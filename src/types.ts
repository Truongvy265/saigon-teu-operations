export type ShowScale = 'NHỎ - 1 SUẤT' | 'NHỎ - 2 SUẤT' | 'NHỎ - 3 SUẤT' | 'VỪA - 2 SUẤT' | 'LỚN - 2 SUẤT' | 'LỚN 1 SUẤT PLUS' | 'WORKSHOP' | 'TẾU CONCERT SIÊU LỚN';

export type ShowGoal = 'Doanh thu' | 'Doanh thu + Talent' | 'Doanh thu + Scale Up' | 'Doanh thu + Sponsor' | 'Doanh thu + Giáo dục' | 'Talent Test Joke' | 'Siêu doanh thu';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'STUCK' | 'DONE';

export type TaskPriority = 'Khẩn cấp' | 'Quan trọng' | 'Bình thường';

export type TaskCategory = 
  | '1. VENUE'
  | '2. LINEUP VÀ KỊCH BẢN CHỮ'
  | '3. GIẤY PHÉP'
  | '4. THÔNG TIN SHOW'
  | '5. SPONSOR'
  | '6. DỰ TRÙ KINH PHÍ'
  | '7. TẠM ỨNG & GIẢI CHI'
  | '8. HÓA ĐƠN & NGHIỆM THU'
  | '9. LOGISTIC'
  | '10. NHÂN SỰ'
  | '11. REMARKETING VÀ SALE VÉ'
  | 'TASK NGOÀI (AD-HOC)';

export type TaskPhase = 
  | 'PHASE 1 (INITIATING)'
  | 'PHASE 2 (PLANNING)'
  | 'PHASE 3 (EXECUTING)'
  | 'PHASE 4 (SUPERVISOR / ONSITE)'
  | 'PHASE 5 (CLOSING)';

export type TaskDepartment = 
  | 'SHOW (SE)'
  | 'TRUYỀN THÔNG (PE)'
  | 'SALE (SAE)'
  | 'COMMUNITY & LOGISTIC (CE)'
  | 'KHÁC';

export interface ShowTask {
  id: string;
  showId?: string; // empty if external/ad-hoc task
  showName?: string;
  title: string;
  category: TaskCategory;
  phase?: TaskPhase;
  department?: TaskDepartment;
  subCategory?: string;
  pic: string; // Person In Charge
  secondaryPic?: string;
  startDate?: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  progressPercent?: number;
  stuckReason?: string; // Reason when status is 'STUCK' or bottlenecked
  notes?: string;
  isExternalTask?: boolean; // Task ngoài
}

export interface ShowInfo {
  id: string;
  name: string;
  month?: string;
  date: string; // e.g. "T7 (19/12)"
  time?: string;
  locationCity: 'SÀI GÒN' | 'HÀ NỘI' | 'CẦN THƠ' | 'BIÊN HOÀ' | 'THỦ ĐỨC' | 'ĐỒNG NAI' | 'KHÁC' | string;
  venue: string;
  scale: ShowScale;
  goal?: ShowGoal;
  status?: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  leadShow?: string;
  seOnsite?: string;
  shifts?: string[]; // e.g. ["Suất 1: 17:00 - 19:00", "Suất 2: 20:00 - 22:00"]
  lineup?: {
    host: string;
    comedians: string[];
    improv?: string;
    durationMins?: string;
  };
  pricing?: {
    tier: string;
    price: number;
    seats: number;
    sold?: number;
  }[];
  ticketTotalTarget?: number;
  ticketSold?: number;
  targetTickets?: number;
  targetRevenue?: number;
  soldTickets?: number;
  actualRevenue?: number;
  personnel?: {
    pm: string; // Project Manager
    pa1?: string; // Project Assistant 1
    pa2?: string;
    se: string; // Show Executive
    sse?: string; // Show Sub-Executive
    pe?: string; // Promotion Executive
    sae?: string; // Sales Executive
    ctvCount?: number;
    htvCount?: number;
  };
  social?: {
    formVeVeLink?: string;
    bannerOnlineLink?: string;
    bannerOfflineLink?: string;
    broadcastDate?: string;
    eventDate?: string;
    imcPlanLink?: string;
  };
  logistics?: {
    travel?: string;
    hotel?: string;
    parkingSupport?: string;
    allowancePerDiem?: string;
  };
  budget?: {
    estimatedRevenue: number;
    estimatedCost: number;
    actualRevenue?: number;
    actualCost?: number;
  };
  notes?: string;
}

export interface ShowAttendanceRecord {
  id: string;
  showId: string;
  showName: string;
  date: string;
  staffName: string;
  role: 'PM' | 'PA' | 'SE' | 'SSE' | 'PE' | 'SAE' | 'CE' | 'TECHNICAL' | 'STAGE_MANAGER' | 'LEAD_CHECKIN' | 'CTV_LOGISTIC' | 'HTV_USHER' | 'TALENT_CARE';
  roleLabel: string;
  shift: string; // e.g. "Suất 1", "Suất 2", "Cả 2 suất + Rehearsal"
  checkInTime?: string;
  checkOutTime?: string;
  status: 'SCHEDULED' | 'PRESENT' | 'LATE' | 'ABSENT' | 'COMPLETED';
  baseAllowance: number; // Mức thù lao / phụ cấp theo vai trò trong show
  bonusOrPenalty: number;
  evalNotes?: string;
  supervisorConfirmedBy?: string;
}

export interface AnalyticsShowData {
  id: string;
  day: string;
  name: string;
  venue: string;
  durationDays: number;
  ticketSpeed: number;
  adsSpend: number;
  impressions: number;
  reach: number;
  linkClicksTotal: number;
  webPurchases: number;
  messagesPurchases: number;
  prPurchases: number;
  totalPurchases: number;
  totalAttendance: number;
  nps: number;
  promotersPct: number;
  detractorsPct: number;
  reAttendanceCount: number;
  reAttendanceRatePct: number;
  tcrPct: number; // Total Conversion Rate
  profitPct: number;
  ugcVolume?: number;
}

export interface AdvanceSettlementItem {
  id: string;
  showId: string;
  showName: string;
  month: string;
  phase: 'TRƯỚC SHOW' | 'SAU SHOW';
  category: 'Giấy phép & Venue' | 'Vé máy bay & Chỗ ở' | 'Thiết bị Pro & Sound Light' | 'Sinh hoạt phí' | 'Vật dụng OP & Logistic' | 'Di chuyển & Phát sinh';
  requestedAmount: number;
  actualAmount: number;
  differenceAmount: number;
  picName: string;
  invoiceStatus: 'CHƯA CÓ BILL' | 'ĐÃ CÓ BILL GIẤY/CK' | 'ĐÃ TẢI LÊN DRIVE';
  billProofDescription: string;
  driveFolderLink?: string;
  doubleCheckRound1: boolean; // Cập nhật số tiền chi & bill chi
  doubleCheckRound2: boolean; // Double check khớp số tiền và bill
  doubleCheckRound3: boolean; // Nhập số qua file tạm ứng & hoàn ứng
  approvedBy?: string;
  notes?: string;
}

export interface PersonnelBaremNode {
  id: string;
  name: string;
  title: string;
  department: string;
  picKeyArea: string;
  reportsTo?: string;
  phasesInvolved: string[];
}
