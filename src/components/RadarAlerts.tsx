import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  UserCheck, 
  Check, 
  MessageSquare,
  AlertTriangle,
  Send
} from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { ShowTask } from '../types';

export const RadarAlerts: React.FC<{
  onSelectShow: (showId: string) => void;
  onOpenTaskModal: (task: ShowTask) => void;
}> = ({ onSelectShow, onOpenTaskModal }) => {
  const { tasks, shows, resolveTaskStuck, reportTaskStuck, roleMode } = useOps();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STUCK' | 'URGENT' | 'BY_SHOW'>('ALL');
  const [unstickModalTask, setUnstickModalTask] = useState<ShowTask | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const stuckTasks = tasks.filter(t => t.status === 'STUCK');
  const urgentTasks = tasks.filter(t => t.priority === 'Khẩn cấp' && t.status !== 'DONE');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'DONE');

  const totalTasks = tasks.length;
  const overallProgress = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Group tasks by PIC to see who is overloaded or blocked
  const picStats = tasks.reduce((acc, task) => {
    const pic = task.pic || 'Chưa gán';
    if (!acc[pic]) acc[pic] = { total: 0, stuck: 0, done: 0 };
    acc[pic].total += 1;
    if (task.status === 'STUCK') acc[pic].stuck += 1;
    if (task.status === 'DONE') acc[pic].done += 1;
    return acc;
  }, {} as Record<string, { total: number; stuck: number; done: number }>);

  const handleResolve = (taskId: string) => {
    resolveTaskStuck(taskId);
    setUnstickModalTask(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Trung Tâm Giám Sát & Điều Hành Tắc Nghẽn (SGT Ops Radar)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Vận Hành Tổng Thể & Kiểm Soát Rủi Ro
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Hệ thống cảnh báo thời gian thực: Phát hiện tức thì các điểm nghẽn giấy phép, hợp đồng venue, kịch bản, và ngân sách để Ban Quản Lý (BOD, SOM, SOS) tháo gỡ kịp thời.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-3 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Tiến độ chung</span>
              <span className="text-2xl font-black text-amber-400">{overallProgress}%</span>
            </div>
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl px-4 py-3 text-center min-w-[110px]">
              <span className="text-xs text-rose-300 block font-medium">Bị kẹt / Trễ</span>
              <span className="text-2xl font-black text-rose-400">{stuckTasks.length}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-3 text-center min-w-[110px]">
              <span className="text-xs text-slate-400 block font-medium">Đang chạy</span>
              <span className="text-2xl font-black text-cyan-400">{inProgressTasks.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* STUCK ALERTS SECTION (Highest Priority!) */}
      {stuckTasks.length > 0 && (
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-500/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-rose-500 text-white rounded-xl shadow">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-950 dark:text-rose-200">
                  Cảnh Báo Khẩn Cấp: {stuckTasks.length} Điểm Nghẽn Cần QL Can Thiệp
                </h2>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Các công việc đang bị dừng hoặc gặp trục trặc, nguy cơ ảnh hưởng trực tiếp đến ngày công diễn show!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stuckTasks.map(task => (
              <div 
                key={task.id}
                className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full">
                      {task.showName || 'Task Ngoài / Vận hành'}
                    </span>
                    <span className="text-slate-500 text-[11px] font-mono font-medium">
                      Hạn chót: {task.deadline}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                    {task.title}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Hạng mục:</span> {task.category} • <span className="font-medium text-slate-700 dark:text-slate-300">PIC:</span> <span className="text-amber-600 font-semibold">{task.pic}</span>
                  </div>

                  {/* Root Cause / Vấn Đề Nằm Ở Đâu */}
                  <div className="mt-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg p-2.5 text-xs text-rose-900 dark:text-rose-200">
                    <div className="font-bold flex items-center space-x-1 text-rose-700 dark:text-rose-300 mb-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Vấn đề nằm ở đâu?</span>
                    </div>
                    <p className="leading-relaxed">
                      {task.stuckReason || 'Đang chờ xác nhận phê duyệt nội dung kịch bản hoặc chứng từ đối soát.'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onOpenTaskModal(task)}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium underline"
                  >
                    Xem chi tiết task
                  </button>

                  {roleMode !== 'VIEWER' && (
                    <button
                      onClick={() => setUnstickModalTask(task)}
                      className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-sm transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tháo gỡ điểm nghẽn</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOW PROGRESS OVERVIEW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Tiến Độ Vận Hành Theo Từng Show
            </h2>
            <p className="text-xs text-slate-500">
              Liên kết các phase chuẩn bị: Venue, Kịch bản, Giấy phép, Vé và Tài chính
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
            Tổng số: {shows.length} Show trong năm
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shows.map(show => {
            const showTasks = tasks.filter(t => t.showId === show.id);
            const showStuck = showTasks.filter(t => t.status === 'STUCK').length;
            const showDone = showTasks.filter(t => t.status === 'DONE').length;
            const taskPct = showTasks.length ? Math.round((showDone / showTasks.length) * 100) : 0;
            const ticketPct = show.ticketTotalTarget ? Math.min(100, Math.round((show.ticketSold / show.ticketTotalTarget) * 100)) : 0;

            return (
              <div
                key={show.id}
                className={`border rounded-xl p-4 transition flex flex-col justify-between ${
                  showStuck > 0 
                    ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {show.locationCity}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {show.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1" title={show.name}>
                    {show.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5" title={show.venue}>
                    📍 {show.venue}
                  </p>

                  {/* Metrics Bar */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Tiến độ Task ({showDone}/{showTasks.length})</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{taskPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            showStuck > 0 ? 'bg-rose-500' : taskPct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${taskPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Vé đã bán ({show.ticketSold}/{show.ticketTotalTarget})</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{ticketPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full transition-all"
                          style={{ width: `${ticketPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stuck badge if any */}
                  {showStuck > 0 && (
                    <div className="mt-2.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-1 rounded flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{showStuck} task đang kẹt vướng mắc</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    Lead: <strong className="text-slate-700 dark:text-slate-300">{show.personnel.pm}</strong>
                  </span>
                  <button
                    onClick={() => onSelectShow(show.id)}
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <span>Vào timeline show</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERSON IN CHARGE (PIC) WORKLOAD MONITOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Theo Dõi Trách Nhiệm Từng Nhân Sự (PIC Distribution)
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Phát hiện ai đang quá tải hoặc có công việc bị nghẽn để QL kịp thời phân bổ lại nguồn lực
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(Object.entries(picStats) as [string, { total: number; stuck: number; done: number }][]).map(([pic, stat]) => (
            <div 
              key={pic}
              className={`p-3 rounded-xl border text-xs ${
                stat.stuck > 0 
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900' 
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100 truncate" title={pic}>
                {pic}
              </div>
              <div className="mt-2 space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>Tổng task:</span>
                  <strong className="text-slate-700 dark:text-slate-300">{stat.total}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hoàn thành:</span>
                  <span className="text-emerald-600 font-bold">{stat.done}</span>
                </div>
                {stat.stuck > 0 && (
                  <div className="flex justify-between text-rose-600 font-black">
                    <span>Bị kẹt:</span>
                    <span>{stat.stuck}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL THÁO GỠ ĐIỂM NGHẼN */}
      {unstickModalTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Xử Lý & Tháo Gỡ Điểm Nghẽn Cho Task</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {unstickModalTask.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thuộc: {unstickModalTask.showName || 'Task Ngoài'} • PIC: {unstickModalTask.pic}
              </p>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 rounded-lg text-xs text-rose-900 dark:text-rose-200">
              <span className="font-bold block mb-1">Vấn đề đang gặp:</span>
              <p>{unstickModalTask.stuckReason}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ghi chú giải pháp / QL chỉ đạo:
              </label>
              <textarea
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="VD: Đã liên hệ trực tiếp Sở VHTT, đã chuyển duyệt qua đơn vị backup..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setUnstickModalTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Đóng
              </button>
              <button
                onClick={() => handleResolve(unstickModalTask.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow transition"
              >
                Xác nhận đã tháo gỡ (Chuyển tiếp tục làm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
