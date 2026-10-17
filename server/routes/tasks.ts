import { Router } from "express";
import { prisma } from "../db";
import { requireManager } from "../middleware/auth";
import type { AuthRequest } from "../types";
import {
  addDeliverable,
  assignTask,
  createDependency,
  createTask,
  listActivities,
  taskDeleteSummary,
  taskForAccess,
  taskInclude,
  unassignTask,
  updateTask,
} from "../services/taskService";
export const tasksRouter = Router();
tasksRouter.get("/", async (req: AuthRequest, res) => {
  const scope = String(req.query.scope || "ALL"),
    and: any[] = [];
  if (scope === "SHOW") and.push({ showId: { not: null } });
  if (scope === "AD_HOC") and.push({ showId: null });
  if (req.user.companyRole !== "MANAGER")
    and.push({
      OR: [
        { show: { members: { some: { userId: req.user.id } } } },
        { showId: null, assignees: { some: { userId: req.user.id } } },
      ],
    });
  res.json(
    await prisma.task.findMany({
      where: and.length ? { AND: and } : {},
      include: taskInclude,
      orderBy: { currentDeadline: "asc" },
    }),
  );
});
tasksRouter.post("/", requireManager, async (req: AuthRequest, res) =>
  res.status(201).json(await createTask(null, req.body, req.user)),
);
tasksRouter.post("/dependencies", requireManager, async (req, res) =>
  res.status(201).json(await createDependency(req.body)),
);
tasksRouter.get("/:id/activities", async (req: AuthRequest, res) =>
  res.json(await listActivities(req.params.id, req.user)),
);
tasksRouter.get("/:id/delete-summary", requireManager, async (req, res) =>
  res.json(await taskDeleteSummary(req.params.id)),
);
tasksRouter.get("/:id", async (req: AuthRequest, res) =>
  res.json(await taskForAccess(req.params.id, req.user)),
);
tasksRouter.patch("/:id", async (req: AuthRequest, res) =>
  res.json(await updateTask(req.params.id, req.body, req.user)),
);
tasksRouter.delete("/:id", requireManager, async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
tasksRouter.post(
  "/:id/assignees",
  requireManager,
  async (req: AuthRequest, res) =>
    res
      .status(201)
      .json(await assignTask(req.params.id, req.body.userId, req.user)),
);
tasksRouter.delete(
  "/:id/assignees/:userId",
  requireManager,
  async (req: AuthRequest, res) => {
    await unassignTask(req.params.id, req.params.userId, req.user);
    res.status(204).end();
  },
);
tasksRouter.post("/:id/deliverables", async (req: AuthRequest, res) =>
  res.status(201).json(await addDeliverable(req.params.id, req.body, req.user)),
);
