import type { Prisma, TaskActivityType } from "@prisma/client";
type Db = Prisma.TransactionClient;
export const recordActivity = (
  db: Db,
  taskId: string,
  actorId: string,
  type: TaskActivityType,
  metadata: Prisma.InputJsonValue = {},
) => db.taskActivity.create({ data: { taskId, actorId, type, metadata } });
