import React, { useState } from 'react';
import { 
  KanbanSquare, 
  Calendar, 
  ListFilter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ChevronDown, 
  ArrowRight,
  Filter,
  Layers,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { ShowTask, TaskCategory, TaskStatus } from '../types';

const CATEGORIES: TaskCategory[] = [
  '1. VENUE',
  '2. LINEUP VÀ KỊCH BẢN CHỮ',
  '3. GIẤY PHÉP',
  '4. THÔNG TIN SHOW',
  '5. SPONSOR',
  '6. DỰ TRÙ KINH PHÍ',
  '7. TẠM ỨNG & GIẢI CHI',
  '8. HÓA ĐƠN & NGHIỆM THU',
  '9. LOGISTIC',
  '10. NHÂN SỰ',
  '11. REMARKETING VÀ SALE VÉ'
];

interface ProjectPlanTimelineProps {
  selectedShowId: string;
  setSelectedShowId: (id: string) => void;
  onOpenNewTaskModal: (showId?: string) => void;
  onOpenTaskDetail: (task: ShowTask) => void;
}

export const ProjectPlanTimeline: React.FC<ProjectPlanTimelineProps> = ({
  selectedShowId,
  setSelectedShowId,
  onOpenNewTaskModal,
  onOpenTaskDetail
}) => {
  const { shows, tasks, toggleTaskStatus, reportTaskStuck, roleMode } = useOps();
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST' | 'TIMELINE'>('KANBAN');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const currentShow = shows.find(s => s.id === selectedShowId) || shows[0];

  const showTasks = tasks.filter(t => {
    const matchesShow = t.showId === currentShow?.id;
    const matchesCat = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesShow && matchesCat && matchesStatus;
  });

  const stuckTasks = showTasks.filter(t => t.status === 'STUCK');
  const doneTasks = showTasks.filter(t => t.status === 'DONE');
  const progressPct = showTasks.length ? Math.round((doneTasks.length / showTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Controller */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
              <KanbanSquare className="w-4 h-4" />
              <span>Bản Kế Hoạch & Timeline Vận Hành [SGT-OP PROJECT PLAN]</span>
            </div>
            
            {/* Show Selector Dropdown */}
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-xs text-slate-400 font-medium">Đang chọn Show:</span>
              <select
                value={currentShow?.id}
                onChange={e => setSelectedShowId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm sm:text-base rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {shows.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.date} - {s.locationCity})
                  </option>
                ))}
              </select>
            </div>
            
            <p className="text-xs text-slate-500 mt-2">
              Bám sát 11 hạng mục tiêu chuẩn từ SGT-OP: Venue, Lineup/Kịch bản, Giấy phép, Thông tin vé, Sponsor, Dự trù, Tạm ứng, Hóa đơn, Logistic, Nhân sự, Remarketing
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-semibold">
              <button
                onClick={() => setViewMode('KANBAN')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'KANBAN' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bảng Kanban
              </button>
              <button
                onClick={() => setViewMode('TIMELINE')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'TIMELINE' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Gantt Timeline
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'LIST' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Danh Sách 11 Hạng Mục
              </button>
            </div>

            {roleMode !== 'VIEWER' && (
              <button
                onClick={() => onOpenNewTaskModal(currentShow?.id)}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Task Cho Show</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Show Highlights Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Tiến độ dự án</span>
            <strong className="text-slate-800 dark:text-slate-200 text-sm">
              {doneTasks.length}/{showTasks.length} task ({progressPct}%)
            </strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Điểm nghẽn / Kẹt</span>
            <strong className={`${stuckTasks.length > 0 ? 'text-rose-600 font-black' : 'text-slate-600'} text-sm`}>
              {stuckTasks.length} task
            </strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[11px]">PM & SE Lead</span>
            <strong className="text-amber-600 dark:text-amber-400 text-sm">
              {currentShow?.personnel.pm} & {currentShow?.personnel.se}
            </strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Địa điểm & Ngày</span>
            <strong className="text-slate-800 dark:text-slate-200 text-sm truncate block" title={currentShow?.venue}>
              {currentShow?.date} @ {currentShow?.venue.split('(')[0]}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          <span className="text-slate-400 font-medium shrink-0">Hạng mục:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">Tất cả 11 hạng mục</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="TODO">Chưa làm</option>
            <option value="IN_PROGRESS">Đang làm</option>
            <option value="STUCK">Bị kẹt / Vướng</option>
            <option value="DONE">Đã xong</option>
          </select>
        </div>

        <span className="text-slate-400 text-xs">
          Đang hiển thị {showTasks.length} task
        </span>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Column TODO */}
          <div className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Chưa Làm (TODO)
                </h3>
              </div>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {showTasks.filter(t => t.status === 'TODO').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {showTasks.filter(t => t.status === 'TODO').map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggleStatus={() => toggleTaskStatus(task.id)}
                  onClick={() => onOpenTaskDetail(task)}
                />
              ))}
            </div>
          </div>

          {/* Column IN PROGRESS */}
          <div className="bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-900 dark:text-cyan-300">
                  Đang Vận Hành
                </h3>
              </div>
              <span className="bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 text-xs font-bold px-2 py-0.5 rounded-full">
                {showTasks.filter(t => t.status === 'IN_PROGRESS').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {showTasks.filter(t => t.status === 'IN_PROGRESS').map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggleStatus={() => toggleTaskStatus(task.id)}
                  onClick={() => onOpenTaskDetail(task)}
                />
              ))}
            </div>
          </div>

          {/* Column STUCK (CRITICAL) */}
          <div className="bg-rose-50/50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-900/60 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-rose-950 dark:text-rose-300">
                  Bị Kẹt / Tắc Nghẽn!
                </h3>
              </div>
              <span className="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {showTasks.filter(t => t.status === 'STUCK').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {showTasks.filter(t => t.status === 'STUCK').map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggleStatus={() => toggleTaskStatus(task.id)}
                  onClick={() => onOpenTaskDetail(task)}
                />
              ))}
              {showTasks.filter(t => t.status === 'STUCK').length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 italic">
                  Không có điểm nghẽn nào cho show này 🎉
                </div>
              )}
            </div>
          </div>

          {/* Column DONE */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Đã Xong (DONE)
                </h3>
              </div>
              <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full">
                {showTasks.filter(t => t.status === 'DONE').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {showTasks.filter(t => t.status === 'DONE').map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggleStatus={() => toggleTaskStatus(task.id)}
                  onClick={() => onOpenTaskDetail(task)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE / GANTT VIEW (As in sheet PROJECT PLAN SHOW HÀ NỘI 19-20/12) */}
      {viewMode === 'TIMELINE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-x-auto shadow-sm">
          <div className="min-w-[800px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
              <div className="w-80">Nội dung Task & Người phụ trách (PIC)</div>
              <div className="w-28 text-center">Bắt đầu</div>
              <div className="w-28 text-center">Hạn chót (Deadline)</div>
              <div className="w-32 text-center">Trạng thái</div>
              <div className="flex-1 text-center">Tiến độ thời gian & Visual Gantt</div>
            </div>

            <div className="space-y-3">
              {showTasks.map(task => {
                const isStuck = task.status === 'STUCK';
                const isDone = task.status === 'DONE';
                return (
                  <div 
                    key={task.id}
                    className={`flex items-center text-xs p-2.5 rounded-xl border transition ${
                      isStuck 
                        ? 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/20' 
                        : isDone 
                        ? 'border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/20' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                    }`}
                  >
                    {/* Task Title & PIC */}
                    <div className="w-80 pr-3 cursor-pointer" onClick={() => onOpenTaskDetail(task)}>
                      <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span className="text-amber-600 font-semibold">{task.pic}</span> • {task.category}
                      </div>
                    </div>

                    <div className="w-28 text-center font-mono text-slate-500 text-[11px]">
                      {task.startDate || '--'}
                    </div>

                    <div className="w-28 text-center font-mono font-bold text-amber-600 text-[11px]">
                      {task.deadline}
                    </div>

                    <div className="w-32 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isStuck 
                          ? 'bg-rose-500 text-white' 
                          : isDone 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-cyan-500 text-white'
                      }`}>
                        {task.status === 'STUCK' ? 'BỊ KẸT' : task.status === 'DONE' ? 'HOÀN THÀNH' : 'ĐANG LÀM'}
                      </span>
                    </div>

                    {/* Progress Visual Bar */}
                    <div className="flex-1 px-4">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isStuck ? 'bg-rose-500' : isDone ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${task.progressPercent || (isDone ? 100 : 40)}%` }}
                        />
                      </div>
                      {isStuck && task.stuckReason && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 truncate" title={task.stuckReason}>
                          ⚠️ Kẹt: {task.stuckReason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LIST TABLE VIEW (Grouped by 11 Categories) */}
      {viewMode === 'LIST' && (
        <div className="space-y-4">
          {CATEGORIES.map(category => {
            const catTasks = showTasks.filter(t => t.category === category);
            if (catTasks.length === 0 && categoryFilter !== 'ALL') return null;

            return (
              <div 
                key={category}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="bg-slate-50 dark:bg-slate-850 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    {category}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {catTasks.length} tasks
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {catTasks.map(task => (
                    <div 
                      key={task.id}
                      className="p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 cursor-pointer" onClick={() => onOpenTaskDetail(task)}>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.status === 'STUCK' ? 'bg-rose-100 text-rose-700' :
                            task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-cyan-100 text-cyan-700'
                          }`}>
                            {task.status}
                          </span>
                          <h5 className="font-bold text-slate-900 dark:text-slate-100">
                            {task.title}
                          </h5>
                        </div>
                        {task.stuckReason && (
                          <div className="text-rose-600 dark:text-rose-400 text-[11px] mt-1 font-medium flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Lý do kẹt: {task.stuckReason}</span>
                          </div>
                        )}
                        {task.notes && (
                          <p className="text-slate-500 text-[11px] mt-0.5">{task.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-slate-500 text-xs shrink-0">
                        <div>
                          PIC: <strong className="text-amber-600 font-semibold">{task.pic}</strong>
                        </div>
                        <div className="font-mono">
                          Hạn: <strong className="text-slate-700 dark:text-slate-300">{task.deadline}</strong>
                        </div>
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-semibold text-[11px] transition"
                        >
                          Chuyển TT
                        </button>
                      </div>
                    </div>
                  ))}
                  {catTasks.length === 0 && (
                    <div className="p-3 text-xs text-slate-400 italic">
                      Chưa có task cho hạng mục này
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: ShowTask;
  onToggleStatus: () => void;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleStatus, onClick }) => {
  const isStuck = task.status === 'STUCK';

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-850 p-3 rounded-xl border shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between ${
        isStuck 
          ? 'border-rose-400 dark:border-rose-900 bg-rose-50/20' 
          : 'border-slate-200 dark:border-slate-700/80 hover:border-amber-400'
      }`}
    >
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[130px]">
            {task.category.split('.')[1] || task.category}
          </span>
          <span className={`font-bold ${task.priority === 'Khẩn cấp' ? 'text-rose-600' : 'text-slate-400'}`}>
            {task.priority}
          </span>
        </div>

        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug line-clamp-2">
          {task.title}
        </h4>

        {isStuck && task.stuckReason && (
          <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-[11px] text-rose-700 dark:text-rose-300">
            <strong>⚠️ Kẹt:</strong> {task.stuckReason}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-amber-600 dark:text-amber-400 font-semibold truncate max-w-[90px]" title={task.pic}>
          👤 {task.pic}
        </span>
        <span className="font-mono text-slate-400">
          📅 {task.deadline}
        </span>
      </div>
    </div>
  );
};
