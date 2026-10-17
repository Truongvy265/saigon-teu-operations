import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckSquare, Clock3, X } from "lucide-react";
import { useOps } from "../context/OpsContext";
import { taskApi } from "../services/api";
import type {
  ShowTask,
  TaskActivity,
  TaskCategory,
  TaskDepartment,
  TaskPhase,
} from "../types";
const activityLabels: Record<string, string> = {
  TASK_CREATED: "Tạo công việc",
  TASK_ASSIGNED: "Phân công công việc",
  TASK_UNASSIGNED: "Gỡ người đảm nhận",
  STATUS_CHANGED: "Thay đổi trạng thái",
  DEADLINE_CHANGED: "Thay đổi deadline",
  DELIVERABLE_ADDED: "Thêm file bàn giao",
  DELIVERABLE_REMOVED: "Xóa file bàn giao",
  STUCK_REPORTED: "Báo bị kẹt",
  STUCK_RESOLVED: "Đã xử lý vấn đề",
};
const vnTime = (v: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(v));
export const TaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ShowTask | null;
  defaultShowId?: string;
}> = ({ isOpen, onClose, taskToEdit, defaultShowId }) => {
  const {
    shows,
    users,
    addTask,
    updateTask,
    currentUser,
    addDeliverable,
    deleteTask,
  } = useOps();
  const [title, setTitle] = useState(""),
    [showId, setShowId] = useState(""),
    [isExternal, setExternal] = useState(false),
    [category, setCategory] = useState<TaskCategory>("10. NHÂN SỰ"),
    [phase, setPhase] = useState<TaskPhase>("PHASE 2 (PLANNING)"),
    [department, setDepartment] = useState<TaskDepartment>("SHOW (SE)"),
    [assigneeId, setAssigneeId] = useState(""),
    [planned, setPlanned] = useState("2026-12-15"),
    [deadline, setDeadline] = useState("2026-12-15"),
    [reason, setReason] = useState(""),
    [priority, setPriority] = useState<ShowTask["priority"]>("Bình thường"),
    [status, setStatus] = useState<ShowTask["status"]>("TODO"),
    [stuckReason, setStuckReason] = useState(""),
    [notes, setNotes] = useState(""),
    [fileTitle, setFileTitle] = useState(""),
    [fileUrl, setFileUrl] = useState(""),
    [activities, setActivities] = useState<TaskActivity[]>([]),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const oldDeadline = (
      taskToEdit?.currentDeadline ||
      taskToEdit?.deadline ||
      ""
    ).slice(0, 10),
    deadlineChanged = !!taskToEdit && deadline !== oldDeadline;
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setShowId(taskToEdit.showId || "");
      setExternal(!taskToEdit.showId);
      setCategory(taskToEdit.category);
      setPhase(taskToEdit.phase || "PHASE 2 (PLANNING)");
      setDepartment(taskToEdit.department || "SHOW (SE)");
      setAssigneeId(taskToEdit.assignees?.[0]?.userId || "");
      setPlanned(
        (taskToEdit.plannedDeadline || taskToEdit.deadline).slice(0, 10),
      );
      setDeadline(oldDeadline);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setStuckReason(taskToEdit.stuckReason || "");
      setNotes(taskToEdit.notes || "");
      void taskApi
        .activities(taskToEdit.id)
        .then(setActivities)
        .catch((e) => setError(e.message));
    } else {
      const external = !defaultShowId;
      setTitle("");
      setExternal(external);
      setShowId(defaultShowId || shows[0]?.id || "");
      setCategory(external ? "TASK NGOÀI (AD-HOC)" : "10. NHÂN SỰ");
      setAssigneeId("");
      setStatus("TODO");
      setNotes("");
      setActivities([]);
    }
  }, [isOpen, taskToEdit, defaultShowId, shows]);
  const assigneeOptions = useMemo(
    () =>
      isExternal
        ? users.filter((u) => u.active)
        : shows.find((s) => s.id === showId)?.members?.map((m) => m.user) || [],
    [isExternal, users, shows, showId],
  );
  const selectedUser = assigneeOptions.find((u) => u.id === assigneeId);
  if (!isOpen) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deadlineChanged && !reason.trim()) {
      setError("Vui lòng nhập lý do thay đổi deadline");
      return;
    }
    setSaving(true);
    setError("");
    const data: ShowTask = {
      id: taskToEdit?.id || "",
      showId: isExternal ? undefined : showId,
      title: title.trim(),
      category: isExternal ? "TASK NGOÀI (AD-HOC)" : category,
      phase,
      department,
      pic: selectedUser?.name || "",
      assignees:
        assigneeId && selectedUser
          ? [
              {
                taskId: taskToEdit?.id || "",
                userId: assigneeId,
                user: selectedUser,
              },
            ]
          : [],
      deadline,
      currentDeadline: deadline,
      plannedDeadline: planned,
      deadlineChangeReason: reason,
      priority,
      status,
      stuckReason: status === "STUCK" ? stuckReason : undefined,
      notes: notes.trim(),
      isExternalTask: isExternal,
    };
    try {
      taskToEdit ? await updateTask(data) : await addTask(data);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể lưu task");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-4">
        <div className="flex justify-between border-b pb-3">
          <h3 className="font-black flex gap-2">
            <CheckSquare size={20} />
            {taskToEdit ? "Chi tiết công việc" : "Tạo công việc mới"}
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-sm">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4 text-sm">
          <div>
            <label className="font-bold">Tên công việc</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border bg-transparent"
            />
          </div>
          {!taskToEdit && (
            <label className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <input
                type="checkbox"
                checked={isExternal}
                onChange={(e) => {
                  setExternal(e.target.checked);
                  setAssigneeId("");
                }}
              />
              Công việc nội bộ, không thuộc Show
            </label>
          )}
          {!isExternal && (
            <select
              value={showId}
              onChange={(e) => {
                setShowId(e.target.value);
                setAssigneeId("");
              }}
              className="w-full p-2.5 rounded-xl border bg-transparent"
            >
              {shows.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold">Người đảm nhận</label>
              <select
                value={assigneeId}
                disabled={currentUser?.companyRole !== "MANAGER"}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-transparent"
              >
                <option value="">Chưa phân công</option>
                {assigneeOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold">Bộ phận</label>
              <input
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value as TaskDepartment)
                }
                className="w-full p-2.5 rounded-xl border bg-transparent"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold">Planned Deadline</label>
              <input
                type="date"
                value={planned}
                disabled={!!taskToEdit}
                onChange={(e) => setPlanned(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-transparent disabled:opacity-60"
              />
            </div>
            <div>
              <label className="font-bold">Current Deadline</label>
              <input
                type="date"
                value={deadline}
                disabled={currentUser?.companyRole !== "MANAGER"}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-transparent disabled:opacity-60"
              />
            </div>
          </div>
          {deadlineChanged && (
            <div>
              <label className="font-bold text-amber-700">
                Lý do thay đổi deadline *
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Lineup chốt trễ"
                className="w-full p-2.5 rounded-xl border border-amber-400 bg-transparent"
              />
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as ShowTask["priority"])
              }
              className="p-2.5 rounded-xl border bg-transparent"
            >
              <option>Bình thường</option>
              <option>Quan trọng</option>
              <option>Khẩn cấp</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ShowTask["status"])}
              className="p-2.5 rounded-xl border bg-transparent"
            >
              <option value="TODO">Chưa bắt đầu</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="STUCK">Bị kẹt</option>
              <option value="DONE">Đã hoàn thành</option>
            </select>
          </div>
          {status === "STUCK" && (
            <textarea
              required
              value={stuckReason}
              onChange={(e) => setStuckReason(e.target.value)}
              placeholder="Lý do bị kẹt"
              className="w-full p-2.5 rounded-xl border border-rose-400 bg-transparent"
            />
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Mô tả / ghi chú"
            className="w-full p-2.5 rounded-xl border bg-transparent"
          />
          {taskToEdit && (
            <>
              <div className="border-t pt-4 space-y-2">
                <b>KẾT QUẢ / FILE BÀN GIAO</b>
                {taskToEdit.deliverables?.map((d) => (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-cyan-600"
                  >
                    {d.title || d.url}
                  </a>
                ))}
                <div className="grid md:grid-cols-3 gap-2">
                  <input
                    value={fileTitle}
                    onChange={(e) => setFileTitle(e.target.value)}
                    placeholder="Tên file"
                    className="p-2 border rounded"
                  />
                  <input
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="p-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await addDeliverable(taskToEdit.id, fileTitle, fileUrl);
                        setFileTitle("");
                        setFileUrl("");
                        setActivities(await taskApi.activities(taskToEdit.id));
                      } catch (e) {
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Không thể thêm link",
                        );
                      }
                    }}
                    className="bg-cyan-600 text-white rounded font-bold"
                  >
                    + Thêm link
                  </button>
                </div>
              </div>
              <div className="border-t pt-4">
                <b className="flex gap-2">
                  <Clock3 size={16} />
                  LỊCH SỬ HOẠT ĐỘNG
                </b>
                <div className="mt-3 space-y-3">
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      className="border-l-2 border-amber-400 pl-3"
                    >
                      <div className="text-xs text-slate-500">
                        {vnTime(a.createdAt)}
                      </div>
                      <div>
                        <b>{a.actor.name}</b> ·{" "}
                        {activityLabels[a.type] || a.type}
                      </div>
                      {a.type === "DEADLINE_CHANGED" && (
                        <div className="text-xs">
                          {new Date(String(a.metadata.from)).toLocaleDateString(
                            "vi-VN",
                          )}{" "}
                          →{" "}
                          {new Date(String(a.metadata.to)).toLocaleDateString(
                            "vi-VN",
                          )}
                          <br />
                          Lý do: {String(a.metadata.reason)}
                        </div>
                      )}
                      {a.type === "TASK_ASSIGNED" && (
                        <div className="text-xs">
                          {String(a.metadata.userName || "")}
                        </div>
                      )}
                    </div>
                  ))}
                  {!activities.length && (
                    <p className="text-slate-500">Chưa có hoạt động.</p>
                  )}
                </div>
              </div>
            </>
          )}
          <div className="flex justify-between border-t pt-4">
            {taskToEdit && currentUser?.companyRole === "MANAGER" ? (
              <button
                type="button"
                onClick={async () => {
                  await deleteTask(taskToEdit.id);
                  onClose();
                }}
                className="text-rose-600 font-bold"
              >
                Xóa task
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose}>
                Hủy
              </button>
              <button
                disabled={saving}
                className="bg-amber-600 text-white px-5 py-2 rounded-xl font-bold disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
