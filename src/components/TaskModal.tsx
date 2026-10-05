import React, { useState, useEffect } from 'react';
import { X, CheckSquare, AlertTriangle, Calendar, User, Flag, Layers } from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { ShowTask, TaskPhase, TaskDepartment, TaskCategory } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ShowTask | null;
  defaultShowId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultShowId
}) => {
  const { shows, addTask, updateTask } = useOps();

  const [title, setTitle] = useState('');
  const [showId, setShowId] = useState(defaultShowId || shows[0]?.id || '');
  const [isExternal, setIsExternal] = useState(false);
  const [category, setCategory] = useState<TaskCategory>('10. NHÂN SỰ');
  const [phase, setPhase] = useState<TaskPhase>('PHASE 2 (PLANNING)');
  const [department, setDepartment] = useState<TaskDepartment>('SHOW (SE)');
  const [pic, setPic] = useState('Chi');
  const [deadline, setDeadline] = useState('15/12/2026');
  const [priority, setPriority] = useState<'Thấp' | 'Bình thường' | 'Cao' | 'Khẩn cấp'>('Bình thường');
  const [status, setStatus] = useState<ShowTask['status']>('TODO');
  const [stuckReason, setStuckReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setShowId(taskToEdit.showId || '');
      setIsExternal(!!taskToEdit.isExternalTask);
      setCategory(taskToEdit.category || (taskToEdit.isExternalTask ? 'TASK NGOÀI (AD-HOC)' : '10. NHÂN SỰ'));
      setPhase(taskToEdit.phase || 'PHASE 2 (PLANNING)');
      setDepartment(taskToEdit.department || 'SHOW (SE)');
      setPic(taskToEdit.pic);
      setDeadline(taskToEdit.deadline);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setStuckReason(taskToEdit.stuckReason || '');
      setNotes(taskToEdit.notes || '');
    } else {
      setTitle('');
      setShowId(defaultShowId || shows[0]?.id || '');
      setIsExternal(!defaultShowId);
      setCategory(defaultShowId ? '10. NHÂN SỰ' : 'TASK NGOÀI (AD-HOC)');
      setPhase('PHASE 2 (PLANNING)');
      setDepartment('SHOW (SE)');
      setPic('Chi');
      setDeadline('15/12/2026');
      setPriority('Bình thường');
      setStatus('TODO');
      setStuckReason('');
      setNotes('');
    }
  }, [taskToEdit, defaultShowId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: ShowTask = {
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}`,
      showId: isExternal ? '' : showId,
      title: title.trim(),
      category: isExternal ? 'TASK NGOÀI (AD-HOC)' : category,
      phase,
      department,
      pic: pic.trim(),
      deadline,
      priority,
      status,
      stuckReason: status === 'STUCK' ? stuckReason : undefined,
      notes: notes.trim(),
      isExternalTask: isExternal
    };

    if (taskToEdit) {
      updateTask(taskData);
    } else {
      addTask(taskData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {taskToEdit ? 'Chỉnh Sửa Chi Tiết Task' : 'Tạo Task Mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tên Task / Nội dung công việc:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Chốt kịch bản tổng duyệt, Mua vật dụng đón khách..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              id="isExternalCheck"
              checked={isExternal}
              onChange={e => setIsExternal(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
            />
            <label htmlFor="isExternalCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Đây là Task Ngoài / Công việc vận hành độc lập (Không gắn riêng 1 show)
            </label>
          </div>

          {!isExternal && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gắn Vào Show:
              </label>
              <select
                value={showId}
                onChange={e => setShowId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                {shows.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.date} - {s.locationCity})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phase Vận Hành:
              </label>
              <select
                value={phase}
                onChange={e => setPhase(e.target.value as TaskPhase)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="PHASE 1 (INITIATING)">Phase 1 (Initiating)</option>
                <option value="PHASE 2 (PLANNING)">Phase 2 (Planning)</option>
                <option value="PHASE 3 (EXECUTING)">Phase 3 (Executing)</option>
                <option value="PHASE 4 (SUPERVISOR / ONSITE)">Phase 4 (Onsite)</option>
                <option value="PHASE 5 (CLOSING)">Phase 5 (Closing)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bộ Phận (Team):
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value as TaskDepartment)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="SHOW (SE)">Show Ops (SE)</option>
                <option value="TRUYỀN THÔNG (PE)">Truyền thông (PE)</option>
                <option value="SALE (SAE)">Sale Vé (SAE)</option>
                <option value="COMMUNITY & LOGISTIC (CE)">Community & Logistic (CE)</option>
                <option value="KHÁC">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Người Nhận Việc (PIC):
              </label>
              <input
                type="text"
                required
                value={pic}
                onChange={e => setPic(e.target.value)}
                placeholder="VD: Chi, Vỹ, Yến Nhi..."
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hạn Chót (Deadline):
              </label>
              <input
                type="text"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                placeholder="VD: 15/12/2026"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mức Độ Ưu Tiên:
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="Thấp">Thấp</option>
                <option value="Bình thường">Bình thường</option>
                <option value="Cao">Cao</option>
                <option value="Khẩn cấp">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trạng Thái Hiện Tại:
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold outline-none"
              >
                <option value="TODO">Chưa Bắt Đầu (TODO)</option>
                <option value="IN_PROGRESS">Đang Thực Hiện (IN PROGRESS)</option>
                <option value="STUCK">Đang Bị Kẹt / Vướng (STUCK)</option>
                <option value="DONE">Đã Hoàn Thành (DONE)</option>
              </select>
            </div>
          </div>

          {status === 'STUCK' && (
            <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-300 dark:border-rose-800 space-y-1">
              <label className="block font-bold text-rose-700 dark:text-rose-300 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Lý Do Bị Kẹt / Điểm Nghẽn (Cần BQL hỗ trợ):</span>
              </label>
              <textarea
                rows={2}
                required
                value={stuckReason}
                onChange={e => setStuckReason(e.target.value)}
                placeholder="Ghi rõ vướng mắc: Chờ bên rạp xác nhận, thiếu báo giá, chờ duyệt chi phí..."
                className="w-full p-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none text-xs"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ghi Chú Chi Tiết & Link Tài Liệu:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Link drive kịch bản, quy chuẩn thiết kế..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition"
            >
              {taskToEdit ? 'Lưu Cập Nhật' : 'Tạo & Giao Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
