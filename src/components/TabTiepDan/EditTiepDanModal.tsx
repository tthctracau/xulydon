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
  Paperclip
} from 'lucide-react';
import { TiepDanRecord } from '../../types';
import { parseDateComponents } from '../../utils/csvParser';

interface EditTiepDanModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: TiepDanRecord | null;
  onUpdateRecord: (updatedRecord: TiepDanRecord) => void;
}

export const EditTiepDanModal: React.FC<EditTiepDanModalProps> = ({
  isOpen,
  onClose,
  record,
  onUpdateRecord,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Convert DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD for date input
  const getInitialDateInput = (rec: TiepDanRecord | null): string => {
    if (!rec) return '';
    if (rec.year && rec.month) {
      let day = 1;
      if (rec.ngayTiepRaw) {
        const parts = rec.ngayTiepRaw.split('/');
        if (parts.length === 3) {
          day = parseInt(parts[1], 10) || 1;
        }
      } else if (rec.ngayTiep) {
        const parts = rec.ngayTiep.split('/');
        if (parts.length === 3) {
          day = parseInt(parts[0], 10) || 1;
        }
      }
      return `${rec.year}-${String(rec.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return '';
  };

  const [form, setForm] = useState({
    stt: 1,
    ngayTiepDate: '',
    hoTen: '',
    diaChi: '',
    toDanPho: 'TDP 2',
    cccd: '',
    noiDung: '',
    loaiDon: 'Phản ánh',
    soNguoi: 1,
    coQuanGiaiQuyet: 'UBND phường Trà Câu',
    thuLy: false,
    traLaiHuongDan: '',
    chuyenDon: '',
    theoDoiKetQua: 'Đang theo dõi',
    ghiChu: '',
  });

  useEffect(() => {
    if (record && isOpen) {
      setNotification(null);
      setForm({
        stt: record.stt,
        ngayTiepDate: getInitialDateInput(record),
        hoTen: record.hoTen,
        diaChi: record.diaChi,
        toDanPho: record.toDanPho || 'TDP 2',
        cccd: record.cccd || '',
        noiDung: record.noiDung,
        loaiDon: record.loaiDon,
        soNguoi: record.soNguoi || 1,
        coQuanGiaiQuyet: record.coQuanGiaiQuyet,
        thuLy: Boolean(record.thuLy),
        traLaiHuongDan: record.traLaiHuongDan || '',
        chuyenDon: record.chuyenDon || '',
        theoDoiKetQua: record.theoDoiKetQua,
        ghiChu: record.ghiChu || '',
      });
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
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

    let year = record.year;
    let month = record.month;
    let quarter = record.quarter;
    let formatted = record.ngayTiep;
    let formattedMMDDYYYY = record.ngayTiepRaw;

    if (form.ngayTiepDate) {
      const parts = form.ngayTiepDate.split('-');
      if (parts.length === 3) {
        formattedMMDDYYYY = `${parts[1]}/${parts[2]}/${parts[0]}`;
        const parsed = parseDateComponents(formattedMMDDYYYY);
        year = parsed.year;
        month = parsed.month;
        quarter = parsed.quarter;
        formatted = parsed.formatted;
      }
    }

    const updatedRecord: TiepDanRecord = {
      ...record,
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
      coQuanGiaiQuyet: form.coQuanGiaiQuyet.trim(),
      thuLy: form.thuLy,
      traLaiHuongDan: form.traLaiHuongDan.trim(),
      chuyenDon: form.chuyenDon.trim(),
      theoDoiKetQua: form.theoDoiKetQua,
      ghiChu: form.ghiChu.trim(),
      toDanPho: form.toDanPho,
    };

    onUpdateRecord(updatedRecord);
    setIsSubmitting(false);
    setNotification({
      type: 'success',
      message: `Đã cập nhật thành công hồ sơ #${updatedRecord.stt} (${updatedRecord.hoTen})!`,
    });

    setTimeout(() => {
      onClose();
    }, 800);
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
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold shadow-md">
              <Edit3 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Sửa Dữ Liệu Hồ Sơ Tiếp Công Dân
                <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                  STT #{record.stt}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                UBND Phường Trà Câu • Cập nhật thông tin Mẫu 03/TCD
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <form id="edit-tiep-dan-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Ngày tiếp, Họ tên, CCCD */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  1. Ngày tiếp <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.ngayTiepDate}
                  onChange={(e) => setForm({ ...form, ngayTiepDate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
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
                  value={form.hoTen}
                  onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  4. CCCD / Hộ chiếu
                </label>
                <input
                  type="text"
                  value={form.cccd}
                  onChange={(e) => setForm({ ...form, cccd: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Row 2: TDP & Địa chỉ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tổ Dân Phố (TDP)
                </label>
                <input
                  type="text"
                  list="edit-tdp-suggestions"
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
                <datalist id="edit-tdp-suggestions">
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
                  value={form.diaChi}
                  onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Row 3: Loại đơn, Số người, Cơ quan giải quyết */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  6. Phân loại đơn
                </label>
                <select
                  value={form.loaiDon}
                  onChange={(e) => setForm({ ...form, loaiDon: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
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
                value={form.noiDung}
                onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Resolution Fields Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-td-thuLy-check"
                  checked={form.thuLy}
                  onChange={(e) => setForm({ ...form, thuLy: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="edit-td-thuLy-check" className="font-bold text-slate-800 cursor-pointer select-none">
                  9. Thụ lý để giải quyết (Đánh dấu "x")
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    10. Trả lại đơn và hướng dẫn (ghi rõ nơi, số VB)
                  </label>
                  <input
                    type="text"
                    value={form.traLaiHuongDan}
                    onChange={(e) => setForm({ ...form, traLaiHuongDan: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    11. Chuyển đơn (ghi rõ cơ quan, số VB)
                  </label>
                  <input
                    type="text"
                    value={form.chuyenDon}
                    onChange={(e) => setForm({ ...form, chuyenDon: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    12. Theo dõi kết quả giải quyết
                  </label>
                  <select
                    value={form.theoDoiKetQua}
                    onChange={(e) => setForm({ ...form, theoDoiKetQua: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-bold"
                  >
                    <option value="Đang theo dõi">Đang theo dõi</option>
                    <option value="Đã hướng dẫn">Đã hướng dẫn</option>
                    <option value="Đã chuyển xử lý">Đã chuyển xử lý</option>
                    <option value="Đã giải quyết xong">Đã giải quyết xong</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    13. Ghi chú
                  </label>
                  <input
                    type="text"
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
                      Tệp hồ sơ, biên bản tiếp công dân, đơn từ liên quan
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
            form="edit-tiep-dan-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-md shadow-amber-900/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
