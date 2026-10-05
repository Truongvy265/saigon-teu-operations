import React, { useState } from 'react';
import { 
  Clock, 
  UserCheck, 
  Users, 
  Calendar, 
  Check, 
  Plus, 
  AlertCircle, 
  DollarSign, 
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { ShowAttendanceRecord } from '../types';

const EVENT_ROLES = [
  { value: 'SE', label: 'Show Executive (Điều phối chính sân khấu)', defaultRate: 800000 },
  { value: 'SSE', label: 'Senior Show Executive (Phụ tá điều phối)', defaultRate: 650000 },
  { value: 'PM', label: 'Project Manager (Quản lý tổng show)', defaultRate: 1000000 },
  { value: 'PA', label: 'Project Assistant (Trợ lý PM)', defaultRate: 600000 },
  { value: 'LEAD_CHECKIN', label: 'Lead Check-in (Trưởng bàn đón khách)', defaultRate: 450000 },
  { value: 'HTV_USHER', label: 'HTV Usher (Soát vé & xếp chỗ khách)', defaultRate: 300000 },
  { value: 'CTV_LOGISTIC', label: 'CTV Hậu đài & Đạo cụ Props', defaultRate: 350000 },
  { value: 'TECHNICAL', label: 'Kỹ thuật Âm thanh / Ánh sáng', defaultRate: 700000 },
  { value: 'STAGE_MANAGER', label: 'Stage Manager (Quản lý cánh gà)', defaultRate: 550000 },
  { value: 'TALENT_CARE', label: 'Chăm sóc nghệ sĩ & Phòng chờ', defaultRate: 400000 },
  { value: 'SAE', label: 'Bán vé & Đối soát tại cửa', defaultRate: 450000 }
];

export const ShowAttendance: React.FC<{ initialShowId?: string }> = ({ initialShowId }) => {
  const { shows, attendance, addAttendanceRecord, updateAttendanceStatus, roleMode } = useOps();
  const [selectedShowId, setSelectedShowId] = useState<string>(initialShowId || shows[0]?.id || '');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for new attendance
  const [newStaffName, setNewStaffName] = useState('');
  const [newRole, setNewRole] = useState<ShowAttendanceRecord['role']>('HTV_USHER');
  const [newShift, setNewShift] = useState('Suất 1 & Suất 2');
  const [newCheckIn, setNewCheckIn] = useState('16:00');
  const [newRate, setNewRate] = useState(300000);
  const [newNotes, setNewNotes] = useState('');

  const currentShow = shows.find(s => s.id === selectedShowId) || shows[0];

  const showAttendance = attendance
    .filter(a => a.showId === currentShow?.id)
    .filter(a => a.staffName.toLowerCase().includes(search.toLowerCase()) || a.roleLabel.toLowerCase().includes(search.toLowerCase()));

  const totalPayroll = showAttendance.reduce((acc, curr) => acc + (curr.baseAllowance + curr.bonusOrPenalty), 0);
  const presentCount = showAttendance.filter(a => a.status === 'PRESENT' || a.status === 'COMPLETED').length;

  const handleRoleChange = (roleVal: string) => {
    const found = EVENT_ROLES.find(r => r.value === roleVal);
    setNewRole(roleVal as ShowAttendanceRecord['role']);
    if (found) setNewRate(found.defaultRate);
  };

  const handleCreateAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const roleConfig = EVENT_ROLES.find(r => r.value === newRole);
    const newRecord: ShowAttendanceRecord = {
      id: `att-${Date.now()}`,
      showId: currentShow.id,
      showName: currentShow.name,
      date: currentShow.date,
      staffName: newStaffName.trim(),
      role: newRole,
      roleLabel: roleConfig?.label || newRole,
      shift: newShift,
      checkInTime: newCheckIn,
      status: 'PRESENT',
      baseAllowance: Number(newRate) || 300000,
      bonusOrPenalty: 0,
      evalNotes: newNotes,
      supervisorConfirmedBy: 'Khôi (SOM)'
    };

    addAttendanceRecord(newRecord);
    setIsModalOpen(false);
    setNewStaffName('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Hệ Thống Chấm Công Sự Kiện Đặc Thù (Event Shift & Role-Based Attendance)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Chấm Công Theo Show & Vị Trí Làm Việc
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Khác biệt với doanh nghiệp văn phòng (không chấm công vân tay hay wifi cố định), hệ thống chấm công của SGT tính theo từng show, suất diễn và vị trí chuyên môn Onsite (SE, Lead Checkin, Kỹ thuật, CTV, HTV Usher...).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {roleMode !== 'VIEWER' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Chấm Công Nhân Sự Show</span>
            </button>
          )}
        </div>
      </div>

      {/* Show Selector & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:col-span-2 flex flex-col justify-between">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Chọn Show Chấm Công:
          </label>
          <select
            value={currentShow?.id}
            onChange={e => setSelectedShowId(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {shows.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.date} - {s.locationCity})
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-500 mt-2">
            Địa điểm: <strong className="text-slate-700 dark:text-slate-300">{currentShow?.venue}</strong>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-500">Quân số Onsite</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {presentCount} / {showAttendance.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {showAttendance.length ? Math.round((presentCount / showAttendance.length) * 100) : 0}% Có mặt thực tế
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-500">Tổng thù lao show này</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {totalPayroll.toLocaleString('vi-VN')}đ
          </div>
          <span className="text-[11px] text-slate-400">
            Được đối soát vào bảng tạm ứng OP
          </span>
        </div>
      </div>

      {/* Table of Attendance Records */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân sự hoặc vị trí..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400"
            />
          </div>
          <div className="text-slate-500 font-medium">
            Danh sách nhân sự chấm công: {showAttendance.length} người
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3">Họ & Tên Nhân Sự</th>
                <th className="p-3">Vị Trí Phụ Trách</th>
                <th className="p-3">Ca / Suất Diễn</th>
                <th className="p-3">Giờ Vào - Ra</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3">Thù Lao Theo Barem</th>
                <th className="p-3">Đánh Giá & Xác Nhận</th>
                {roleMode !== 'VIEWER' && <th className="p-3 text-right">Thao Tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {showAttendance.map(record => {
                const totalComp = record.baseAllowance + record.bonusOrPenalty;
                return (
                  <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      {record.staffName}
                    </td>

                    <td className="p-3">
                      <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {record.roleLabel}
                      </span>
                    </td>

                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {record.shift}
                    </td>

                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {record.checkInTime || '--:--'} - {record.checkOutTime || '--:--'}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.status === 'PRESENT' || record.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        record.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                        record.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {record.status === 'PRESENT' ? 'CÓ MẶT' :
                         record.status === 'COMPLETED' ? 'HOÀN THÀNH' :
                         record.status === 'LATE' ? 'ĐẾN TRỄ' :
                         record.status === 'ABSENT' ? 'VẮNG MẶT' : 'ĐÃ XẾP LỊCH'}
                      </span>
                    </td>

                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      {totalComp.toLocaleString('vi-VN')}đ
                      {record.bonusOrPenalty !== 0 && (
                        <span className={`block text-[10px] font-normal ${record.bonusOrPenalty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {record.bonusOrPenalty > 0 ? `+${record.bonusOrPenalty.toLocaleString('vi-VN')}đ thưởng` : `${record.bonusOrPenalty.toLocaleString('vi-VN')}đ phạt trễ`}
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-xs max-w-xs">
                      {record.evalNotes && (
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] italic">
                          "{record.evalNotes}"
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Xác nhận: {record.supervisorConfirmedBy || 'BQL Show'}
                      </span>
                    </td>

                    {roleMode !== 'VIEWER' && (
                      <td className="p-3 text-right">
                        <select
                          value={record.status}
                          onChange={e => updateAttendanceStatus(record.id, e.target.value as any)}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] rounded p-1"
                        >
                          <option value="PRESENT">Có mặt</option>
                          <option value="COMPLETED">Hoàn thành</option>
                          <option value="LATE">Trễ ca</option>
                          <option value="ABSENT">Vắng</option>
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}

              {showAttendance.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-xs text-slate-400 italic">
                    Chưa có nhân sự nào được chấm công cho show này. Hãy bấm "+ Chấm Công Nhân Sự Show".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chấm công mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-500" />
              <span>Chấm Công Nhân Sự Vào Show</span>
            </h3>

            <form onSubmit={handleCreateAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Họ tên nhân sự:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn A (CTV/HTV)"
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vị trí làm việc theo show:
                </label>
                <select
                  value={newRole}
                  onChange={e => handleRoleChange(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {EVENT_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ca làm việc:
                  </label>
                  <input
                    type="text"
                    value={newShift}
                    onChange={e => setNewShift(e.target.value)}
                    placeholder="VD: Suất 1 & Suất 2"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Giờ vào thực tế:
                  </label>
                  <input
                    type="text"
                    value={newCheckIn}
                    onChange={e => setNewCheckIn(e.target.value)}
                    placeholder="VD: 15:30"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mức thù lao / phụ cấp ca (VNĐ):
                </label>
                <input
                  type="number"
                  value={newRate}
                  onChange={e => setNewRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú đánh giá hiệu suất onsite:
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="VD: Hoàn thành tốt, đón khách nhiệt tình..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow transition"
                >
                  Xác Nhận Chấm Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
