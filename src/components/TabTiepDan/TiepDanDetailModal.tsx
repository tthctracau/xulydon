import React from 'react';
import { 
  X, 
  Printer, 
  User, 
  MapPin, 
  FileText, 
  CheckCircle, 
  Building2, 
  Calendar,
  AlertCircle,
  Edit3,
  Trash2,
  Paperclip
} from 'lucide-react';
import { TiepDanRecord } from '../../types';

interface TiepDanDetailModalProps {
  record: TiepDanRecord | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TiepDanDetailModal: React.FC<TiepDanDetailModalProps> = ({ 
  record, 
  onClose,
  onEdit,
  onDelete
}) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Chi Tiết Hồ Sơ Tiếp Công Dân #{record.stt}
              </h3>
              <p className="text-xs text-slate-300">
                Mẫu số 03/TCD • Nghị định 154/2026/NĐ-CP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu Tiếp Dân</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Form Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Vietnam National Emblem Header (Standard Administrative Print Format) */}
          <div className="text-center border-b border-slate-200 pb-4">
            <div className="text-xs uppercase font-bold text-slate-700">
              UBND TỈNH QUẢNG NGÃI • UBND PHƯỜNG TRÀ CÂU
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-wide">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs italic text-slate-700 underline underline-offset-4 decoration-slate-300">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-4 uppercase">
              PHIẾU GHI NHẬN TIẾP CÔNG DÂN
            </h2>
            <p className="text-xs text-slate-500 italic mt-0.5">
              (Trích lục từ Sổ Tiếp công dân ngày {record.ngayTiep})
            </p>
          </div>

          {/* Citizen information card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-200/80 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>I. THÔNG TIN CÔNG DÂN TIẾP NHẬN</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-xs">Họ và tên công dân:</span>
                <span className="font-bold text-slate-800 text-sm">{record.hoTen}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Số CCCD / Hộ chiếu:</span>
                <span className="font-mono font-semibold text-slate-800">{record.cccd || 'Chưa cung cấp'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> Nơi thường trú / Địa chỉ liên hệ:
                </span>
                <span className="font-medium text-slate-800">{record.diaChi}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Tổ dân phố:</span>
                <span className="inline-block bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded text-xs mt-0.5">
                  {record.toDanPho || 'TDP tại phường'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Số người cùng đứng đơn / tham gia:</span>
                <span className="font-semibold text-slate-800">{record.soNguoi} người</span>
              </div>
            </div>
          </div>

          {/* Content & classification */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-200/80 pb-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>II. NỘI DUNG VỤ VIỆC & PHÂN LOẠI ĐƠN</span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500 text-xs">Phân loại đơn:</span>
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {record.loaiDon}
                </span>
                <span className="text-slate-400 text-xs">• Ngày tiếp: {record.ngayTiep}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-xs mb-1">Tóm tắt nội dung trình bày của công dân:</span>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {record.noiDung}
                </div>
              </div>
            </div>
          </div>

          {/* Handling & resolutions */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs sm:text-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-200/80 pb-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>III. HÌNH THỨC XỬ LÝ & THEO DÕI KẾT QUẢ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-xs">Cơ quan đã / đang giải quyết:</span>
                <span className="font-semibold text-slate-800">{record.coQuanGiaiQuyet}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-xs">Thụ lý để giải quyết:</span>
                {record.thuLy ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Có thụ lý giải quyết (x)
                  </span>
                ) : (
                  <span className="text-slate-500 text-xs font-medium">Không thụ lý trực tiếp</span>
                )}
              </div>

              <div>
                <span className="text-slate-500 block text-xs">Trả lại đơn & Hướng dẫn:</span>
                <span className="text-slate-800 font-medium">
                  {record.traLaiHuongDan || 'Không có hướng dẫn trả lại'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-xs">Chuyển đơn:</span>
                <span className="text-slate-800 font-medium">
                  {record.chuyenDon || 'Không chuyển'}
                </span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 block text-xs">Tình trạng theo dõi kết quả:</span>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-md text-xs mt-1">
                  {record.theoDoiKetQua}
                </span>
                {record.ghiChu && (
                  <span className="block text-xs text-slate-500 italic mt-1">
                    Ghi chú: {record.ghiChu}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* IV. File đính kèm & Tài liệu - Background #A20409 */}
          <div 
            style={{ backgroundColor: '#A20409' }}
            className="rounded-xl p-4 text-white shadow-sm space-y-2 border border-red-950 no-print"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-200">
                <Paperclip className="w-4 h-4 text-amber-300" />
                <span>IV. FILE ĐÍNH KÈM & TÀI LIỆU HỒ SƠ</span>
              </div>
              <span className="text-[11px] bg-black/25 px-2.5 py-0.5 rounded-full text-amber-100 font-semibold border border-white/20">
                Mẫu số 03/TCD
              </span>
            </div>
            <p className="text-xs text-red-100 leading-relaxed">
              Tệp tài liệu đính kèm theo hồ sơ tiếp công dân số #{record.stt} ({record.loaiDon} - {record.hoTen}).
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg border border-white/30 font-medium transition cursor-pointer">
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>Bien_ban_tiep_dan_so_{record.stt}.pdf</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg border border-white/30 font-medium transition cursor-pointer">
                <Paperclip className="w-3.5 h-3.5 text-amber-300" />
                <span>Don_yeu_cau_giai_quyet.doc</span>
              </span>
            </div>
          </div>

          {/* Signature block for print */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
            <div>
              <p className="font-bold uppercase text-slate-800">CÔNG DÂN ĐẾN TIẾP</p>
              <p className="italic text-slate-500">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-700">{record.hoTen}</p>
            </div>
            <div>
              <p className="font-bold uppercase text-slate-800">CÁN BỘ TIẾP CÔNG DÂN</p>
              <p className="italic text-slate-500">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-700">Bộ phận Tiếp dân Phường</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-lg transition shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa hồ sơ</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa hồ sơ</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
