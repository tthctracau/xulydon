import React from 'react';
import { 
  Users, 
  FileText, 
  RefreshCw, 
  Database, 
  ExternalLink,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import { SHEET_URLS } from '../data/initialData';

interface HeaderProps {
  activeTab: 'tiepDan' | 'xuLyDon';
  setActiveTab: (tab: 'tiepDan' | 'xuLyDon') => void;
  tiepDanCount: number;
  xuLyDonCount: number;
  onOpenSyncModal: () => void;
  isSyncing: boolean;
  lastSyncTime: string;
  isAutoSyncEnabled: boolean;
  setIsAutoSyncEnabled: (val: boolean) => void;
  secondsUntilNextSync: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  tiepDanCount,
  xuLyDonCount,
  onOpenSyncModal,
  isSyncing,
  lastSyncTime,
  isAutoSyncEnabled,
  setIsAutoSyncEnabled,
  secondsUntilNextSync,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30 no-print">
      {/* Top administrative sub-bar */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-amber-700 px-4 py-1 text-xs text-amber-100 flex flex-wrap justify-between items-center gap-2 font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ỦY BAN NHÂN DÂN PHƯỜNG TRÀ CÂU, TỈNH QUẢNG NGÃI</span>
        </div>
        <div className="flex items-center gap-4 text-amber-200">
          <span className="hidden sm:inline">Áp dụng Mẫu số 03/TCD kèm Nghị định số 154/2026/NĐ-CP</span>
          <span className="flex items-center gap-1 text-[11px] bg-red-900/60 px-2 py-0.5 rounded border border-red-700/50">
            <CalendarCheck className="w-3 h-3 text-amber-300" />
            Cập nhật: {lastSyncTime}
          </span>
        </div>
      </div>

      {/* Main header banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Agency Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-950/40 border border-amber-400/30 flex-shrink-0">
              <div className="text-center font-bold text-amber-300 text-xs leading-tight">
                <span className="text-lg leading-none">★</span>
                <div className="text-[8px] uppercase tracking-tighter">UBND</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  UBND Phường Trà Câu
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Hệ thống chính quyền điện tử
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                HỆ THỐNG QUẢN LÝ TIẾP CÔNG DÂN - XỬ LÝ ĐƠN THƯ
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Bộ lọc thông minh theo Tháng / Quý / Năm • Trực quan hóa xu hướng • Tự động tạo báo cáo hành chính
              </p>
            </div>
          </div>

          {/* Action buttons & Sheet link */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Auto-sync 10 minutes status & toggle */}
            <button
              onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition select-none ${
                isAutoSyncEnabled 
                  ? 'bg-emerald-950/50 border-emerald-600/50 text-emerald-200 hover:bg-emerald-900/60' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
              title={
                isAutoSyncEnabled 
                  ? `Đang tự động đồng bộ Google Sheets mỗi 10 phút. Lần kế tiếp sau: ${Math.floor(secondsUntilNextSync / 60)}:${String(secondsUntilNextSync % 60).padStart(2, '0')}. Nhấn để tạm dừng.`
                  : 'Tự động đồng bộ đang tắt. Nhấn để bật lại chu kỳ 10 phút/lần.'
              }
            >
              <span className="relative flex h-2 w-2">
                {isAutoSyncEnabled && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoSyncEnabled ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
              </span>
              <span className="text-[11px] sm:text-xs flex items-center gap-1.5">
                <span className="font-medium">Tự động (10p):</span>
                {isAutoSyncEnabled ? (
                  <span className="font-mono font-bold text-emerald-300">
                    {Math.floor(secondsUntilNextSync / 60)}:{String(secondsUntilNextSync % 60).padStart(2, '0')}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">Tắt</span>
                )}
              </span>
            </button>

            {/* Sync from Google Sheet button */}
            <button
              onClick={onOpenSyncModal}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm border border-blue-400/30 disabled:opacity-50"
              title="Đồng bộ trực tiếp từ bảng tính Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Google Sheets'}</span>
            </button>

            {/* Link to view raw Google Sheet */}
            <a
              href={activeTab === 'tiepDan' ? SHEET_URLS.tiepDanWeb : SHEET_URLS.xuLyDonWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
              title="Mở Google Sheet gốc trong tab mới"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Google Sheet gốc</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs (02 Tabs as requested by user) */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-3">
          <button
            onClick={() => setActiveTab('tiepDan')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
              activeTab === 'tiepDan'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Users className="w-4 h-4 text-blue-300" />
            <span>SỔ TIẾP CÔNG DÂN</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'tiepDan'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tiepDanCount} hồ sơ
            </span>
          </button>

          <button
            onClick={() => setActiveTab('xuLyDon')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
              activeTab === 'xuLyDon'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-300" />
            <span>SỔ XỬ LÝ ĐƠN</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'xuLyDon'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {xuLyDonCount} đơn thư
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
