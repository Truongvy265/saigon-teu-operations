import React, { useMemo, useState } from "react";
import { useOps } from "../context/OpsContext";
import type { ShowTask } from "../types";
const fmt = (v: string) =>
  new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(v),
  );
export const MyTasks: React.FC<{ onOpen: (t: ShowTask) => void }> = ({
  onOpen,
}) => {
  const { tasks, currentUser, loading, error } = useOps();
  const [time, setTime] = useState("ALL"),
    [scope, setScope] = useState("ALL");
  const mine = useMemo(
    () =>
      tasks
        .filter((t) => t.assignees?.some((a) => a.userId === currentUser?.id))
        .filter(
          (t) => scope === "ALL" || (scope === "SHOW" ? !!t.showId : !t.showId),
        )
        .filter((t) => {
          const d = new Date(t.currentDeadline || t.deadline),
            now = new Date();
          if (time === "DONE") return t.status === "DONE";
          if (time === "OVERDUE") return t.status !== "DONE" && d < now;
          if (time === "TODAY")
            return (
              new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Ho_Chi_Minh",
              }).format(d) ===
              new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Ho_Chi_Minh",
              }).format(now)
            );
          if (time === "UPCOMING") return t.status !== "DONE" && d >= now;
          return true;
        }),
    [tasks, currentUser, time, scope],
  );
  if (loading) return <p>Đang tải công việc...</p>;
  if (error) return <p className="text-rose-600">{error}</p>;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Công việc của tôi</h1>
        <p className="text-sm text-slate-500">
          {currentUser?.name} · development user mode
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[
          ["ALL", "Tất cả"],
          ["TODAY", "Hôm nay"],
          ["UPCOMING", "Sắp tới"],
          ["OVERDUE", "Quá hạn"],
          ["DONE", "Đã xong"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTime(v)}
            className={`px-3 py-2 rounded-lg text-xs font-bold ${time === v ? "bg-amber-500 text-slate-950" : "bg-white dark:bg-slate-900"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {[
          ["ALL", "Tất cả"],
          ["SHOW", "Show"],
          ["AD_HOC", "Nội bộ"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setScope(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${scope === v ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-200 dark:bg-slate-800"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {!mine.length ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center text-slate-500">
          Không có công việc trong bộ lọc này.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {mine.map((t) => {
            const overdue =
                t.status !== "DONE" &&
                new Date(t.currentDeadline || t.deadline) < new Date(),
              role = t.show?.members?.find(
                (m) => m.userId === currentUser?.id,
              )?.role;
            return (
              <button
                key={t.id}
                onClick={() => onOpen(t)}
                className="text-left bg-white dark:bg-slate-900 border rounded-xl p-4"
              >
                <div className="flex gap-2 justify-between">
                  <b>{t.title}</b>
                  <span
                    className={`text-[10px] px-2 py-1 rounded font-bold ${t.showId ? "bg-indigo-100 text-indigo-700" : "bg-cyan-100 text-cyan-700"}`}
                  >
                    {t.showId ? "SHOW" : "NỘI BỘ"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {t.showId ? t.showName : "Công việc nội bộ"}
                  {role ? ` · ${role}` : ""} · Hạn{" "}
                  {fmt(t.currentDeadline || t.deadline)}
                </div>
                <div className="flex gap-2 mt-2 text-xs font-bold">
                  <span>{t.status}</span>
                  <span>· {t.priority}</span>
                  {overdue && <span className="text-rose-600">· QUÁ HẠN</span>}
                  <span>· {t.deliverables?.length || 0} file</span>
                </div>
                {(t.deadlineVarianceDays || 0) > 0 && (
                  <div className="text-xs text-amber-600 mt-2">
                    Deadline đã dời +{t.deadlineVarianceDays} ngày
                  </div>
                )}
                {t.completionVarianceDays !== undefined &&
                  t.completionVarianceDays !== null && (
                    <div
                      className={`text-xs mt-1 ${t.completionVarianceDays > 0 ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {t.completionVarianceDays > 0
                        ? `Hoàn thành trễ ${t.completionVarianceDays} ngày`
                        : "Hoàn thành đúng hạn"}
                    </div>
                  )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
