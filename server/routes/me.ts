import { Router } from "express";
import { prisma } from "../db";
import type { AuthRequest } from "../types";
import { taskInclude } from "../services/taskService";
export const meRouter = Router();
meRouter.get("/", async (req: AuthRequest, res) =>
  res.json(await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } })),
);
meRouter.get("/tasks", async (req: AuthRequest, res) =>
  res.json(
    await prisma.task.findMany({
      where: { assignees: { some: { userId: req.user.id } } },
      include: taskInclude,
      orderBy: { currentDeadline: "asc" },
    }),
  ),
);
