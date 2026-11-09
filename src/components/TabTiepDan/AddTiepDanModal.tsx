import React, { useState, useMemo } from 'react';
import { 
  X, 
  PlusCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  ShieldCheck, 
  ExternalLink,
  User,
  MapPin,
  Calendar,
  FileText,
  Building2,
  LogOut,
  UserCheck,
  ArrowRightCircle,
  Paperclip
} from 'lucide-react';
import { TiepDanRecord, XuLyDonPrefillData } from '../../types';
import { googleSignIn, logoutGoogle } from '../../services/googleAuth';
import { appendTiepDanRowToGoogleSheet, SPREADSHEET_ID, GID_TIEP_DAN } from '../../services/googleSheets';
import { parseDateComponents } from '../../utils/csvParser';
import { User as FirebaseUser } from 'firebase/auth';

interface AddTiepDanModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRecords: TiepDanRecord[];
  onAddRecord: (newRecord: TiepDanRecord) => void;
  currentUser: FirebaseUser | null;
  accessToken: string | null;
  onAuthUpdated: (user: FirebaseUser | null, token: string | null) => void;
  onSaveAndTransfer?: (data: XuLyDonPrefillData) => void;
}

export const AddTiepDanModal: React.FC<AddTiepDanModalProps> = ({
  isOpen,
  onClose,
  existingRecords,
  onAddRecord,
  currentUser,
  accessToken,
  onAuthUpdated,
  onSaveAndTransfer,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [saveToSheet, setSaveToSheet] = useState(true);
  const [autoTransferToTab2, setAutoTransferToTab2] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Compute default values
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const nextSTT = useMemo(() => {
    if (existingRecords.length === 0) return 1;
    return Math.max(...existingRecords.map(r => r.stt)) + 1;
  }, [existingRecords]);

  // Form State for all 13 fields requested
  const [form, setForm] = useState({
    stt: nextSTT,
    ngayTiepDate: todayStr, // 1. Ngày tiếp
    hoTen: '', // 2. Họ tên
    diaChi: 'TDP 2, phường Trà Câu, tỉnh Quảng Ngãi', // 3. địa chỉ
    toDanPho: 'TDP 2',
    cccd: '', // 4. CCCD/Hộ chiếu
    noiDung: '', // 5. Nội dung vụ việc
    loaiDon: 'Phản ánh', // 6. Phân loại đơn
    soNguoi: 1, // 7. Số người
    coQuanGiaiQuyet: 'UBND phường Trà Câu (nếu đã tiếp nhận/xử lý)', // 8. Cơ quan đã giải quyết
    thuLy: false, // 9. Thụ lý để giải quyết (x)
    traLaiHuongDan: '', // 10. Trả lại đơn và hướng dẫn (ghi rõ nơi, số VB)
    chuyenDon: '', // 11. Chuyển đơn (ghi rõ cơ quan, số VB)
    theoDoiKetQua: 'Đang theo dõi', // 12. Theo dõi kết quả giải quyết
    ghiChu: '', // 13. Ghi chú
  });

  // Reset notification when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNotification(null);
      setForm(prev => ({ ...prev, stt: nextSTT }));
    }
  }, [isOpen, nextSTT]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setNotification(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthUpdated(res.user, res.accessToken);
        setNotification({
          type: 'success',
          message: `Đã kết nối tài khoản Google: ${res.user.email}. Quyền ghi Google Sheets đã sẵn sàng!`,
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Không thể đăng nhập Google. Vui lòng thử lại.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hoTen.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập Họ tên công dân.' });
      return;
    }
    if (!form.noiDung.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập Nội dung vụ việc.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    // Format date MM/DD/YYYY for Google Sheets compatibility
    const dateParts = form.ngayTiepDate.split('-');
    const formattedMMDDYYYY = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
    const { year, month, quarter, formatted } = parseDateComponents(formattedMMDDYYYY);

    // Matching Google Sheets columns A -> M:
    // 1: STT, 2: Ngày tiếp, 3: "Họ tên, địa chỉ", 4: CCCD, 5: Nội dung, 6: Phân loại đơn,
    // 7: Số người, 8: Cơ quan, 9: Thụ lý (x), 10: Trả lại hướng dẫn, 11: Chuyển đơn, 12: Theo dõi, 13: Ghi chú
    const hoTenDiaChiRaw = `${form.hoTen.trim()}\n${form.diaChi.trim()}`;
    const rowValues = [
      form.stt,
      formattedMMDDYYYY,
      hoTenDiaChiRaw,
      form.cccd.trim() || 'TEST-CCCD-NEW',
      form.noiDung.trim(),
      form.loaiDon,
      Number(form.soNguoi) || 1,
      form.coQuanGiaiQuyet,
      form.thuLy ? 'x' : '',
      form.traLaiHuongDan.trim(),
      form.chuyenDon.trim(),
      form.theoDoiKetQua,
      form.ghiChu.trim(),
    ];

    let savedToSheetSuccess = false;

    if (saveToSheet) {
      let token = accessToken;
      if (!token) {
        try {
          const authRes = await googleSignIn();
          if (authRes) {
            token = authRes.accessToken;
            onAuthUpdated(authRes.user, authRes.accessToken);
          }
        } catch (err: any) {
          setNotification({
            type: 'error',
            message: 'Chưa cấp quyền Google Sheets. Bản ghi sẽ được lưu vào Dashboard nội bộ.',
          });
        }
      }

      if (token) {
        const sheetRes = await appendTiepDanRowToGoogleSheet(token, rowValues);
        if (sheetRes.success) {
          savedToSheetSuccess = true;
        } else {
          setNotification({
            type: 'error',
            message: `Không thể ghi vào Google Sheets: ${sheetRes.error}. Đã lưu dữ liệu vào bảng hiển thị nội bộ.`,
          });
        }
      }
    }

    // Create local record
    const newRecord: TiepDanRecord = {
      id: `TD-${form.stt}-${Date.now()}`,
      stt: form.stt,
      ngayTiep: formatted,
      ngayTiepRaw: formattedMMDDYYYY,
      year,
      month,
      quarter,
      hoTen: form.hoTen.trim(),
      diaChi: form.diaChi.trim(),
      cccd: form.cccd.trim(),
      noiDung: form.noiDung.trim(),
      loaiDon: form.loaiDon,
      soNguoi: Number(form.soNguoi) || 1,
      coQuanGiaiQuyet: form.coQuanGiaiQuyet,
      thuLy: form.thuLy,
      traLaiHuongDan: form.traLaiHuongDan.trim(),
      chuyenDon: form.chuyenDon.trim(),
      theoDoiKetQua: form.theoDoiKetQua,
      ghiChu: form.ghiChu.trim(),
      toDanPho: form.toDanPho,
    };

    onAddRecord(newRecord);
    setIsSubmitting(false);

    const prefillData: XuLyDonPrefillData = {
      ngayNhanDate: form.ngayTiepDate, // 1. "Ngày tiếp" -> "Ngày tiếp" (Ngày nhận)
      hoTenNguoiGui: form.hoTen.trim(), // 2. "Họ tên" -> "Họ tên người gửi"
      diaChiLienHe: form.diaChi.trim(), // 3. "Địa chỉ" -> "Địa chỉ/liên hệ"
      tomTatNoiDung: form.noiDung.trim(), // 4. "Nội dung vụ việc" -> "Tóm tắt nội dung"
      coQuanNhanChuTri: form.coQuanGiaiQuyet.trim() || 'UBND phường Trà Câu', // 5. "Cơ quan đã giải quyết" -> "Cơ quan nhận/chủ trì"
      loaiDon: form.loaiDon, // 6. "Phân loại đơn" -> "Loại đơn"
      sourceSTT: newRecord.stt,
    };

    if (autoTransferToTab2 && onSaveAndTransfer) {
      if (savedToSheetSuccess) {
        setNotification({
          type: 'success',
          message: `Đã lưu hồ sơ #${newRecord.stt} vào Google Sheets ("So tiep dan")! Đang tự động chuyển dữ liệu sang Tab 2 (Sổ xử lý đơn)...`,
        });
      } else {
        setNotification({
          type: 'success',
          message: `Đã thêm hồ sơ #${newRecord.stt} vào Dashboard! Đang tự động chuyển dữ liệu sang Tab 2 (Sổ xử lý đơn)...`,
        });
      }
      setTimeout(() => {
        onClose();
        onSaveAndTransfer(prefillData);
      }, 900);
    } else {
      if (savedToSheetSuccess) {
        setNotification({
          type: 'success',
          message: `Đã lưu thành công hồ sơ #${newRecord.stt} vào Google Sheets ("So tiep dan") và cập nhật Dashboard!`,
        });
        setTimeout(() => {
          onClose();
        }, 1600);
      } else {
        setNotification({
          type: 'success',
          message: `Đã thêm thành công hồ sơ #${newRecord.stt} vào Dashboard!`,
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Thêm Mới Hồ Sơ Tiếp Công Dân (Mẫu 03/TCD)
              </h3>
              <p className="text-xs text-slate-300">
                UBND Phường Trà Câu • Lưu trực tiếp vào Google Sheets (gid={GID_TIEP_DAN})
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

        {/* Google Authentication & Sheet Connection Status Strip */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600">Google Sheet đích:</span>
            <a
              href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=${GID_TIEP_DAN}#gid=${GID_TIEP_DAN}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-blue-700 font-semibold text-[11px] hover:underline flex items-center gap-1"
            >
              <span>Bảng "So tiep dan" (gid={GID_TIEP_DAN})</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[140px]" title={currentUser.email || ''}>
                  {currentUser.email}
                </span>
                <button
                  type="button"
                  onClick={() => logoutGoogle().then(() => onAuthUpdated(null, null))}
                  className="text-slate-400 hover:text-red-600 ml-1"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 font-semibold text-xs shadow-xs transition disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isLoggingIn ? 'Đang xác thực...' : 'Đăng nhập Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Form Body - 13 fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <form id="tiep-dan-add-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Auto-generated STT Information Strip */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Số thứ tự hồ sơ tiếp công dân:</span>
                <strong className="text-blue-700 font-mono font-bold text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  #{form.stt}
                </strong>
                <span className="text-[11px] text-slate-400">(Tự động đánh số liên tục theo Mẫu 03/TCD)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const val = prompt('Điều chỉnh STT hồ sơ (nếu cần):', String(form.stt));
                  if (val && !isNaN(Number(val)) && Number(val) > 0) {
                    setForm(prev => ({ ...prev, stt: Number(val) }));
                  }
                }}
                className="text-slate-500 hover:text-blue-600 text-[11px] underline font-medium"
              >
                Đổi STT
              </button>
            </div>

            {/* Row 1: Bắt đầu nhập thông tin trực tiếp từ 1. Ngày tiếp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  1. Ngày tiếp <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  autoFocus
                  value={form.ngayTiepDate}
                  onChange={(e) => setForm({ ...form, ngayTiepDate: e.target.value })}
                  className="w-full bg-white border border-blue-400 focus:border-blue-600 rounded-lg px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  2. Họ tên công dân <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn Hoàng"
                  value={form.hoTen}
                  onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. CCCD / Hộ chiếu
                </label>
                <input
                  type="text"
                  placeholder="VD: 051098xxxxxx hoặc TEST-CCCD-0011"
                  value={form.cccd}
                  onChange={(e) => setForm({ ...form, cccd: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Row 2: Tổ dân phố & 3. Địa chỉ công dân */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tổ Dân Phố (TDP)
                </label>
                <input
                  type="text"
                  list="add-tdp-suggestions"
                  placeholder="Nhập trực tiếp TDP (VD: TDP 2, TDP 5...)"
                  value={form.toDanPho}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm(prev => ({ 
                      ...prev, 
                      toDanPho: val,
                      diaChi: prev.diaChi.includes('phường Trà Câu') && (prev.diaChi.startsWith('TDP') || !prev.diaChi)
                        ? `${val ? `${val}, ` : ''}phường Trà Câu, tỉnh Quảng Ngãi`
                        : prev.diaChi
                    }));
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <datalist id="add-tdp-suggestions">
                  {Array.from({ length: 10 }, (_, i) => `TDP ${i + 1}`).map(tdp => (
                    <option key={tdp} value={tdp}>{tdp}</option>
                  ))}
                  <option value="TDP khác">TDP khác</option>
                </datalist>
                <p className="text-[11px] text-slate-400 mt-0.5">Cho phép nhập trực tiếp hoặc chọn gợi ý</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  3. Địa chỉ công dân <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: TDP 2, phường Trà Câu, tỉnh Quảng Ngãi"
                  value={form.diaChi}
                  onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Row 3: 6. Phân loại đơn & 7. Số người & 8. Cơ quan đã giải quyết */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  6. Phân loại đơn
                </label>
                <select
                  value={form.loaiDon}
                  onChange={(e) => setForm({ ...form, loaiDon: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                >
                  <option value="Phản ánh">Phản ánh</option>
                  <option value="Khiếu nại">Khiếu nại</option>
                  <option value="Kiến nghị">Kiến nghị</option>
                  <option value="Tố cáo">Tố cáo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  7. Số người
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.soNguoi}
                  onChange={(e) => setForm({ ...form, soNguoi: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  8. Cơ quan đã giải quyết
                </label>
                <input
                  type="text"
                  value={form.coQuanGiaiQuyet}
                  onChange={(e) => setForm({ ...form, coQuanGiaiQuyet: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            {/* 5. Nội dung vụ việc */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                5. Nội dung vụ việc <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Trình bày tóm tắt nội dung phản ánh, khiếu nại, tố cáo, kiến nghị của công dân..."
                value={form.noiDung}
                onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 leading-relaxed"
                required
              />
            </div>

            {/* Resolution Fields Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              {/* 9. Thụ lý để giải quyết (x) */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="td-thuLy-check"
                  checked={form.thuLy}
                  onChange={(e) => setForm({ ...form, thuLy: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="td-thuLy-check" className="font-bold text-slate-800 cursor-pointer select-none">
                  9. Thụ lý để giải quyết (Đánh dấu "x")
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 10. Trả lại đơn và hướng dẫn */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    10. Trả lại đơn và hướng dẫn (ghi rõ nơi, số VB)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Hướng dẫn bổ sung tài liệu hồ sơ địa chính"
                    value={form.traLaiHuongDan}
                    onChange={(e) => setForm({ ...form, traLaiHuongDan: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                {/* 11. Chuyển đơn */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    11. Chuyển đơn (ghi rõ cơ quan, số VB)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Chuyển Chi nhánh VP Đăng ký đất đai, VB số 24/UBND"
                    value={form.chuyenDon}
                    onChange={(e) => setForm({ ...form, chuyenDon: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 12. Theo dõi kết quả giải quyết */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    12. Theo dõi kết quả giải quyết
                  </label>
                  <select
                    value={form.theoDoiKetQua}
                    onChange={(e) => setForm({ ...form, theoDoiKetQua: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Đang theo dõi">Đang theo dõi</option>
                    <option value="Đã hướng dẫn">Đã hướng dẫn</option>
                    <option value="Đã chuyển xử lý">Đã chuyển xử lý</option>
                    <option value="Đã giải quyết xong">Đã giải quyết xong</option>
                  </select>
                </div>

                {/* 13. Ghi chú */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    13. Ghi chú
                  </label>
                  <input
                    type="text"
                    placeholder="Ghi chú thêm nếu có..."
                    value={form.ghiChu}
                    onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              {/* File đính kèm - Background #A20409 */}
              <div 
                style={{ backgroundColor: '#A20409' }}
                className="mt-2 p-3 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Paperclip className="w-4 h-4 text-amber-200" />
                  </div>
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-white block">
                      File đính kèm & Tài liệu chứng cứ
                    </span>
                    <span className="text-[11px] text-red-100">
                      Đính kèm văn bản, đơn từ, tài liệu CCCD/hộ tịch của công dân
                    </span>
                  </div>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/30 transition self-start sm:self-auto">
                  <Paperclip className="w-3.5 h-3.5 text-amber-300" />
                  <span>Chọn file đính kèm</span>
                  <input type="file" multiple className="hidden" />
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={saveToSheet}
                onChange={(e) => setSaveToSheet(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                Lưu trực tiếp dòng mới vào bảng "So tiep dan" trên Google Sheets
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-indigo-700 font-semibold">
              <input
                type="checkbox"
                checked={autoTransferToTab2}
                onChange={(e) => setAutoTransferToTab2(e.target.checked)}
                className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="flex items-center gap-1.5">
                <ArrowRightCircle className="w-3.5 h-3.5 text-indigo-600" />
                Đồng thời chuyển thông tin sang Tab 2 (Sổ xử lý đơn) sau khi lưu
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="tiep-dan-add-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-md shadow-blue-900/20 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
              <span>{isSubmitting ? 'Đang lưu vào Google Sheets...' : 'Lưu Vào Google Sheets & Dashboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
