export type TaskLike = { status: string; assignees?: unknown[]; currentDeadline?: string | Date };

export const showProgress = (tasks: TaskLike[]) =>
  tasks.length ? Math.round(tasks.filter(t => t.status === 'DONE').length / tasks.length * 100) : 0;

export const isUnassigned = (task: TaskLike) => !task.assignees?.length;

export const isOverdue = (task: TaskLike, now = new Date()) =>
  task.status !== 'DONE' && !!task.currentDeadline && new Date(task.currentDeadline) < now;

export const isValidDeliverableUrl = (value: string) => {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
};

export const canUpdateTask = (role: string, userId: string, assigneeIds: string[]) =>
  role === 'MANAGER' || assigneeIds.includes(userId);
