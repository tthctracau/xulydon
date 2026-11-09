import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Search, 
  FileCheck2, 
  Printer, 
  Building2, 
  Layers, 
  Activity,
  PlusCircle
} from 'lucide-react';
import { XuLyDonFilterState, XuLyDonRecord } from '../../types';

interface XuLyDonFilterBarProps {
  filter: XuLyDonFilterState;
  setFilter: React.Dispatch<React.SetStateAction<XuLyDonFilterState>>;
  availableCoQuan: string[];
  records: XuLyDonRecord[];
  totalFilteredCount: number;
  totalAllCount: number;
  onOpenReportModal: () => void;
  onOpenAddModal?: () => void;
}

export const XuLyDonFilterBar: React.FC<XuLyDonFilterBarProps> = ({
  filter,
  setFilter,
  availableCoQuan,
  records,
  totalFilteredCount,
  totalAllCount,
  onOpenReportModal,
  onOpenAddModal,
}) => {
  const loaiDonCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Tất cả': records.length,
      'Phản ánh': 0,
      'Khiếu nại': 0,
      'Kiến nghị': 0,
      'Tố cáo': 0,
    };
    records.forEach(r => {
      if (counts[r.loaiDon] !== undefined) {
        counts[r.loaiDon]++;
      } else {
        counts[r.loaiDon] = 1;
      }
    });
    return counts;
  }, [records]);

  const handleReset = () => {
    setFilter({
      loaiDon: 'all',
      coQuan: 'all',
      tinhTrang: 'all',
      nguonNhan: 'all',
      thuocThamQuyen: 'all',
      duDieuKien: 'all',
      searchKeyword: '',
      year: 'all',
      month: 'all',
      kpiFilter: 'all',
    });
  };

  const isFiltered =
    filter.loaiDon !== 'all' ||
    filter.coQuan !== 'all' ||
    filter.tinhTrang !== 'all' ||
    filter.nguonNhan !== 'all' ||
    filter.thuocThamQuyen !== 'all' ||
    filter.duDieuKien !== 'all' ||
    (filter.kpiFilter && filter.kpiFilter !== 'all') ||
    filter.searchKeyword.trim() !== '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-6 transition-all no-print">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              BỘ LỌC THÔNG MINH VÀ BÁO CÁO ĐƠN
            </h3>
            <p className="text-xs text-slate-500">
              Lọc theo Loại đơn, Cơ quan tiếp nhận/chủ trì & Trạng thái xử lý để tự động lập báo cáo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-slate-500">
            Hiển thị: <strong className="text-indigo-600 font-bold">{totalFilteredCount}</strong> / {totalAllCount} đơn thư
          </span>

          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition font-medium text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}

          {/* Prominent Add Record Button */}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shadow-emerald-900/20"
              title="Nhập thêm mới đơn thư vào hệ thống và Google Sheets"
            >
              <PlusCircle className="w-4 h-4 text-emerald-100" />
              <span>+ Thêm mới dữ liệu</span>
            </button>
          )}

          {/* Prominent Auto-Report Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:from-indigo-700 active:to-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-900/20"
          >
            <FileCheck2 className="w-4 h-4 text-indigo-200 animate-pulse" />
            <span>TẠO BÁO CÁO TỰ ĐỘNG</span>
          </button>

          {/* Prominent Print Report Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md shadow-slate-900/20 border border-slate-700"
            title="In báo cáo danh sách đơn thư và các thống kê đã xử lý ra định dạng PDF hoặc giấy"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>IN BÁO CÁO</span>
          </button>
        </div>
      </div>

      {/* Primary Smart Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
        {/* 1. Loại đơn (User requirement explicit) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-500" /> Loại đơn thư
          </label>
          <select
            value={filter.loaiDon}
            onChange={(e) => setFilter(prev => ({ ...prev, loaiDon: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả loại đơn ({records.length})</option>
            <option value="Phản ánh">Phản ánh ({loaiDonCounts['Phản ánh'] || 0})</option>
            <option value="Khiếu nại">Khiếu nại ({loaiDonCounts['Khiếu nại'] || 0})</option>
            <option value="Kiến nghị">Kiến nghị ({loaiDonCounts['Kiến nghị'] || 0})</option>
            <option value="Tố cáo">Tố cáo ({loaiDonCounts['Tố cáo'] || 0})</option>
          </select>
        </div>

        {/* 2. Cơ quan tiếp nhận / chủ trì (User requirement explicit) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-indigo-500" /> Cơ quan tiếp nhận / chủ trì
          </label>
          <select
            value={filter.coQuan}
            onChange={(e) => setFilter(prev => ({ ...prev, coQuan: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả cơ quan ({availableCoQuan.length})</option>
            {availableCoQuan.map(cq => (
              <option key={cq} value={cq}>{cq}</option>
            ))}
          </select>
        </div>

        {/* 3. Trạng thái xử lý (User requirement explicit) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-indigo-500" /> Trạng thái xử lý (Tình trạng)
          </label>
          <select
            value={filter.tinhTrang}
            onChange={(e) => setFilter(prev => ({ ...prev, tinhTrang: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang giải quyết">Đang giải quyết</option>
            <option value="Đã hướng dẫn">Đã hướng dẫn</option>
            <option value="Đã chuyển">Đã chuyển cơ quan khác</option>
            <option value="Hoàn thành">Hoàn thành / Đã xong</option>
          </select>
        </div>

        {/* 4. Nguồn nhận */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Nguồn tiếp nhận
          </label>
          <select
            value={filter.nguonNhan}
            onChange={(e) => setFilter(prev => ({ ...prev, nguonNhan: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả nguồn nhận</option>
            <option value="Trực tiếp">Trực tiếp tại trụ sở</option>
            <option value="Bưu chính">Qua bưu chính / thư</option>
            <option value="Trực tuyến">Cổng Dịch vụ công / Trực tuyến</option>
          </select>
        </div>
      </div>

      {/* Auxiliary Filters & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Thuộc thẩm quyền UBND
          </label>
          <select
            value={filter.thuocThamQuyen}
            onChange={(e) => setFilter(prev => ({ ...prev, thuocThamQuyen: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả thẩm quyền</option>
            <option value="Có">Có (Thuộc thẩm quyền)</option>
            <option value="Không">Không (Ngoài thẩm quyền)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Đủ điều kiện xử lý
          </label>
          <select
            value={filter.duDieuKien}
            onChange={(e) => setFilter(prev => ({ ...prev, duDieuKien: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả</option>
            <option value="Có">Có (Đủ điều kiện)</option>
            <option value="Không">Không (Chưa đủ điều kiện)</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Tìm kiếm từ khóa
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Số đến, Họ tên người gửi, tóm tắt..."
              value={filter.searchKeyword}
              onChange={(e) => setFilter(prev => ({ ...prev, searchKeyword: e.target.value }))}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
