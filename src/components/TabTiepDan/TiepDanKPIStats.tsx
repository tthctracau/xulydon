import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  BookOpenCheck, 
  Send, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { TiepDanRecord } from '../../types';

interface TiepDanKPIStatsProps {
  records: TiepDanRecord[];
  currentTrangThai?: string;
  onSelectTrangThai?: (status: string) => void;
}

export const TiepDanKPIStats: React.FC<TiepDanKPIStatsProps> = ({ 
  records,
  currentTrangThai = 'all',
  onSelectTrangThai
}) => {
  const totalVisits = records.length;
  const totalPeople = records.reduce((acc, r) => acc + (r.soNguoi || 1), 0);

  // 4 Status counts for the requested functions
  const dangTheoDoiCount = records.filter(r => 
    r.theoDoiKetQua === 'Đang theo dõi' || 
    (r.theoDoiKetQua && r.theoDoiKetQua.toLowerCase().includes('theo dõi'))
  ).length;

  const daHuongDanCount = records.filter(r => 
    r.theoDoiKetQua === 'Đã hướng dẫn' || 
    (r.traLaiHuongDan && r.traLaiHuongDan.trim() && r.theoDoiKetQua !== 'Đã giải quyết xong' && r.theoDoiKetQua !== 'Đã chuyển xử lý' && r.theoDoiKetQua !== 'Đang theo dõi')
  ).length;

  const daChuyenXuLyCount = records.filter(r => 
    r.theoDoiKetQua === 'Đã chuyển xử lý' || 
    (r.chuyenDon && r.chuyenDon.trim() && r.theoDoiKetQua !== 'Đã giải quyết xong' && r.theoDoiKetQua !== 'Đang theo dõi' && r.theoDoiKetQua !== 'Đã hướng dẫn')
  ).length;

  const daGiaiQuyetXongCount = records.filter(r => 
    r.theoDoiKetQua === 'Đã giải quyết xong' || 
    (r.theoDoiKetQua && r.theoDoiKetQua.toLowerCase().includes('xong'))
  ).length;

  // Breakdown by 4 petition categories
  const loaiDonStats = React.useMemo(() => {
    const stats: Record<string, number> = {
      'Phản ánh': 0,
      'Khiếu nại': 0,
      'Kiến nghị': 0,
      'Tố cáo': 0,
    };
    records.forEach(r => {
      if (stats[r.loaiDon] !== undefined) {
        stats[r.loaiDon]++;
      } else {
        stats[r.loaiDon] = 1;
      }
    });
    return stats;
  }, [records]);

  const dangTheoDoiRate = totalVisits > 0 ? Math.round((dangTheoDoiCount / totalVisits) * 100) : 0;
  const daHuongDanRate = totalVisits > 0 ? Math.round((daHuongDanCount / totalVisits) * 100) : 0;
  const daChuyenXuLyRate = totalVisits > 0 ? Math.round((daChuyenXuLyCount / totalVisits) * 100) : 0;
  const daGiaiQuyetXongRate = totalVisits > 0 ? Math.round((daGiaiQuyetXongCount / totalVisits) * 100) : 0;

  const handleCardClick = (status: string) => {
    if (onSelectTrangThai) {
      if (currentTrangThai === status) {
        onSelectTrangThai('all'); // toggle off
      } else {
        onSelectTrangThai(status);
      }
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* 5 Core Dashboard KPI Function Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Card 1: Lượt tiếp công dân - Background #A20409 */}
        <div 
          onClick={() => handleCardClick('all')}
          style={{ backgroundColor: '#A20409' }}
          className={`rounded-xl p-4 shadow-sm relative overflow-hidden transition cursor-pointer select-none group border text-white ${
            currentTrangThai === 'all' 
              ? 'border-amber-300 ring-2 ring-amber-300/80 shadow-md scale-[1.01]' 
              : 'border-red-900/60 hover:brightness-105 hover:shadow-md'
          }`}
          title="Nhấp để hiển thị toàn bộ lượt tiếp công dân"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-200 uppercase tracking-wider">
                Lượt tiếp công dân
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {totalVisits}
                </span>
                <span className="text-xs text-amber-100 font-semibold">
                  lượt ({totalPeople} người)
                </span>
              </div>
              <p className="text-[11px] text-amber-200 mt-2 font-medium flex items-center gap-1">
                <span>Toàn bộ hồ sơ trong Sổ</span>
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition border ${
              currentTrangThai === 'all' ? 'bg-amber-400 text-red-950 border-amber-300 shadow-sm' : 'bg-white/15 text-white border-white/20 group-hover:bg-white/25'
            }`}>
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-black/25 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-300 h-full rounded-full w-full"></div>
          </div>
        </div>

        {/* Card 2: Đang theo dõi - Background #e58e61 */}
        <div 
          onClick={() => handleCardClick('Đang theo dõi')}
          style={{ backgroundColor: '#e58e61' }}
          className={`rounded-xl p-4 shadow-sm relative overflow-hidden transition cursor-pointer select-none group border text-slate-950 ${
            currentTrangThai === 'Đang theo dõi' 
              ? 'border-slate-900 ring-2 ring-slate-950/60 shadow-md scale-[1.01]' 
              : 'border-amber-700/30 hover:brightness-105 hover:shadow-md'
          }`}
          title="Nhấp để lọc hồ sơ Đang theo dõi"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Đang theo dõi
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {dangTheoDoiCount}
                </span>
                <span className="text-xs text-slate-950 bg-white/40 px-1.5 py-0.5 rounded font-extrabold border border-black/10">
                  {dangTheoDoiRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-900 mt-2 font-medium">
                Đang thụ lý & giám sát
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition border ${
              currentTrangThai === 'Đang theo dõi' ? 'bg-slate-950 text-white border-slate-950 shadow-sm' : 'bg-white/35 text-slate-950 border-white/40 group-hover:bg-white/50'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-black/15 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-slate-950 h-full rounded-full transition-all duration-500" 
              style={{ width: `${dangTheoDoiRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Đã hướng dẫn - Background #f0ebd6 */}
        <div 
          onClick={() => handleCardClick('Đã hướng dẫn')}
          style={{ backgroundColor: '#f0ebd6' }}
          className={`rounded-xl p-4 shadow-sm relative overflow-hidden transition cursor-pointer select-none group border text-slate-900 ${
            currentTrangThai === 'Đã hướng dẫn' 
              ? 'border-amber-800 ring-2 ring-amber-800/60 shadow-md scale-[1.01]' 
              : 'border-amber-300/60 hover:brightness-95 hover:shadow-md'
          }`}
          title="Nhấp để lọc hồ sơ Đã hướng dẫn"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Đã hướng dẫn
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {daHuongDanCount}
                </span>
                <span className="text-xs text-amber-950 bg-white/80 px-1.5 py-0.5 rounded font-extrabold border border-amber-300">
                  {daHuongDanRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-700 mt-2 font-medium">
                Giải thích, bổ sung hồ sơ
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition border ${
              currentTrangThai === 'Đã hướng dẫn' ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-sm' : 'bg-white/80 text-amber-900 border-amber-200 group-hover:bg-white'
            }`}>
              <BookOpenCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-300/80 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-amber-800 h-full rounded-full transition-all duration-500" 
              style={{ width: `${daHuongDanRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Đã chuyển xử lý - Background #bbeda4 */}
        <div 
          onClick={() => handleCardClick('Đã chuyển xử lý')}
          style={{ backgroundColor: '#bbeda4' }}
          className={`rounded-xl p-4 shadow-sm relative overflow-hidden transition cursor-pointer select-none group border text-emerald-950 ${
            currentTrangThai === 'Đã chuyển xử lý' 
              ? 'border-emerald-900 ring-2 ring-emerald-900/60 shadow-md scale-[1.01]' 
              : 'border-emerald-300 hover:brightness-95 hover:shadow-md'
          }`}
          title="Nhấp để lọc hồ sơ Đã chuyển xử lý"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                Đã chuyển xử lý
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                  {daChuyenXuLyCount}
                </span>
                <span className="text-xs text-emerald-950 bg-white/70 px-1.5 py-0.5 rounded font-extrabold border border-emerald-300">
                  {daChuyenXuLyRate}%
                </span>
              </div>
              <p className="text-[11px] text-emerald-900 mt-2 font-medium">
                Chuyển cơ quan thẩm quyền
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition border ${
              currentTrangThai === 'Đã chuyển xử lý' ? 'bg-emerald-900 text-emerald-50 border-emerald-900 shadow-sm' : 'bg-white/70 text-emerald-900 border-emerald-300 group-hover:bg-white'
            }`}>
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-emerald-950/20 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-900 h-full rounded-full transition-all duration-500" 
              style={{ width: `${daChuyenXuLyRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 5: Đã giải quyết xong - Background #9bba74 */}
        <div 
          onClick={() => handleCardClick('Đã giải quyết xong')}
          style={{ backgroundColor: '#9bba74' }}
          className={`rounded-xl p-4 shadow-sm relative overflow-hidden transition cursor-pointer select-none group border text-slate-950 ${
            currentTrangThai === 'Đã giải quyết xong' 
              ? 'border-slate-950 ring-2 ring-slate-950/60 shadow-md scale-[1.01]' 
              : 'border-green-800/30 hover:brightness-105 hover:shadow-md'
          }`}
          title="Nhấp để lọc hồ sơ Đã giải quyết xong"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-950 uppercase tracking-wider">
                Đã giải quyết xong
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {daGiaiQuyetXongCount}
                </span>
                <span className="text-xs text-slate-950 bg-white/50 px-1.5 py-0.5 rounded font-extrabold border border-black/10">
                  {daGiaiQuyetXongRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-950 mt-2 font-medium">
                Đã kết luận & hoàn thành
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition border ${
              currentTrangThai === 'Đã giải quyết xong' ? 'bg-slate-950 text-white border-slate-950 shadow-sm' : 'bg-white/45 text-slate-950 border-white/40 group-hover:bg-white/60'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-black/15 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-slate-950 h-full rounded-full transition-all duration-500" 
              style={{ width: `${daGiaiQuyetXongRate}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Bottom mini-bar: Cơ cấu 4 loại đơn trong đợt tiếp công dân - Background #A20409 */}
      <div 
        style={{ backgroundColor: '#A20409' }}
        className="rounded-xl p-3 border border-red-950 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs text-white"
      >
        <div className="flex items-center gap-2 font-bold text-white">
          <AlertCircle className="w-4 h-4 text-amber-300" />
          <span className="tracking-wide">Cơ cấu 4 loại đơn trong đợt tiếp công dân:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/15">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span>
            <span className="text-amber-100">Phản ánh:</span>
            <strong className="text-white font-extrabold">{loaiDonStats['Phản ánh'] || 0}</strong>
          </span>
          <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/15">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
            <span className="text-amber-100">Khiếu nại:</span>
            <strong className="text-white font-extrabold">{loaiDonStats['Khiếu nại'] || 0}</strong>
          </span>
          <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/15">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-300"></span>
            <span className="text-amber-100">Kiến nghị:</span>
            <strong className="text-white font-extrabold">{loaiDonStats['Kiến nghị'] || 0}</strong>
          </span>
          <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/15">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span>
            <span className="text-amber-100">Tố cáo:</span>
            <strong className="text-white font-extrabold">{loaiDonStats['Tố cáo'] || 0}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
