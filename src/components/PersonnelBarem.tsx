import React, { useState } from 'react';
import { 
  Users, 
  GitBranch, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  Briefcase,
  Award
} from 'lucide-react';
import { PERSONNEL_BAREM } from '../data/initialData';

const CUSTOMER_JOURNEY_STAGES = [
  { step: '1. ToFU', label: 'Awareness', desc: 'Nhận biết show, truyền thông mạng xã hội' },
  { step: '2. MoFU', label: 'Consider', desc: 'Cân nhắc lineup, giá vé, thời gian' },
  { step: '3. BoFU', label: 'Conversion', desc: 'Chuyển đổi mua vé trên Ve Vé / Tin nhắn' },
  { step: '4. SeoFU', label: 'Upsell & Before', desc: 'Quyền lợi vé, chuẩn bị trước giờ G' },
  { step: '5. EoFU', label: 'Deliver Experience', desc: 'Trải nghiệm show onsite, đón tiếp, set diễn' },
  { step: '6. AoFU', label: 'After Experience', desc: 'Chăm sóc sau show, khảo sát NPS hài lòng' },
  { step: '7. SoFU', label: 'Sharing/Ref', desc: 'Lan tỏa story, clip TikTok, review' },
  { step: '8. RoFU', label: 'Retention', desc: 'Duy trì khán giả quay lại mua vé show sau' },
];

const PHASES_MATRIX = [
  {
    phase: 'PHASE 1 (INITIATING)',
    marketing: 'IMC Plan (Chiến lược truyền thông tổng thể)',
    sales: 'Kế hoạch phân bổ vé & Sale Scheme',
    showOps: 'Show Plan (Lineup, Scount Venue, Giấy phép)',
    community: 'Khảo sát nhóm khách hàng tiềm năng'
  },
  {
    phase: 'PHASE 2 (PLANNING)',
    marketing: 'PE-Budget Performance, PE-Partnership thương lượng đối tác',
    sales: 'SAE-Sale On (Kế hoạch bán vé, Upsell), SAE-Customer Benefit',
    showOps: 'SE-Budget Control (Dự trù show), SE-Scrum Master (Timeline)',
    community: 'CE-Logistic (Ngân sách vật dụng), CE-UGC (Kế hoạch nhóm KH)'
  },
  {
    phase: 'PHASE 3 (EXECUTING)',
    marketing: 'PE-Ticket System (Tạo form vé), PE-Copywriting nội dung',
    sales: 'SAE-Sale On (Bán vé trên kênh online & Zalo)',
    showOps: 'SE-Điều Phối Chính (Kế hoạch onsite), SE-Activity Control, Chase Deadline',
    community: 'CE-Logistic (Thuê mua, in ấn vật dụng), CE-UGC tổ chức KH'
  },
  {
    phase: 'PHASE 4 (SUPERVISOR / ONSITE)',
    marketing: 'PE-Partnership (Chăm sóc đối tác offline), PE-Ticket System (CK list)',
    sales: 'SAE-Sale Off (Bán vé tại cửa), SAE-Quyền lợi khách hàng',
    showOps: 'SE-Lead Show Onsite, SE-Lead hoạt động khác, SE-Scrum Onsite',
    community: 'CE-Logistic (Quản lý vật dụng), CE-Lead Checkin (Đón khách)'
  },
  {
    phase: 'PHASE 5 (CLOSING)',
    marketing: 'PE-Budget Performance (Thống kê số liệu), PE-Nghiệm thu đối tác',
    sales: 'SAE-Nghiệm thu doanh thu vé',
    showOps: 'SE-Nghiệm chi ngân sách, SE-Báo cáo sau show (Feedback)',
    community: 'CE-Logistic (Tổng hợp hóa đơn, hoàn ứng), CE-Thúc đẩy UGC sharing'
  }
];

