import React from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  User, 
  MapPin, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Tag,
  Edit3,
  Trash2
} from 'lucide-react';
import { XuLyDonRecord } from '../../types';

interface XuLyDonDetailModalProps {
  record: XuLyDonRecord | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const XuLyDonDetailModal: React.FC<XuLyDonDetailModalProps> = ({ 
  record, 
  onClose,
  onEdit,
  onDelete
}) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Hồ Sơ Xử Lý Đơn Số Đến: {record.soDen}
              </h3>
              <p className="text-xs text-slate-300">
                Sổ theo dõi tiếp nhận, phân loại và xử lý đơn thư
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu Theo Dõi</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          {/* Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-slate-700">Loại đơn:</span>
              <span className="font-bold text-indigo-900 bg-white px-2.5 py-0.5 rounded-md border border-indigo-200">
                {record.loaiDon}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Tình trạng:</span>
              <span className="font-bold text-slate-900 bg-indigo-100 text-indigo-900 px-3 py-1 rounded-md">
                {record.tinhTrang}
              </span>
            </div>
          </div>

          {/* Citizen & Sender Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2 text-xs uppercase tracking-wider">
              <User className="w-4 h-4 text-blue-600" />
              1. Thông tin người gửi đơn & Nguồn tiếp nhận
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-xs">Họ và tên người gửi:</span>
                <span className="font-bold text-slate-900 text-sm">{record.hoTenNguoiGui}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Nguồn tiếp nhận:</span>
                <span className="font-semibold text-slate-800">{record.nguonNhan}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-xs">Địa chỉ / Liên hệ:</span>
                <span className="font-medium text-slate-800">{record.diaChiLienHe}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Ngày tiếp nhận đơn:</span>
                <span className="font-semibold text-slate-800">{record.ngayNhan}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Số văn bản đến:</span>
                <span className="font-mono font-bold text-indigo-600">{record.soDen}</span>
              </div>
            </div>
          </div>

          {/* Content summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2 text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-amber-600" />
              2. Tóm tắt nội dung vụ việc & Điều kiện xử lý
            </h4>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-medium">
              {record.tomTatNoiDung}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Đủ điều kiện xử lý:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                  record.duDieuKien === 'Có' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {record.duDieuKien}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Thuộc thẩm quyền:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                  record.thuocThamQuyen === 'Có' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {record.thuocThamQuyen}
                </span>
              </div>
            </div>
          </div>

          {/* Resolutions & Agency */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2 text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-emerald-600" />
              3. Hướng xử lý & Cơ quan chủ trì giải quyết
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-xs">Hướng xử lý:</span>
                <span className="font-bold text-indigo-700">{record.huongXuLy}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Số, ngày văn bản xử lý:</span>
                <span className="font-medium text-slate-800">{record.soNgayVB || 'Chưa ban hành văn bản'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-xs">Cơ quan nhận / chủ trì:</span>
                <span className="font-semibold text-slate-900">{record.coQuanNhanChuTri}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Ngày chuyển / hướng dẫn:</span>
                <span className="font-medium text-slate-800">{record.ngayChuyenHuongDan || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Hạn theo dõi giải quyết:</span>
                <span className="font-bold text-rose-600">{record.hanTheoDoi || '-'}</span>
              </div>
            </div>
          </div>

          {/* Resolution result */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 border-b pb-2 text-xs uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              4. Kết quả giải quyết & Cán bộ theo dõi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-xs">Kết quả giải quyết:</span>
                <span className="font-semibold text-slate-800">{record.ketQuaGiaiQuyet}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Ngày có kết quả:</span>
                <span className="font-medium text-slate-800">{record.ngayCoKetQua || 'Đang chờ kết quả'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Cán bộ theo dõi:</span>
                <span className="font-bold text-slate-900">{record.canBoTheoDoi}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Ghi chú:</span>
                <span className="text-slate-600 italic">{record.ghiChu || 'Không có'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-lg transition shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa đơn thư</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa đơn thư</span>
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
