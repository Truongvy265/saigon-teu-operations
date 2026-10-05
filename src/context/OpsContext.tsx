import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ShowInfo, 
  ShowTask, 
  AnalyticsShowData, 
  AdvanceSettlementItem, 
  ShowAttendanceRecord 
} from '../types';
import { 
  INITIAL_SHOWS, 
  INITIAL_TASKS, 
  INITIAL_ANALYTICS, 
  INITIAL_ADVANCES, 
  INITIAL_ATTENDANCE 
} from '../data/initialData';

interface OpsContextType {
  roleMode: 'QL' | 'SE' | 'VIEWER';
  setRoleMode: (mode: 'QL' | 'SE' | 'VIEWER') => void;
  shows: ShowInfo[];
  tasks: ShowTask[];
  analytics: AnalyticsShowData[];
  advances: AdvanceSettlementItem[];
  attendance: ShowAttendanceRecord[];
  
  // Show Actions
  addShow: (show: ShowInfo) => void;
  updateShow: (show: ShowInfo) => void;
  deleteShow: (id: string) => void;

  // Task Actions
  addTask: (task: ShowTask) => void;
  updateTask: (task: ShowTask) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  reportTaskStuck: (id: string, reason: string) => void;
  resolveTaskStuck: (id: string) => void;

  // Analytics Actions
  addAnalyticsRecord: (data: AnalyticsShowData) => void;

  // Advance Actions
  addAdvanceItem: (item: AdvanceSettlementItem) => void;
  updateAdvanceItem: (item: AdvanceSettlementItem) => void;
  toggleDoubleCheck: (id: string, round: 1 | 2 | 3) => void;

  // Attendance Actions
  addAttendanceRecord: (record: ShowAttendanceRecord) => void;
  updateAttendanceStatus: (id: string, status: ShowAttendanceRecord['status']) => void;

  // Quick reset to sample data
  resetToDefaultData: () => void;
}

const OpsContext = createContext<OpsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SHOWS: 'sgt_ops_shows_v1',
  TASKS: 'sgt_ops_tasks_v1',
  ANALYTICS: 'sgt_ops_analytics_v1',
  ADVANCES: 'sgt_ops_advances_v1',
  ATTENDANCE: 'sgt_ops_attendance_v1',
  ROLE: 'sgt_ops_role_v1'
};

