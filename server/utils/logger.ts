type Level = "info" | "warn" | "error";
const rank: Record<Level, number> = { info: 1, warn: 2, error: 3 };
const configured = (process.env.LOG_LEVEL || "info") as Level;
const write = (
  level: Level,
  event: string,
  metadata: Record<string, unknown> = {},
) => {
  if (rank[level] < (rank[configured] || 1)) return;
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...metadata,
  });
  (level === "error"
    ? console.error
    : level === "warn"
      ? console.warn
      : console.log)(entry);
};
export const logger = {
  info: (e: string, m?: Record<string, unknown>) => write("info", e, m),
  warn: (e: string, m?: Record<string, unknown>) => write("warn", e, m),
  error: (e: string, m?: Record<string, unknown>) => write("error", e, m),
};
