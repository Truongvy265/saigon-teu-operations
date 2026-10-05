import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient, CompanyRole, ShowRole, ShowStatus, TaskPriority, TaskStatus } from '@prisma/client';
import { canUpdateTask, isValidDeliverableUrl, showProgress } from './business';

const prisma = new PrismaClient();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

type AuthRequest = Request & { user?: { id: string; companyRole: CompanyRole } };
const taskInclude = { assignees: { include: { user: true } }, deliverables: { include: { submittedBy: true } }, show: { include: { members: true } }, predecessors: true, successors: true } as const;
const showInclude = { members: { include: { user: true } }, tasks: { include: { assignees: { include: { user: true } }, deliverables: true } } } as const;

app.use('/api', async (req: AuthRequest, res, next) => {
  try {
    // Development-only identity bridge. TODO: replace with Firebase/Google authentication.
    const id = req.header('x-user-id');
    const user = id ? await prisma.user.findUnique({ where: { id }, select: { id: true, companyRole: true, active: true } }) : await prisma.user.findFirst({ where: { active: true, companyRole: 'MANAGER' }, select: { id: true, companyRole: true, active: true } });
    if (!user?.active) return res.status(401).json({ error: 'Development user is missing or inactive' });
    req.user = user;
    next();
  } catch (error) { next(error); }
});

const manager = (req: AuthRequest, res: Response, next: NextFunction) => req.user?.companyRole === 'MANAGER' ? next() : res.status(403).json({ error: 'Manager permission required' });
const date = (value: unknown) => { const d = new Date(String(value)); if (Number.isNaN(d.getTime())) throw Object.assign(new Error('Invalid date'), { status: 400 }); return d; };
const enumValue = <T extends Record<string,string>>(values: T, value: unknown, label: string) => { if (!Object.values(values).includes(value as string)) throw Object.assign(new Error(`Invalid ${label}`), {status:400}); return value as T[keyof T]; };

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/users', async (_req, res) => res.json(await prisma.user.findMany({ where: { active: true }, orderBy: { name: 'asc' } })));

app.get('/api/shows', async (req: AuthRequest, res) => {
  const where = req.user!.companyRole === 'MANAGER' ? {} : { members: { some: { userId: req.user!.id } } };
  const shows = await prisma.show.findMany({ where, include: showInclude, orderBy: { showDate: 'asc' } });
  res.json(shows.map(show => ({ ...show, progressPercent: showProgress(show.tasks) })));
});
app.post('/api/shows', manager, async (req: AuthRequest, res) => {
  const b = req.body;
  if (!b.name?.trim() || !b.city?.trim() || !b.venue?.trim()) return res.status(400).json({ error: 'Name, city and venue are required' });
  const show = await prisma.show.create({ data: { name:b.name.trim(), code:b.code||null, description:b.description||null, showDate:date(b.showDate), startTime:b.startTime||null, endTime:b.endTime||null, city:b.city.trim(), venue:b.venue.trim(), scale:b.scale||null, goal:b.goal||null, status:enumValue(ShowStatus,b.status||'PLANNING','show status'), createdById:req.user!.id }, include:showInclude });
  res.status(201).json({ ...show, progressPercent: 0 });
});
app.get('/api/shows/:id', async (req: AuthRequest, res) => {
  const show = await prisma.show.findUnique({ where:{id:req.params.id}, include:showInclude });
  if (!show) return res.status(404).json({error:'Show not found'});
  if (req.user!.companyRole !== 'MANAGER' && !show.members.some(m=>m.userId===req.user!.id)) return res.status(403).json({error:'Not a show member'});
  res.json({...show,progressPercent:showProgress(show.tasks)});
});
app.patch('/api/shows/:id', manager, async (req, res) => {
  const b=req.body; const show=await prisma.show.update({where:{id:req.params.id},data:{name:b.name,code:b.code,description:b.description,showDate:b.showDate?date(b.showDate):undefined,startTime:b.startTime,endTime:b.endTime,city:b.city,venue:b.venue,scale:b.scale,goal:b.goal,status:b.status?enumValue(ShowStatus,b.status,'show status'):undefined},include:showInclude}); res.json(show);
});
app.delete('/api/shows/:id', manager, async (req,res)=>{ await prisma.show.delete({where:{id:req.params.id}}); res.status(204).end(); });

