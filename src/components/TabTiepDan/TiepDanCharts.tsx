import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';
import { TiepDanRecord } from '../../types';

interface TiepDanChartsProps {
  records: TiepDanRecord[];
  showCharts?: boolean;
  onToggleCharts?: () => void;
}

const COLORS = {
  blue: '#3b82f6',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  rose: '#f43f5e',
  emerald: '#10b981',
  indigo: '#6366f1',
  cyan: '#06b6d4',
  slate: '#64748b',
};

const PIE_COLORS = [COLORS.blue, COLORS.amber, COLORS.purple, COLORS.rose, COLORS.cyan];

interface TrendPoint {
  label: string;
  tiepDan: number;
  thuLy: number;
  chuyenDon: number;
  huongDan: number;
  rawTime?: number;
}

export const TiepDanCharts: React.FC<TiepDanChartsProps> = ({ 
  records,
  showCharts = true,
  onToggleCharts
}) => {
  const [trendViewMode, setTrendViewMode] = useState<'month' | 'day'>('month');

  // 1. Data for Trend Chart
  const trendData = React.useMemo<TrendPoint[]>(() => {
    if (trendViewMode === 'month') {
      // Group by month
      const monthMap: Record<number, TrendPoint> = {};
      
      records.forEach(r => {
        const m = r.month;
        if (!monthMap[m]) {
          monthMap[m] = {
            label: `Tháng ${m}`,
            tiepDan: 0,
            thuLy: 0,
            chuyenDon: 0,
            huongDan: 0,
          };
        }
        monthMap[m].tiepDan += 1;
        if (r.thuLy) monthMap[m].thuLy += 1;
        if (r.chuyenDon && r.chuyenDon.trim()) monthMap[m].chuyenDon += 1;
        if (r.traLaiHuongDan && r.traLaiHuongDan.trim()) monthMap[m].huongDan += 1;
      });

      return Object.keys(monthMap)
        .map(k => Number(k))
        .sort((a, b) => a - b)
        .map(m => monthMap[m]);
    } else {
      // Group by date
      const dateMap: Record<string, TrendPoint> = {};
      records.forEach(r => {
        const label = r.ngayTiep;
        if (!dateMap[label]) {
          dateMap[label] = {
            label,
            tiepDan: 0,
            thuLy: 0,
            chuyenDon: 0,
            huongDan: 0,
            rawTime: new Date(r.year, r.month - 1, parseInt(label.split('/')[0] || '1', 10)).getTime(),
          };
        }
        dateMap[label].tiepDan += 1;
        if (r.thuLy) dateMap[label].thuLy += 1;
        if (r.chuyenDon && r.chuyenDon.trim()) dateMap[label].chuyenDon += 1;
        if (r.traLaiHuongDan && r.traLaiHuongDan.trim()) dateMap[label].huongDan += 1;
      });

      return Object.values(dateMap).sort((a, b) => (a.rawTime || 0) - (b.rawTime || 0));
    }
  }, [records, trendViewMode]);

  // 2. Data for Loai Don Pie Chart
  const loaiDonPieData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const type = r.loaiDon || 'Khác';
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [records]);

  // 3. Data for Status Bar Chart
  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const st = r.theoDoiKetQua || 'Chưa cập nhật';
      counts[st] = (counts[st] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [records]);

  // 4. Data for TDP distribution
  const tdpData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const tdp = r.toDanPho || 'TDP khác';
      counts[tdp] = (counts[tdp] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([tdp, count]) => ({ tdp, count }))
      .sort((a, b) => {
        const numA = parseInt(a.tdp.replace(/\D/g, '') || '999', 10);
        const numB = parseInt(b.tdp.replace(/\D/g, '') || '999', 10);
        return numA - numB;
      });
  }, [records]);

  if (!showCharts) {
    return (
      <div className="bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-dashed border-slate-300 p-3.5 sm:p-4 mb-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700">
          <div className="p-2 bg-slate-200 text-slate-600 rounded-lg flex-shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm">
              04 Biểu đồ phân tích tiếp công dân đang được ẩn
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              (Gồm: Xu hướng tiếp dân & xử lý • Cơ cấu 4 loại đơn • Kết quả theo dõi • Mật độ theo Tổ dân phố)
            </p>
          </div>
        </div>
        {onToggleCharts && (
          <button
            onClick={onToggleCharts}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition"
            title="Bấm để hiển thị lại 04 biểu đồ phân tích"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hiện 04 biểu đồ</span>
          </button>
        )}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 mb-6">
        <TrendingUp className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-sm font-medium">Không có dữ liệu phù hợp với bộ lọc để vẽ biểu đồ</p>
        <p className="text-xs text-slate-400 mt-1">Vui lòng điều chỉnh hoặc xóa bớt tiêu chí lọc</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {/* 04 Charts Section Header Bar with Hide button */}
      <div className="flex items-center justify-between bg-slate-100/90 px-4 py-2 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span className="tracking-wide">04 BIỂU ĐỒ PHÂN TÍCH & TRỰC QUAN HÓA DỮ LIỆU TIẾP DÂN</span>
        </div>
        {onToggleCharts && (
          <button
            onClick={onToggleCharts}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-300 transition shadow-2xs"
            title="Nhấp để ẩn 04 biểu đồ phân tích"
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
            <span>Ẩn 04 biểu đồ</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Xu hướng tiếp dân & xử lý */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Xu Hướng Tiếp Dân & Xử Lý Đơn Thư
              </h4>
              <p className="text-xs text-slate-500">
                Diễn biến số lượt tiếp nhận, thụ lý và chuyển xử lý
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setTrendViewMode('month')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                trendViewMode === 'month'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo tháng
            </button>
            <button
              onClick={() => setTrendViewMode('day')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                trendViewMode === 'day'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Theo ngày
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTiepDan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorThuLy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
              />
              <Area
                type="monotone"
                dataKey="tiepDan"
                name="Tổng lượt tiếp"
                stroke={COLORS.blue}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTiepDan)"
              />
              <Area
                type="monotone"
                dataKey="thuLy"
                name="Thụ lý giải quyết"
                stroke={COLORS.emerald}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorThuLy)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Cơ cấu loại đơn */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Cơ Cấu Phân Loại Đơn Thư
              </h4>
              <p className="text-xs text-slate-500">
                Tỷ trọng giữa Khiếu nại, Tố cáo, Kiến nghị & Phản ánh
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {records.length} hồ sơ
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={loaiDonPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              >
                {loaiDonPieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PIE_COLORS[index % PIE_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value} hồ sơ (${Math.round((Number(value) / records.length) * 100)}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Trạng thái theo dõi kết quả */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Trạng Thái & Kết Quả Theo Dõi
              </h4>
              <p className="text-xs text-slate-500">
                Phân bố kết quả xử lý tiếp công dân
              </p>
            </div>
          </div>
        </div>

        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Số lượng hồ sơ" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => {
                  let color = COLORS.blue;
                  if (entry.status.includes('hướng dẫn')) color = COLORS.amber;
                  if (entry.status.includes('chuyển')) color = COLORS.indigo;
                  if (entry.status.includes('giải quyết') || entry.status.includes('xong')) color = COLORS.emerald;
                  return <Cell key={`bar-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Phân bố theo TDP */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Mật Độ Tiếp Dân Theo Tổ Dân Phố (TDP)
              </h4>
              <p className="text-xs text-slate-500">
                Địa bàn phát sinh nhiều phản ánh, kiến nghị trên phường
              </p>
            </div>
          </div>
        </div>

        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tdpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="tdp" 
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar 
                dataKey="count" 
                name="Số lượt tiếp dân" 
                fill={COLORS.purple} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
    </div>
  );
};
