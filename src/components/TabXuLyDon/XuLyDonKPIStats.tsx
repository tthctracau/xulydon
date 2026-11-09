import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  RotateCcw
} from 'lucide-react';
import { XuLyDonRecord } from '../../types';

// Helper to parse date string into timestamp
export function parseDateToTime(dStr: string): number | null {
  if (!dStr || !dStr.trim() || dStr === '-') return null;
  const clean = dStr.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      let day = parts[0];
      let month = parts[1];
      let year = parts[2];
      if (parts[0] > 1000) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[1] > 12) {
        month = parts[0];
        day = parts[1];
      }
      return new Date(year, month - 1, day).getTime();
    }
  } else if (clean.includes('-')) {
    const parts = clean.split('-').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
      } else {
        return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
      }
    }
  }
  return null;
}

export function isRecordResolved(r: XuLyDonRecord): boolean {
  const tt = (r.tinhTrang || '').toLowerCase();
  const kq = (r.ketQuaGiaiQuyet || '').toLowerCase();
  const hasDate = Boolean(r.ngayCoKetQua && r.ngayCoKetQua.trim() && r.ngayCoKetQua !== '-');
  return (
    tt.includes('hoàn thành') ||
    tt.includes('đã giải quyết') ||
    hasDate ||
    (kq.length > 0 && !kq.includes('chưa') && kq !== '-')
  );
}

export function isRecordDungHan(r: XuLyDonRecord): boolean {
  if (!isRecordResolved(r)) return false;
  const tt = (r.tinhTrang || '').toLowerCase();
  const gc = (r.ghiChu || '').toLowerCase();
  if (tt.includes('quá hạn') || gc.includes('quá hạn') || tt.includes('trễ hạn')) return false;

  const hanTime = parseDateToTime(r.hanTheoDoi);
  const kqTime = parseDateToTime(r.ngayCoKetQua);
  if (hanTime && kqTime) {
    return kqTime <= hanTime;
  }
  return true;
}

export function isRecordGiaiQuyetQuaHan(r: XuLyDonRecord): boolean {
  if (!isRecordResolved(r)) return false;
  const tt = (r.tinhTrang || '').toLowerCase();
  const gc = (r.ghiChu || '').toLowerCase();
  if (tt.includes('quá hạn') || gc.includes('quá hạn') || tt.includes('trễ hạn')) return true;

  const hanTime = parseDateToTime(r.hanTheoDoi);
  const kqTime = parseDateToTime(r.ngayCoKetQua);
  if (hanTime && kqTime) {
    return kqTime > hanTime;
  }
  return false;
}

export function isRecordQuaHanGiaiQuyet(r: XuLyDonRecord, nowTime = Date.now()): boolean {
  if (isRecordResolved(r)) return false;
  const tt = (r.tinhTrang || '').toLowerCase();
  const gc = (r.ghiChu || '').toLowerCase();
  if (tt.includes('quá hạn') || gc.includes('quá hạn') || tt.includes('chậm')) return true;

  const hanTime = parseDateToTime(r.hanTheoDoi);
  if (hanTime && hanTime < nowTime) {
    return true;
  }
  return false;
}

interface XuLyDonKPIStatsProps {
  records: XuLyDonRecord[];
  activeKpi?: string;
  onSelectKpi?: (kpiKey: string) => void;
}

