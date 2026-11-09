import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ArrowUpDown, 
  Eye, 
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle,
  HelpCircle,
  Share2,
  PlusCircle,
  Edit3,
  Trash2
} from 'lucide-react';
import { XuLyDonRecord } from '../../types';
import { exportToCSV } from '../../utils/exportHelpers';
import { XuLyDonDetailModal } from './XuLyDonDetailModal';
import { EditXuLyDonModal } from './EditXuLyDonModal';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface XuLyDonTableProps {
  records: XuLyDonRecord[];
  onOpenReportModal: () => void;
  onOpenAddModal?: () => void;
  onUpdateRecord?: (updatedRecord: XuLyDonRecord) => void;
  onDeleteRecord?: (id: string) => void;
}

export const XuLyDonTable: React.FC<XuLyDonTableProps> = ({ 
  records, 
  onOpenReportModal, 
  onOpenAddModal,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<XuLyDonRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<XuLyDonRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<XuLyDonRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<'stt' | 'ngayNhan' | 'soDen'>('stt');
  const [sortAsc, setSortAsc] = useState(true);

  // Sorting
  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'stt') {
        return sortAsc ? (a.stt - b.stt) : (b.stt - a.stt);
      }
      
      const comp = String(valA).localeCompare(String(valB), 'vi');
      return sortAsc ? comp : -comp;
    });
  }, [records, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: 'stt' | 'ngayNhan' | 'soDen') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Ngày nhận',
      'Số đến',
      'Nguồn nhận',
      'Họ tên người gửi',
      'Địa chỉ/liên hệ',
      'Loại đơn',
      'Tóm tắt nội dung',
      'Đủ điều kiện xử lý?',
      'Thuộc thẩm quyền?',
      'Hướng xử lý',
      'Số, ngày văn bản xử lý',
      'Cơ quan nhận/chủ trì',
      'Ngày chuyển/hướng dẫn',
      'Hạn theo dõi',
      'Tình trạng',
      'Kết quả giải quyết',
      'Ngày có kết quả',
      'Cán bộ theo dõi',
      'Ghi chú',
    ];

    const rows = sortedRecords.map(r => [
      r.stt,
      r.ngayNhan,
      r.soDen,
      r.nguonNhan,
      r.hoTenNguoiGui,
      r.diaChiLienHe,
      r.loaiDon,
      r.tomTatNoiDung,
      r.duDieuKien,
      r.thuocThamQuyen,
      r.huongXuLy,
      r.soNgayVB,
      r.coQuanNhanChuTri,
      r.ngayChuyenHuongDan,
      r.hanTheoDoi,
      r.tinhTrang,
      r.ketQuaGiaiQuyet,
      r.ngayCoKetQua,
      r.canBoTheoDoi,
      r.ghiChu,
    ]);

    exportToCSV(`So_Theo_Doi_Xu_Ly_Don_UBND_Tra_Cau_${new Date().toISOString().slice(0, 10)}`, rows, headers);
  };

  const getLoaiDonBadge = (type: string) => {
    switch (type) {
      case 'Phản ánh':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Khiếu nại':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Kiến nghị':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Tố cáo':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getTinhTrangBadge = (st: string) => {
    if (st.includes('giải quyết') || st.includes('Đang')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> {st}
        </span>
      );
    }
    if (st.includes('hướng dẫn')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          <HelpCircle className="w-3 h-3 text-blue-600" /> {st}
        </span>
      );
    }
    if (st.includes('chuyển')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
          <Share2 className="w-3 h-3 text-indigo-600" /> {st}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
        <CheckCircle className="w-3 h-3 text-emerald-600" /> {st}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Table Title Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
        <div>
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
            SỔ THEO DÕI TIẾP NHẬN, PHÂN LOẠI VÀ XỬ LÝ ĐƠN
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            DANH SÁCH ĐƠN THƯ TIẾP NHẬN VÀ KẾT QUẢ XỬ LÝ
          </h3>
          <p className="text-xs text-slate-500">
            UBND Phường Trà Câu • Đang hiển thị <strong className="text-slate-800">{records.length}</strong> đơn thỏa bộ lọc
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs"
              title="Thêm mới đơn thư vào hệ thống và Google Sheets"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span>+ Thêm mới dữ liệu</span>
            </button>
          )}

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs"
            title="Tạo báo cáo hành chính tự động từ bảng dữ liệu đang lọc"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-200" />
            <span>Tạo Báo Cáo Tự Động</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-xs"
            title="Tải bảng dữ liệu về máy định dạng CSV/Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel/CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs no-print border border-slate-700"
            title="In báo cáo danh sách đơn thư và các thống kê đã xử lý ra định dạng PDF hoặc giấy"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Print only section title */}
      <div className="hidden print:block mb-3 pt-1">
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-1 mb-2">
          <h4 className="font-bold text-xs uppercase text-slate-900 tracking-wide">
            PHẦN II. DANH SÁCH CHI TIẾT ĐƠN THƯ TIẾP NHẬN VÀ KẾT QUẢ XỬ LÝ
          </h4>
          <span className="text-[11px] text-slate-600 italic">
            Tổng số: <strong>{sortedRecords.length}</strong> đơn thư
          </span>
        </div>
      </div>

      {/* Table container with bold black grid */}
      <div className="overflow-x-auto p-2 sm:p-3 bg-white">
        <table className="w-full text-left text-xs border-collapse border-2 border-black">
          <thead>
            <tr className="bg-slate-200 text-black font-extrabold uppercase tracking-tight text-[11px] border-b-2 border-black">
              <th 
                className="py-3 px-2.5 w-12 text-center cursor-pointer hover:bg-slate-300 transition border border-black text-black font-extrabold"
                onClick={() => handleSort('stt')}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>STT</span>
                  <ArrowUpDown className="w-3 h-3 text-black no-print" />
                </div>
              </th>
              <th 
                className="py-3 px-2.5 w-24 cursor-pointer hover:bg-slate-300 transition border border-black text-black font-extrabold"
                onClick={() => handleSort('ngayNhan')}
              >
                <div className="flex items-center gap-1">
                  <span>Ngày nhận</span>
                  <ArrowUpDown className="w-3 h-3 text-black no-print" />
                </div>
              </th>
              <th 
                className="py-3 px-2.5 w-28 cursor-pointer hover:bg-slate-300 transition border border-black text-black font-extrabold"
                onClick={() => handleSort('soDen')}
              >
                <div className="flex items-center gap-1">
                  <span>Số đến</span>
                  <ArrowUpDown className="w-3 h-3 text-black no-print" />
                </div>
              </th>
              <th className="py-3 px-2.5 w-20 text-center border border-black text-black font-extrabold">Nguồn</th>
              <th className="py-3 px-2.5 min-w-[170px] border border-black text-black font-extrabold">Người gửi & Địa chỉ</th>
              <th className="py-3 px-2.5 w-24 text-center border border-black text-black font-extrabold">Loại đơn</th>
              <th className="py-3 px-2.5 min-w-[240px] border border-black text-black font-extrabold">Tóm tắt nội dung</th>
              <th className="py-3 px-2.5 w-24 text-center border border-black text-black font-extrabold">Đủ ĐK / TQ</th>
              <th className="py-3 px-2.5 min-w-[140px] border border-black text-black font-extrabold">Hướng xử lý</th>
              <th className="py-3 px-2.5 min-w-[160px] border border-black text-black font-extrabold">Cơ quan chủ trì</th>
              <th className="py-3 px-2.5 w-24 text-center border border-black text-black font-extrabold">Hạn theo dõi</th>
              <th className="py-3 px-2.5 min-w-[130px] border border-black text-black font-extrabold">Tình trạng</th>
              <th className="py-3 px-2.5 w-20 text-center border border-black text-black font-extrabold no-print">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black print:hidden">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-700 border border-black">
                  <div className="max-w-sm mx-auto">
                    <p className="text-sm font-bold text-slate-900">Không tìm thấy đơn thư nào</p>
                    <p className="text-xs text-slate-500 mt-1">Vui lòng điều chỉnh lại bộ lọc Loại đơn, Cơ quan hoặc Trạng thái xử lý</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => (
                <tr 
                  key={r.id} 
                  className="hover:bg-amber-50/60 transition group cursor-pointer border-b border-black"
                  onClick={() => setSelectedRecord(r)}
                >
                  <td className="py-2.5 px-2.5 text-center font-bold text-black border border-black">
                    {r.stt}
                  </td>
                  <td className="py-2.5 px-2.5 font-semibold text-black whitespace-nowrap border border-black">
                    {r.ngayNhan}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono font-bold text-black whitespace-nowrap border border-black">
                    {r.soDen}
                  </td>
                  <td className="py-2.5 px-2.5 text-center text-[11px] text-black border border-black">
                    <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-800 border border-slate-300">
                      {r.nguonNhan}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 border border-black">
                    <div className="font-bold text-black group-hover:text-blue-900">
                      {r.hoTenNguoiGui}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate max-w-[180px]" title={r.diaChiLienHe}>
                      {r.diaChiLienHe}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-center whitespace-nowrap border border-black">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getLoaiDonBadge(r.loaiDon)}`}>
                      {r.loaiDon}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 border border-black">
                    <p className="text-slate-900 line-clamp-2 text-xs leading-relaxed" title={r.tomTatNoiDung}>
                      {r.tomTatNoiDung}
                    </p>
                  </td>
                  <td className="py-2.5 px-2.5 text-center whitespace-nowrap border border-black">
                    <div className="text-[10px] space-y-0.5">
                      <div>ĐK: <strong className={r.duDieuKien === 'Có' ? 'text-emerald-700' : 'text-red-600'}>{r.duDieuKien}</strong></div>
                      <div>TQ: <strong className={r.thuocThamQuyen === 'Có' ? 'text-emerald-700' : 'text-amber-600'}>{r.thuocThamQuyen}</strong></div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-[11px] text-slate-900 font-medium border border-black">
                    {r.huongXuLy}
                  </td>
                  <td className="py-2.5 px-2.5 text-[11px] text-slate-900 border border-black">
                    <div className="line-clamp-2" title={r.coQuanNhanChuTri}>
                      {r.coQuanNhanChuTri}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-center whitespace-nowrap border border-black">
                    <span className="font-semibold text-rose-800 text-[11px]">
                      {r.hanTheoDoi || '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 whitespace-nowrap border border-black">
                    {getTinhTrangBadge(r.tinhTrang)}
                  </td>
                  <td className="py-2.5 px-2.5 text-center whitespace-nowrap border border-black no-print">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="p-1.5 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition"
                        title="Xem chi tiết đơn thư"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRecord(r);
                        }}
                        className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition"
                        title="Sửa dữ liệu đơn thư"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingRecord(r);
                        }}
                        className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition"
                        title="Xóa dữ liệu đơn thư"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Print only: Full list of all filtered records without pagination truncation */}
          <tbody className="hidden print:table-row-group divide-y divide-black">
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-6 text-center text-slate-700 italic border border-black">
                  Không có dữ liệu đơn thư phù hợp với tiêu chí lọc.
                </td>
              </tr>
            ) : (
              sortedRecords.map((r) => (
                <tr key={`print-${r.id}`} className="text-[10px] leading-tight page-break-inside-avoid border-b border-black">
                  <td className="py-2 px-2 text-center font-bold text-black border border-black">
                    {r.stt}
                  </td>
                  <td className="py-2 px-2 font-medium text-black whitespace-nowrap border border-black">
                    {r.ngayNhan}
                  </td>
                  <td className="py-2 px-2 font-mono font-bold text-black whitespace-nowrap border border-black">
                    {r.soDen}
                  </td>
                  <td className="py-2 px-2 text-center text-black border border-black">
                    {r.nguonNhan}
                  </td>
                  <td className="py-2 px-2 border border-black">
                    <div className="font-bold text-black">{r.hoTenNguoiGui}</div>
                    <div className="text-[9px] text-slate-700">{r.diaChiLienHe}</div>
                  </td>
                  <td className="py-2 px-2 text-center font-bold border border-black whitespace-nowrap">
                    {r.loaiDon}
                  </td>
                  <td className="py-2 px-2 border border-black">
                    <p className="text-black text-[10px] line-clamp-3 leading-snug">{r.tomTatNoiDung}</p>
                  </td>
                  <td className="py-2 px-2 text-center text-[9px] border border-black whitespace-nowrap">
                    <div>ĐK: <strong>{r.duDieuKien}</strong></div>
                    <div>TQ: <strong>{r.thuocThamQuyen}</strong></div>
                  </td>
                  <td className="py-2 px-2 text-[10px] text-black border border-black">
                    {r.huongXuLy}
                  </td>
                  <td className="py-2 px-2 text-[10px] text-black border border-black">
                    {r.coQuanNhanChuTri}
                  </td>
                  <td className="py-2 px-2 text-center text-[10px] font-semibold text-rose-900 whitespace-nowrap border border-black">
                    {r.hanTheoDoi || '-'}
                  </td>
                  <td className="py-2 px-2 text-[10px] font-semibold text-black border border-black">
                    {r.tinhTrang}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & row count bar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 no-print">
        <div className="flex items-center gap-2">
          <span>Hiển thị mỗi trang:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-slate-300 rounded px-2 py-1 bg-white text-slate-700"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-400">|</span>
          <span>
            Trang <strong>{currentPage}</strong> / {totalPages} (Tổng số {sortedRecords.length} đơn thư)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
          >
            Trang trước
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`w-7 h-7 rounded text-xs font-semibold transition ${
                currentPage === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* Print only administrative signatures */}
      <div className="hidden print:block mt-8 pt-4 border-t border-slate-400 page-break-inside-avoid">
        <div className="flex justify-between items-start text-xs text-slate-900 px-6">
          <div className="text-center w-64 space-y-1">
            <p className="font-bold uppercase tracking-wider">NGƯỜI LẬP BIỂU</p>
            <p className="italic text-[11px] text-slate-600">(Ký và ghi rõ họ tên)</p>
            <div className="h-20"></div>
            <p className="font-semibold text-slate-800">Cán bộ phụ trách Tiếp công dân & Xử lý đơn</p>
          </div>
          
          <div className="text-center w-72 space-y-1">
            <p className="italic text-[11px] text-slate-700">
              Trà Câu, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
            </p>
            <p className="font-bold uppercase tracking-wider">TM. ỦY BAN NHÂN DÂN PHƯỜNG</p>
            <p className="font-bold uppercase tracking-wide">CHỦ TỊCH / PHÓ CHỦ TỊCH</p>
            <p className="italic text-[11px] text-slate-600">(Ký, đóng dấu và ghi rõ họ tên)</p>
            <div className="h-20"></div>
          </div>
        </div>
      </div>

      {/* 1. Detail Modal */}
      {selectedRecord && (
        <XuLyDonDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onEdit={() => {
            const rec = selectedRecord;
            setSelectedRecord(null);
            setEditingRecord(rec);
          }}
          onDelete={() => {
            const rec = selectedRecord;
            setSelectedRecord(null);
            setDeletingRecord(rec);
          }}
        />
      )}

      {/* 2. Edit Modal */}
      {editingRecord && (
        <EditXuLyDonModal
          isOpen={Boolean(editingRecord)}
          onClose={() => setEditingRecord(null)}
          record={editingRecord}
          onUpdateRecord={(updated) => {
            if (onUpdateRecord) onUpdateRecord(updated);
            setEditingRecord(null);
          }}
        />
      )}

      {/* 3. Confirm Delete Modal */}
      {deletingRecord && (
        <ConfirmDeleteModal
          isOpen={Boolean(deletingRecord)}
          onClose={() => setDeletingRecord(null)}
          onConfirm={() => {
            if (onDeleteRecord && deletingRecord) {
              onDeleteRecord(deletingRecord.id);
            }
          }}
          title="Xác nhận xóa dữ liệu đơn thư"
          itemTitle={`${deletingRecord.soDen} - ${deletingRecord.hoTenNguoiGui}`}
          itemSubtitle={`${deletingRecord.loaiDon} • ${deletingRecord.tomTatNoiDung}`}
          itemType="đơn thư"
        />
      )}
    </div>
  );
};
