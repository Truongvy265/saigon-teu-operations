import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, Users, Award, ShieldCheck } from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { ShowInfo } from '../types';

interface ShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToEdit?: ShowInfo | null;
}

export const ShowModal: React.FC<ShowModalProps> = ({
  isOpen,
  onClose,
  showToEdit
}) => {
  const { addShow, updateShow } = useOps();

  const [name, setName] = useState('');
  const [month, setMonth] = useState('Tháng 12/2026');
  const [date, setDate] = useState('19/12/2026');
  const [time, setTime] = useState('19:30 - 22:00');
  const [city, setCity] = useState('HÀ NỘI');
  const [venue, setVenue] = useState('Nhà hát Tuổi Trẻ / Trung Tâm Văn Hóa');
  const [scale, setScale] = useState<ShowInfo['scale']>('SHOW LỚN');
  const [status, setStatus] = useState<ShowInfo['status']>('UPCOMING');
  const [leadShow, setLeadShow] = useState('Anh Khôi (SOM)');
  const [seOnsite, setSeOnsite] = useState('Chi (SE Onsite)');
  const [targetTickets, setTargetTickets] = useState<number>(1000);
  const [targetRevenue, setTargetRevenue] = useState<number>(550000000);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (showToEdit) {
      setName(showToEdit.name);
      setMonth(showToEdit.month);
      setDate(showToEdit.date);
      setTime(showToEdit.time);
      setCity(showToEdit.locationCity);
      setVenue(showToEdit.venue);
      setScale(showToEdit.scale);
      setStatus(showToEdit.status);
      setLeadShow(showToEdit.leadShow);
      setSeOnsite(showToEdit.seOnsite);
      setTargetTickets(showToEdit.targetTickets);
      setTargetRevenue(showToEdit.targetRevenue);
      setNotes(showToEdit.notes || '');
    } else {
      setName('');
      setMonth('Tháng 12/2026');
      setDate('19/12/2026');
      setTime('19:30 - 22:00');
      setCity('HÀ NỘI');
      setVenue('Nhà hát Tuổi Trẻ');
      setScale('SHOW LỚN');
      setStatus('UPCOMING');
      setLeadShow('Anh Khôi (SOM)');
      setSeOnsite('Chi (SE Onsite)');
      setTargetTickets(1000);
      setTargetRevenue(550000000);
      setNotes('');
    }
  }, [showToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const showData: ShowInfo = {
      id: showToEdit ? showToEdit.id : `show-${Date.now()}`,
      name: name.trim(),
      month,
      date,
      time,
      locationCity: city,
      venue,
      scale,
      status,
      leadShow,
      seOnsite,
      targetTickets: Number(targetTickets),
      targetRevenue: Number(targetRevenue),
      soldTickets: showToEdit ? showToEdit.soldTickets : 0,
      actualRevenue: showToEdit ? showToEdit.actualRevenue : 0,
      notes: notes.trim(),
      pricing: showToEdit?.pricing || [
        { tier: 'Tếu Siêu Cấp', price: 1500000, seats: Math.round(Number(targetTickets) * 0.1) },
        { tier: 'Tếu Thả Ga Cùng Nhau', price: 900000, seats: Math.round(Number(targetTickets) * 0.2) },
        { tier: 'Tếu Thả Ga', price: 600000, seats: Math.round(Number(targetTickets) * 0.25) },
        { tier: 'Tếu Tung Tăng', price: 500000, seats: Math.round(Number(targetTickets) * 0.25) },
        { tier: 'Tếu Tiết Kiệm', price: 399000, seats: Math.round(Number(targetTickets) * 0.2) },
      ]
    };

    if (showToEdit) {
      updateShow(showData);
    } else {
      addShow(showData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {showToEdit ? 'Chỉnh Sửa Thông Tin Show' : 'Khởi Tạo Show Mới Trong Năm'}
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
              Tên Show Sự Kiện:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: SHOW HÀ NỘI 19-20/12, SHOW NẰM ĐÂU..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tháng Diễn Ra:
              </label>
              <input
                type="text"
                value={month}
                onChange={e => setMonth(e.target.value)}
                placeholder="VD: Tháng 12/2026"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ngày Show:
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="VD: 19/12/2026"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Thành Phố:
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="HÀ NỘI">HÀ NỘI</option>
                <option value="TP. HỒ CHÍ MINH">TP. HỒ CHÍ MINH</option>
                <option value="ĐÀ NẴNG">ĐÀ NẴNG</option>
                <option value="CẦN THƠ">CẦN THƠ</option>
                <option value="HẢI PHÒNG">HẢI PHÒNG</option>
                <option value="ĐÀ LẠT">ĐÀ LẠT</option>
                <option value="QUỐC TẾ">QUỐC TẾ</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Khung Giờ Diễn:
              </label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="VD: 19:30 - 22:00"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Địa Điểm / Rạp / Venue:
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={e => setVenue(e.target.value)}
              placeholder="VD: Nhà hát Quân Đội, Rạp Kim Mã, NVH Thanh Niên..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quy Mô Show:
              </label>
              <select
                value={scale}
                onChange={e => setScale(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="SHOW LỚN">SHOW LỚN (&gt;800 khách)</option>
                <option value="SHOW NHỎ">SHOW NHỎ (&lt;300 khách)</option>
                <option value="SHOW ĐẶC BIỆT">SHOW ĐẶC BIỆT</option>
                <option value="OPEN MIC">OPEN MIC / WORKSHOP</option>
                <option value="SHOW TOUR">SHOW TOUR LIÊN TỈNH</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trạng Thái Show:
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold outline-none"
              >
                <option value="UPCOMING">Sắp Diễn Ra</option>
                <option value="IN_PROGRESS">Đang Triển Khai</option>
                <option value="COMPLETED">Đã Hoàn Thành</option>
                <option value="CANCELLED">Hủy Bỏ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quản Lý Show (QL):
              </label>
              <input
                type="text"
                value={leadShow}
                onChange={e => setLeadShow(e.target.value)}
                placeholder="VD: Anh Khôi (SOM)"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SE Onsite Chính:
              </label>
              <input
                type="text"
                value={seOnsite}
                onChange={e => setSeOnsite(e.target.value)}
                placeholder="VD: Chi (SE Onsite)"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chỉ Tiêu Vé (Ghế):
              </label>
              <input
                type="number"
                value={targetTickets}
                onChange={e => setTargetTickets(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Doanh Thu Target (VNĐ):
              </label>
              <input
                type="number"
                value={targetRevenue}
                onChange={e => setTargetRevenue(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ghi Chú Đặc Thù (Cột E trong Sheet Show):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Cần đặt vé máy bay sớm, cọc rạp 30% trước tháng 10..."
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
              {showToEdit ? 'Lưu Thay Đổi' : 'Tạo Show'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
