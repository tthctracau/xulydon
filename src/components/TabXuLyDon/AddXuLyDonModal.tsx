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
  Clock,
  Layers,
  Inbox,
  CheckSquare,
  Briefcase
} from 'lucide-react';
import { XuLyDonRecord, LoaiDon, NguonNhan, XuLyDonPrefillData } from '../../types';
import { googleSignIn, logoutGoogle } from '../../services/googleAuth';
import { appendXuLyDonRowToGoogleSheet, SPREADSHEET_ID, GID_XU_LY_DON } from '../../services/googleSheets';
import { parseDateComponents } from '../../utils/csvParser';
import { User as FirebaseUser } from 'firebase/auth';

interface AddXuLyDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingRecords: XuLyDonRecord[];
  onAddRecord: (newRecord: XuLyDonRecord) => void;
  currentUser: FirebaseUser | null;
  accessToken: string | null;
  onAuthUpdated: (user: FirebaseUser | null, token: string | null) => void;
  initialPrefill?: XuLyDonPrefillData | null;
}

export const AddXuLyDonModal: React.FC<AddXuLyDonModalProps> = ({
  isOpen,
  onClose,
  existingRecords,
  onAddRecord,
  currentUser,
  accessToken,
  onAuthUpdated,
  initialPrefill,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [saveToSheet, setSaveToSheet] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Compute default values
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const defaultHanTheoDoi = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15); // default 15 days deadline
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const nextSTT = useMemo(() => {
    if (existingRecords.length === 0) return 1;
    return Math.max(...existingRecords.map(r => r.stt)) + 1;
  }, [existingRecords]);

  const defaultSoDen = useMemo(() => {
    return `Đ-2026-${String(nextSTT).padStart(3, '0')}`;
  }, [nextSTT]);

  // Form State for all 19 fields requested by user
  const [form, setForm] = useState({
    stt: nextSTT,
    ngayNhanDate: todayStr, // 1. Ngày nhận
    soDen: defaultSoDen, // 2. Số đến
    nguonNhan: 'Trực tiếp' as NguonNhan, // 3. Nguồn nhận
    hoTenNguoiGui: '', // 4. Họ tên người gửi
    diaChiLienHe: 'TDP 2, phường Trà Câu, tỉnh Quảng Ngãi', // 5. Địa chỉ/liên hệ
    loaiDon: 'Phản ánh' as LoaiDon, // 6. Loại đơn
    tomTatNoiDung: '', // 7. Tóm tắt nội dung
    duDieuKien: 'Có', // 8. Đủ điều kiện xử lý?
    thuocThamQuyen: 'Có', // 9. Thuộc thẩm quyền?
    huongXuLy: 'Thụ lý giải quyết', // 10. Hướng xử lý
    soNgayVB: '', // 11. Số, ngày văn bản xử lý
    coQuanNhanChuTri: 'UBND phường Trà Câu', // 12. Cơ quan nhận/chủ trì
    ngayChuyenHuongDanDate: todayStr, // 13. Ngày chuyển/hướng dẫn
    hanTheoDoiDate: defaultHanTheoDoi, // 14. Hạn theo dõi
    tinhTrang: 'Đang giải quyết', // 15. Tình trạng
    ketQuaGiaiQuyet: 'Đang thụ lý giải quyết theo quy định', // 16. Kết quả giải quyết
    ngayCoKetQuaDate: '', // 17. Ngày có kết quả
    canBoTheoDoi: 'Bộ phận Tiếp công dân & Xử lý đơn', // 18. Cán bộ theo dõi
    ghiChu: '', // 19. Ghi chú
  });

  // Reset/sync notification and prefill/default values when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNotification(null);
      setForm(prev => ({
        ...prev,
        stt: nextSTT,
        soDen: `Đ-2026-${String(nextSTT).padStart(3, '0')}`,
        soNgayVB: `VB-2026-${String(nextSTT).padStart(3, '0')} ngày ${new Date().toLocaleDateString('vi-VN')}`,
        ...(initialPrefill ? {
          ngayNhanDate: initialPrefill.ngayNhanDate || todayStr,
          hoTenNguoiGui: initialPrefill.hoTenNguoiGui || '',
          diaChiLienHe: initialPrefill.diaChiLienHe || 'TDP 2, phường Trà Câu, tỉnh Quảng Ngãi',
          tomTatNoiDung: initialPrefill.tomTatNoiDung || '',
          coQuanNhanChuTri: initialPrefill.coQuanNhanChuTri || 'UBND phường Trà Câu',
          loaiDon: initialPrefill.loaiDon || 'Phản ánh',
        } : {})
      }));
    }
  }, [isOpen, nextSTT, initialPrefill, todayStr]);

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

  const formatDateToMMDDYYYY = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return isoDate;
  };

  const formatDateToDDMMYYYY = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hoTenNguoiGui.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập Họ tên người gửi đơn.' });
      return;
    }
    if (!form.tomTatNoiDung.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập Tóm tắt nội dung đơn thư.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    // Format dates for Google Sheets (MM/DD/YYYY)
    const ngayNhanMMDD = formatDateToMMDDYYYY(form.ngayNhanDate);
    const ngayChuyenMMDD = form.ngayChuyenHuongDanDate ? formatDateToMMDDYYYY(form.ngayChuyenHuongDanDate) : '';
    const hanTheoDoiMMDD = form.hanTheoDoiDate ? formatDateToMMDDYYYY(form.hanTheoDoiDate) : '';
    const ngayCoKetQuaMMDD = form.ngayCoKetQuaDate ? formatDateToMMDDYYYY(form.ngayCoKetQuaDate) : '';

    const { year, month, quarter, formatted: ngayNhanDisplay } = parseDateComponents(ngayNhanMMDD);

    // Google Sheets Columns A -> T (20 columns):
    // 1: STT
    // 2: Ngày nhận
    // 3: Số đến
    // 4: Nguồn nhận
    // 5: Họ tên người gửi
    // 6: Địa chỉ/liên hệ
    // 7: Loại đơn
    // 8: Tóm tắt nội dung
    // 9: Đủ điều kiện xử lý?
    // 10: Thuộc thẩm quyền?
    // 11: Hướng xử lý
    // 12: Số, ngày văn bản xử lý
    // 13: Cơ quan nhận/chủ trì
    // 14: Ngày chuyển/hướng dẫn
    // 15: Hạn theo dõi
    // 16: Tình trạng
    // 17: Kết quả giải quyết
    // 18: Ngày có kết quả
    // 19: Cán bộ theo dõi
    // 20: Ghi chú
    const rowValues = [
      form.stt,
      ngayNhanMMDD,
      form.soDen.trim(),
      form.nguonNhan,
      form.hoTenNguoiGui.trim(),
      form.diaChiLienHe.trim(),
      form.loaiDon,
      form.tomTatNoiDung.trim(),
      form.duDieuKien,
      form.thuocThamQuyen,
      form.huongXuLy.trim(),
      form.soNgayVB.trim(),
      form.coQuanNhanChuTri.trim(),
      ngayChuyenMMDD,
      hanTheoDoiMMDD,
      form.tinhTrang,
      form.ketQuaGiaiQuyet.trim(),
      ngayCoKetQuaMMDD,
      form.canBoTheoDoi.trim(),
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
            message: 'Chưa cấp quyền Google Sheets. Đơn thư sẽ được lưu trực tiếp vào Dashboard nội bộ.',
          });
        }
      }

      if (token) {
        const sheetRes = await appendXuLyDonRowToGoogleSheet(token, rowValues);
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

    // Create local record for Dashboard
    const newRecord: XuLyDonRecord = {
      id: `XLD-${form.stt}-${Date.now()}`,
      stt: form.stt,
      ngayNhan: ngayNhanDisplay,
      ngayNhanRaw: ngayNhanMMDD,
      year,
      month,
      quarter,
      soDen: form.soDen.trim(),
      nguonNhan: form.nguonNhan,
      hoTenNguoiGui: form.hoTenNguoiGui.trim(),
      diaChiLienHe: form.diaChiLienHe.trim(),
      loaiDon: form.loaiDon,
      tomTatNoiDung: form.tomTatNoiDung.trim(),
      duDieuKien: form.duDieuKien,
      thuocThamQuyen: form.thuocThamQuyen,
      huongXuLy: form.huongXuLy.trim(),
      soNgayVB: form.soNgayVB.trim(),
      coQuanNhanChuTri: form.coQuanNhanChuTri.trim(),
      ngayChuyenHuongDan: form.ngayChuyenHuongDanDate ? formatDateToDDMMYYYY(form.ngayChuyenHuongDanDate) : '',
      hanTheoDoi: form.hanTheoDoiDate ? formatDateToDDMMYYYY(form.hanTheoDoiDate) : '',
      tinhTrang: form.tinhTrang,
      ketQuaGiaiQuyet: form.ketQuaGiaiQuyet.trim(),
      ngayCoKetQua: form.ngayCoKetQuaDate ? formatDateToDDMMYYYY(form.ngayCoKetQuaDate) : '',
      canBoTheoDoi: form.canBoTheoDoi.trim(),
      ghiChu: form.ghiChu.trim(),
    };

    onAddRecord(newRecord);
    setIsSubmitting(false);

    if (savedToSheetSuccess) {
      setNotification({
        type: 'success',
        message: `Đã lưu thành công đơn thư #${newRecord.stt} (${newRecord.soDen}) vào bảng "So xu ly don" trên Google Sheets và cập nhật Dashboard!`,
      });
      setTimeout(() => {
        onClose();
      }, 1600);
    } else if (!saveToSheet) {
      setNotification({
        type: 'success',
        message: `Đã thêm thành công đơn thư #${newRecord.stt} (${newRecord.soDen}) vào Dashboard!`,
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 flex items-center justify-center text-white shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Thêm Mới Đơn Thư Vào Sổ Xử Lý Đơn
              </h3>
              <p className="text-xs text-slate-300">
                UBND Phường Trà Câu • Lưu trực tiếp vào Google Sheets (gid={GID_XU_LY_DON})
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
            <Database className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600">Google Sheet đích:</span>
            <a
              href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?gid=${GID_XU_LY_DON}#gid=${GID_XU_LY_DON}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-indigo-700 font-semibold text-[11px] hover:underline flex items-center gap-1"
            >
              <span>Bảng "So xu ly don" (gid={GID_XU_LY_DON})</span>
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

        {/* Form Body - 19 user fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {initialPrefill && (
            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-2 border-indigo-200/90 rounded-xl p-3.5 text-xs text-indigo-950 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-indigo-900 text-sm">
                    Đã chuyển tự động thông tin từ Tab 1 (Sổ tiếp dân)
                  </span>
                  {initialPrefill.sourceSTT && (
                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                      Hồ sơ tiếp dân #{initialPrefill.sourceSTT}
                    </span>
                  )}
                </div>
                <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                  Hệ thống đã tự động điền sẵn 6 trường: <strong>Ngày tiếp → Ngày nhận</strong> ({form.ngayNhanDate}), <strong>Họ tên → Họ tên người gửi</strong> ({form.hoTenNguoiGui}), <strong>Địa chỉ → Địa chỉ/liên hệ</strong>, <strong>Nội dung vụ việc → Tóm tắt nội dung</strong>, <strong>Cơ quan đã giải quyết → Cơ quan nhận/chủ trì</strong> ({form.coQuanNhanChuTri}) và <strong>Phân loại đơn → Loại đơn</strong> ({form.loaiDon}).
                </p>
                <p className="text-indigo-800 font-semibold text-[11px] mt-1">
                  Quý Cán bộ vui lòng kiểm tra thông tin, bổ sung các trường theo dõi (nếu có) và nhấn nút lưu bên dưới để cập nhật vào Google Sheets ("So xu ly don")!
                </p>
              </div>
            </div>
          )}

          <form id="xu-ly-don-add-form" onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Section 1: Thông tin tiếp nhận ban đầu (STT, Ngày nhận, Số đến, Nguồn nhận) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-700">
                <Inbox className="w-4 h-4 text-indigo-600" />
                <span>I. Thông tin tiếp nhận đơn thư</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    1. Ngày nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    autoFocus
                    value={form.ngayNhanDate}
                    onChange={(e) => setForm({ ...form, ngayNhanDate: e.target.value })}
                    className="w-full bg-white border border-indigo-400 focus:border-indigo-600 rounded-lg px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    2. Số đến <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đ-2026-016"
                    value={form.soDen}
                    onChange={(e) => setForm({ ...form, soDen: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-indigo-700 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    3. Nguồn nhận
                  </label>
                  <select
                    value={form.nguonNhan}
                    onChange={(e) => setForm({ ...form, nguonNhan: e.target.value as NguonNhan })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Trực tiếp">Trực tiếp tại trụ sở</option>
                    <option value="Bưu chính">Qua bưu chính / thư</option>
                    <option value="Trực tuyến">Cổng Dịch vụ công / Trực tuyến</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">STT hồ sơ</label>
                  <input
                    type="number"
                    value={form.stt}
                    onChange={(e) => setForm({ ...form, stt: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* 4. Họ tên người gửi & 5. Địa chỉ/liên hệ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    4. Họ tên người gửi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn Hoàng"
                    value={form.hoTenNguoiGui}
                    onChange={(e) => setForm({ ...form, hoTenNguoiGui: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    5. Địa chỉ / liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: TDP 2, phường Trà Câu, tỉnh Quảng Ngãi - SĐT: 0912..."
                    value={form.diaChiLienHe}
                    onChange={(e) => setForm({ ...form, diaChiLienHe: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Nội dung & Phân loại thẩm quyền */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-700">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>II. Phân loại nội dung & Điều kiện thẩm quyền</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    6. Loại đơn
                  </label>
                  <select
                    value={form.loaiDon}
                    onChange={(e) => setForm({ ...form, loaiDon: e.target.value as LoaiDon })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="Phản ánh">Phản ánh</option>
                    <option value="Khiếu nại">Khiếu nại</option>
                    <option value="Kiến nghị">Kiến nghị</option>
                    <option value="Tố cáo">Tố cáo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                    8. Đủ điều kiện xử lý?
                  </label>
                  <select
                    value={form.duDieuKien}
                    onChange={(e) => setForm({ ...form, duDieuKien: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Có">Có (Đủ điều kiện)</option>
                    <option value="Không">Không (Chưa đủ điều kiện)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                    9. Thuộc thẩm quyền?
                  </label>
                  <select
                    value={form.thuocThamQuyen}
                    onChange={(e) => setForm({ ...form, thuocThamQuyen: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Có">Có (Thuộc thẩm quyền UBND)</option>
                    <option value="Không">Không (Ngoài thẩm quyền UBND)</option>
                  </select>
                </div>
              </div>

              {/* 7. Tóm tắt nội dung */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  7. Tóm tắt nội dung đơn thư <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi tóm tắt yêu cầu, sự việc khiếu nại, phản ánh hoặc tố cáo của công dân..."
                  value={form.tomTatNoiDung}
                  onChange={(e) => setForm({ ...form, tomTatNoiDung: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 leading-relaxed"
                  required
                />
              </div>
            </div>

            {/* Section 3: Hướng xử lý & Cơ quan tiếp nhận/chủ trì */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-700">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>III. Phương hướng xử lý & Đơn vị chủ trì</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    10. Hướng xử lý
                  </label>
                  <select
                    value={form.huongXuLy}
                    onChange={(e) => setForm({ ...form, huongXuLy: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold"
                  >
                    <option value="Thụ lý giải quyết">Thụ lý giải quyết</option>
                    <option value="Hướng dẫn bổ sung">Hướng dẫn bổ sung</option>
                    <option value="Chuyển cơ quan có thẩm quyền">Chuyển cơ quan có thẩm quyền</option>
                    <option value="Lưu đơn theo dõi">Lưu đơn theo dõi (đơn trùng/nặc danh)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    11. Số, ngày văn bản xử lý
                  </label>
                  <input
                    type="text"
                    placeholder="VD: VB-2026-016 ngày 03/11/2026"
                    value={form.soNgayVB}
                    onChange={(e) => setForm({ ...form, soNgayVB: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    12. Cơ quan nhận / chủ trì
                  </label>
                  <input
                    type="text"
                    placeholder="VD: UBND phường Trà Câu / Công an phường"
                    value={form.coQuanNhanChuTri}
                    onChange={(e) => setForm({ ...form, coQuanNhanChuTri: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    13. Ngày chuyển / hướng dẫn
                  </label>
                  <input
                    type="date"
                    value={form.ngayChuyenHuongDanDate}
                    onChange={(e) => setForm({ ...form, ngayChuyenHuongDanDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    14. Hạn theo dõi giải quyết
                  </label>
                  <input
                    type="date"
                    value={form.hanTheoDoiDate}
                    onChange={(e) => setForm({ ...form, hanTheoDoiDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-rose-700 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Tình trạng & Kết quả giải quyết */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider text-indigo-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>IV. Tình trạng, Kết quả & Theo dõi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    15. Tình trạng xử lý
                  </label>
                  <select
                    value={form.tinhTrang}
                    onChange={(e) => setForm({ ...form, tinhTrang: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="Đang giải quyết">Đang giải quyết</option>
                    <option value="Đã hướng dẫn">Đã hướng dẫn</option>
                    <option value="Đã chuyển">Đã chuyển cơ quan khác</option>
                    <option value="Hoàn thành">Hoàn thành / Đã có kết quả</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    17. Ngày có kết quả
                  </label>
                  <input
                    type="date"
                    value={form.ngayCoKetQuaDate}
                    onChange={(e) => setForm({ ...form, ngayCoKetQuaDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    18. Cán bộ theo dõi
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Cán bộ Địa chính - Xây dựng"
                    value={form.canBoTheoDoi}
                    onChange={(e) => setForm({ ...form, canBoTheoDoi: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  16. Kết quả giải quyết
                </label>
                <input
                  type="text"
                  placeholder="VD: Đã kiểm tra thực địa và thông báo kết luận giải quyết..."
                  value={form.ketQuaGiaiQuyet}
                  onChange={(e) => setForm({ ...form, ketQuaGiaiQuyet: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  19. Ghi chú
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm thông tin lưu trữ..."
                  value={form.ghiChu}
                  onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-semibold">
            <input
              type="checkbox"
              checked={saveToSheet}
              onChange={(e) => setSaveToSheet(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Lưu trực tiếp dòng mới vào bảng "So xu ly don" trên Google Sheets
            </span>
          </label>

          <div className="flex items-center gap-2.5">
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
              form="xu-ly-don-add-form"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-md shadow-indigo-900/20 disabled:opacity-50"
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
