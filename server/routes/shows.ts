import { Router } from "express";
import { ShowRole, ShowStatus } from "@prisma/client";
import { prisma } from "../db";
import { requireManager } from "../middleware/auth";
import type { AuthRequest } from "../types";
import { enumValue, validDate } from "../utils/validation";
import { forbidden, notFound } from "../utils/errors";
import {
  addMember,
  assertShowAccess,
  createShow,
  deleteSummary,
  listShows,
  showInclude,
} from "../services/showService";
import { createTask, taskInclude } from "../services/taskService";
export const showsRouter = Router();
showsRouter.get("/", async (req: AuthRequest, res) =>
  res.json(await listShows(req.user)),
);
showsRouter.post("/", requireManager, async (req: AuthRequest, res) =>
  res.status(201).json(await createShow(req.body, req.user)),
);
showsRouter.get("/:id/delete-summary", requireManager, async (req, res) =>
  res.json(await deleteSummary(req.params.id)),
);
showsRouter.get("/:id", async (req: AuthRequest, res) => {
  const show = await prisma.show.findUnique({
    where: { id: req.params.id },
    include: showInclude,
  });
  if (!show) throw notFound("Show not found");
  if (
    req.user.companyRole !== "MANAGER" &&
    !show.members.some((m) => m.userId === req.user.id)
  )
    throw forbidden("Not a show member");
  res.json({
    ...show,
    progressPercent: show.tasks.length
      ? Math.round(
          (show.tasks.filter((t) => t.status === "DONE").length /
            show.tasks.length) *
            100,
        )
      : 0,
  });
});
showsRouter.patch("/:id", requireManager, async (req, res) => {
  const b = req.body;
  res.json(
    await prisma.show.update({
      where: { id: req.params.id },
      data: {
        name: b.name?.trim(),
        code: b.code,
        description: b.description,
        showDate: b.showDate ? validDate(b.showDate, "show date") : undefined,
        startTime: b.startTime,
        endTime: b.endTime,
        city: b.city,
        venue: b.venue,
        scale: b.scale,
        goal: b.goal,
        status: b.status
          ? enumValue(ShowStatus, b.status, "show status")
          : undefined,
      },
      include: showInclude,
    }),
  );
});
showsRouter.delete("/:id", requireManager, async (req, res) => {
  await prisma.show.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
showsRouter.get("/:id/members", async (req: AuthRequest, res) => {
  await assertShowAccess(req.params.id, req.user);
  res.json(
    await prisma.showMember.findMany({
      where: { showId: req.params.id },
      include: { user: true },
    }),
  );
});
showsRouter.post("/:id/members", requireManager, async (req, res) =>
  res.status(201).json(await addMember(req.params.id, req.body)),
);
showsRouter.get("/:id/tasks", async (req: AuthRequest, res) => {
  if (
    req.user.companyRole !== "MANAGER" &&
    !(await prisma.showMember.findUnique({
      where: { showId_userId: { showId: req.params.id, userId: req.user.id } },
    }))
  )
    throw forbidden("Not a show member");
  res.json(
    await prisma.task.findMany({
      where: { showId: req.params.id },
      include: taskInclude,
      orderBy: { currentDeadline: "asc" },
    }),
  );
});
showsRouter.post("/:id/tasks", requireManager, async (req: AuthRequest, res) =>
  res.status(201).json(await createTask(req.params.id, req.body, req.user)),
);