app.get('/api/shows/:id/members', async (req,res)=>res.json(await prisma.showMember.findMany({where:{showId:req.params.id},include:{user:true}})));
app.post('/api/shows/:id/members', manager, async (req,res)=>{
  const [show,user]=await Promise.all([prisma.show.findUnique({where:{id:req.params.id}}),prisma.user.findUnique({where:{id:req.body.userId}})]);
  if(!show||!user)return res.status(404).json({error:'Show or user not found'});
  const member=await prisma.showMember.create({data:{showId:show.id,userId:user.id,role:enumValue(ShowRole,req.body.role,'show role'),note:req.body.note||null},include:{user:true}}); res.status(201).json(member);
});
app.patch('/api/show-members/:id', manager, async(req,res)=>res.json(await prisma.showMember.update({where:{id:req.params.id},data:{role:enumValue(ShowRole,req.body.role,'show role'),note:req.body.note},include:{user:true}})));
app.delete('/api/show-members/:id', manager, async(req,res)=>{await prisma.showMember.delete({where:{id:req.params.id}});res.status(204).end();});

app.get('/api/shows/:id/tasks', async(req:AuthRequest,res)=>{if(req.user!.companyRole!=='MANAGER'&&!await prisma.showMember.findUnique({where:{showId_userId:{showId:req.params.id,userId:req.user!.id}}}))return res.status(403).json({error:'Not a show member'});res.json(await prisma.task.findMany({where:{showId:req.params.id},include:taskInclude,orderBy:{currentDeadline:'asc'}}));});
app.post('/api/shows/:id/tasks', manager, async(req:AuthRequest,res)=>{
  const b=req.body; const show=await prisma.show.findUnique({where:{id:req.params.id}}); if(!show)return res.status(404).json({error:'Show not found'});
  const deadline=date(b.currentDeadline||b.plannedDeadline); const task=await prisma.task.create({data:{showId:show.id,title:b.title?.trim(),description:b.description||null,category:b.category||null,phase:b.phase||null,department:b.department||null,startDate:b.startDate?date(b.startDate):null,plannedDeadline:date(b.plannedDeadline||deadline),currentDeadline:deadline,priority:enumValue(TaskPriority,b.priority||'NORMAL','priority'),status:enumValue(TaskStatus,b.status||'TODO','task status'),progressPercent:b.status==='DONE'?100:0,completedAt:b.status==='DONE'?new Date():null,stuckReason:b.status==='STUCK'?b.stuckReason||null:null,createdById:req.user!.id},include:taskInclude}); res.status(201).json(task);
});
app.get('/api/tasks/:id', async(req:AuthRequest,res)=>{const task=await prisma.task.findUnique({where:{id:req.params.id},include:taskInclude});if(!task)return res.status(404).json({error:'Task not found'});if(req.user!.companyRole!=='MANAGER'&&!task.show.members.some(m=>m.userId===req.user!.id))return res.status(403).json({error:'Not a show member'});res.json(task);});
app.patch('/api/tasks/:id', async(req:AuthRequest,res)=>{
  const current=await prisma.task.findUnique({where:{id:req.params.id},include:{assignees:true}}); if(!current)return res.status(404).json({error:'Task not found'});
  if(!canUpdateTask(req.user!.companyRole,req.user!.id,current.assignees.map(a=>a.userId)))return res.status(403).json({error:'You cannot update this task'});
  const b=req.body; if(req.user!.companyRole!=='MANAGER'&&(b.currentDeadline||b.plannedDeadline||b.title||b.priority))return res.status(403).json({error:'Members may only update status, stuck reason and deliverables'});
  const status=b.status?enumValue(TaskStatus,b.status,'task status'):current.status;
  if(req.user!.companyRole!=='MANAGER'&&status!==current.status){const allowed:Record<string,string[]>={TODO:['IN_PROGRESS'],IN_PROGRESS:['DONE','STUCK'],STUCK:['IN_PROGRESS'],DONE:[]};if(!allowed[current.status].includes(status))return res.status(400).json({error:`Invalid status transition: ${current.status} -> ${status}`});}
  const task=await prisma.task.update({where:{id:current.id},data:{title:b.title,description:b.description,category:b.category,phase:b.phase,department:b.department,startDate:b.startDate?date(b.startDate):undefined,currentDeadline:b.currentDeadline?date(b.currentDeadline):undefined,plannedDeadline:undefined,priority:b.priority?enumValue(TaskPriority,b.priority,'priority'):undefined,status,progressPercent:status==='DONE'?100:status==='IN_PROGRESS'?Math.max(current.progressPercent,40):status==='TODO'?0:current.progressPercent,stuckReason:status==='STUCK'?b.stuckReason||current.stuckReason:null,completedAt:status==='DONE'?(current.completedAt||new Date()):null},include:taskInclude});res.json(task);
});
app.delete('/api/tasks/:id',manager,async(req,res)=>{await prisma.task.delete({where:{id:req.params.id}});res.status(204).end();});
app.post('/api/tasks/:id/assignees',manager,async(req,res)=>{const task=await prisma.task.findUnique({where:{id:req.params.id}});if(!task)return res.status(404).json({error:'Task not found'});const member=await prisma.showMember.findUnique({where:{showId_userId:{showId:task.showId,userId:req.body.userId}}});if(!member)return res.status(400).json({error:'Assignee must be a member of this show'});res.status(201).json(await prisma.taskAssignee.upsert({where:{taskId_userId:{taskId:task.id,userId:req.body.userId}},create:{taskId:task.id,userId:req.body.userId},update:{},include:{user:true}}));});
app.delete('/api/tasks/:id/assignees/:userId',manager,async(req,res)=>{await prisma.taskAssignee.delete({where:{taskId_userId:{taskId:req.params.id,userId:req.params.userId}}});res.status(204).end();});
app.post('/api/tasks/:id/deliverables',async(req:AuthRequest,res)=>{const task=await prisma.task.findUnique({where:{id:req.params.id},include:{assignees:true}});if(!task)return res.status(404).json({error:'Task not found'});if(!canUpdateTask(req.user!.companyRole,req.user!.id,task.assignees.map(a=>a.userId)))return res.status(403).json({error:'You cannot add a deliverable'});if(!isValidDeliverableUrl(req.body.url))return res.status(400).json({error:'A valid HTTPS URL is required'});res.status(201).json(await prisma.taskDeliverable.create({data:{taskId:task.id,title:req.body.title||null,url:req.body.url,submittedById:req.user!.id},include:{submittedBy:true}}));});
app.delete('/api/deliverables/:id',async(req:AuthRequest,res)=>{const d=await prisma.taskDeliverable.findUnique({where:{id:req.params.id}});if(!d)return res.status(404).json({error:'Deliverable not found'});if(req.user!.companyRole!=='MANAGER'&&d.submittedById!==req.user!.id)return res.status(403).json({error:'Cannot delete this deliverable'});await prisma.taskDeliverable.delete({where:{id:d.id}});res.status(204).end();});
app.get('/api/me/tasks',async(req:AuthRequest,res)=>res.json(await prisma.task.findMany({where:{assignees:{some:{userId:req.user!.id}}},include:taskInclude,orderBy:{currentDeadline:'asc'}})));

app.use((error:any,_req:Request,res:Response,_next:NextFunction)=>{console.error(error);res.status(error.status||((error.code==='P2025')?404:500)).json({error:error.status?error.message:'Request could not be completed'});});
const port=Number(process.env.API_PORT||4000);app.listen(port,()=>console.log(`SGT API listening on http://localhost:${port}`));
