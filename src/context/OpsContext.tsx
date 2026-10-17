import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AdvanceSettlementItem,
  AnalyticsShowData,
  ShowAttendanceRecord,
  ShowInfo,
  ShowMemberRole,
  ShowTask,
  User,
} from "../types";
import {
  INITIAL_ADVANCES,
  INITIAL_ANALYTICS,
  INITIAL_ATTENDANCE,
} from "../data/initialData";
import { setApiUser, showApi, taskApi, userApi } from "../services/api";
type RoleMode = "QL" | "SE" | "VIEWER";
interface OpsContextType {
  roleMode: RoleMode;
  setRoleMode: (r: RoleMode) => void;
  shows: ShowInfo[];
  tasks: ShowTask[];
  users: User[];
  currentUser?: User;
  loading: boolean;
  error: string | null;
  analytics: AnalyticsShowData[];
  advances: AdvanceSettlementItem[];
  attendance: ShowAttendanceRecord[];
  setCurrentUser: (id: string) => Promise<void>;
  refreshCore: () => Promise<void>;
  addShow: (s: ShowInfo) => Promise<void>;
  updateShow: (s: ShowInfo) => Promise<void>;
  deleteShow: (id: string) => Promise<void>;
  addTask: (t: ShowTask) => Promise<void>;
  updateTask: (t: ShowTask) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  reportTaskStuck: (id: string, r: string) => Promise<void>;
  resolveTaskStuck: (id: string) => Promise<void>;
  addShowMember: (s: string, u: string, r: ShowMemberRole) => Promise<void>;
  updateShowMember: (id: string, r: ShowMemberRole) => Promise<void>;
  removeShowMember: (id: string) => Promise<void>;
  assignTask: (t: string, u: string) => Promise<void>;
  unassignTask: (t: string, u: string) => Promise<void>;
  addDeliverable: (t: string, title: string, url: string) => Promise<void>;
  addAnalyticsRecord: (d: AnalyticsShowData) => void;
  addAdvanceItem: (i: AdvanceSettlementItem) => void;
  updateAdvanceItem: (i: AdvanceSettlementItem) => void;
  toggleDoubleCheck: (id: string, r: 1 | 2 | 3) => void;
  addAttendanceRecord: (r: ShowAttendanceRecord) => void;
  updateAttendanceStatus: (
    id: string,
    s: ShowAttendanceRecord["status"],
  ) => void;
  resetToDefaultData: () => void;
}
const C = createContext<OpsContextType | undefined>(undefined);
const saved = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};
export const OpsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [roleMode, setRoleMode] = useState<RoleMode>("QL"),
    [shows, setShows] = useState<ShowInfo[]>([]),
    [tasks, setTasks] = useState<ShowTask[]>([]),
    [users, setUsers] = useState<User[]>([]),
    [currentUserId, setCurrentUserId] = useState(
      localStorage.getItem("sgt_dev_user_id") || "",
    ),
    [loading, setLoading] = useState(true),
    [error, setError] = useState<string | null>(null),
    [analytics, setAnalytics] = useState(() =>
      saved("sgt_ops_analytics_v1", INITIAL_ANALYTICS),
    ),
    [advances, setAdvances] = useState(() =>
      saved("sgt_ops_advances_v1", INITIAL_ADVANCES),
    ),
    [attendance, setAttendance] = useState(() =>
      saved("sgt_ops_attendance_v1", INITIAL_ATTENDANCE),
    );
  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || users[0],
    [users, currentUserId],
  );
  const refreshCore = async () => {
    setLoading(true);
    setError(null);
    try {
      const [us, self] = await Promise.all([userApi.list(), userApi.me()]);
      setUsers(us);
      setCurrentUserId(self.id);
      setApiUser(self.id);
      setRoleMode(self.companyRole === "MANAGER" ? "QL" : "SE");
      const [ss, tt] = await Promise.all([showApi.list(), taskApi.list()]);
      setShows(ss);
      setTasks(tt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refreshCore();
  }, []);
  useEffect(
    () =>
      localStorage.setItem("sgt_ops_analytics_v1", JSON.stringify(analytics)),
    [analytics],
  );
  useEffect(
    () => localStorage.setItem("sgt_ops_advances_v1", JSON.stringify(advances)),
    [advances],
  );
  useEffect(
    () =>
      localStorage.setItem("sgt_ops_attendance_v1", JSON.stringify(attendance)),
    [attendance],
  );
  const reload = async (p: Promise<unknown>) => {
    await p;
    await refreshCore();
  };
  const setCurrentUser = async (id: string) => {
    setApiUser(id);
    setCurrentUserId(id);
    await refreshCore();
  };
  const addShow = async (s: ShowInfo) =>
    reload(
      showApi.create({
        name: s.name,
        showDate: s.showDate || s.date,
        startTime: s.time,
        city: s.locationCity,
        venue: s.venue,
        scale: s.scale,
        goal: s.goal,
        status: s.apiStatus || "PLANNING",
        description: s.description,
      }),
    );
  const updateShow = async (s: ShowInfo) =>
    reload(
      showApi.update(s.id, {
        name: s.name,
        showDate: s.showDate,
        city: s.locationCity,
        venue: s.venue,
        scale: s.scale,
        goal: s.goal,
        status: s.apiStatus,
        description: s.description,
      }),
    );
  const deleteShow = async (id: string) => {
    const x = await showApi.deleteSummary(id);
    if (
      confirm(
        `Show này có:\n${x.tasks} Task\n${x.members} nhân sự\n${x.deliverables} file/link bàn giao\n\nBạn có chắc muốn xóa?`,
      )
    )
      await reload(showApi.remove(id));
  };
  const addTask = async (t: ShowTask) => reload(taskApi.create(t.showId, t));
  const updateTask = async (t: ShowTask) => {
    const old = tasks.find((x) => x.id === t.id);
    await taskApi.update(t.id, t);
    if (currentUser?.companyRole === "MANAGER") {
      const before = old?.assignees?.map((a) => a.userId) || [],
        after = t.assignees?.map((a) => a.userId) || [];
      for (const id of before.filter((id) => !after.includes(id)))
        await taskApi.unassign(t.id, id);
      for (const id of after.filter((id) => !before.includes(id)))
        await taskApi.assign(t.id, id);
    }
    await refreshCore();
  };
  const deleteTask = async (id: string) => {
    const x = await taskApi.deleteSummary(id),
      related =
        x._count.deliverables +
        x._count.activities +
        x._count.predecessors +
        x._count.successors;
    if (
      !related ||
      confirm(
        `Task này có dữ liệu liên quan.\n${x._count.deliverables} file, ${x._count.activities} hoạt động, ${x._count.predecessors + x._count.successors} dependency.\nXóa task sẽ xóa lịch sử và file link liên quan.`,
      )
    )
      await reload(taskApi.remove(id));
  };
  const toggleTaskStatus = async (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (t)
      await reload(
        taskApi.update(id, {
          status:
            t.status === "TODO"
              ? "IN_PROGRESS"
              : t.status === "IN_PROGRESS"
                ? "DONE"
                : t.status === "STUCK"
                  ? "IN_PROGRESS"
                  : "TODO",
        }),
      );
  };
  const reportTaskStuck = async (id: string, r: string) =>
    reload(taskApi.update(id, { status: "STUCK", stuckReason: r }));
  const resolveTaskStuck = async (id: string) =>
    reload(taskApi.update(id, { status: "IN_PROGRESS", stuckReason: "" }));
  const value: OpsContextType = {
    roleMode,
    setRoleMode,
    shows,
    tasks,
    users,
    currentUser,
    loading,
    error,
    setCurrentUser,
    refreshCore,
    analytics,
    advances,
    attendance,
    addShow,
    updateShow,
    deleteShow,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    reportTaskStuck,
    resolveTaskStuck,
    addShowMember: async (s, u, r) => reload(showApi.addMember(s, u, r)),
    updateShowMember: async (id, r) => reload(showApi.updateMember(id, r)),
    removeShowMember: async (id) => reload(showApi.removeMember(id)),
    assignTask: async (t, u) => reload(taskApi.assign(t, u)),
    unassignTask: async (t, u) => reload(taskApi.unassign(t, u)),
    addDeliverable: async (t, title, url) =>
      reload(taskApi.addDeliverable(t, title, url)),
    addAnalyticsRecord: (d) => setAnalytics((p) => [d, ...p]),
    addAdvanceItem: (i) => setAdvances((p) => [i, ...p]),
    updateAdvanceItem: (i) =>
      setAdvances((p) => p.map((x) => (x.id === i.id ? i : x))),
    toggleDoubleCheck: (id, r) =>
      setAdvances((p) =>
        p.map((x) =>
          x.id !== id
            ? x
            : {
                ...x,
                [`doubleCheckRound${r}`]:
                  !x[`doubleCheckRound${r}` as keyof typeof x],
              },
        ),
      ),
    addAttendanceRecord: (r) => setAttendance((p) => [r, ...p]),
    updateAttendanceStatus: (id, status) =>
      setAttendance((p) => p.map((x) => (x.id === id ? { ...x, status } : x))),
    resetToDefaultData: () => {
      setAnalytics(INITIAL_ANALYTICS);
      setAdvances(INITIAL_ADVANCES);
      setAttendance(INITIAL_ATTENDANCE);
    },
  };
  return <C.Provider value={value}>{children}</C.Provider>;
};
export const useOps = () => {
  const c = useContext(C);
  if (!c) throw new Error("useOps must be used within OpsProvider");
  return c;
};
