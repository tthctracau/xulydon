import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  ExternalLink, 
  Database, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Timer
} from 'lucide-react';
import { SHEET_URLS } from '../data/initialData';

interface SyncGoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncFromUrl: (urlTiepDan: string, urlXuLyDon: string, isAuto?: boolean) => Promise<boolean>;
  onUploadCsv: (file: File, target: 'tiepDan' | 'xuLyDon') => void;
  isSyncing: boolean;
  syncSuccessMessage: string | null;
  syncErrorMessage: string | null;
  lastSyncTime: string;
  isAutoSyncEnabled: boolean;
  setIsAutoSyncEnabled: (val: boolean) => void;
  secondsUntilNextSync: number;
}

export const SyncGoogleSheetModal: React.FC<SyncGoogleSheetModalProps> = ({
  isOpen,
  onClose,
  onSyncFromUrl,
  onUploadCsv,
  isSyncing,
  syncSuccessMessage,
  syncErrorMessage,
  lastSyncTime,
  isAutoSyncEnabled,
  setIsAutoSyncEnabled,
  secondsUntilNextSync,
}) => {
  const [tiepDanUrl, setTiepDanUrl] = useState(SHEET_URLS.tiepDan);
  const [xuLyDonUrl, setXuLyDonUrl] = useState(SHEET_URLS.xuLyDon);

  if (!isOpen) return null;

  const handleSync = async () => {
    await onSyncFromUrl(tiepDanUrl, xuLyDonUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'tiepDan' | 'xuLyDon') => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCsv(file, target);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Đồng Bộ Dữ Liệu Từ Google Sheets
              </h3>
              <p className="text-xs text-slate-300">
                Kết nối trực tiếp hai bảng tính Sổ Tiếp Dân & Sổ Xử Lý Đơn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Status Message */}
          {syncSuccessMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {syncErrorMessage && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{syncErrorMessage}</span>
            </div>
          )}

          {/* Auto-sync 10 minutes Card */}
          <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-blue-50/80 border border-emerald-200/90 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-600 text-white flex-shrink-0 shadow-xs">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Chức năng tự động đồng bộ (10 phút / lần)</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                      Mặc định
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hệ thống sẽ chạy nền định kỳ mỗi 10 phút để tự động tải và cập nhật số liệu mới nhất từ hai bảng tính Google Sheets.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isAutoSyncEnabled}
                  onChange={(e) => setIsAutoSyncEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="mt-3 pt-2.5 border-t border-emerald-200/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trạng thái:</span>
                <strong className={isAutoSyncEnabled ? 'text-emerald-700' : 'text-slate-500'}>
                  {isAutoSyncEnabled ? 'Đang kích hoạt (10 phút/lần)' : 'Đang tạm dừng'}
                </strong>
              </span>

              {isAutoSyncEnabled && (
                <span className="text-slate-700 bg-white/70 px-2.5 py-1 rounded-md border border-emerald-200/70">
                  Lần tự động kế tiếp sau: <strong className="font-mono text-emerald-700">{Math.floor(secondsUntilNextSync / 60)} phút {String(secondsUntilNextSync % 60).padStart(2, '0')} giây</strong>
                </span>
              )}
            </div>
          </div>

          {/* Sheet 1: So tiep dan */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                1. Bảng "Sổ tiếp dân" (gid=30479724)
              </span>
              <a
                href={SHEET_URLS.tiepDanWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs flex items-center gap-1"
              >
                <span>Mở sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Đường dẫn xuất dữ liệu định dạng CSV:
            </p>
            <input
              type="text"
              value={tiepDanUrl}
              onChange={(e) => setTiepDanUrl(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 pt-1">
              <label className="cursor-pointer text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition">
                <Upload className="w-3 h-3 text-slate-400" />
                <span>Hoặc tải tệp CSV Sổ tiếp dân lên</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'tiepDan')}
                />
              </label>
            </div>
          </div>

          {/* Sheet 2: So xu ly don */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                2. Bảng "Sổ xử lý đơn" (gid=537408158)
              </span>
              <a
                href={SHEET_URLS.xuLyDonWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-xs flex items-center gap-1"
              >
                <span>Mở sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Đường dẫn xuất dữ liệu định dạng CSV:
            </p>
            <input
              type="text"
              value={xuLyDonUrl}
              onChange={(e) => setXuLyDonUrl(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2 pt-1">
              <label className="cursor-pointer text-xs text-slate-600 hover:text-indigo-600 flex items-center gap-1 bg-white border border-slate-300 px-2.5 py-1 rounded-md transition">
                <Upload className="w-3 h-3 text-slate-400" />
                <span>Hoặc tải tệp CSV Sổ xử lý đơn lên</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'xuLyDon')}
                />
              </label>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Thời điểm đồng bộ gần nhất: <strong>{lastSyncTime}</strong></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Sẵn sàng làm việc
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              setTiepDanUrl(SHEET_URLS.tiepDan);
              setXuLyDonUrl(SHEET_URLS.xuLyDon);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 transition"
          >
            Khôi phục URL gốc
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Đóng
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang tải dữ liệu...' : 'Bắt đầu đồng bộ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
