import { Router } from "express";
import type { AuthRequest } from "../types";
import { removeDeliverable } from "../services/taskService";
export const deliverablesRouter = Router();
deliverablesRouter.delete("/:id", async (req: AuthRequest, res) => {
  await removeDeliverable(req.params.id, req.user);
  res.status(204).end();
});
