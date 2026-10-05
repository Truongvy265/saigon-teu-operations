import React from 'react';
import { 
  AlertTriangle, 
  Layers, 
  Calendar, 
  KanbanSquare, 
  Clock, 
  BarChart3, 
  CircleDollarSign, 
  Receipt, 
  Users, 
  CheckSquare, 
  ShieldAlert,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useOps } from '../context/OpsContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewShowModal: () => void;
  onOpenNewTaskModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewShowModal,
  onOpenNewTaskModal
}) => {
  const { roleMode, setRoleMode, tasks, resetToDefaultData } = useOps();

  const stuckTasks = tasks.filter(t => t.status === 'STUCK');
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'DONE') return false;
    // simple check if deadline passed or urgent
    return t.priority === 'Khẩn cấp';
  });

  const navItems = [
    { id: 'radar', label: 'Điều Hành & Cảnh Báo', icon: ShieldAlert, highlight: stuckTasks.length > 0 },
    { id: 'shows', label: '[SGT] Show Các Tháng', icon: Calendar },
    { id: 'project-plan', label: 'Project Plan & Timeline', icon: KanbanSquare },
    { id: 'ad-hoc', label: 'Task Ngoài (Giao Việc)', icon: CheckSquare },
    { id: 'attendance', label: 'Chấm Công Theo Show', icon: Clock },
    { id: 'analytics', label: 'Phân Tích Số Liệu 2026', icon: BarChart3 },
    { id: 'finance', label: '[SGT-OP] Finance Draft', icon: CircleDollarSign },
    { id: 'advances', label: 'Hoàn Tạm Ứng 2026', icon: Receipt },
    { id: 'barem', label: 'Barem OP & Nhân Sự', icon: Users },
  ];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-inner">
              SGT
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white tracking-wide">SGT OPERATIONS HUB</span>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-500/40 font-medium">
                  Barem OP 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Hệ thống điều hành show sự kiện, timeline & kiểm soát tắc nghẽn
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Stuck Alert Badge */}
            {stuckTasks.length > 0 && (
              <button 
                onClick={() => setActiveTab('radar')}
                className="flex items-center space-x-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 px-3 py-1.5 rounded-lg text-xs font-semibold transition animate-pulse"
                title="Có task bị kẹt cần tháo gỡ ngay"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{stuckTasks.length} Task Bị Kẹt!</span>
              </button>
            )}

            {/* Quick Add Buttons for QL & SE */}
            {roleMode !== 'VIEWER' && (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={onOpenNewTaskModal}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-medium border border-slate-700 transition"
                >
                  + Giao Task
                </button>
                <button
                  onClick={onOpenNewShowModal}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3.5 py-2 rounded-lg font-semibold shadow-sm transition"
                >
                  + Tạo Show Mới
                </button>
              </div>
            )}

            {/* Role Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-medium">
              <span className="text-slate-400 px-2 text-[11px] uppercase tracking-wider hidden lg:inline">Chế độ:</span>
              <button
                onClick={() => setRoleMode('QL')}
                className={`px-2.5 py-1 rounded transition ${
                  roleMode === 'QL' 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                QL (Quản Lý)
              </button>
              <button
                onClick={() => setRoleMode('SE')}
                className={`px-2.5 py-1 rounded transition ${
                  roleMode === 'SE' 
                    ? 'bg-indigo-600 text-white font-bold shadow' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                SE (Điều Phối)
              </button>
              <button
                onClick={() => setRoleMode('VIEWER')}
                className={`px-2 py-1 rounded transition ${
                  roleMode === 'VIEWER' 
                    ? 'bg-slate-700 text-slate-200 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Người Xem
              </button>
            </div>

            {/* Reset data */}
            <button
              onClick={() => {
                if (confirm('Khôi phục dữ liệu mẫu gốc theo đúng các bảng tính của Saigon Tếu?')) {
                  resetToDefaultData();
                }
              }}
              title="Khôi phục dữ liệu mẫu chuẩn"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 py-1.5 min-w-max">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'radar' && stuckTasks.length > 0 && (
                  <span className="bg-rose-600 text-white rounded-full text-[10px] px-1.5 py-0.2 font-black">
                    {stuckTasks.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
