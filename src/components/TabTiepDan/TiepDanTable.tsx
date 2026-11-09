import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ArrowUpDown, 
  Eye, 
  Check, 
  HelpCircle,
  Share2,
  Clock,
  CheckCircle2,
  PlusCircle,
  Edit3,
  Trash2,
  Paperclip
} from 'lucide-react';
import { TiepDanRecord } from '../../types';
import { exportToCSV } from '../../utils/exportHelpers';
import { TiepDanDetailModal } from './TiepDanDetailModal';
import { EditTiepDanModal } from './EditTiepDanModal';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface TiepDanTableProps {
  records: TiepDanRecord[];
  onOpenAddModal?: () => void;
  onUpdateRecord?: (updatedRecord: TiepDanRecord) => void;
  onDeleteRecord?: (id: string) => void;
}

export const TiepDanTable: React.FC<TiepDanTableProps> = ({ 
  records, 
  onOpenAddModal,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<TiepDanRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<TiepDanRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<TiepDanRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<'stt' | 'ngayTiep' | 'hoTen'>('stt');
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

  const handleSort = (field: 'stt' | 'ngayTiep' | 'hoTen') => {
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
      'Ngày tiếp',
      'Họ tên',
      'Địa chỉ',
      'Tổ dân phố',
      'CCCD/Hộ chiếu',
      'Nội dung vụ việc',
      'Phân loại đơn',
      'Số người',
      'Cơ quan đã giải quyết',
      'Thụ lý để giải quyết (x)',
      'Trả lại đơn và hướng dẫn',
      'Chuyển đơn',
      'Theo dõi kết quả giải quyết',
      'Ghi chú',
    ];

    const rows = sortedRecords.map(r => [
      r.stt,
      r.ngayTiep,
      r.hoTen,
      r.diaChi,
      r.toDanPho || '',
      r.cccd,
      r.noiDung,
      r.loaiDon,
      r.soNguoi,
      r.coQuanGiaiQuyet,
      r.thuLy ? 'x' : '',
      r.traLaiHuongDan,
      r.chuyenDon,
      r.theoDoiKetQua,
      r.ghiChu,
    ]);

    exportToCSV(`So_Tiep_Cong_Dan_UBND_Tra_Cau_${new Date().toISOString().slice(0, 10)}`, rows, headers);
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

  const getTrangThaiBadge = (st: string) => {
    if (st.includes('giải quyết') || st.includes('xong')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {st}
        </span>
      );
    }
    if (st.includes('hướng dẫn')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <HelpCircle className="w-3 h-3 text-amber-600" /> {st}
        </span>
      );
    }
    if (st.includes('chuyển')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
          <Share2 className="w-3 h-3 text-indigo-600" /> {st}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
        <Clock className="w-3 h-3 text-slate-500" /> {st}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Table Title Bar - Background #A20409 */}
      <div 
        style={{ backgroundColor: '#A20409' }}
        className="p-4 sm:p-5 border-b border-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white shadow-sm"
      >
        <div>
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            MẪU SỐ 03/TCD – SỔ TIẾP CÔNG DÂN
          </div>
          <h3 className="text-base font-bold text-white mt-0.5 tracking-tight">
            Danh Sách Hồ Sơ Tiếp Công Dân UBND Phường Trà Câu
          </h3>
          <p className="text-xs text-red-100">
            Theo Nghị định số 154/2026/NĐ-CP • Tổng số: <strong className="text-white font-bold">{records.length}</strong> hồ sơ lọc được
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-red-950 text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs"
              title="Thêm mới dữ liệu và lưu vào Google Sheets"
            >
              <PlusCircle className="w-3.5 h-3.5 text-red-950" />
              <span>+ Thêm mới dữ liệu</span>
            </button>
          )}

          {/* File đính kèm button with Background #A20409 */}
          <button
            onClick={() => {
              if (paginatedRecords.length > 0) {
                setSelectedRecord(paginatedRecords[0]);
              }
            }}
            style={{ backgroundColor: '#A20409' }}
            className="flex items-center gap-1.5 text-white hover:brightness-110 active:brightness-95 text-xs font-bold px-3 py-2 rounded-lg transition shadow-xs border border-white/30"
            title="Xem và quản lý tệp tin, tài liệu, file đính kèm"
          >
            <Paperclip className="w-3.5 h-3.5 text-amber-300" />
            <span>File đính kèm</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-xs border border-emerald-400/30"
            title="Tải bảng dữ liệu về máy định dạng CSV/Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel/CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-xs no-print border border-slate-700"
            title="In sổ tiếp công dân"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In sổ</span>
          </button>
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
                  <ArrowUpDown className="w-3 h-3 text-black" />
                </div>
              </th>
              <th 
                className="py-3 px-2.5 w-24 cursor-pointer hover:bg-slate-300 transition border border-black text-black font-extrabold"
                onClick={() => handleSort('ngayTiep')}
              >
                <div className="flex items-center gap-1">
                  <span>Ngày tiếp</span>
                  <ArrowUpDown className="w-3 h-3 text-black" />
                </div>
              </th>
              <th 
                className="py-3 px-2.5 min-w-[180px] cursor-pointer hover:bg-slate-300 transition border border-black text-black font-extrabold"
                onClick={() => handleSort('hoTen')}
              >
                <div className="flex items-center gap-1">
                  <span>Họ tên & Địa chỉ</span>
                  <ArrowUpDown className="w-3 h-3 text-black" />
                </div>
              </th>
              <th className="py-3 px-2.5 w-28 border border-black text-black font-extrabold">CCCD / HC</th>
              <th className="py-3 px-2.5 min-w-[220px] border border-black text-black font-extrabold">Nội dung vụ việc</th>
              <th className="py-3 px-2.5 w-24 text-center border border-black text-black font-extrabold">Phân loại</th>
              <th className="py-3 px-2.5 w-14 text-center border border-black text-black font-extrabold">Số ng</th>
              <th className="py-3 px-2.5 min-w-[140px] border border-black text-black font-extrabold">Cơ quan GQ</th>
              <th className="py-3 px-2.5 w-16 text-center border border-black text-black font-extrabold">Thụ lý (x)</th>
              <th className="py-3 px-2.5 min-w-[150px] border border-black text-black font-extrabold">Hướng dẫn</th>
              <th className="py-3 px-2.5 min-w-[150px] border border-black text-black font-extrabold">Chuyển đơn</th>
              <th className="py-3 px-2.5 min-w-[130px] border border-black text-black font-extrabold">Theo dõi KQ</th>
              <th className="py-3 px-2.5 w-20 text-center border border-black text-black font-extrabold no-print">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-700 border border-black">
                  <div className="max-w-sm mx-auto">
                    <p className="text-sm font-bold text-slate-900">Không tìm thấy hồ sơ tiếp dân nào</p>
                    <p className="text-xs text-slate-500 mt-1">Vui lòng thử thay đổi các tùy chọn lọc hoặc tìm kiếm</p>
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
                    {r.ngayTiep}
                  </td>
                  <td className="py-2.5 px-2.5 border border-black">
                    <div className="font-bold text-black group-hover:text-blue-900">
                      {r.hoTen}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate max-w-[200px]" title={r.diaChi}>
                      {r.diaChi}
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-[11px] text-black whitespace-nowrap border border-black">
                    {r.cccd || '-'}
                  </td>
                  <td className="py-2.5 px-2.5 border border-black">
                    <p className="text-slate-900 line-clamp-2 text-xs leading-relaxed" title={r.noiDung}>
                      {r.noiDung}
                    </p>
                  </td>
                  <td className="py-2.5 px-2.5 text-center whitespace-nowrap border border-black">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getLoaiDonBadge(r.loaiDon)}`}>
                      {r.loaiDon}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-bold text-black border border-black">
                    {r.soNguoi}
                  </td>
                  <td className="py-2.5 px-2.5 text-[11px] text-slate-900 border border-black">
                    {r.coQuanGiaiQuyet}
                  </td>
                  <td className="py-2.5 px-2.5 text-center border border-black">
                    {r.thuLy ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300" title="Đã thụ lý giải quyết">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 text-[11px] text-slate-900 border border-black">
                    {r.traLaiHuongDan || <span className="text-slate-400 font-bold">-</span>}
                  </td>
                  <td className="py-2.5 px-2.5 text-[11px] text-slate-900 border border-black">
                    {r.chuyenDon || <span className="text-slate-400 font-bold">-</span>}
                  </td>
                  <td className="py-2.5 px-2.5 whitespace-nowrap border border-black">
                    {getTrangThaiBadge(r.theoDoiKetQua)}
                  </td>
                  <td className="py-2.5 px-2.5 text-center whitespace-nowrap border border-black no-print">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        style={{ backgroundColor: '#A20409' }}
                        className="p-1.5 text-white hover:brightness-110 rounded-lg transition shadow-2xs"
                        title="File đính kèm & Tài liệu hồ sơ"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-amber-200" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition"
                        title="Xem chi tiết & In phiếu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRecord(r);
                        }}
                        className="p-1.5 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition"
                        title="Sửa dữ liệu hồ sơ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingRecord(r);
                        }}
                        className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-100 rounded-lg transition"
                        title="Xóa dữ liệu hồ sơ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & row count bar */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
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
            Trang <strong>{currentPage}</strong> / {totalPages} (Tổng số {sortedRecords.length} hồ sơ)
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
                  ? 'bg-blue-600 text-white'
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

      {/* 1. Detail Modal */}
      {selectedRecord && (
        <TiepDanDetailModal
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
        <EditTiepDanModal
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
          title="Xác nhận xóa hồ sơ tiếp công dân"
          itemTitle={`Hồ sơ #${deletingRecord.stt} - ${deletingRecord.hoTen}`}
          itemSubtitle={`${deletingRecord.loaiDon} • ${deletingRecord.noiDung}`}
          itemType="hồ sơ tiếp dân"
        />
      )}
    </div>
  );
};
