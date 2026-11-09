import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  MapPin, 
  Calendar, 
  FileText, 
  Edit3,
  Building2,
  Clock,
  Layers,
  Inbox,
  CheckSquare,
  Briefcase
} from 'lucide-react';
import { XuLyDonRecord, LoaiDon, NguonNhan } from '../../types';
import { parseDateComponents } from '../../utils/csvParser';

interface EditXuLyDonModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: XuLyDonRecord | null;
  onUpdateRecord: (updatedRecord: XuLyDonRecord) => void;
}

export const EditXuLyDonModal: React.FC<EditXuLyDonModalProps> = ({
  isOpen,
  onClose,
  record,
  onUpdateRecord,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper to convert DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD
  const parseToInputDate = (dateStr?: string): string => {
    if (!dateStr || !dateStr.trim() || dateStr === '-') return '';
    const clean = dateStr.trim();
    if (clean.includes('-') && clean.length === 10) return clean; // Already YYYY-MM-DD
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        // If year is in parts[0]
        if (parts[0].length === 4) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else if (month > 12) {
          // Inverted MM/DD format in source
          const tmp = day;
          day = month;
          month = tmp;
        }
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
    return '';
  };

  const [form, setForm] = useState({
    stt: 1,
    ngayNhanDate: '',
    soDen: '',
    nguonNhan: 'Trực tiếp' as NguonNhan,
    hoTenNguoiGui: '',
    diaChiLienHe: '',
    loaiDon: 'Phản ánh' as LoaiDon,
    tomTatNoiDung: '',
    duDieuKien: 'Có',
    thuocThamQuyen: 'Có',
    huongXuLy: 'Thụ lý giải quyết',
    soNgayVB: '',
    coQuanNhanChuTri: 'UBND phường Trà Câu',
    ngayChuyenHuongDanDate: '',
    hanTheoDoiDate: '',
    tinhTrang: 'Đang giải quyết',
    ketQuaGiaiQuyet: '',
    ngayCoKetQuaDate: '',
    canBoTheoDoi: '',
    ghiChu: '',
  });

  useEffect(() => {
    if (record && isOpen) {
      setNotification(null);
      setForm({
        stt: record.stt,
        ngayNhanDate: parseToInputDate(record.ngayNhanRaw || record.ngayNhan),
        soDen: record.soDen,
        nguonNhan: record.nguonNhan,
        hoTenNguoiGui: record.hoTenNguoiGui,
        diaChiLienHe: record.diaChiLienHe,
        loaiDon: record.loaiDon,
        tomTatNoiDung: record.tomTatNoiDung,
        duDieuKien: record.duDieuKien,
        thuocThamQuyen: record.thuocThamQuyen,
        huongXuLy: record.huongXuLy,
        soNgayVB: record.soNgayVB || '',
        coQuanNhanChuTri: record.coQuanNhanChuTri,
        ngayChuyenHuongDanDate: parseToInputDate(record.ngayChuyenHuongDan),
        hanTheoDoiDate: parseToInputDate(record.hanTheoDoi),
        tinhTrang: record.tinhTrang,
        ketQuaGiaiQuyet: record.ketQuaGiaiQuyet || '',
        ngayCoKetQuaDate: parseToInputDate(record.ngayCoKetQua),
        canBoTheoDoi: record.canBoTheoDoi || '',
        ghiChu: record.ghiChu || '',
      });
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const formatDateToDDMMYYYY = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  const formatDateToMMDDYYYY = (isoDate: string): string => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return isoDate;
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    let year = record.year;
    let month = record.month;
    let quarter = record.quarter;
    let ngayNhanDisplay = record.ngayNhan;
    let ngayNhanMMDD = record.ngayNhanRaw;

    if (form.ngayNhanDate) {
      ngayNhanMMDD = formatDateToMMDDYYYY(form.ngayNhanDate);
      const parsed = parseDateComponents(ngayNhanMMDD);
      year = parsed.year;
      month = parsed.month;
      quarter = parsed.quarter;
      ngayNhanDisplay = parsed.formatted;
    }

    const updatedRecord: XuLyDonRecord = {
      ...record,
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

    onUpdateRecord(updatedRecord);
    setIsSubmitting(false);
    setNotification({
      type: 'success',
      message: `Đã cập nhật thành công đơn thư #${updatedRecord.stt} (${updatedRecord.soDen})!`,
    });

    setTimeout(() => {
      onClose();
    }, 800);
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
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Edit3 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Sửa Dữ Liệu Đơn Thư
                <span className="bg-indigo-500 text-white text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {record.soDen}
                </span>
                <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                  STT #{record.stt}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                UBND Phường Trà Câu • Sổ tiếp nhận, phân loại và xử lý đơn thư
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form id="edit-xu-ly-don-form" onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {/* Section 1: Thông tin tiếp nhận ban đầu */}
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
                    value={form.ngayNhanDate}
                    onChange={(e) => setForm({ ...form, ngayNhanDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    2. Số đến <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.soDen}
                    onChange={(e) => setForm({ ...form, soDen: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-indigo-700 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
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
                    value={form.hoTenNguoiGui}
                    onChange={(e) => setForm({ ...form, hoTenNguoiGui: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500"
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
                    value={form.diaChiLienHe}
                    onChange={(e) => setForm({ ...form, diaChiLienHe: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  7. Tóm tắt nội dung đơn thư <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.tomTatNoiDung}
                  onChange={(e) => setForm({ ...form, tomTatNoiDung: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Section 3: Hướng xử lý & Cơ quan tiếp nhận */}
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
                    value={form.canBoTheoDoi}
                    onChange={(e) => setForm({ ...form, canBoTheoDoi: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  16. Kết quả giải quyết
                </label>
                <input
                  type="text"
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
                  value={form.ghiChu}
                  onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="edit-xu-ly-don-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-md shadow-indigo-900/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
