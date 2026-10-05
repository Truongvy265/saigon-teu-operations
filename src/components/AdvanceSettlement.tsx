import React, { useState } from 'react';
import { 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  FolderOpen, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  ShieldCheck, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { AdvanceSettlementItem } from '../types';

export const AdvanceSettlement: React.FC = () => {
  const { advances, shows, addAdvanceItem, toggleDoubleCheck, roleMode } = useOps();
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formShowId, setFormShowId] = useState(shows[0]?.id || '');
  const [formMonth, setFormMonth] = useState('Tháng 12/2026');
  const [formPhase, setFormPhase] = useState<'TRƯỚC SHOW' | 'SAU SHOW'>('TRƯỚC SHOW');
  const [formCategory, setFormCategory] = useState<AdvanceSettlementItem['category']>('Giấy phép & Venue');
  const [formRequested, setFormRequested] = useState<number>(20000000);
  const [formActual, setFormActual] = useState<number>(20000000);
  const [formPic, setFormPic] = useState('Yến Nhi');
  const [formBillDesc, setFormBillDesc] = useState('');
  const [formDriveLink, setFormDriveLink] = useState('');

  const months = ['ALL', 'Tháng 1/2026', 'Tháng 2/2026', 'Tháng 5/2026', 'Tháng 8/2026', 'Tháng 11/2026', 'Tháng 12/2026'];

  const filteredAdvances = advances.filter(item => {
    const matchMonth = selectedMonth === 'ALL' || item.month === selectedMonth;
    const matchSearch = item.showName.toLowerCase().includes(search.toLowerCase()) ||
      item.picName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchSearch;
  });

  const totalRequested = filteredAdvances.reduce((acc, curr) => acc + curr.requestedAmount, 0);
  const totalActual = filteredAdvances.reduce((acc, curr) => acc + curr.actualAmount, 0);
  const totalDiff = totalActual - totalRequested;

  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const show = shows.find(s => s.id === formShowId);
    const newItem: AdvanceSettlementItem = {
      id: `adv-${Date.now()}`,
      showId: formShowId,
      showName: show?.name || 'Show SGT',
      month: formMonth,
      phase: formPhase,
      category: formCategory,
      requestedAmount: Number(formRequested),
      actualAmount: Number(formActual),
      differenceAmount: Number(formActual) - Number(formRequested),
      picName: formPic,
      invoiceStatus: formDriveLink ? 'ĐÃ TẢI LÊN DRIVE' : formBillDesc ? 'ĐÃ CÓ BILL GIẤY/CK' : 'CHƯA CÓ BILL',
      billProofDescription: formBillDesc || 'Đang chờ bill chuyển khoản theo cú pháp',
      driveFolderLink: formDriveLink,
      doubleCheckRound1: false,
      doubleCheckRound2: false,
      doubleCheckRound3: false,
      notes: 'Được tạo bởi hệ thống SGT-OP'
    };

    addAdvanceItem(newItem);
    setIsModalOpen(false);
    setFormBillDesc('');
    setFormDriveLink('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Sheet [SGT-OP] HOÀN TẠM ỨNG 2026 & QUY TRÌNH HÓA ĐƠN</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Quản Lý Tạm Ứng, Hóa Đơn & Double-Check 3 Vòng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình giải chi nghiêm ngặt: Nộp tạm ứng trước 17:00 Thứ 5, nhận ứng trước 48h show, tổng hợp bill sau 24h show và đối soát qua 3 vòng kiểm tra.
          </p>
        </div>

        {roleMode !== 'VIEWER' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-md transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Đề Xuất Tạm Ứng Mới</span>
          </button>
        )}
      </div>

      {/* SGT Standard Rules Infobox */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2">
        <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Quy Chuẩn Cú Pháp Hóa Đơn & Double Check (Hiệu lực từ Ban Điều Hành SGT-OP)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300 text-[11px]">
          <div className="bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl">
            <strong>Hóa đơn show:</strong> Cú pháp: <code>Chi phi (nội dung) + show (tên show) + ngày show</code>.
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl">
            <strong>Hóa đơn nước & Họp:</strong> Có bill giấy chụp gửi nhóm [SGT - OP HÓA ĐƠN]. Quán lề đường gửi bill chuyển khoản.
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl">
            <strong>Sinh hoạt phí:</strong> Chuyển khoản đúng cú pháp <code>Sinh hoat phi + tên show + ngày show</code>.
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Tiền Đã Tạm Ứng</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {totalRequested.toLocaleString('vi-VN')}đ
          </div>
          <span className="text-[11px] text-slate-400">Được cấp trước show</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Thực Chi (Có Bill)</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalActual.toLocaleString('vi-VN')}đ
          </div>
          <span className="text-[11px] text-slate-400">Chi phí thực tế phát sinh</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Chênh Lệch Tất Toán</span>
          <div className={`text-2xl font-black mt-1 ${totalDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {totalDiff > 0 ? `+${totalDiff.toLocaleString('vi-VN')}đ (Thiếu quỹ)` : `${totalDiff.toLocaleString('vi-VN')}đ (Thừa hoàn quỹ)`}
          </div>
          <span className="text-[11px] text-slate-400">Đối soát vào sổ quỹ doanh nghiệp</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo show, PIC phụ trách, hoặc hạng mục..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto">
          {months.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedMonth === m
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {m === 'ALL' ? 'Tất cả các tháng' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Advance Table with 3-Round Double Check */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3">Show & Tháng</th>
                <th className="p-3">Giai Đoạn & Hạng Mục</th>
                <th className="p-3 text-right">Tạm Ứng</th>
                <th className="p-3 text-right">Thực Chi</th>
                <th className="p-3 text-right">Chênh Lệch</th>
                <th className="p-3">PIC & Chứng Từ Bill</th>
                <th className="p-3 text-center">Vòng 1 (Cập nhật bill)</th>
                <th className="p-3 text-center">Vòng 2 (Khớp số)</th>
                <th className="p-3 text-center">Vòng 3 (Nhập file)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {filteredAdvances.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition">
                  <td className="p-3">
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block">{item.showName}</strong>
                    <span className="text-[11px] text-slate-400">{item.month}</span>
                  </td>

                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.phase === 'TRƯỚC SHOW' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.phase}
                    </span>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {item.category}
                    </div>
                  </td>

                  <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300 font-bold">
                    {item.requestedAmount.toLocaleString('vi-VN')}đ
                  </td>

                  <td className="p-3 text-right font-mono text-amber-600 font-bold">
                    {item.actualAmount.toLocaleString('vi-VN')}đ
                  </td>

                  <td className="p-3 text-right font-mono font-bold">
                    <span className={item.differenceAmount < 0 ? 'text-emerald-600' : item.differenceAmount > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      {item.differenceAmount > 0 ? `+${item.differenceAmount.toLocaleString('vi-VN')}đ` : `${item.differenceAmount.toLocaleString('vi-VN')}đ`}
                    </span>
                  </td>

                  <td className="p-3 max-w-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      PIC: <span className="text-amber-600">{item.picName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate" title={item.billProofDescription}>
                      {item.billProofDescription}
                    </div>
                    {item.driveFolderLink && (
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 flex items-center space-x-1 mt-0.5">
                        <FolderOpen className="w-3 h-3" />
                        <span className="underline">Đã lưu drive</span>
                      </span>
                    )}
                  </td>

                  {/* 3-Round Double Check Checkboxes */}
                  <td className="p-3 text-center">
                    <button
                      disabled={roleMode === 'VIEWER'}
                      onClick={() => toggleDoubleCheck(item.id, 1)}
                      className={`p-1.5 rounded-lg border transition ${
                        item.doubleCheckRound1 
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                      title="Vòng 1: Cập nhật số tiền và bill chi"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      disabled={roleMode === 'VIEWER'}
                      onClick={() => toggleDoubleCheck(item.id, 2)}
                      className={`p-1.5 rounded-lg border transition ${
                        item.doubleCheckRound2 
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                      title="Vòng 2: Doublecheck khớp số tiền và bill"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      disabled={roleMode === 'VIEWER'}
                      onClick={() => toggleDoubleCheck(item.id, 3)}
                      className={`p-1.5 rounded-lg border transition ${
                        item.doubleCheckRound3 
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                      }`}
                      title="Vòng 3: Nhập số qua file hoàn ứng đóng sổ"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tạo Tạm Ứng Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>Đề Xuất Tạm Ứng Show Mới</span>
            </h3>

            <form onSubmit={handleCreateAdvance} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Chọn Show:</label>
                <select
                  value={formShowId}
                  onChange={e => setFormShowId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {shows.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.date})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Giai đoạn:</label>
                  <select
                    value={formPhase}
                    onChange={e => setFormPhase(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="TRƯỚC SHOW">Trước show</option>
                    <option value="SAU SHOW">Sau show</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tháng tạm ứng:</label>
                  <input
                    type="text"
                    value={formMonth}
                    onChange={e => setFormMonth(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Hạng mục chi phí:</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Giấy phép & Venue">Giấy phép & Venue</option>
                  <option value="Vé máy bay & Chỗ ở">Vé máy bay & Chỗ ở</option>
                  <option value="Thiết bị Pro & Sound Light">Thiết bị Pro & Sound Light</option>
                  <option value="Sinh hoạt phí">Sinh hoạt phí</option>
                  <option value="Vật dụng OP & Logistic">Vật dụng OP & Logistic</option>
                  <option value="Di chuyển & Phát sinh">Di chuyển & Phát sinh</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Số tiền xin tạm ứng (VNĐ):</label>
                  <input
                    type="number"
                    value={formRequested}
                    onChange={e => setFormRequested(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Số tiền thực chi (nếu đã có):</label>
                  <input
                    type="number"
                    value={formActual}
                    onChange={e => setFormActual(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Người nhận tạm ứng (PIC):</label>
                <input
                  type="text"
                  value={formPic}
                  onChange={e => setFormPic(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Mô tả chứng từ / Hóa đơn đính kèm:</label>
                <textarea
                  rows={2}
                  value={formBillDesc}
                  onChange={e => setFormBillDesc(e.target.value)}
                  placeholder="VD: Chuyển khoản cọc venue 30% đúng cú pháp..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Đường dẫn Google Drive Folder bill:</label>
                <input
                  type="text"
                  value={formDriveLink}
                  onChange={e => setFormDriveLink(e.target.value)}
                  placeholder="VD: drive.google.com/drive/folders/..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
                  Tạo Đề Xuất Tạm Ứng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
