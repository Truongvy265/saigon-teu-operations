import { PrismaClient, ShowRole, TaskPriority, TaskStatus } from '@prisma/client';
const prisma = new PrismaClient();

const people = [
  ['Khoi','Khôi','khoi@saigonteu.vn','MANAGER'],['phuc','Phúc','phuc@saigonteu.vn','MEMBER'],['yen-nhi','Yến Nhi','yennhi@saigonteu.vn','MEMBER'],['truong-vy','Trường Vỹ','vy@saigonteu.vn','MEMBER'],['kha-di','Khả Di','khadi@saigonteu.vn','MEMBER'],['na','Na','na@saigonteu.vn','MEMBER'],['nhung','Nhung','nhung@saigonteu.vn','MEMBER']
] as const;

async function main(){
  const users:Record<string,any>={};
  for(const [id,name,email,companyRole] of people) users[id]=await prisma.user.upsert({where:{email},update:{name,companyRole},create:{id,name,email,companyRole}});
  const show=await prisma.show.upsert({where:{id:'teu-len-trinh-4'},update:{},create:{id:'teu-len-trinh-4',name:'Tếu Lên Trình #4',code:'TLT-04',showDate:new Date('2026-11-20T00:00:00.000Z'),startTime:'19:30',city:'TP. Hồ Chí Minh',venue:'Venue demo',scale:'VỪA',goal:'Doanh thu + Talent',status:'PREPARING',createdById:users.Khoi.id}});
  const roles:[string,ShowRole][]=[['Khoi','PM'],['phuc','PA1'],['yen-nhi','PA2'],['truong-vy','SE'],['kha-di','SSE']];
  for(const [key,role] of roles) await prisma.showMember.upsert({where:{showId_userId:{showId:show.id,userId:users[key].id}},update:{role},create:{showId:show.id,userId:users[key].id,role}});
  await prisma.task.deleteMany({where:{showId:show.id}});
  const statuses:TaskStatus[]=['DONE','DONE','DONE','IN_PROGRESS','IN_PROGRESS','IN_PROGRESS','TODO','TODO','TODO','STUCK'];
  const titles=['Chốt venue','Duyệt kịch bản','Banner online','Kế hoạch check-in','Lineup nghệ sĩ','Kế hoạch social','Giấy phép biểu diễn','Logistics onsite','Chăm sóc talent','Đối soát vé'];
  const tasks=[];
  for(let i=0;i<10;i++) tasks.push(await prisma.task.create({data:{showId:show.id,title:titles[i],description:`Công việc mẫu ${i+1}`,category:i<3?'PLANNING':'EXECUTION',phase:i<5?'PHASE 1':'PHASE 2',department:'SHOW',startDate:new Date('2026-10-20T00:00:00.000Z'),plannedDeadline:new Date(`2026-11-${String(5+i).padStart(2,'0')}T00:00:00.000Z`),currentDeadline:new Date(`2026-11-${String(5+i).padStart(2,'0')}T00:00:00.000Z`),priority:i===9?TaskPriority.URGENT:TaskPriority.NORMAL,status:statuses[i],progressPercent:statuses[i]==='DONE'?100:statuses[i]==='IN_PROGRESS'?50:0,stuckReason:statuses[i]==='STUCK'?'Chờ xác nhận đối tác':null,completedAt:statuses[i]==='DONE'?new Date():null,createdById:users.Khoi.id}}));
  // Six assigned, four unassigned.
  const assigned=['truong-vy','truong-vy','phuc','yen-nhi','kha-di','truong-vy'];
  for(let i=0;i<assigned.length;i++) await prisma.taskAssignee.create({data:{taskId:tasks[i].id,userId:users[assigned[i]].id}});
  await prisma.taskDeliverable.createMany({data:[{taskId:tasks[0].id,title:'Hợp đồng venue',url:'https://drive.google.com/example',submittedById:users['truong-vy'].id},{taskId:tasks[2].id,title:'Source Canva',url:'https://canva.com/example',submittedById:users.phuc.id}]});
  await prisma.taskDependency.createMany({data:[{predecessorTaskId:tasks[0].id,successorTaskId:tasks[3].id,lagDays:2,autoAdjust:false},{predecessorTaskId:tasks[1].id,successorTaskId:tasks[4].id,lagDays:1,autoAdjust:false}]});
}
main().finally(()=>prisma.$disconnect());
