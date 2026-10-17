import { Router } from "express";
import { prisma } from "../db";
export const usersRouter = Router();
usersRouter.get("/", async (_req, res) =>
  res.json(
    await prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ),
);
