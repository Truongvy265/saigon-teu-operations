import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { HttpError } from "../utils/errors";
import { logger } from "../utils/logger";
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError)
    return res.status(error.status).json({ error: error.message });
  if (
    Number.isInteger(error?.status) &&
    error.status >= 400 &&
    error.status < 500
  )
    return res.status(error.status).json({
      error: error.message || "Invalid request",
    });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return res.status(409).json({ error: "Resource already exists" });
    if (error.code === "P2025")
      return res.status(404).json({ error: "Resource not found" });
  }
  logger.error("request_error", {
    message: error instanceof Error ? error.message : "Unknown error",
  });
  return res.status(500).json({ error: "Request could not be completed" });
};
