import { Router } from "express";
import { ShowRole } from "@prisma/client";
import { prisma } from "../db";
import { requireManager } from "../middleware/auth";
import { enumValue } from "../utils/validation";
export const showMembersRouter = Router();
showMembersRouter.use(requireManager);
showMembersRouter.patch("/:id", async (req, res) =>
  res.json(
    await prisma.showMember.update({
      where: { id: req.params.id },
      data: {
        role: enumValue(ShowRole, req.body.role, "show role"),
        note: req.body.note,
      },
      include: { user: true },
    }),
  ),
);
showMembersRouter.delete("/:id", async (req, res) => {
  await prisma.showMember.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
