import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Ticket, 
  Smile, 
  DollarSign, 
  Plus, 
  Search, 
  Sparkles,
  ArrowUpRight,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useOps } from '../context/OpsContext';
import { AnalyticsShowData } from '../types';

export const AnalyticsView: React.FC = () => {
  const { analytics, addAnalyticsRecord, roleMode } = useOps();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Record Form State
  const [newDay, setNewDay] = useState('');
  const [newName, setNewName] = useState('');
  const [newVenue, setNewVenue] = useState('Nhà Văn Hóa Thanh Niên');
  const [newAdsSpend, setNewAdsSpend] = useState(1500000);
  const [newReach, setNewReach] = useState(250000);
  const [newClicks, setNewClicks] = useState(4500);
  const [newMsgPurchases, setNewMsgPurchases] = useState(120);
  const [newWebPurchases, setNewWebPurchases] = useState(30);
  const [newPrPurchases, setNewPrPurchases] = useState(50);
  const [newAttendance, setNewAttendance] = useState(190);
  const [newNps, setNewNps] = useState(96);
  const [newReAttendance, setNewReAttendance] = useState(45);
  const [newProfitPct, setNewProfitPct] = useState(42);

  const filteredData = analytics.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.venue.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate Aggregates
  const totalPurchases = analytics.reduce((sum, d) => sum + d.totalPurchases, 0);
  const totalAttendance = analytics.reduce((sum, d) => sum + d.totalAttendance, 0);
  const totalAdsSpend = analytics.reduce((sum, d) => sum + d.adsSpend, 0);
  const avgNps = analytics.length ? Math.round(analytics.reduce((sum, d) => sum + d.nps, 0) / analytics.length) : 0;
  const avgReAttendance = analytics.length ? (analytics.reduce((sum, d) => sum + d.reAttendanceRatePct, 0) / analytics.length).toFixed(1) : 0;

  // Chart data formatting
  const chartData = analytics.map(d => ({
    name: d.name.length > 15 ? d.name.slice(0, 14) + '...' : d.name,
    purchases: d.totalPurchases,
    attendance: d.totalAttendance,
    nps: d.nps,
    reAttendancePct: d.reAttendanceRatePct,
    adsSpendK: Math.round(d.adsSpend / 1000)
  }));

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const totalPurch = Number(newMsgPurchases) + Number(newWebPurchases) + Number(newPrPurchases);
    const totalAtt = Number(newAttendance) || totalPurch;
    const reAttCount = Number(newReAttendance);
    const reAttPct = totalAtt ? Number(((reAttCount / totalAtt) * 100).toFixed(1)) : 0;
    const clicks = Number(newClicks) || 1;
    const tcr = Number(((totalPurch / clicks) * 100).toFixed(1));

    const record: AnalyticsShowData = {
      id: `a-${Date.now()}`,
      day: newDay || '10/10',
      name: newName,
      venue: newVenue,
      durationDays: 20,
      ticketSpeed: Math.round(totalPurch / 20),
      adsSpend: Number(newAdsSpend),
      impressions: Number(newReach) * 1.5,
      reach: Number(newReach),
      linkClicksTotal: clicks,
      webPurchases: Number(newWebPurchases),
      messagesPurchases: Number(newMsgPurchases),
      prPurchases: Number(newPrPurchases),
      totalPurchases: totalPurch,
      totalAttendance: totalAtt,
      nps: Number(newNps),
      promotersPct: Number(newNps),
      detractorsPct: Math.max(0, 100 - Number(newNps)),
      reAttendanceCount: reAttCount,
      reAttendanceRatePct: reAttPct,
      tcrPct: tcr,
      profitPct: Number(newProfitPct)
    };

    addAnalyticsRecord(record);
    setIsModalOpen(false);
    setNewName('');
    setNewDay('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Sheet [SAIGON TẾU X OP] PHÂN TÍCH SỐ LIỆU 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Phân Tích Số Liệu Vé & Hiệu Quả Truyền Thông
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi phễu 8 bước: Chú ý (Attention), Quan tâm (Interest), Mua vé (Purchases), Trải nghiệm (NPS hài lòng) và Khách quay lại (Retention).
          </p>
        </div>

        {roleMode !== 'VIEWER' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-md transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nhập Số Liệu Show Mới</span>
          </button>
        )}
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <Ticket className="w-4 h-4 text-amber-500" />
            <span>Tổng Vé Mua</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalPurchases.toLocaleString('vi-VN')}
          </div>
          <span className="text-[11px] text-slate-400">Trên {analytics.length} show thống kê</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <Users className="w-4 h-4 text-cyan-500" />
            <span>Khách Có Mặt</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalAttendance.toLocaleString('vi-VN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Tỷ lệ check-in ~98%</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <Smile className="w-4 h-4 text-emerald-500" />
            <span>NPS Hài Lòng</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {avgNps}%
          </div>
          <span className="text-[11px] text-slate-400">Net Promoter Score</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Tỷ Lệ Quay Lại (RAR)</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {avgReAttendance}%
          </div>
          <span className="text-[11px] text-slate-400">Khách cũ tiếp tục xem show</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <DollarSign className="w-4 h-4 text-rose-500" />
            <span>Tổng Chi Phí Ads</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 truncate">
            {totalAdsSpend.toLocaleString('vi-VN')}đ
          </div>
          <span className="text-[11px] text-slate-400">Facebook & PR Marketing</span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchases & Attendance Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Quy Mô Vé Mua & Số Khách Có Mặt Theo Từng Show
              </h3>
              <p className="text-xs text-slate-500">So sánh số vé bán và lượng khán giả onsite thực tế</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="purchases" name="Tổng vé mua" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attendance" name="Khách có mặt" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Satisfaction NPS & Retention Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Chỉ Số Hài Lòng (NPS) & Tỷ Lệ Khách Quay Lại (%)
              </h3>
              <p className="text-xs text-slate-500">Đo lường mức độ trung thành của cộng đồng khán giả Saigon Tếu</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 110]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="nps" name="Điểm NPS (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="reAttendancePct" name="Tỷ lệ quay lại (%)" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full Sheet Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên show hoặc địa điểm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400"
            />
          </div>
          <span className="text-slate-500 font-medium">
            Số lượng show: {filteredData.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-3">Ngày</th>
                <th className="p-3 min-w-[160px]">Tên Show</th>
                <th className="p-3">Địa Điểm</th>
                <th className="p-3 text-right">Chi Phí Ads</th>
                <th className="p-3 text-right">Reach</th>
                <th className="p-3 text-right">Clicks Link</th>
                <th className="p-3 text-right">Tin Nhắn Mua</th>
                <th className="p-3 text-right">Tổng Vé Mua</th>
                <th className="p-3 text-right">Khách Có Mặt</th>
                <th className="p-3 text-right">Điểm NPS</th>
                <th className="p-3 text-right">Khách Quay Lại</th>
                <th className="p-3 text-right">% Lợi Nhuận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
              {filteredData.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition">
                  <td className="p-3 font-semibold text-slate-500">{row.day}</td>
                  <td className="p-3 font-bold font-sans text-xs text-slate-900 dark:text-slate-100">{row.name}</td>
                  <td className="p-3 font-sans text-xs text-slate-600 dark:text-slate-400">{row.venue}</td>
                  <td className="p-3 text-right text-slate-700 dark:text-slate-300">
                    {row.adsSpend ? `${(row.adsSpend / 1000).toFixed(0)}k` : '0'}
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">{row.reach.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">{row.linkClicksTotal.toLocaleString('vi-VN')}</td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-400">{row.messagesPurchases}</td>
                  <td className="p-3 text-right font-bold text-amber-600">{row.totalPurchases}</td>
                  <td className="p-3 text-right font-bold text-cyan-600">{row.totalAttendance}</td>
                  <td className="p-3 text-right font-bold text-emerald-600">{row.nps}%</td>
                  <td className="p-3 text-right text-indigo-600 dark:text-indigo-400">
                    {row.reAttendanceCount} ({row.reAttendanceRatePct}%)
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    {row.profitPct ? `${row.profitPct}%` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nhập Số Liệu Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>Nhập Số Liệu Show Mới Vào Hệ Thống</span>
            </h3>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Ngày tổ chức:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 19/12"
                    value={newDay}
                    onChange={e => setNewDay(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tên Show:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SHOW HÀ NỘI..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Địa điểm / Venue:</label>
                <input
                  type="text"
                  required
                  value={newVenue}
                  onChange={e => setNewVenue(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Chi phí Ads (VNĐ):</label>
                  <input
                    type="number"
                    value={newAdsSpend}
                    onChange={e => setNewAdsSpend(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Số người Reach:</label>
                  <input
                    type="number"
                    value={newReach}
                    onChange={e => setNewReach(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tổng Clicks:</label>
                  <input
                    type="number"
                    value={newClicks}
                    onChange={e => setNewClicks(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Vé qua Tin nhắn:</label>
                  <input
                    type="number"
                    value={newMsgPurchases}
                    onChange={e => setNewMsgPurchases(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Vé qua Web:</label>
                  <input
                    type="number"
                    value={newWebPurchases}
                    onChange={e => setNewWebPurchases(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Vé qua PR/Đối tác:</label>
                  <input
                    type="number"
                    value={newPrPurchases}
                    onChange={e => setNewPrPurchases(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Khách có mặt:</label>
                  <input
                    type="number"
                    value={newAttendance}
                    onChange={e => setNewAttendance(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Điểm NPS (%):</label>
                  <input
                    type="number"
                    value={newNps}
                    onChange={e => setNewNps(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Khách quay lại:</label>
                  <input
                    type="number"
                    value={newReAttendance}
                    onChange={e => setNewReAttendance(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
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
                  Lưu & Tự Động Phân Tích
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