export const PersonnelBarem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ORG' | 'PHASES' | 'JOURNEY'>('ORG');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Sheet [SGT OP] KẾ HOẠCH NĂM 2026 (BAREM OP)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Hệ Thống Nhân Sự Phân Cấp & Ma Trận Trách Nhiệm SGT
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sơ đồ tổ chức phân quyền từ Ban Giám Đốc (BOD), Quản lý Show (SOM), Trợ lý (Deputy SOM), Giám sát (Supervisors) đến các Executive chuyên trách.
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ORG')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ORG' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sơ Đồ Phân Cấp
          </button>
          <button
            onClick={() => setActiveTab('PHASES')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'PHASES' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Ma Trận 5 Phase Vận Hành
          </button>
          <button
            onClick={() => setActiveTab('JOURNEY')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'JOURNEY' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            8 Bước Hành Trình Khách Hàng
          </button>
        </div>
      </div>

      {/* TAB 1: SƠ ĐỒ PHÂN CẤP ORG HIERARCHY */}
      {activeTab === 'ORG' && (
        <div className="space-y-5">
          {/* Level 1: BOD */}
          <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-5 text-center">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block mb-1">
              CẤP CAO NHẤT • BAN GIÁM ĐỐC (BOD)
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Anh Tùng • Anh Uy • Anh Minh
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl mx-auto">
              Phê duyệt chủ trương lưu diễn, duyệt trần tài chính show lớn (lần 3), bảo trợ nghệ thuật và định hướng hệ thống Saigon Tếu.
            </p>
          </div>

          {/* Level 2: Show Operations Leadership */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>SHOW OPERATION MANAGER (SOM)</span>
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Anh Khôi
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Chịu trách nhiệm toàn diện vận hành các show, ký kết hợp đồng venue, duyệt giấy phép biểu diễn, kiểm soát giải chi và nghiệm thu.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                <Briefcase className="w-4 h-4" />
                <span>DEPUTY SHOW OPERATION MANAGER</span>
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Phúc
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Phụ trách phối hợp điều phối nhân sự, duyệt IMC Plan, Sale Scheme, chase deadline và hỗ trợ lead onsite các show lớn.
              </p>
            </div>
          </div>

          {/* Level 3: Supervisors & Key Functions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 block uppercase">Technical Operations</span>
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">Vỹ</h5>
              <p className="text-xs text-slate-500 mt-1">
                PIC: Hệ thống bán vé (Ve Vé), hệ thống làm việc nội bộ, âm thanh kỹ thuật.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 block uppercase">Show Operation Supervisor</span>
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">Yến Nhi</h5>
              <p className="text-xs text-slate-500 mt-1">
                Giám sát thực thi show, quản lý ngân sách tạm ứng / hoàn ứng, rà soát bill chi.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 block uppercase">Sale & Community Supervisor</span>
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">Quỳnh</h5>
              <p className="text-xs text-slate-500 mt-1">
                Giám sát bán vé các kênh, chăm sóc khách hàng fanpage & cộng đồng UGC.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 block uppercase">Team HR & Training</span>
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">Quý / Phân Nhân Sự</h5>
              <p className="text-xs text-slate-500 mt-1">
                Tuyển dụng CTV/HTV theo quý, tổ chức giáo án và training nhân sự onsite.
              </p>
            </div>
          </div>

          {/* Level 4: 4 Core Execution Teams */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              4 Đội Ngũ Thực Thi Cốt Lõi Tại Show (Executive Teams)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <strong className="text-amber-600 font-bold block">1. TEAM TRUYỀN THÔNG</strong>
                <span className="text-slate-500">PIC: Promotion Executive (PE)</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Chạy ads, banner online/offline, viết description, form vé, bài recap.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <strong className="text-indigo-600 font-bold block">2. TEAM SALE VÉ</strong>
                <span className="text-slate-500">PIC: Sales Executive (SAE)</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Bán vé trên kênh online, đối soát vé tại cửa rạp, giải quyết vé lỗi.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <strong className="text-cyan-600 font-bold block">3. TEAM SHOW ONSITE</strong>
                <span className="text-slate-500">PIC: Show Executive (SE/SSE)</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Điều phối chính sân khấu, bám timeline phút diễn, âm thanh, props.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                <strong className="text-emerald-600 font-bold block">4. TEAM COMMUNITY & LOGISTIC</strong>
                <span className="text-slate-500">PIC: Community Executive (CE)</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Quản lý vật dụng logistic, lead bàn check-in, đón khách & thúc đẩy review.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MA TRẬN 5 PHASE VẬN HÀNH SHOW */}
      {activeTab === 'PHASES' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200">
            <strong>Nguyên tắc vận hành 5 Phase:</strong> Mỗi show đều phải đi qua đủ 5 Phase từ Khởi tạo (Initiating) đến Nghiệm thu đóng sổ (Closing) để đảm bảo không bị sót việc, chậm deadline hoặc thâm hụt tài chính.
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="p-3.5 min-w-[150px]">Phase Vận Hành</th>
                    <th className="p-3.5 min-w-[200px]">Team Truyền Thông (PE)</th>
                    <th className="p-3.5 min-w-[180px]">Team Sale (SAE)</th>
                    <th className="p-3.5 min-w-[220px]">Team Show Ops (SE)</th>
                    <th className="p-3.5 min-w-[200px]">Team Community & Logistic (CE)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-xs">
                  {PHASES_MATRIX.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition">
                      <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400 bg-slate-50/50 dark:bg-slate-850/50">
                        {p.phase}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {p.marketing}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {p.sales}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {p.showOps}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {p.community}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 8 BƯỚC HÀNH TRÌNH KHÁCH HÀNG (ToFU -> RoFU) */}
      {activeTab === 'JOURNEY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CUSTOMER_JOURNEY_STAGES.map((s, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-amber-400 transition"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                  {s.step}
                </span>
                <span className="text-[11px] text-slate-400">Giai đoạn {idx + 1}</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {s.label}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