export const OpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roleMode, setRoleMode] = useState<'QL' | 'SE' | 'VIEWER'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as 'QL' | 'SE' | 'VIEWER') || 'QL';
  });

  const [shows, setShows] = useState<ShowInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOWS);
    return saved ? JSON.parse(saved) : INITIAL_SHOWS;
  });

  const [tasks, setTasks] = useState<ShowTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [analytics, setAnalytics] = useState<AnalyticsShowData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    return saved ? JSON.parse(saved) : INITIAL_ANALYTICS;
  });

  const [advances, setAdvances] = useState<AdvanceSettlementItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADVANCES);
    return saved ? JSON.parse(saved) : INITIAL_ADVANCES;
  });

  const [attendance, setAttendance] = useState<ShowAttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, roleMode);
  }, [roleMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOWS, JSON.stringify(shows));
  }, [shows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  }, [analytics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  // Show functions
  const addShow = (show: ShowInfo) => {
    setShows(prev => [show, ...prev]);

    // Automatically generate foundational project plan tasks for this show based on standard SGT-OP workflow!
    const defaultCategories: { cat: ShowTask['category']; title: string; pic: string; daysBefore: number }[] = [
      { cat: '1. VENUE', title: `Khảo sát và ký hợp đồng địa điểm: ${show.venue}`, pic: show.personnel.pm || 'Anh Khôi', daysBefore: 21 },
      { cat: '2. LINEUP VÀ KỊCH BẢN CHỮ', title: `Chốt lineup & kịch bản chữ show: ${show.name}`, pic: 'Nhung, Ý', daysBefore: 14 },
      { cat: '3. GIẤY PHÉP', title: `Xin giấy phép biểu diễn Sở VHTT cho show: ${show.name}`, pic: 'Yến Nhi, Anh Khôi', daysBefore: 14 },
      { cat: '4. THÔNG TIN SHOW', title: `Thiết kế banner & mở form bán vé Ve Vé: ${show.name}`, pic: show.personnel.pe || 'Diệp Huỳnh, Vỹ', daysBefore: 20 },
      { cat: '6. DỰ TRÙ KINH PHÍ', title: `Dự trù kinh phí và duyệt barem tài chính show: ${show.name}`, pic: 'Anh Khôi, Anh Tùng', daysBefore: 18 },
      { cat: '7. TẠM ỨNG & GIẢI CHI', title: `Lập đề xuất tạm ứng chi phí trước show: ${show.name}`, pic: show.personnel.se || 'Yến Nhi', daysBefore: 7 },
      { cat: '9. LOGISTIC', title: `Chuẩn bị checklist vật dụng OP, quà tặng, nước uống`, pic: 'Chi', daysBefore: 5 },
      { cat: '10. NHÂN SỰ', title: `Xếp lịch và chia ca CTV/HTV onsite show: ${show.name}`, pic: 'Phương Nhi', daysBefore: 5 },
      { cat: '11. REMARKETING VÀ SALE VÉ', title: `Chạy truyền thông, broadcast & Zalo CSKH thúc đẩy bán vé`, pic: show.personnel.sae || 'Quỳnh, Chum', daysBefore: 15 },
    ];

    const newTasks: ShowTask[] = defaultCategories.map((item, idx) => ({
      id: `task-gen-${Date.now()}-${idx}`,
      showId: show.id,
      showName: show.name,
      category: item.cat,
      title: item.title,
      pic: item.pic,
      startDate: new Date().toLocaleDateString('vi-VN'),
      deadline: show.date,
      priority: 'Quan trọng',
      status: 'TODO',
      progressPercent: 0,
      notes: 'Tự động tạo theo quy trình SGT-OP'
    }));

    setTasks(prev => [...newTasks, ...prev]);
  };

  const updateShow = (updatedShow: ShowInfo) => {
    setShows(prev => prev.map(s => s.id === updatedShow.id ? updatedShow : s));
  };

  const deleteShow = (id: string) => {
    setShows(prev => prev.filter(s => s.id !== id));
  };

  // Task functions
  const addTask = (task: ShowTask) => {
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (updatedTask: ShowTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.status === 'TODO') return { ...t, status: 'IN_PROGRESS', progressPercent: 40 };
      if (t.status === 'IN_PROGRESS') return { ...t, status: 'DONE', progressPercent: 100, stuckReason: undefined };
      if (t.status === 'STUCK') return { ...t, status: 'IN_PROGRESS', stuckReason: undefined };
      return { ...t, status: 'TODO', progressPercent: 0 };
    }));
  };

  const reportTaskStuck = (id: string, reason: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        status: 'STUCK',
        stuckReason: reason
      };
    }));
  };

  const resolveTaskStuck = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        status: 'IN_PROGRESS',
        stuckReason: undefined
      };
    }));
  };

  // Analytics functions
  const addAnalyticsRecord = (record: AnalyticsShowData) => {
    setAnalytics(prev => [record, ...prev]);
  };

  // Advance functions
  const addAdvanceItem = (item: AdvanceSettlementItem) => {
    setAdvances(prev => [item, ...prev]);
  };

  const updateAdvanceItem = (updatedItem: AdvanceSettlementItem) => {
    setAdvances(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const toggleDoubleCheck = (id: string, round: 1 | 2 | 3) => {
    setAdvances(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (round === 1) return { ...item, doubleCheckRound1: !item.doubleCheckRound1 };
      if (round === 2) return { ...item, doubleCheckRound2: !item.doubleCheckRound2 };
      if (round === 3) return { ...item, doubleCheckRound3: !item.doubleCheckRound3 };
      return item;
    }));
  };

  // Attendance functions
  const addAttendanceRecord = (record: ShowAttendanceRecord) => {
    setAttendance(prev => [record, ...prev]);
  };

  const updateAttendanceStatus = (id: string, status: ShowAttendanceRecord['status']) => {
    setAttendance(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const resetToDefaultData = () => {
    setShows(INITIAL_SHOWS);
    setTasks(INITIAL_TASKS);
    setAnalytics(INITIAL_ANALYTICS);
    setAdvances(INITIAL_ADVANCES);
    setAttendance(INITIAL_ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.SHOWS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.ANALYTICS);
    localStorage.removeItem(STORAGE_KEYS.ADVANCES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  };

  return (
    <OpsContext.Provider value={{
      roleMode,
      setRoleMode,
      shows,
      tasks,
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
      addAnalyticsRecord,
      addAdvanceItem,
      updateAdvanceItem,
      toggleDoubleCheck,
      addAttendanceRecord,
      updateAttendanceStatus,
      resetToDefaultData
    }}>
      {children}
    </OpsContext.Provider>
  );
};

export const useOps = () => {
  const context = useContext(OpsContext);
  if (!context) throw new Error('useOps must be used within OpsProvider');
  return context;
};
