import React, { useState, useMemo } from 'react';
import { TiepDanRecord, TiepDanFilterState, XuLyDonPrefillData } from '../../types';
import { TiepDanFilterBar } from './TiepDanFilterBar';
import { TiepDanKPIStats } from './TiepDanKPIStats';
import { TiepDanCharts } from './TiepDanCharts';
import { TiepDanTable } from './TiepDanTable';
import { AddTiepDanModal } from './AddTiepDanModal';
import { User } from 'firebase/auth';

interface TabTiepDanProps {
  initialRecords: TiepDanRecord[];
  onAddNewRecord: (record: TiepDanRecord) => void;
  onUpdateRecord?: (updatedRecord: TiepDanRecord) => void;
  onDeleteRecord?: (id: string) => void;
  currentUser: User | null;
  accessToken: string | null;
  onAuthUpdated: (user: User | null, token: string | null) => void;
  onTransferToXuLyDon?: (data: XuLyDonPrefillData) => void;
}

export const TabTiepDan: React.FC<TabTiepDanProps> = ({ 
  initialRecords,
  onAddNewRecord,
  onUpdateRecord,
  onDeleteRecord,
  currentUser,
  accessToken,
  onAuthUpdated,
  onTransferToXuLyDon,
}) => {
  const [filter, setFilter] = useState<TiepDanFilterState>({
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(true);

  // Extract distinct years and co quan
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    initialRecords.forEach(r => {
      if (r.year) set.add(r.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [initialRecords]);

  const availableCoQuan = useMemo(() => {
    const set = new Set<string>();
    initialRecords.forEach(r => {
      if (r.coQuanGiaiQuyet && r.coQuanGiaiQuyet.trim()) {
        set.add(r.coQuanGiaiQuyet.trim());
      }
    });
    return Array.from(set);
  }, [initialRecords]);

  // Helper to extract timestamp from record for date range filtering
  const getRecordTimestamp = (r: TiepDanRecord): number => {
    if (r.ngayTiepRaw) {
      const parts = r.ngayTiepRaw.split('/');
      if (parts.length === 3) {
        const m = parseInt(parts[0], 10);
        const d = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        return new Date(y, m - 1, d).getTime();
      }
    }
    return new Date(r.year, (r.month || 1) - 1, 15).getTime();
  };

  // Apply intelligent multi-criteria filtering
  const filteredRecords = useMemo(() => {
    const fromTime = filter.fromDate ? new Date(filter.fromDate).setHours(0, 0, 0, 0) : null;
    const toTime = filter.toDate ? new Date(filter.toDate).setHours(23, 59, 59, 999) : null;

    return initialRecords.filter(r => {
      // 1. Year filter
      if (filter.year !== 'all' && String(r.year) !== filter.year) {
        return false;
      }

      // 2. Quarter filter
      if (filter.quarter !== 'all' && String(r.quarter) !== filter.quarter) {
        return false;
      }

      // 3. Month filter
      if (filter.month !== 'all' && String(r.month) !== filter.month) {
        return false;
      }

      // 4. Custom date range filter (Từ ngày - Đến ngày)
      if (fromTime || toTime) {
        const recTime = getRecordTimestamp(r);
        if (fromTime && recTime < fromTime) return false;
        if (toTime && recTime > toTime) return false;
      }

      // 5. Loai don filter
      if (filter.loaiDon !== 'all' && r.loaiDon !== filter.loaiDon) {
        return false;
      }

      // 6. Co quan giai quyet filter
      if (filter.coQuan !== 'all' && r.coQuanGiaiQuyet !== filter.coQuan) {
        return false;
      }

      // 7. Trang thai / Theo doi ket qua filter
      if (filter.trangThai !== 'all') {
        const statusMatch = 
          r.theoDoiKetQua === filter.trangThai ||
          (filter.trangThai === 'Đang theo dõi' && r.theoDoiKetQua.toLowerCase().includes('theo dõi')) ||
          (filter.trangThai === 'Đã giải quyết xong' && r.theoDoiKetQua.toLowerCase().includes('xong')) ||
          (filter.trangThai === 'Đã hướng dẫn' && (r.theoDoiKetQua === 'Đã hướng dẫn' || (!r.thuLy && r.traLaiHuongDan && r.traLaiHuongDan.trim()))) ||
          (filter.trangThai === 'Đã chuyển xử lý' && (r.theoDoiKetQua === 'Đã chuyển xử lý' || (r.chuyenDon && r.chuyenDon.trim())));
        if (!statusMatch) return false;
      }

      // 8. Hinh thuc filter
      if (filter.hinhThuc === 'thuLy' && !r.thuLy) {
        return false;
      }
      if (filter.hinhThuc === 'huongDan' && (!r.traLaiHuongDan || !r.traLaiHuongDan.trim())) {
        return false;
      }
      if (filter.hinhThuc === 'chuyenDon' && (!r.chuyenDon || !r.chuyenDon.trim())) {
        return false;
      }

      // 9. Tổ dân phố (TDP) filter
      if (filter.toDanPho && filter.toDanPho !== 'all') {
        const tdpMatch = 
          (r.toDanPho && r.toDanPho.toLowerCase().includes(filter.toDanPho.toLowerCase())) ||
          (r.diaChi && r.diaChi.toLowerCase().includes(filter.toDanPho.toLowerCase()));
        if (!tdpMatch) return false;
      }

      // 10. Comprehensive Search keyword
      if (filter.searchKeyword.trim() !== '') {
        const kw = filter.searchKeyword.toLowerCase().trim();
        const match =
          r.hoTen.toLowerCase().includes(kw) ||
          r.cccd.toLowerCase().includes(kw) ||
          r.diaChi.toLowerCase().includes(kw) ||
          r.noiDung.toLowerCase().includes(kw) ||
          (r.toDanPho && r.toDanPho.toLowerCase().includes(kw)) ||
          (r.coQuanGiaiQuyet && r.coQuanGiaiQuyet.toLowerCase().includes(kw)) ||
          (r.traLaiHuongDan && r.traLaiHuongDan.toLowerCase().includes(kw)) ||
          (r.chuyenDon && r.chuyenDon.toLowerCase().includes(kw)) ||
          (r.ghiChu && r.ghiChu.toLowerCase().includes(kw));
        if (!match) return false;
      }

      return true;
    });
  }, [initialRecords, filter]);

  return (
    <div className="space-y-6">
      {/* 1. Smart Filter Bar with Add button and Charts Toggle */}
      <TiepDanFilterBar
        filter={filter}
        setFilter={setFilter}
        availableYears={availableYears}
        availableCoQuan={availableCoQuan}
        records={initialRecords}
        totalFilteredCount={filteredRecords.length}
        totalAllCount={initialRecords.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        showCharts={showCharts}
        onToggleCharts={() => setShowCharts(prev => !prev)}
      />

      {/* 2. KPI Summary Stats with Interactive Filter Integration */}
      <TiepDanKPIStats 
        records={filteredRecords} 
        currentTrangThai={filter.trangThai}
        onSelectTrangThai={(status) => setFilter(prev => ({ ...prev, trangThai: status }))}
      />

      {/* 3. Visual Trend & Distribution Charts (04 Charts) */}
      <TiepDanCharts 
        records={filteredRecords} 
        showCharts={showCharts}
        onToggleCharts={() => setShowCharts(prev => !prev)}
      />

      {/* 4. Compliant Administrative Table Mẫu 03/TCD with Edit & Delete */}
      <TiepDanTable 
        records={filteredRecords} 
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onUpdateRecord={onUpdateRecord}
        onDeleteRecord={onDeleteRecord}
      />

      {/* 5. Add Record Modal for Tab 1 */}
      <AddTiepDanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingRecords={initialRecords}
        onAddRecord={onAddNewRecord}
        currentUser={currentUser}
        accessToken={accessToken}
        onAuthUpdated={onAuthUpdated}
        onSaveAndTransfer={onTransferToXuLyDon}
      />
    </div>
  );
};
