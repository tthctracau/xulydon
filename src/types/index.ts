export type LoaiDon = 'Phản ánh' | 'Khiếu nại' | 'Kiến nghị' | 'Tố cáo' | string;

export type NguonNhan = 'Trực tiếp' | 'Bưu chính' | 'Trực tuyến' | string;

export interface TiepDanRecord {
  id: string;
  stt: number;
  ngayTiep: string; // ISO date YYYY-MM-DD or display format MM/DD/YYYY
  ngayTiepRaw: string;
  year: number;
  month: number; // 1-12
  quarter: number; // 1-4
  hoTen: string;
  diaChi: string;
  cccd: string;
  noiDung: string;
  loaiDon: LoaiDon;
  soNguoi: number;
  coQuanGiaiQuyet: string;
  thuLy: boolean; // "x" or not
  traLaiHuongDan: string;
  chuyenDon: string;
  theoDoiKetQua: string; // e.g., 'Đang theo dõi' | 'Đã hướng dẫn' | 'Đã chuyển xử lý'
  ghiChu: string;
  toDanPho?: string;
}

export interface XuLyDonRecord {
  id: string;
  stt: number;
  ngayNhan: string;
  ngayNhanRaw: string;
  year: number;
  month: number;
  quarter: number;
  soDen: string;
  nguonNhan: NguonNhan;
  hoTenNguoiGui: string;
  diaChiLienHe: string;
  loaiDon: LoaiDon;
  tomTatNoiDung: string;
  duDieuKien: 'Có' | 'Không' | string;
  thuocThamQuyen: 'Có' | 'Không' | string;
  huongXuLy: string;
  soNgayVB: string;
  coQuanNhanChuTri: string;
  ngayChuyenHuongDan: string;
  hanTheoDoi: string;
  tinhTrang: string; // 'Đang giải quyết' | 'Đã hướng dẫn' | 'Đã chuyển' | 'Hoàn thành' | string
  ketQuaGiaiQuyet: string;
  ngayCoKetQua: string;
  canBoTheoDoi: string;
  ghiChu: string;
}

export interface XuLyDonPrefillData {
  ngayNhanDate: string;
  hoTenNguoiGui: string;
  diaChiLienHe: string;
  tomTatNoiDung: string;
  coQuanNhanChuTri: string;
  loaiDon: LoaiDon;
  sourceSTT?: number;
}

export interface TiepDanFilterState {
  year: string; // 'all' or '2026', '2025'
  quarter: string; // 'all' or '1', '2', '3', '4'
  month: string; // 'all' or '1'..'12'
  fromDate?: string;
  toDate?: string;
  loaiDon: string; // 'all' or specific
  coQuan: string; // 'all' or specific
  trangThai: string; // 'all' or specific
  hinhThuc: string; // 'all' | 'thuLy' | 'huongDan' | 'chuyenDon'
  toDanPho?: string; // 'all' or 'TDP 1'..'TDP 10'
  searchKeyword: string;
}

export interface XuLyDonFilterState {
  loaiDon: string;
  coQuan: string;
  tinhTrang: string;
  nguonNhan: string;
  thuocThamQuyen: string; // 'all' | 'Có' | 'Không'
  duDieuKien: string; // 'all' | 'Có' | 'Không'
  searchKeyword: string;
  year: string;
  month: string;
  kpiFilter?: string;
}

export interface ReportConfig {
  tieuDe: string;
  kyBaoCao: string;
  nguoiLap: string;
  chucVuNguoiLap: string;
  nguoiKy: string;
  chucVuNguoiKy: string;
  diaDiem: string;
  ngayBaoCao: string;
  ghiChuThem: string;
}
