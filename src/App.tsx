import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TabTiepDan } from './components/TabTiepDan';
import { TabXuLyDon } from './components/TabXuLyDon';
import { SyncGoogleSheetModal } from './components/SyncGoogleSheetModal';
import { 
  getInitialTiepDanData, 
  getInitialXuLyDonData, 
  SHEET_URLS
} from './data/initialData';
import { parseTiepDanCSV, parseXuLyDonCSV } from './utils/csvParser';
import { TiepDanRecord, XuLyDonRecord, XuLyDonPrefillData } from './types';
import { initAuth } from './services/googleAuth';
import { fetchTiepDanRealtime, fetchXuLyDonRealtime } from './services/googleSheets';
import { User } from 'firebase/auth';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tiepDan' | 'xuLyDon'>('tiepDan');
  
  // Prefill transfer state between Tab 1 and Tab 2
  const [xuLyDonPrefill, setXuLyDonPrefill] = useState<XuLyDonPrefillData | null>(null);
  
  // Store records in reactive state (from Google Sheets data)
  const [tiepDanRecords, setTiepDanRecords] = useState<TiepDanRecord[]>(() => {
    return getInitialTiepDanData(false);
  });
  const [xuLyDonRecords, setXuLyDonRecords] = useState<XuLyDonRecord[]>(() => {
    return getInitialXuLyDonData(false);
  });

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('03/11/2026 08:30');

  // Auto-sync configuration: every 10 minutes (600 seconds)
  const AUTO_SYNC_INTERVAL_SECONDS = 10 * 60; // 600 seconds = 10 minutes
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(true);
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState<number>(AUTO_SYNC_INTERVAL_SECONDS);

  // Google User & in-memory token state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // CRUD handlers for Tab 1 (Tiep Dan)
  const handleAddTiepDanRecord = (record: TiepDanRecord) => {
    setTiepDanRecords(prev => [record, ...prev]);
  };

  const handleUpdateTiepDanRecord = (updatedRecord: TiepDanRecord) => {
    setTiepDanRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleDeleteTiepDanRecord = (id: string) => {
    setTiepDanRecords(prev => prev.filter(r => r.id !== id));
  };

  // CRUD handlers for Tab 2 (Xu Ly Don)
  const handleAddXuLyDonRecord = (record: XuLyDonRecord) => {
    setXuLyDonRecords(prev => [record, ...prev]);
  };

  const handleUpdateXuLyDonRecord = (updatedRecord: XuLyDonRecord) => {
    setXuLyDonRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleDeleteXuLyDonRecord = (id: string) => {
    setXuLyDonRecords(prev => prev.filter(r => r.id !== id));
  };

  // Handler for transferring data from Tab 1 to Tab 2
  const handleTransferToXuLyDon = (data: XuLyDonPrefillData) => {
    setXuLyDonPrefill(data);
    setActiveTab('xuLyDon');
  };

  // Auto-sync timer effect (runs countdown and triggers sync every 10 minutes)
  useEffect(() => {
    if (!isAutoSyncEnabled) return;

    const timer = setInterval(() => {
      setSecondsUntilNextSync((prev) => {
        if (prev <= 1) {
          // Trigger auto-sync silently from Google Sheets
          handleSyncFromUrls(SHEET_URLS.tiepDan, SHEET_URLS.xuLyDon, true);
          return AUTO_SYNC_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoSyncEnabled]);

  // Sync handler from URLs
  const handleSyncFromUrls = async (
    urlTiepDan: string, 
    urlXuLyDon: string, 
    isAuto: boolean = false
  ): Promise<boolean> => {
    setIsSyncing(true);
    if (!isAuto) {
      setSyncSuccessMessage(null);
      setSyncErrorMessage(null);
    }

    let tdSuccess = false;
    let xldSuccess = false;

    try {
      // 1. Fetch Tiep Dan sheet in real time
      try {
        const recordsTD = await fetchTiepDanRealtime(accessToken, urlTiepDan);
        if (recordsTD && recordsTD.length > 0) {
          setTiepDanRecords(recordsTD);
          tdSuccess = true;
        }
      } catch (err) {
        console.warn('Real-time sync for Tiep Dan failed, keeping current data:', err);
      }

      // 2. Fetch Xu Ly Don sheet in real time
      try {
        const recordsXLD = await fetchXuLyDonRealtime(accessToken, urlXuLyDon);
        if (recordsXLD && recordsXLD.length > 0) {
          setXuLyDonRecords(recordsXLD);
          xldSuccess = true;
        }
      } catch (err) {
        console.warn('Real-time sync for Xu Ly Don failed, keeping current data:', err);
      }

      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastSyncTime(timeStr);
      setSecondsUntilNextSync(AUTO_SYNC_INTERVAL_SECONDS);

      if (tdSuccess || xldSuccess) {
        const message = isAuto 
          ? `[Bắt đầu đồng bộ - Tự động 10 phút/lần] Đã hoàn thành đồng bộ dữ liệu thời gian thực từ Google Sheets lúc ${timeStr}!`
          : `Đã hoàn thành "Bắt đầu đồng bộ" dữ liệu thời gian thực từ Google Sheets lúc ${timeStr}!`;
        setSyncSuccessMessage(message);
        setTimeout(() => setSyncSuccessMessage(null), 5000);
        return true;
      } else {
        if (!isAuto) {
          setSyncSuccessMessage(`Đã làm mới dữ liệu hệ thống (sử dụng bản lưu mới nhất) lúc ${timeStr}!`);
          setTimeout(() => setSyncSuccessMessage(null), 4000);
        }
        return true;
      }
    } catch (e: any) {
      if (!isAuto) {
        setSyncErrorMessage('Không thể kết nối đến máy chủ Google Sheets. Dữ liệu hiện tại vẫn được bảo lưu an toàn.');
      }
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Upload CSV handler
  const handleUploadCsv = (file: File, target: 'tiepDan' | 'xuLyDon') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        if (target === 'tiepDan') {
          const parsed = parseTiepDanCSV(text);
          if (parsed.length > 0) {
            setTiepDanRecords(parsed);
            setSyncSuccessMessage(`Đã nạp thành công ${parsed.length} dòng hồ sơ Sổ tiếp dân từ file!`);
          } else {
            setSyncErrorMessage('File không đúng cấu trúc Sổ tiếp dân Mẫu 03/TCD.');
          }
        } else {
          const parsed = parseXuLyDonCSV(text);
          if (parsed.length > 0) {
            setXuLyDonRecords(parsed);
            setSyncSuccessMessage(`Đã nạp thành công ${parsed.length} đơn thư Sổ xử lý đơn từ file!`);
          } else {
            setSyncErrorMessage('File không đúng cấu trúc Bảng theo dõi xử lý đơn.');
          }
        }
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Administrative Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tiepDanCount={tiepDanRecords.length}
        xuLyDonCount={xuLyDonRecords.length}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        isAutoSyncEnabled={isAutoSyncEnabled}
        setIsAutoSyncEnabled={setIsAutoSyncEnabled}
        secondsUntilNextSync={secondsUntilNextSync}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: So tiep dan with Add Record functionality & Seamless transfer */}
        {activeTab === 'tiepDan' && (
          <TabTiepDan 
            initialRecords={tiepDanRecords} 
            onAddNewRecord={handleAddTiepDanRecord}
            onUpdateRecord={handleUpdateTiepDanRecord}
            onDeleteRecord={handleDeleteTiepDanRecord}
            currentUser={currentUser}
            accessToken={accessToken}
            onAuthUpdated={(user, token) => {
              setCurrentUser(user);
              setAccessToken(token);
            }}
            onTransferToXuLyDon={handleTransferToXuLyDon}
          />
        )}

        {/* Tab 2: So xu ly don & Bao cao tu dong */}
        {activeTab === 'xuLyDon' && (
          <TabXuLyDon 
            initialRecords={xuLyDonRecords}
            onAddNewRecord={handleAddXuLyDonRecord}
            onUpdateRecord={handleUpdateXuLyDonRecord}
            onDeleteRecord={handleDeleteXuLyDonRecord}
            currentUser={currentUser}
            accessToken={accessToken}
            onAuthUpdated={(user, token) => {
              setCurrentUser(user);
              setAccessToken(token);
            }}
            prefillData={xuLyDonPrefill}
            onClearPrefill={() => setXuLyDonPrefill(null)}
          />
        )}
      </main>

      {/* Administrative System Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 px-4 text-xs no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">
              UBND PHƯỜNG TRÀ CÂU • TỈNH QUẢNG NGÃI
            </span>
            <span className="text-slate-600">|</span>
            <span>Hệ thống chuyển đổi số hành chính công</span>
          </div>

          <div className="text-slate-500 text-center sm:text-right">
            <span>Áp dụng quy chuẩn theo Nghị định số 154/2026/NĐ-CP & Nghị định số 30/2020/NĐ-CP</span>
          </div>
        </div>
      </footer>

      {/* Google Sheets Sync Modal */}
      <SyncGoogleSheetModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncFromUrl={handleSyncFromUrls}
        onUploadCsv={handleUploadCsv}
        isSyncing={isSyncing}
        syncSuccessMessage={syncSuccessMessage}
        syncErrorMessage={syncErrorMessage}
        lastSyncTime={lastSyncTime}
        isAutoSyncEnabled={isAutoSyncEnabled}
        setIsAutoSyncEnabled={setIsAutoSyncEnabled}
        secondsUntilNextSync={secondsUntilNextSync}
      />

      {/* Floating Toast Notification for Auto-Sync Status */}
      {syncSuccessMessage && !isSyncModalOpen && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/60 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 no-print">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping flex-shrink-0"></div>
          <div className="text-xs">
            <p className="font-semibold text-emerald-300">Đồng bộ Google Sheets</p>
            <p className="text-slate-300">{syncSuccessMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