export const XuLyDonKPIStats: React.FC<XuLyDonKPIStatsProps> = ({ 
  records,
  activeKpi = 'all',
  onSelectKpi,
}) => {
  const total = records.length;
  const now = React.useMemo(() => Date.now(), []);

  // 1. Tổng số đơn tiếp nhận
  const tongSoCount = total;

  // 2. Thuộc thẩm quyền giải quyết
  const thuocThamQuyenCount = records.filter(r => r.thuocThamQuyen === 'Có').length;

  // 3. Đang giải quyết
  const dangGiaiQuyetCount = records.filter(r => r.tinhTrang.toLowerCase().includes('đang')).length;

  // 4. Đã giải quyết đúng hạn
  const daGiaiQuyetDungHanCount = records.filter(r => isRecordDungHan(r)).length;

  // 5. Đã giải quyết quá hạn
  const daGiaiQuyetQuaHanCount = records.filter(r => isRecordGiaiQuyetQuaHan(r)).length;

  // 6. Quá hạn giải quyết
  const quaHanGiaiQuyetCount = records.filter(r => isRecordQuaHanGiaiQuyet(r, now)).length;

  // Helper percentage
  const calcRate = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  const kpiItems = [
    {
      id: 'tongSo',
      title: 'Tổng số đơn tiếp nhận',
      count: tongSoCount,
      rateText: '100%',
      rateNum: 100,
      description: 'Đơn thư đã vào sổ tiếp nhận & theo dõi',
      icon: FileText,
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-200',
      barColor: 'bg-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'thuocThamQuyen',
      title: 'Thuộc thẩm quyền giải quyết',
      count: thuocThamQuyenCount,
      rateText: `${calcRate(thuocThamQuyenCount)}%`,
      rateNum: calcRate(thuocThamQuyenCount),
      description: 'UBND phường trực tiếp thụ lý giải quyết',
      icon: ShieldCheck,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      activeBorder: 'border-blue-500 ring-2 ring-blue-200',
      barColor: 'bg-blue-600',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'dangGiaiQuyet',
      title: 'Đang giải quyết',
      count: dangGiaiQuyetCount,
      rateText: `${calcRate(dangGiaiQuyetCount)}%`,
      rateNum: calcRate(dangGiaiQuyetCount),
      description: 'Đang trong quá trình thẩm tra, xác minh hồ sơ',
      icon: Clock,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      activeBorder: 'border-amber-500 ring-2 ring-amber-200',
      barColor: 'bg-amber-500',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'daGiaiQuyetDungHan',
      title: 'Đã giải quyết đúng hạn',
      count: daGiaiQuyetDungHanCount,
      rateText: `${calcRate(daGiaiQuyetDungHanCount)}%`,
      rateNum: calcRate(daGiaiQuyetDungHanCount),
      description: 'Có kết quả giải quyết đúng thời hạn quy định',
      icon: CheckCircle2,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-200',
      barColor: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'daGiaiQuyetQuaHan',
      title: 'Đã giải quyết quá hạn',
      count: daGiaiQuyetQuaHanCount,
      rateText: `${calcRate(daGiaiQuyetQuaHanCount)}%`,
      rateNum: calcRate(daGiaiQuyetQuaHanCount),
      description: 'Đã có kết quả giải quyết nhưng trễ hạn theo dõi',
      icon: AlertTriangle,
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      activeBorder: 'border-orange-500 ring-2 ring-orange-200',
      barColor: 'bg-orange-500',
      iconBg: 'bg-orange-50 text-orange-600',
    },
    {
      id: 'quaHanGiaiQuyet',
      title: 'Trễ hạn',
      count: quaHanGiaiQuyetCount,
      rateText: `${calcRate(quaHanGiaiQuyetCount)}%`,
      rateNum: calcRate(quaHanGiaiQuyetCount),
      description: 'Chưa có kết quả và hiện đã quá thời hạn theo dõi',
      icon: AlertOctagon,
      badgeClass: 'bg-red-50 text-red-700 border-red-200 font-bold',
      activeBorder: 'border-red-500 ring-2 ring-red-200',
      barColor: 'bg-red-600',
      iconBg: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="mb-6">
      {/* Official Administrative Statistics Summary for Print/PDF */}
      <div className="hidden print:block mb-4 border border-slate-700 p-3 bg-slate-50/50">
        <div className="text-center font-bold text-xs uppercase mb-2 tracking-wide text-slate-800">
          PHẦN I. TỔNG HỢP CÁC CHỈ TIÊU XỬ LÝ ĐƠN THƯ (THEO NGHỊ ĐỊNH SỐ 154/2026/NĐ-CP)
        </div>
        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          <div className="border border-slate-400 p-2 bg-white">
            <div className="text-[10px] font-bold text-slate-700 uppercase">1. Tổng tiếp nhận</div>
            <div className="text-base font-black text-slate-900 mt-0.5">{tongSoCount}</div>
            <div className="text-[9px] text-slate-500 font-semibold">100%</div>
          </div>
          <div className="border border-slate-400 p-2 bg-white">
            <div className="text-[10px] font-bold text-slate-700 uppercase">2. Thuộc thẩm quyền</div>
            <div className="text-base font-black text-blue-850 mt-0.5">{thuocThamQuyenCount}</div>
            <div className="text-[9px] text-slate-500 font-semibold">{calcRate(thuocThamQuyenCount)}%</div>
          </div>
          <div className="border border-slate-400 p-2 bg-white">
            <div className="text-[10px] font-bold text-slate-700 uppercase">3. Đang giải quyết</div>
            <div className="text-base font-black text-amber-800 mt-0.5">{dangGiaiQuyetCount}</div>
            <div className="text-[9px] text-slate-500 font-semibold">{calcRate(dangGiaiQuyetCount)}%</div>
          </div>
          <div className="border border-slate-400 p-2 bg-white">
            <div className="text-[10px] font-bold text-slate-700 uppercase">4. GQ đúng hạn</div>
            <div className="text-base font-black text-emerald-800 mt-0.5">{daGiaiQuyetDungHanCount}</div>
            <div className="text-[9px] text-slate-500 font-semibold">{calcRate(daGiaiQuyetDungHanCount)}%</div>
          </div>
          <div className="border border-slate-400 p-2 bg-white">
            <div className="text-[10px] font-bold text-slate-700 uppercase">5. GQ quá hạn</div>
            <div className="text-base font-black text-orange-800 mt-0.5">{daGiaiQuyetQuaHanCount}</div>
            <div className="text-[9px] text-slate-500 font-semibold">{calcRate(daGiaiQuyetQuaHanCount)}%</div>
          </div>
          <div className="border border-slate-400 p-2 bg-white">
            <div className="text-[10px] font-bold text-slate-700 uppercase">6. Trễ hạn</div>
            <div className="text-base font-black text-rose-800 mt-0.5">{quaHanGiaiQuyetCount}</div>
            <div className="text-[9px] text-slate-500 font-semibold">{calcRate(quaHanGiaiQuyetCount)}%</div>
          </div>
        </div>
      </div>

      {/* Title & Filter Indicator on Web */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-0.5 no-print">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Dashboard Chỉ Số Tiếp Nhận & Xử Lý Đơn Thư (06 Chỉ Tiêu)
          </h3>
        </div>
        {activeKpi && activeKpi !== 'all' && onSelectKpi && (
          <button
            onClick={() => onSelectKpi('all')}
            className="flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Hiển thị tất cả đơn</span>
          </button>
        )}
      </div>

      {/* Grid of 6 KPI Cards on Web */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 no-print">
        {kpiItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeKpi === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectKpi && onSelectKpi(isSelected ? 'all' : item.id)}
              className={`bg-white rounded-xl p-4 border shadow-xs transition-all relative overflow-hidden group cursor-pointer ${
                isSelected 
                  ? `${item.activeBorder} shadow-md` 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-tight truncate" title={item.title}>
                    {item.title}
                  </p>
                  
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                      {item.count}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${item.badgeClass}`}>
                      {item.rateText}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-1" title={item.description}>
                    {item.description}
                  </p>
                </div>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${item.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${item.barColor}`} 
                  style={{ width: `${Math.min(100, Math.max(item.count > 0 ? 6 : 0, item.rateNum))}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
