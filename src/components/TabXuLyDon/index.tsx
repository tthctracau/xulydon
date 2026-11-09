import React, { useState, useMemo, useEffect } from 'react';
import { XuLyDonRecord, XuLyDonFilterState, XuLyDonPrefillData } from '../../types';
import { XuLyDonFilterBar } from './XuLyDonFilterBar';
import { 
  XuLyDonKPIStats, 
  isRecordDungHan, 
  isRecordGiaiQuyetQuaHan, 
  isRecordQuaHanGiaiQuyet 
} from './XuLyDonKPIStats';
import { XuLyDonTable } from './XuLyDonTable';
import { XuLyDonAutoReportModal } from './XuLyDonAutoReportModal';
import { AddXuLyDonModal } from './AddXuLyDonModal';
import { User as FirebaseUser } from 'firebase/auth';

interface TabXuLyDonProps {
  initialRecords: XuLyDonRecord[];
  onAddNewRecord?: (record: XuLyDonRecord) => void;
  onUpdateRecord?: (updatedRecord: XuLyDonRecord) => void;
  onDeleteRecord?: (id: string) => void;
  currentUser?: FirebaseUser | null;
  accessToken?: string | null;
  onAuthUpdated?: (user: FirebaseUser | null, token: string | null) => void;
  prefillData?: XuLyDonPrefillData | null;
  onClearPrefill?: () => void;
}

export const TabXuLyDon: React.FC<TabXuLyDonProps> = ({ 
  initialRecords,
  onAddNewRecord,
  onUpdateRecord,
  onDeleteRecord,
  currentUser,
  accessToken,
  onAuthUpdated,
  prefillData,
  onClearPrefill,
}) => {
  const [filter, setFilter] = useState<XuLyDonFilterState>({
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

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Auto-open modal when prefill data arrives from Tab 1
  useEffect(() => {
    if (prefillData) {
      setIsAddModalOpen(true);
    }
  }, [prefillData]);

  // Extract distinct agencies
  const availableCoQuan = useMemo(() => {
    const set = new Set<string>();
    initialRecords.forEach(r => {
      if (r.coQuanNhanChuTri && r.coQuanNhanChuTri.trim()) {
        set.add(r.coQuanNhanChuTri.trim());
      }
    });
    return Array.from(set);
  }, [initialRecords]);

  // 1. Base filtered records (by search, agency, source, etc. before KPI card selection)
  const baseFilteredRecords = useMemo(() => {
    return initialRecords.filter(r => {
      // 1. Loại đơn
      if (filter.loaiDon !== 'all' && r.loaiDon !== filter.loaiDon) {
        return false;
      }

      // 2. Cơ quan tiếp nhận / nhận chủ trì
      if (filter.coQuan !== 'all' && r.coQuanNhanChuTri !== filter.coQuan) {
        return false;
      }

      // 3. Trạng thái xử lý (Tình trạng)
      if (filter.tinhTrang !== 'all' && r.tinhTrang !== filter.tinhTrang) {
        return false;
      }

      // 4. Nguồn nhận
      if (filter.nguonNhan !== 'all' && r.nguonNhan !== filter.nguonNhan) {
        return false;
      }

      // 5. Thuộc thẩm quyền
      if (filter.thuocThamQuyen !== 'all' && r.thuocThamQuyen !== filter.thuocThamQuyen) {
        return false;
      }

      // 6. Đủ điều kiện
      if (filter.duDieuKien !== 'all' && r.duDieuKien !== filter.duDieuKien) {
        return false;
      }

      // 7. Search keyword
      if (filter.searchKeyword.trim() !== '') {
        const kw = filter.searchKeyword.toLowerCase().trim();
        const match =
          r.soDen.toLowerCase().includes(kw) ||
          r.hoTenNguoiGui.toLowerCase().includes(kw) ||
          r.tomTatNoiDung.toLowerCase().includes(kw) ||
          r.diaChiLienHe.toLowerCase().includes(kw) ||
          (r.soNgayVB && r.soNgayVB.toLowerCase().includes(kw));
        if (!match) return false;
      }

      return true;
    });
  }, [initialRecords, filter]);

  // 2. Final filtered records applying the selected KPI card
  const filteredRecords = useMemo(() => {
    const kpi = filter.kpiFilter || 'all';
    if (kpi === 'all' || kpi === 'tongSo') {
      return baseFilteredRecords;
    }

    return baseFilteredRecords.filter(r => {
      if (kpi === 'thuocThamQuyen') return r.thuocThamQuyen === 'Có';
      if (kpi === 'dangGiaiQuyet') return r.tinhTrang.toLowerCase().includes('đang');
      if (kpi === 'daGiaiQuyetDungHan') return isRecordDungHan(r);
      if (kpi === 'daGiaiQuyetQuaHan') return isRecordGiaiQuyetQuaHan(r);
      if (kpi === 'quaHanGiaiQuyet') return isRecordQuaHanGiaiQuyet(r);
      return true;
    });
  }, [baseFilteredRecords, filter.kpiFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Filter Bar with Add Record & Auto-Report Trigger */}
      <XuLyDonFilterBar
        filter={filter}
        setFilter={setFilter}
        availableCoQuan={availableCoQuan}
        records={initialRecords}
        totalFilteredCount={filteredRecords.length}
        totalAllCount={initialRecords.length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* 2. KPI Summary Stats (09 Indicators Dashboard) */}
      <XuLyDonKPIStats 
        records={baseFilteredRecords} 
        activeKpi={filter.kpiFilter || 'all'}
        onSelectKpi={(kpiKey) => setFilter(prev => ({ ...prev, kpiFilter: kpiKey }))}
      />

      {/* 3. Table with View, Add, Edit, Delete & Detail Modals */}
      <XuLyDonTable
        records={filteredRecords}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onUpdateRecord={onUpdateRecord}
        onDeleteRecord={onDeleteRecord}
      />

      {/* 4. Automatic Administrative Report Generator Modal */}
      <XuLyDonAutoReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        filteredRecords={filteredRecords}
        allRecords={initialRecords}
        filter={filter}
      />

      {/* 5. Add New Petition Record Modal with Google Sheets Integration */}
      <AddXuLyDonModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          if (onClearPrefill) onClearPrefill();
        }}
        existingRecords={initialRecords}
        initialPrefill={prefillData}
        onAddRecord={(newRec) => {
          if (onAddNewRecord) {
            onAddNewRecord(newRec);
          }
          if (onClearPrefill) {
            onClearPrefill();
          }
        }}
        currentUser={currentUser || null}
        accessToken={accessToken || null}
        onAuthUpdated={(user, token) => {
          if (onAuthUpdated) {
            onAuthUpdated(user, token);
          }
        }}
      />
    </div>
  );
};

