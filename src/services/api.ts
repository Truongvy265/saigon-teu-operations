import type {
  ShowInfo,
  ShowMember,
  ShowTask,
  TaskActivity,
  TaskDeliverable,
  User,
} from "../types";
import { frontendAuthMode, getFirebaseToken } from "./auth";
const base =
  (import.meta as ImportMeta & { env: Record<string, string> }).env
    .VITE_API_URL || "http://localhost:4000/api";
let userId = localStorage.getItem("sgt_dev_user_id") || "";
export const setApiUser = (id: string) => {
  userId = id;
  localStorage.setItem("sgt_dev_user_id", id);
};
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getFirebaseToken();
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(frontendAuthMode === "development" && userId
        ? { "x-user-id": userId }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API error ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
const mapShow = (s: any): ShowInfo => ({
  ...s,
  date: new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(s.showDate)),
  locationCity: s.city,
  time: s.startTime,
  apiStatus: s.status,
  status:
    s.status === "COMPLETED"
      ? "COMPLETED"
      : s.status === "CANCELLED"
        ? "CANCELLED"
        : s.status === "READY"
          ? "IN_PROGRESS"
          : "UPCOMING",
  scale: s.scale || "",
  goal: s.goal || "",
  personnel: {
    pm:
      s.members?.find((m: any) => m.role === "PM")?.user.name ||
      "Chưa phân công",
    se:
      s.members?.find((m: any) => m.role === "SE")?.user.name ||
      "Chưa phân công",
    ctvCount: 0,
    htvCount: 0,
  },
  lineup: { host: "", comedians: [] },
  pricing: [],
  shifts: [],
  social: {},
  ticketTotalTarget: 0,
  ticketSold: 0,
});
const priorityFromApi = (p: string) =>
  p === "URGENT"
    ? "Khẩn cấp"
    : p === "IMPORTANT"
      ? "Quan trọng"
      : "Bình thường";
const days = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
export const mapTask = (t: any): ShowTask => ({
  ...t,
  showId: t.showId || undefined,
  showName: t.show?.name || "Công việc nội bộ",
  isExternalTask: !t.showId,
  category: t.category || "TASK NGOÀI (AD-HOC)",
  pic: t.assignees?.map((a: any) => a.user.name).join(", ") || "",
  deadline: t.currentDeadline,
  priority: priorityFromApi(t.priority),
  notes: t.description,
  deadlineVarianceDays: days(t.plannedDeadline, t.currentDeadline),
  completionVarianceDays: t.completedAt
    ? Math.ceil(
        (new Date(t.completedAt).getTime() -
          new Date(t.currentDeadline).getTime()) /
          86_400_000,
      )
    : undefined,
});
const taskPayload = (t: Partial<ShowTask>) => ({
  title: t.title,
  description: t.description ?? t.notes,
  category: t.category,
  phase: t.phase,
  department: t.department,
  startDate: t.startDate || null,
  plannedDeadline: t.plannedDeadline || t.deadline,
  currentDeadline: t.currentDeadline || t.deadline,
  deadlineChangeReason: t.deadlineChangeReason,
  assigneeId: t.assignees?.[0]?.userId,
  priority:
    t.priority === "Khẩn cấp"
      ? "URGENT"
      : t.priority === "Quan trọng"
        ? "IMPORTANT"
        : "NORMAL",
  status: t.status,
  stuckReason: t.stuckReason,
});
export const userApi = {
  list: () => request<User[]>("/users"),
  me: () => request<User>("/me"),
};
export const showApi = {
  list: async () => (await request<any[]>("/shows")).map(mapShow),
  create: async (s: any) =>
    mapShow(
      await request("/shows", { method: "POST", body: JSON.stringify(s) }),
    ),
  update: async (id: string, s: any) =>
    mapShow(
      await request(`/shows/${id}`, {
        method: "PATCH",
        body: JSON.stringify(s),
      }),
    ),
  deleteSummary: (id: string) =>
    request<{ tasks: number; members: number; deliverables: number }>(
      `/shows/${id}/delete-summary`,
    ),
  remove: (id: string) => request<void>(`/shows/${id}`, { method: "DELETE" }),
  addMember: (showId: string, userId: string, role: string) =>
    request<ShowMember>(`/shows/${showId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    }),
  updateMember: (id: string, role: string) =>
    request<ShowMember>(`/show-members/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (id: string) =>
    request<void>(`/show-members/${id}`, { method: "DELETE" }),
};
export const taskApi = {
  list: async (scope = "ALL") =>
    (await request<any[]>(`/tasks?scope=${scope}`)).map(mapTask),
  forShow: async (id: string) =>
    (await request<any[]>(`/shows/${id}/tasks`)).map(mapTask),
  create: async (showId: string | undefined, t: Partial<ShowTask>) =>
    mapTask(
      await request(showId ? `/shows/${showId}/tasks` : "/tasks", {
        method: "POST",
        body: JSON.stringify(taskPayload(t)),
      }),
    ),
  update: async (id: string, t: Partial<ShowTask>) =>
    mapTask(
      await request(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(taskPayload(t)),
      }),
    ),
  deleteSummary: (id: string) =>
    request<{
      _count: {
        deliverables: number;
        activities: number;
        predecessors: number;
        successors: number;
      };
    }>(`/tasks/${id}/delete-summary`),
  remove: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
  assign: (id: string, uid: string) =>
    request(`/tasks/${id}/assignees`, {
      method: "POST",
      body: JSON.stringify({ userId: uid }),
    }),
  unassign: (id: string, uid: string) =>
    request<void>(`/tasks/${id}/assignees/${uid}`, { method: "DELETE" }),
  my: async () => (await request<any[]>("/me/tasks")).map(mapTask),
  activities: (id: string) =>
    request<TaskActivity[]>(`/tasks/${id}/activities`),
  addDeliverable: (id: string, title: string, url: string) =>
    request<TaskDeliverable>(`/tasks/${id}/deliverables`, {
      method: "POST",
      body: JSON.stringify({ title, url }),
    }),
  removeDeliverable: (id: string) =>
    request<void>(`/deliverables/${id}`, { method: "DELETE" }),
};
