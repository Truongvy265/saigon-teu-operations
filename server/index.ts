import "dotenv/config";
import "express-async-errors";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import { authenticate } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { usersRouter } from "./routes/users";
import { showsRouter } from "./routes/shows";
import { showMembersRouter } from "./routes/showMembers";
import { tasksRouter } from "./routes/tasks";
import { deliverablesRouter } from "./routes/deliverables";
import { meRouter } from "./routes/me";
import {
  assertConfiguredOrigin,
  authMode,
  corsOrigins,
  isProduction,
} from "./config";
import { prisma } from "./db";
import { logger } from "./utils/logger";
import { initializeFirebaseAuth } from "./services/firebaseAdmin";

if (authMode === "firebase") initializeFirebaseAuth();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", "loopback");
app.use(
  cors({
    origin: (origin, callback) => {
      try {
        callback(null, assertConfiguredOrigin(origin));
      } catch (error) {
        callback(error as Error);
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      ...(isProduction ? [] : ["x-user-id"]),
    ],
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  const started = Date.now(),
    requestId = req.header("cf-ray") || crypto.randomUUID();
  res.setHeader("x-request-id", requestId);
  res.on("finish", () =>
    logger.info("http_request", {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - started,
    }),
  );
  next();
});

app.get("/health/live", (_req, res) => res.json({ status: "ok" }));
app.get("/health/ready", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ready", database: "connected" });
});
app.get("/api/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ready" });
});
app.use("/api", authenticate);
app.use("/api/users", usersRouter);
app.use("/api/shows", showsRouter);
app.use("/api/show-members", showMembersRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/deliverables", deliverablesRouter);
app.use("/api/me", meRouter);
app.use(errorHandler);

const port = Number(process.env.API_PORT || process.env.PORT || 4000),
  host = process.env.API_HOST || (isProduction ? "127.0.0.1" : "0.0.0.0");
const server = app.listen(port, host, () =>
  logger.info("api_started", {
    host,
    port,
    environment: process.env.NODE_ENV || "development",
    corsOrigins,
  }),
);
let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("shutdown_started", { signal });
  const timer = setTimeout(() => {
    logger.error("shutdown_timeout");
    process.exit(1);
  }, 10_000);
  timer.unref();
  server.close(async (error) => {
    if (error) logger.error("server_close_failed", { message: error.message });
    await prisma.$disconnect();
    logger.info("shutdown_complete");
    process.exit(error ? 1 : 0);
  });
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("unhandled_rejection", { reason: String(reason) });
  void shutdown("unhandledRejection");
});
process.on("uncaughtException", (error) => {
  logger.error("uncaught_exception", { message: error.message });
  void shutdown("uncaughtException");
});
