import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { ShowTask } from '../types';

interface AdHocTasksProps {
  onOpenNewTaskModal: () => void;
  onOpenTaskDetail: (task: ShowTask) => void;
}

export const AdHocTasks: React.FC<AdHocTasksProps> = ({
  onOpenNewTaskModal,
  onOpenTaskDetail
}) => {
  const { tasks, toggleTaskStatus, roleMode } = useOps();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'STUCK' | 'DONE'>('ALL');

  // Ad-hoc tasks are either marked isExternalTask === true or showId is empty
  const adHocTasks = tasks.filter(t => t.isExternalTask || !t.showId).filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.pic.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Task Ngoài & Vận Hành Độc Lập</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Giao Việc & Theo Dõi Task Phát Sinh Ngoài Show
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dành cho các công việc không thuộc riêng lẻ 1 show: Bảo trì kho đạo cụ, tuyển dụng HTV quý, hợp đồng nền tảng Ve Vé, đào tạo kỹ năng xử lý tình huống...
          </p>
        </div>

        {roleMode !== 'VIEWER' && (
          <button
            onClick={onOpenNewTaskModal}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-md transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Task Ngoài Mới</span>
          </button>
        )}
      </div>

      {/* Filter and Stats */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc người nhận task (PIC)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-1">
          {(['ALL', 'TODO', 'IN_PROGRESS', 'STUCK', 'DONE'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filterStatus === st 
                  ? 'bg-amber-500 text-slate-950 font-bold' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'TODO' ? 'Chưa làm' : st === 'IN_PROGRESS' ? 'Đang làm' : st === 'STUCK' ? 'Bị kẹt' : 'Đã xong'}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adHocTasks.map(task => {
          const isStuck = task.status === 'STUCK';
          const isDone = task.status === 'DONE';

          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                isStuck 
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-400 dark:border-rose-900' 
                  : isDone
                  ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                    Task Ngoài
                  </span>
                  <span className={`text-[11px] font-bold ${
                    task.priority === 'Khẩn cấp' ? 'text-rose-600' : 'text-slate-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                <h3 
                  onClick={() => onOpenTaskDetail(task)}
                  className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug cursor-pointer hover:text-amber-600 transition"
                >
                  {task.title}
                </h3>

                <div className="mt-2 text-xs text-slate-500 space-y-1">
                  <div>
                    Người nhận việc (PIC): <strong className="text-amber-600 dark:text-amber-400">{task.pic}</strong>
                  </div>
                  <div>
                    Hạn chót: <strong className="text-slate-700 dark:text-slate-300 font-mono">{task.deadline}</strong>
                  </div>
                </div>

                {isStuck && task.stuckReason && (
                  <div className="mt-3 p-2.5 bg-rose-100/70 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200">
                    <strong className="block font-bold mb-0.5 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Vướng mắc:</span>
                    </strong>
                    <p>{task.stuckReason}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onOpenTaskDetail(task)}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  Chi tiết
                </button>

                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                    isDone 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' 
                      : isStuck
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isDone ? '✓ Đã Xong' : isStuck ? 'Gỡ Kẹt / Chuyển' : 'Đổi Trạng Thái'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
