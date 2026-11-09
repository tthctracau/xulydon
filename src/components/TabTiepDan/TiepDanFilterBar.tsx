import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  Filter, 
  Calendar, 
  PlusCircle, 
  Layers, 
  Building2, 
  CheckCircle2, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Tag,
  X,
  Clock,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { TiepDanFilterState, TiepDanRecord } from '../../types';

interface TiepDanFilterBarProps {
  filter: TiepDanFilterState;
  setFilter: React.Dispatch<React.SetStateAction<TiepDanFilterState>>;
  availableYears: number[];
  availableCoQuan: string[];
  records: TiepDanRecord[];
  totalFilteredCount: number;
  totalAllCount: number;
  onOpenAddModal?: () => void;
  showCharts?: boolean;
  onToggleCharts?: () => void;
}

export const TiepDanFilterBar: React.FC<TiepDanFilterBarProps> = ({
  filter,
  setFilter,
  availableYears,
  availableCoQuan,
  records,
  totalFilteredCount,
  totalAllCount,
  onOpenAddModal,
  showCharts = true,
  onToggleCharts,
}) => {
  const [showAdvancedDate, setShowAdvancedDate] = useState(Boolean(filter.fromDate || filter.toDate));

  // Compute counts for the 4 petition categories
  const loaiDonCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      'all': records.length,
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

  // Compute available TDPs in records
  const availableTDPs = React.useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.toDanPho && r.toDanPho.trim()) {
        set.add(r.toDanPho.trim());
      } else if (r.diaChi) {
        const match = r.diaChi.match(/TDP\s*\d+/i);
        if (match) set.add(match[0].toUpperCase());
      }
    });
    // Add default TDP 1 -> 10 if not present
    for (let i = 1; i <= 10; i++) {
      set.add(`TDP ${i}`);
    }
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [records]);

  const handleReset = () => {
    setFilter({
      year: 'all',
      quarter: 'all',
      month: 'all',
      fromDate: '',
      toDate: '',
      loaiDon: 'all',
      coQuan: 'all',
      trangThai: 'all',
      hinhThuc: 'all',
      toDanPho: 'all',
      searchKeyword: '',
    });
  };

  const isFiltered =
    filter.year !== 'all' ||
    filter.quarter !== 'all' ||
    filter.month !== 'all' ||
    Boolean(filter.fromDate) ||
    Boolean(filter.toDate) ||
    filter.loaiDon !== 'all' ||
    filter.coQuan !== 'all' ||
    filter.trangThai !== 'all' ||
    filter.hinhThuc !== 'all' ||
    (filter.toDanPho && filter.toDanPho !== 'all') ||
    filter.searchKeyword.trim() !== '';

  // Quick period preset helpers
  const handleSelectQuickPeriod = (preset: 'all' | 'thisMonth' | 'q4' | 'year2026') => {
    if (preset === 'all') {
      setFilter(prev => ({ ...prev, year: 'all', quarter: 'all', month: 'all', fromDate: '', toDate: '' }));
    } else if (preset === 'thisMonth') {
      setFilter(prev => ({ ...prev, year: '2026', month: '10', quarter: '4', fromDate: '', toDate: '' }));
    } else if (preset === 'q4') {
      setFilter(prev => ({ ...prev, year: '2026', quarter: '4', month: 'all', fromDate: '', toDate: '' }));
    } else if (preset === 'year2026') {
      setFilter(prev => ({ ...prev, year: '2026', quarter: 'all', month: 'all', fromDate: '', toDate: '' }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden mb-6 transition-all">
      {/* 1. Filter Header with Background #A20409 */}
      <div 
        style={{ backgroundColor: '#A20409' }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 sm:p-5 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center shadow-xs flex-shrink-0 border border-white/20">
            <Filter className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                BỘ LỌC SỔ TIẾP CÔNG DÂN
              </h3>
              <span className="bg-amber-400 text-red-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                Mẫu 03/TCD
              </span>
            </div>
            <p className="text-xs text-red-100/90 mt-0.5">
              Phân tích đa tiêu chí: Thời gian (Năm/Quý/Tháng), 4 Loại đơn, Cơ quan giải quyết & Trạng thái kết quả
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="bg-black/25 px-3 py-1.5 rounded-lg border border-white/20 text-white font-medium">
            Hiển thị: <strong className="text-amber-300 font-extrabold">{totalFilteredCount}</strong> / {totalAllCount} hồ sơ
            {totalAllCount > 0 && (
              <span className="text-amber-100/80 text-[11px] ml-1">
                ({Math.round((totalFilteredCount / totalAllCount) * 100)}%)
              </span>
            )}
          </div>

          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-amber-200 hover:text-white bg-black/30 hover:bg-black/40 border border-amber-300/40 px-3 py-1.5 rounded-lg transition font-semibold"
              title="Đặt lại toàn bộ tiêu chí lọc"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span>Xóa bộ lọc</span>
            </button>
          )}

          {onToggleCharts && (
            <button
              onClick={onToggleCharts}
              className="flex items-center gap-1.5 bg-black/25 hover:bg-black/35 text-amber-200 hover:text-white border border-amber-300/30 px-3 py-1.5 rounded-lg transition font-semibold"
              title={showCharts ? 'Nhấp để ẩn 04 biểu đồ phân tích' : 'Nhấp để hiển thị lại 04 biểu đồ phân tích'}
            >
              {showCharts ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ẩn 04 biểu đồ</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span>Hiện 04 biểu đồ</span>
                </>
              )}
            </button>
          )}

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-red-950 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition"
              title="Thêm mới dữ liệu và lưu vào Google Sheets"
            >
              <PlusCircle className="w-3.5 h-3.5 text-red-950" />
              <span>+ Thêm mới dữ liệu</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">

      {/* 2. Fast Segmented Selector: Phân loại đơn */}
      <div className="mt-3.5 pt-1">
        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          Phân loại đơn thư
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Tất cả loại đơn', color: 'blue' },
            { id: 'Phản ánh', label: 'Phản ánh', color: 'blue' },
            { id: 'Khiếu nại', label: 'Khiếu nại', color: 'amber' },
            { id: 'Kiến nghị', label: 'Kiến nghị', color: 'purple' },
            { id: 'Tố cáo', label: 'Tố cáo', color: 'rose' },
          ].map(item => {
            const isSelected = filter.loaiDon === item.id;
            const count = loaiDonCounts[item.id] || 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(prev => ({ ...prev, loaiDon: item.id }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition border select-none ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Multi-Criteria Grid (Time dimensions, Agencies, Status, Handling method, TDP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {/* Năm */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Năm
          </label>
          <select
            value={filter.year}
            onChange={(e) => setFilter(prev => ({ ...prev, year: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả các năm</option>
            {availableYears.map(y => (
              <option key={y} value={String(y)}>Năm {y}</option>
            ))}
          </select>
        </div>

        {/* Quý */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Quý trong năm
          </label>
          <select
            value={filter.quarter}
            onChange={(e) => setFilter(prev => ({ ...prev, quarter: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả các quý</option>
            <option value="1">Quý I (Tháng 1 - 3)</option>
            <option value="2">Quý II (Tháng 4 - 6)</option>
            <option value="3">Quý III (Tháng 7 - 9)</option>
            <option value="4">Quý IV (Tháng 10 - 12)</option>
          </select>
        </div>

        {/* Tháng */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Tháng cụ thể
          </label>
          <select
            value={filter.month}
            onChange={(e) => setFilter(prev => ({ ...prev, month: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả các tháng</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={String(m)}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>

        {/* Cơ quan giải quyết */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" /> Cơ quan giải quyết
          </label>
          <select
            value={filter.coQuan}
            onChange={(e) => setFilter(prev => ({ ...prev, coQuan: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
          >
            <option value="all">Tất cả cơ quan ({availableCoQuan.length})</option>
            {availableCoQuan.map(cq => (
              <option key={cq} value={cq}>{cq}</option>
            ))}
          </select>
        </div>

        {/* Trạng thái kết quả giải quyết */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Trạng thái giải quyết
          </label>
          <select
            value={filter.trangThai}
            onChange={(e) => setFilter(prev => ({ ...prev, trangThai: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Đang theo dõi">Đang theo dõi</option>
            <option value="Đã hướng dẫn">Đã hướng dẫn</option>
            <option value="Đã chuyển xử lý">Đã chuyển xử lý</option>
            <option value="Đã giải quyết xong">Đã giải quyết xong</option>
          </select>
        </div>

        {/* Địa bàn / TDP */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" /> Tổ Dân Phố (TDP)
          </label>
          <select
            value={filter.toDanPho || 'all'}
            onChange={(e) => setFilter(prev => ({ ...prev, toDanPho: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả tổ dân phố</option>
            {availableTDPs.map(tdp => (
              <option key={tdp} value={tdp}>{tdp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Secondary Row: Quick Period presets, Custom Date Range, Handling method pills, Search */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Handling method pills & Custom date toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Hình thức:</span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'thuLy', label: 'Thụ lý giải quyết (x)' },
            { id: 'huongDan', label: 'Hướng dẫn / Bổ sung' },
            { id: 'chuyenDon', label: 'Chuyển cơ quan khác' },
          ].map(pill => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilter(prev => ({ ...prev, hinhThuc: pill.id }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border select-none ${
                filter.hinhThuc === pill.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {pill.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowAdvancedDate(!showAdvancedDate)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showAdvancedDate || filter.fromDate || filter.toDate
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3 h-3 text-indigo-600" />
            <span>Khoảng ngày</span>
            {showAdvancedDate ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Right: Universal Full-text Search */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Tên công dân, CCCD, TDP, địa chỉ, nội dung..."
            value={filter.searchKeyword}
            onChange={(e) => setFilter(prev => ({ ...prev, searchKeyword: e.target.value }))}
            className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          {filter.searchKeyword && (
            <button
              type="button"
              onClick={() => setFilter(prev => ({ ...prev, searchKeyword: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Collapsible Custom Date Range Picker */}
      {showAdvancedDate && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Lọc theo khoảng ngày tiếp:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-slate-500 font-medium">Từ ngày:</label>
            <input
              type="date"
              value={filter.fromDate || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, fromDate: e.target.value }))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-500 font-medium">Đến ngày:</label>
            <input
              type="date"
              value={filter.toDate || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, toDate: e.target.value }))}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(filter.fromDate || filter.toDate) && (
            <button
              type="button"
              onClick={() => setFilter(prev => ({ ...prev, fromDate: '', toDate: '' }))}
              className="text-red-600 hover:text-red-800 text-xs font-semibold underline ml-1"
            >
              Xóa ngày
            </button>
          )}
        </div>
      )}

      {/* 6. Active Filter Chips Summary */}
      {isFiltered && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3 text-blue-600" />
            Đang lọc:
          </span>

          {filter.year !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              Năm: {filter.year}
              <button onClick={() => setFilter(prev => ({ ...prev, year: 'all' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.quarter !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              Quý {filter.quarter}
              <button onClick={() => setFilter(prev => ({ ...prev, quarter: 'all' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.month !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              Tháng {filter.month}
              <button onClick={() => setFilter(prev => ({ ...prev, month: 'all' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.loaiDon !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              Loại: {filter.loaiDon}
              <button onClick={() => setFilter(prev => ({ ...prev, loaiDon: 'all' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.coQuan !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              Cơ quan: {filter.coQuan}
              <button onClick={() => setFilter(prev => ({ ...prev, coQuan: 'all' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.trangThai !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              Trạng thái: {filter.trangThai}
              <button onClick={() => setFilter(prev => ({ ...prev, trangThai: 'all' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.hinhThuc !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              Hình thức: {filter.hinhThuc === 'thuLy' ? 'Thụ lý' : filter.hinhThuc === 'huongDan' ? 'Hướng dẫn' : 'Chuyển đơn'}
              <button onClick={() => setFilter(prev => ({ ...prev, hinhThuc: 'all' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.toDanPho && filter.toDanPho !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              TDP: {filter.toDanPho}
              <button onClick={() => setFilter(prev => ({ ...prev, toDanPho: 'all' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filter.searchKeyword && (
            <span className="inline-flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              Từ khóa: "{filter.searchKeyword}"
              <button onClick={() => setFilter(prev => ({ ...prev, searchKeyword: '' }))} className="hover:text-red-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleReset}
            className="text-[11px] text-slate-500 hover:text-red-600 underline font-medium ml-1"
          >
            Đặt lại tất cả
          </button>
        </div>
      )}
      </div>
    </div>
  );
};
