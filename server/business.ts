export type TaskLike = {
  status: string;
  showId?: string | null;
  assignees?: unknown[];
  plannedDeadline?: string | Date;
  currentDeadline?: string | Date;
  completedAt?: string | Date | null;
};

export const showProgress = (tasks: TaskLike[]) => {
  const scoped = tasks.filter((t) => t.showId !== null);
  return scoped.length
    ? Math.round(
        (scoped.filter((t) => t.status === "DONE").length / scoped.length) *
          100,
      )
    : 0;
};

export const isUnassigned = (task: TaskLike) => !task.assignees?.length;

export const isOverdue = (task: TaskLike, now = new Date()) =>
  task.status !== "DONE" &&
  !!task.currentDeadline &&
  new Date(task.currentDeadline) < now;

export const isValidDeliverableUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export const canUpdateTask = (
  role: string,
  userId: string,
  assigneeIds: string[],
) => role === "MANAGER" || assigneeIds.includes(userId);

export const canAccessShow = (
  role: string,
  userId: string,
  memberIds: string[],
) => role === "MANAGER" || memberIds.includes(userId);

export const progressForStatus = (status: string, current = 0) =>
  status === "TODO"
    ? 0
    : status === "IN_PROGRESS"
      ? 40
      : status === "DONE"
        ? 100
        : current;
const day = 86_400_000;
export const deadlineVarianceDays = (task: TaskLike) =>
  task.plannedDeadline && task.currentDeadline
    ? Math.round(
        (new Date(task.currentDeadline).getTime() -
          new Date(task.plannedDeadline).getTime()) /
          day,
      )
    : 0;
export const completionVarianceDays = (task: TaskLike) =>
  task.completedAt && task.currentDeadline
    ? Math.ceil(
        (new Date(task.completedAt).getTime() -
          new Date(task.currentDeadline).getTime()) /
          day,
      )
    : null;
export const deadlineChangeRequiresReason = (
  from: string | Date,
  to: string | Date,
  reason: unknown,
) =>
  new Date(from).getTime() === new Date(to).getTime() ||
  (typeof reason === "string" && !!reason.trim());
export const assignmentAllowed = (
  showId: string | null,
  userActive: boolean,
  isShowMember: boolean,
) => userActive && (!showId || isShowMember);
