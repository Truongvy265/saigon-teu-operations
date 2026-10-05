import React, { useState } from 'react';
import { 
  CircleDollarSign, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Layers, 
  Check, 
  HelpCircle,
  Calculator,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useOps } from '../context/OpsContext';

interface CostItem {
  name: string;
  category: string;
  estimated: number;
  actual?: number;
  pic: string;
}

export const FinanceDraft: React.FC<{ initialShowId?: string }> = ({ initialShowId }) => {
  const { shows } = useOps();
  const [selectedShowId, setSelectedShowId] = useState<string>(initialShowId || shows[0]?.id || '');
  const [occupancyScenario, setOccupancyScenario] = useState<number>(95); // 50%, 70%, 85%, 95%

  const currentShow = shows.find(s => s.id === selectedShowId) || shows[0];

  // Dynamic ticket revenue calculation
  const ticketTiers = currentShow?.pricing || [];
  const maxPotentialTicketRevenue = ticketTiers.reduce((acc, tier) => acc + (tier.price * tier.seats), 0);
  const scenarioTicketRevenue = Math.round(maxPotentialTicketRevenue * (occupancyScenario / 100));
  const sponsorRevenue = currentShow?.scale.includes('LỚN') ? 45000000 : 10000000;
  const totalRevenue = scenarioTicketRevenue + sponsorRevenue;

  // Standardized SGT-OP Cost items
  const isLargeTour = currentShow?.scale.includes('LỚN') || currentShow?.locationCity === 'HÀ NỘI';
  const costs: CostItem[] = [
    { name: 'Thuê rạp / Venue & Kỹ thuật sân khấu', category: 'Venue', estimated: isLargeTour ? 110000000 : 25000000, actual: isLargeTour ? 110000000 : 23500000, pic: 'Anh Khôi' },
    { name: 'Giấy phép biểu diễn Sở VHTT & SHIKI', category: 'Pháp lý', estimated: isLargeTour ? 25000000 : 8000000, actual: isLargeTour ? 22000000 : 8000000, pic: 'Yến Nhi' },
    { name: 'Cát-sê Talent Comedians & Kịch bản', category: 'Nghệ thuật', estimated: isLargeTour ? 120000000 : 35000000, actual: isLargeTour ? 120000000 : 35000000, pic: 'Nhung, Ý' },
    { name: 'Vé máy bay & Khách sạn đoàn lưu diễn', category: 'Di chuyển', estimated: isLargeTour ? 65000000 : 5000000, actual: isLargeTour ? 58400000 : 4200000, pic: 'Chi' },
    { name: 'Team Pro ghi hình, dựng clip & Sound Light', category: 'Sản xuất', estimated: isLargeTour ? 45000000 : 12000000, actual: isLargeTour ? 43000000 : 12000000, pic: 'Vỹ' },
    { name: 'Ngân sách Ads, Broadcast & PR KOL', category: 'Marketing', estimated: isLargeTour ? 40000000 : 10000000, actual: isLargeTour ? 38500000 : 8500000, pic: 'Chum, Quỳnh' },
    { name: 'In ấn, Backdrop, Thẻ đeo & Vật dụng OP', category: 'Logistic', estimated: isLargeTour ? 18000000 : 6000000, actual: isLargeTour ? 16800000 : 5500000, pic: 'Chi, Phương Nhi' },
    { name: 'Thù lao nhân sự Onsite (SE, Lead, CTV, HTV)', category: 'Nhân sự', estimated: isLargeTour ? 22000000 : 8000000, actual: isLargeTour ? 21200000 : 7800000, pic: 'Yến Nhi' },
    { name: 'Dự phòng rủi ro phát sinh (5%)', category: 'Dự phòng', estimated: isLargeTour ? 20000000 : 5000000, actual: isLargeTour ? 8000000 : 2000000, pic: 'Anh Khôi' }
  ];

  const totalEstimatedCost = costs.reduce((sum, c) => sum + c.estimated, 0);
  const totalActualCost = costs.reduce((sum, c) => sum + (c.actual || c.estimated), 0);

  const profit = totalRevenue - totalEstimatedCost;
  const profitMargin = totalRevenue ? ((profit / totalRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <CircleDollarSign className="w-4 h-4" />
            <span>Sheet [SGT-OP] FINANCE DRAFT 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Bảng Dự Trù Tài Chính & Barem Chi Phí Show
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô phỏng 4 kịch bản lỗ/hòa/lời ít/lời nhiều theo tỷ lệ lấp đầy ghế, quản lý giá vé và kiểm soát trần chi phí 8 hạng mục vận hành.
          </p>
        </div>

        {/* Show Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-400 font-medium pl-2">Chọn Show:</span>
          <select
            value={currentShow?.id}
            onChange={e => setSelectedShowId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {shows.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.locationCity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 SCENARIOS (LỖ / HÒA / LỜI ÍT / LỜI NHIỀU) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              <span>4 Kịch Bản Dự Toán Tài Chính Theo Tỷ Lệ Lấp Đầy Ghế</span>
            </h3>
            <p className="text-xs text-slate-500">
              Quy định duyệt dự trù lần 3: Phân loại trường hợp Lỗ, Hòa vốn, Lời ít, Lời nhiều để điều chỉnh kế hoạch chạy Ads và vé
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Kịch bản đang xem: <strong className="text-amber-600 font-bold">{occupancyScenario}% vé bán</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '1. Kịch bản LỖ', pct: 50, note: 'Bán dưới 50% vé', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
            { label: '2. HÒA VỐN', pct: 68, note: 'Điểm hòa vốn rạp', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
            { label: '3. LỜI ÍT', pct: 85, note: 'Tỷ lệ an toàn', badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' },
            { label: '4. LỜI NHIỀU (SOLD OUT)', pct: 98, note: 'Cháy vé >95%', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
          ].map(sc => (
            <button
              key={sc.pct}
              onClick={() => setOccupancyScenario(sc.pct)}
              className={`p-3 rounded-xl border text-left transition ${
                occupancyScenario === sc.pct
                  ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-slate-100'
              }`}
            >
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sc.badge}`}>
                {sc.label}
              </span>
              <div className="text-base font-black text-slate-900 dark:text-slate-100 mt-2">
                {sc.pct}% Lấp đầy
              </div>
              <span className="text-[11px] text-slate-500 block">{sc.note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY FINANCIAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Doanh Thu Dự Toán ({occupancyScenario}% vé)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Vé: {scenarioTicketRevenue.toLocaleString('vi-VN')}đ • Sponsor: {sponsorRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tổng Chi Phí Dự Trù (Barem OP)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {totalEstimatedCost.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Thực chi đã nghiệm thu: {totalActualCost.toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div className={`border rounded-2xl p-5 shadow-sm ${
          profit >= 0 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900' 
            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
        }`}>
          <span className="text-xs text-slate-500 font-medium">Lợi Nhuận Dự Kiến (Net Profit)</span>
          <div className={`text-2xl font-black mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {profit >= 0 ? `+${profit.toLocaleString('vi-VN')}đ` : `${profit.toLocaleString('vi-VN')}đ`}
          </div>
          <div className="text-[11px] font-bold mt-1">
            {profit >= 0 ? `Tỷ suất sinh lời: +${profitMargin}%` : `Thâm hụt: ${profitMargin}%`}
          </div>
        </div>
      </div>

      {/* DETAIL BREAKDOWN: TICKETS & COSTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Revenue Tiers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Cơ Cấu Giá Vé & Sức Chứa (Từng Hạng Ghế)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Bảng giá phân theo quy chuẩn: Siêu Cấp, Thả Ga, Tung Tăng, Tiết Kiệm
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {ticketTiers.map((tier, idx) => {
              const maxTierRev = tier.price * tier.seats;
              const estSold = Math.round(tier.seats * (occupancyScenario / 100));
              const estRev = estSold * tier.price;

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 font-bold block">{tier.tier}</strong>
                    <span className="text-[11px] text-slate-500">
                      {tier.price.toLocaleString('vi-VN')}đ / vé • {tier.seats} ghế rạp
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {estRev.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Dự kiến bán: {estSold}/{tier.seats} vé
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost Items Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Barem 8 Nhóm Chi Phí Vận Hành Show
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Các khoản chi được giám sát bởi Ban Quản Lý và kiểm toán qua file tạm ứng
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {costs.map((c, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-slate-100 font-medium block">{c.name}</strong>
                  <span className="text-[11px] text-amber-600 font-semibold">
                    PIC: {c.pic} ({c.category})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    {c.estimated.toLocaleString('vi-VN')}đ
                  </span>
                  {c.actual !== undefined && (
                    <span className="text-[10px] text-slate-400">
                      Thực tế: {c.actual.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
