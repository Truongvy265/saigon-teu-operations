import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { useOps } from '../context/OpsContext';
import { ShowInfo } from '../types';

interface ShowManagementProps {
  onOpenNewShowModal: () => void;
  onSelectShow: (showId: string) => void;
  onNavigateToAttendance: (showId: string) => void;
  onNavigateToFinance: (showId: string) => void;
}

export const ShowManagement: React.FC<ShowManagementProps> = ({
  onOpenNewShowModal,
  onSelectShow,
  onNavigateToAttendance,
  onNavigateToFinance
}) => {
  const { shows, tasks, roleMode } = useOps();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'SHEET_MATRIX'>('SHEET_MATRIX');
  const [activePhaseTab, setActivePhaseTab] = useState<'ALL' | 'PHASE_0' | 'PHASE_1' | 'PHASE_2' | 'PHASE_3'>('ALL');

  const filteredShows = shows.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.personnel.pm.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCity = selectedCity === 'ALL' || s.locationCity === selectedCity;
    return matchSearch && matchCity;
  });

  const cities = ['ALL', 'SÀI GÒN', 'HÀ NỘI', 'CẦN THƠ', 'BIÊN HOÀ', 'THỦ ĐỨC'];

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Sheet [SGT] SHOW CÁC THÁNG TRONG NĂM 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Quản Lý Danh Sách Show & Phân Bổ Vận Hành
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tích hợp toàn bộ 4 Phase của Saigon Tếu: Định hướng quy mô (Phase 0), Nghệ thuật & Venue (Phase 1), Social & Vé (Phase 2), Onsite & Nghiệm thu (Phase 3)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setViewMode('SHEET_MATRIX')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'SHEET_MATRIX' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ma Trận Sheet (Chuẩn SGT)
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'CARDS' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Card Chi Tiết
            </button>
          </div>

          {roleMode !== 'VIEWER' && (
            <button
              onClick={onOpenNewShowModal}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo Show Mới (Cột E)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên show, địa điểm venue, hoặc Lead PM..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-slate-400 font-medium">Khu vực:</span>
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                selectedCity === city
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* MATRIX / SHEET VIEW (As requested from sheet [SGT] SHOW các tháng) */}
      {viewMode === 'SHEET_MATRIX' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Hiển thị cấu trúc cột chuẩn (Phase 0, Phase 1, Phase 2, Phase 3)
              </span>
              <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-mono">
                {filteredShows.length} Shows
              </span>
            </div>

            <div className="flex items-center space-x-1 text-xs font-medium">
              <button
                onClick={() => setActivePhaseTab('ALL')}
                className={`px-2.5 py-1 rounded ${activePhaseTab === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActivePhaseTab('PHASE_0')}
                className={`px-2.5 py-1 rounded ${activePhaseTab === 'PHASE_0' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}
              >
                Phase 0 (Kế hoạch)
              </button>
              <button
                onClick={() => setActivePhaseTab('PHASE_1')}
                className={`px-2.5 py-1 rounded ${activePhaseTab === 'PHASE_1' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}
              >
                Phase 1 (Nghệ thuật & Venue)
              </button>
              <button
                onClick={() => setActivePhaseTab('PHASE_2')}
                className={`px-2.5 py-1 rounded ${activePhaseTab === 'PHASE_2' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}
              >
                Phase 2 (Social & Vé)
              </button>
              <button
                onClick={() => setActivePhaseTab('PHASE_3')}
                className={`px-2.5 py-1 rounded ${activePhaseTab === 'PHASE_3' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500'}`}
              >
                Phase 3 (Tiến độ Task)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3 whitespace-nowrap min-w-[180px] sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-sm">
                    Tên Show & Ngày Tổ Chức
                  </th>
                  {(activePhaseTab === 'ALL' || activePhaseTab === 'PHASE_0') && (
                    <>
                      <th className="p-3 whitespace-nowrap min-w-[110px]">Địa Phương</th>
                      <th className="p-3 whitespace-nowrap min-w-[140px]">Mục Tiêu Show</th>
                      <th className="p-3 whitespace-nowrap min-w-[130px]">Loại Show (Quy mô)</th>
                    </>
                  )}
                  {(activePhaseTab === 'ALL' || activePhaseTab === 'PHASE_1') && (
                    <>
                      <th className="p-3 whitespace-nowrap min-w-[200px]">Địa Điểm (Venue)</th>
                      <th className="p-3 whitespace-nowrap min-w-[220px]">Lineup & Comedians</th>
                      <th className="p-3 whitespace-nowrap min-w-[170px]">Suất Diễn</th>
                      <th className="p-3 whitespace-nowrap min-w-[180px]">Bảng Giá Vé & Số Ghế</th>
                      <th className="p-3 whitespace-nowrap min-w-[200px]">Nhân Sự Phân Bổ (PM/SE/CTV)</th>
                    </>
                  )}
                  {(activePhaseTab === 'ALL' || activePhaseTab === 'PHASE_2') && (
                    <>
                      <th className="p-3 whitespace-nowrap min-w-[130px]">Đăng Broadcast</th>
                      <th className="p-3 whitespace-nowrap min-w-[130px]">Đăng Event</th>
                      <th className="p-3 whitespace-nowrap min-w-[150px]">Form Bán Vé</th>
                    </>
                  )}
                  {(activePhaseTab === 'ALL' || activePhaseTab === 'PHASE_3') && (
                    <>
                      <th className="p-3 whitespace-nowrap min-w-[150px]">Tiến Độ Vé (Sold/Target)</th>
                      <th className="p-3 whitespace-nowrap min-w-[140px]">Tiến Độ Task Dự Án</th>
                    </>
                  )}
                  <th className="p-3 whitespace-nowrap text-right min-w-[130px]">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                {filteredShows.map(show => {
                  const showTasks = tasks.filter(t => t.showId === show.id);
                  const showDone = showTasks.filter(t => t.status === 'DONE').length;
                  const taskPct = showTasks.length ? Math.round((showDone / showTasks.length) * 100) : 0;
                  const ticketPct = show.ticketTotalTarget ? Math.min(100, Math.round((show.ticketSold / show.ticketTotalTarget) * 100)) : 0;

                  return (
                    <tr key={show.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      {/* Name & Date (Sticky column) */}
                      <td className="p-3 sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-xs">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {show.name}
                        </div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                          📅 {show.date}
                        </div>
                      </td>

                      {/* Phase 0 Columns */}
                      {(activePhaseTab === 'ALL' || activePhaseTab === 'PHASE_0') && (
                        <>
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-semibold text-[11px]">
                              {show.locationCity}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                            {show.goal}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              {show.scale}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Phase 1 Columns */}
                      {(activePhaseTab === 'ALL' || activePhaseTab === 'PHASE_1') && (
                        <>
                          <td className="p-3 text-xs text-slate-700 dark:text-slate-300 max-w-xs">
                            {show.venue}
                          </td>
                          <td className="p-3 text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              Host: {show.lineup.host}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {show.lineup.comedians.join(', ')}
                            </div>
                          </td>
                          <td className="p-3 text-xs text-slate-500">
                            {show.shifts.map((shift, idx) => (
                              <div key={idx} className="whitespace-nowrap">{shift}</div>
                            ))}
                          </td>
                          <td className="p-3 text-xs">
                            <div className="space-y-0.5">
                              {show.pricing.slice(0, 2).map((p, idx) => (
                                <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                  {p.tier}: {p.price.toLocaleString('vi-VN')}đ ({p.seats} ghế)
                                </div>
                              ))}
                              {show.pricing.length > 2 && (
                                <span className="text-[10px] text-slate-400">+{show.pricing.length - 2} hạng ghế khác</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-xs">
                            <div className="font-medium text-slate-700 dark:text-slate-300">
                              PM: <strong className="text-amber-600">{show.personnel.pm}</strong> | SE: {show.personnel.se}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {show.personnel.ctvCount || 0} CTV • {show.personnel.htvCount || 0} HTV Onsite
                            </div>
                          </td>
                        </>
                      )}

                      {/* Phase 2 Columns */}
                      {(activePhaseTab === 'ALL' || activePhaseTab === 'PHASE_2') && (
                        <>
                          <td className="p-3 text-xs font-mono text-slate-600 dark:text-slate-400">
                            {show.social.broadcastDate || 'Chưa định'}
                          </td>
                          <td className="p-3 text-xs font-mono text-slate-600 dark:text-slate-400">
                            {show.social.eventDate || 'Chưa định'}
                          </td>
                          <td className="p-3 text-xs">
                            {show.social.formVeVeLink ? (
                              <a
                                href={show.social.formVeVeLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Link Ve Vé</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">Đang setup form</span>
                            )}
                          </td>
                        </>
                      )}

                      {/* Phase 3 Columns */}
                      {(activePhaseTab === 'ALL' || activePhaseTab === 'PHASE_3') && (
                        <>
                          <td className="p-3 text-xs">
                            <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                              <span>{show.ticketSold}/{show.ticketTotalTarget}</span>
                              <span className="text-cyan-600">{ticketPct}%</span>
                            </div>
                            <div className="w-28 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${ticketPct}%` }} />
                            </div>
                          </td>
                          <td className="p-3 text-xs">
                            <div className="flex items-center justify-between text-[11px] mb-1 font-bold">
                              <span>{showDone}/{showTasks.length} task</span>
                              <span className="text-emerald-600">{taskPct}%</span>
                            </div>
                            <div className="w-28 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${taskPct}%` }} />
                            </div>
                          </td>
                        </>
                      )}

                      {/* Action buttons */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onSelectShow(show.id)}
                            title="Vào Project Plan & Timeline của show"
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1"
                          >
                            <span>Timeline</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onNavigateToAttendance(show.id)}
                            title="Chấm công theo show"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-1.5 rounded-lg"
                          >
                            <Users className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShows.map(show => {
            const showTasks = tasks.filter(t => t.showId === show.id);
            const showDone = showTasks.filter(t => t.status === 'DONE').length;
            const taskPct = showTasks.length ? Math.round((showDone / showTasks.length) * 100) : 0;
            const ticketPct = show.ticketTotalTarget ? Math.min(100, Math.round((show.ticketSold / show.ticketTotalTarget) * 100)) : 0;

            return (
              <div 
                key={show.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full">
                      {show.locationCity}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      📅 {show.date}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base leading-snug">
                    {show.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-start space-x-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                    <span>{show.venue}</span>
                  </p>

                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div><strong>Host:</strong> {show.lineup.host}</div>
                    <div className="line-clamp-1"><strong>Talents:</strong> {show.lineup.comedians.join(', ')}</div>
                    <div><strong>Quy mô:</strong> {show.scale} ({show.goal})</div>
                    <div><strong>PM Lead:</strong> <span className="text-amber-600 font-bold">{show.personnel.pm}</span> (SE: {show.personnel.se})</div>
                  </div>

                  {/* Progress info */}
                  <div className="mt-4 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Tiến độ Task</span>
                        <span>{showDone}/{showTasks.length} ({taskPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${taskPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Vé đã bán</span>
                        <span className="text-cyan-600">{show.ticketSold}/{show.ticketTotalTarget} ({ticketPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${ticketPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onNavigateToFinance(show.id)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                  >
                    Dự trù kinh phí
                  </button>
                  <button
                    onClick={() => onSelectShow(show.id)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center space-x-1 shadow-sm transition"
                  >
                    <span>Vào Timeline Show</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
