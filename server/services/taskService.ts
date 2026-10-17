import { TaskPriority, TaskStatus, type Prisma } from "@prisma/client";
import { prisma } from "../db";
import {
  canUpdateTask,
  deadlineChangeRequiresReason,
  progressForStatus,
} from "../business";
import { recordActivity } from "./activityService";
import { badRequest, forbidden, notFound } from "../utils/errors";
import {
  enumValue,
  optionalText,
  requiredText,
  validDate,
  validHttpsUrl,
} from "../utils/validation";
import type { AuthUser } from "../types";
export const taskInclude = {
  assignees: { include: { user: true } },
  deliverables: { include: { submittedBy: true } },
  show: { include: { members: true } },
  predecessors: true,
  successors: true,
} as const;
const activityInclude = {
  actor: { select: { id: true, name: true, avatarUrl: true } },
} as const;
const allowedTransitions: Record<string, string[]> = {
  TODO: ["IN_PROGRESS"],
  IN_PROGRESS: ["DONE", "STUCK"],
  STUCK: ["IN_PROGRESS"],
  DONE: [],
};
export async function taskForAccess(id: string, user: AuthUser) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  });
  if (!task) throw notFound("Task not found");
  if (user.companyRole === "MANAGER") return task;
  if (task.showId) {
    if (!task.show?.members.some((m) => m.userId === user.id))
      throw forbidden("Not a show member");
  } else if (!task.assignees.some((a) => a.userId === user.id))
    throw forbidden("Not assigned to this internal task");
  return task;
}
function taskData(body: any, showId: string | null, userId: string) {
  const deadline = validDate(
    body.currentDeadline || body.plannedDeadline,
    "deadline",
  );
  return {
    showId,
    title: requiredText(body.title, "Task title"),
    description: optionalText(body.description),
    category: optionalText(body.category),
    phase: optionalText(body.phase),
    department: optionalText(body.department),
    startDate: body.startDate ? validDate(body.startDate, "start date") : null,
    plannedDeadline: validDate(
      body.plannedDeadline || deadline,
      "planned deadline",
    ),
    currentDeadline: deadline,
    priority: enumValue(TaskPriority, body.priority || "NORMAL", "priority"),
    status: enumValue(TaskStatus, body.status || "TODO", "task status"),
    progressPercent: progressForStatus(body.status || "TODO"),
    completedAt: body.status === "DONE" ? new Date() : null,
    stuckReason:
      body.status === "STUCK" ? optionalText(body.stuckReason) : null,
    createdById: userId,
  };
}
async function validateAssignee(
  db: Prisma.TransactionClient,
  showId: string | null,
  userId: string,
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, active: true },
  });
  if (!user?.active) throw badRequest("Assignee must be an active user");
  if (
    showId &&
    !(await db.showMember.findUnique({
      where: { showId_userId: { showId, userId } },
    }))
  )
    throw badRequest("Assignee must be a member of this show");
  return user;
}
export async function createTask(
  showId: string | null,
  body: any,
  actor: AuthUser,
) {
  if (showId && !(await prisma.show.findUnique({ where: { id: showId } })))
    throw notFound("Show not found");
  return prisma.$transaction(async (db) => {
    const task = await db.task.create({
      data: taskData(body, showId, actor.id),
    });
    await recordActivity(db, task.id, actor.id, "TASK_CREATED", {
      scope: showId ? "SHOW" : "AD_HOC",
    });
    if (body.assigneeId) {
      const user = await validateAssignee(db, showId, body.assigneeId);
      await db.taskAssignee.create({
        data: { taskId: task.id, userId: user.id },
      });
      await recordActivity(db, task.id, actor.id, "TASK_ASSIGNED", {
        userId: user.id,
        userName: user.name,
      });
    }
    return db.task.findUniqueOrThrow({
      where: { id: task.id },
      include: taskInclude,
    });
  });
}
export async function updateTask(id: string, body: any, actor: AuthUser) {
  const current = await prisma.task.findUnique({
    where: { id },
    include: { assignees: true },
  });
  if (!current) throw notFound("Task not found");
  if (
    !canUpdateTask(
      actor.companyRole,
      actor.id,
      current.assignees.map((a) => a.userId),
    )
  )
    throw forbidden("You cannot update this task");
  const protectedChange =
    (body.currentDeadline &&
      new Date(body.currentDeadline).getTime() !== current.currentDeadline.getTime()) ||
    (body.plannedDeadline &&
      new Date(body.plannedDeadline).getTime() !== current.plannedDeadline.getTime()) ||
    (body.title && body.title.trim() !== current.title) ||
    (body.priority && body.priority !== current.priority) ||
    (body.department !== undefined &&
      (body.department || null) !== current.department);
  if (actor.companyRole !== "MANAGER" && protectedChange)
    throw forbidden(
      "Members may only update status, stuck reason and deliverables",
    );
  if (
    body.plannedDeadline &&
    new Date(body.plannedDeadline).getTime() !==
      current.plannedDeadline.getTime()
  )
    throw badRequest("plannedDeadline is an immutable baseline");
  const status = body.status
    ? enumValue(TaskStatus, body.status, "task status")
    : current.status;
  if (
    actor.companyRole !== "MANAGER" &&
    status !== current.status &&
    !allowedTransitions[current.status].includes(status)
  )
    throw badRequest(
      `Invalid status transition: ${current.status} -> ${status}`,
    );
  const nextDeadline = body.currentDeadline
    ? validDate(body.currentDeadline, "current deadline")
    : current.currentDeadline;
  const deadlineChanged =
    nextDeadline.getTime() !== current.currentDeadline.getTime();
  if (
    deadlineChanged &&
    !deadlineChangeRequiresReason(
      current.currentDeadline,
      nextDeadline,
      body.deadlineChangeReason,
    )
  )
    throw badRequest("Deadline change reason is required");
  return prisma.$transaction(async (db) => {
    const task = await db.task.update({
      where: { id },
      data: {
        title: body.title ? requiredText(body.title, "Task title") : undefined,
        description:
          body.description === undefined
            ? undefined
            : optionalText(body.description),
        category:
          body.category === undefined ? undefined : optionalText(body.category),
        phase: body.phase === undefined ? undefined : optionalText(body.phase),
        department:
          body.department === undefined
            ? undefined
            : optionalText(body.department),
        startDate: body.startDate
          ? validDate(body.startDate, "start date")
          : undefined,
        currentDeadline: nextDeadline,
        priority: body.priority
          ? enumValue(TaskPriority, body.priority, "priority")
          : undefined,
        status,
        progressPercent: progressForStatus(status, current.progressPercent),
        stuckReason:
          status === "STUCK"
            ? optionalText(body.stuckReason) || current.stuckReason
            : null,
        completedAt:
          status === "DONE" ? current.completedAt || new Date() : null,
      },
      include: taskInclude,
    });
    if (deadlineChanged)
      await recordActivity(db, id, actor.id, "DEADLINE_CHANGED", {
        from: current.currentDeadline.toISOString(),
        to: nextDeadline.toISOString(),
        reason: body.deadlineChangeReason.trim(),
      });
    if (status !== current.status) {
      await recordActivity(db, id, actor.id, "STATUS_CHANGED", {
        from: current.status,
        to: status,
      });
      if (status === "STUCK")
        await recordActivity(db, id, actor.id, "STUCK_REPORTED", {
          reason: body.stuckReason || current.stuckReason,
        });
      if (current.status === "STUCK" && status === "IN_PROGRESS")
        await recordActivity(db, id, actor.id, "STUCK_RESOLVED", {});
    }
    return task;
  });
}
export async function assignTask(
  taskId: string,
  userId: string,
  actor: AuthUser,
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw notFound("Task not found");
  return prisma.$transaction(async (db) => {
    const user = await validateAssignee(db, task.showId, userId),
      existing = await db.taskAssignee.findUnique({
        where: { taskId_userId: { taskId, userId } },
        include: { user: true },
      });
    if (existing) return existing;
    const assignment = await db.taskAssignee.create({
      data: { taskId, userId },
      include: { user: true },
    });
    await recordActivity(db, taskId, actor.id, "TASK_ASSIGNED", {
      userId,
      userName: user.name,
    });
    return assignment;
  });
}
export async function unassignTask(
  taskId: string,
  userId: string,
  actor: AuthUser,
) {
  return prisma.$transaction(async (db) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    await db.taskAssignee.delete({
      where: { taskId_userId: { taskId, userId } },
    });
    await recordActivity(db, taskId, actor.id, "TASK_UNASSIGNED", {
      userId,
      userName: user?.name,
    });
  });
}
export async function addDeliverable(
  taskId: string,
  body: any,
  actor: AuthUser,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { assignees: true },
  });
  if (!task) throw notFound("Task not found");
  if (
    !canUpdateTask(
      actor.companyRole,
      actor.id,
      task.assignees.map((a) => a.userId),
    )
  )
    throw forbidden("You cannot add a deliverable");
  const url = validHttpsUrl(body.url);
  return prisma.$transaction(async (db) => {
    const d = await db.taskDeliverable.create({
      data: {
        taskId,
        title: optionalText(body.title),
        url,
        submittedById: actor.id,
      },
      include: { submittedBy: true },
    });
    await recordActivity(db, taskId, actor.id, "DELIVERABLE_ADDED", {
      deliverableId: d.id,
      title: d.title,
      url: d.url,
    });
    return d;
  });
}
export async function removeDeliverable(id: string, actor: AuthUser) {
  const d = await prisma.taskDeliverable.findUnique({ where: { id } });
  if (!d) throw notFound("Deliverable not found");
  if (actor.companyRole !== "MANAGER" && d.submittedById !== actor.id)
    throw forbidden("Cannot delete this deliverable");
  return prisma.$transaction(async (db) => {
    await db.taskDeliverable.delete({ where: { id } });
    await recordActivity(db, d.taskId, actor.id, "DELIVERABLE_REMOVED", {
      deliverableId: d.id,
      title: d.title,
      url: d.url,
    });
  });
}
export const listActivities = async (id: string, user: AuthUser) => {
  await taskForAccess(id, user);
  return prisma.taskActivity.findMany({
    where: { taskId: id },
    include: activityInclude,
    orderBy: { createdAt: "desc" },
  });
};
export const taskDeleteSummary = async (id: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          deliverables: true,
          activities: true,
          predecessors: true,
          successors: true,
        },
      },
    },
  });
  if (!task) throw notFound("Task not found");
  return task;
};
export async function createDependency(body: any) {
  if (body.predecessorTaskId === body.successorTaskId)
    throw badRequest("A task cannot depend on itself");
  const [pre, suc] = await Promise.all([
    prisma.task.findUnique({ where: { id: body.predecessorTaskId } }),
    prisma.task.findUnique({ where: { id: body.successorTaskId } }),
  ]);
  if (!pre || !suc) throw notFound("Dependency task not found");
  if (!pre.showId || pre.showId !== suc.showId)
    throw badRequest(
      "Dependencies require two different tasks in the same Show",
    );
  return prisma.taskDependency.create({
    data: {
      predecessorTaskId: pre.id,
      successorTaskId: suc.id,
      lagDays: Number(body.lagDays || 0),
      autoAdjust: false,
    },
  });
}
