import { TiepDanRecord, XuLyDonRecord } from '../types';

/**
 * Standard RFC-4180 CSV parser supporting multiline fields and escaped quotes
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.some(col => col.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(col => col.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parse date strings like "10/18/2026", "18/10/2026", "2026-10-18"
 */
export function parseDateComponents(dateStr: string): { year: number; month: number; quarter: number; formatted: string } {
  if (!dateStr || !dateStr.trim()) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      quarter: Math.ceil((now.getMonth() + 1) / 3),
      formatted: 'Chưa có',
    };
  }

  const clean = dateStr.trim();
  let day = 1;
  let month = 10;
  let year = 2026;

  if (clean.includes('/')) {
    const parts = clean.split('/').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      // In Google Sheets export for this data: 10/18/2026 -> MM/DD/YYYY or DD/MM/YYYY
      if (parts[0] > 12) {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      } else if (parts[1] > 12) {
        month = parts[0];
        day = parts[1];
        year = parts[2];
      } else {
        // Assume MM/DD/YYYY as seen in Google Sheets output (10/4/2026, 10/18/2026, 10/29/2026)
        month = parts[0];
        day = parts[1];
        year = parts[2];
      }
    }
  } else if (clean.includes('-')) {
    const parts = clean.split('-').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    }
  }

  if (isNaN(year) || year < 2000) year = 2026;
  if (isNaN(month) || month < 1 || month > 12) month = 10;
  if (isNaN(day) || day < 1 || day > 31) day = 1;

  const quarter = Math.ceil(month / 3);
  const formatted = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  return { year, month, quarter, formatted };
}

/**
 * Extract TDP from address string (e.g. TDP 2, TDP 9)
 */
export function extractTDP(address: string): string {
  if (!address) return 'Chưa rõ TDP';
  const match = address.match(/TDP\s*(\d+|[A-Za-z0-9]+)/i);
  if (match) {
    return `TDP ${match[1]}`;
  }
  return 'TDP khác';
}

/**
 * Parse Sổ Tiếp Dân CSV
 */
export function parseTiepDanCSV(csvText: string): TiepDanRecord[] {
  const rows = parseCSV(csvText);
  // Find the header row containing "STT" or "Ngày tiếp"
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.some(cell => cell.includes('STT') || cell.includes('Ngày tiếp'))) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    return [];
  }

  const dataRows = rows.slice(headerIndex + 1);
  const records: TiepDanRecord[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length < 5 || !row[0]?.trim()) continue;

    // Check if first column is numeric STT
    const sttNum = parseInt(row[0].trim(), 10);
    if (isNaN(sttNum)) continue;

    const ngayTiepRaw = row[1]?.trim() || '';
    const { year, month, quarter, formatted } = parseDateComponents(ngayTiepRaw);

    const hoTenDiaChiRaw = row[2]?.trim() || '';
    let hoTen = hoTenDiaChiRaw;
    let diaChi = '';
    if (hoTenDiaChiRaw.includes('\n')) {
      const parts = hoTenDiaChiRaw.split('\n');
      hoTen = parts[0]?.trim() || '';
      diaChi = parts.slice(1).join(', ').trim();
    } else if (hoTenDiaChiRaw.includes(',')) {
      const parts = hoTenDiaChiRaw.split(',');
      hoTen = parts[0]?.trim() || '';
      diaChi = parts.slice(1).join(',').trim();
    }

    const cccd = row[3]?.trim() || '';
    const noiDung = row[4]?.trim() || '';
    const loaiDon = row[5]?.trim() || 'Phản ánh';
    const soNguoi = parseInt(row[6]?.trim() || '1', 10) || 1;
    const coQuanGiaiQuyet = row[7]?.trim() || 'UBND phường Trà Câu';
    const thuLy = (row[8]?.trim().toLowerCase() === 'x' || row[8]?.trim() === '1');
    const traLaiHuongDan = row[9]?.trim() || '';
    const chuyenDon = row[10]?.trim() || '';
    const theoDoiKetQua = row[11]?.trim() || (thuLy ? 'Đang giải quyết' : 'Đang theo dõi');
    const ghiChu = row[12]?.trim() || '';

    const toDanPho = extractTDP(diaChi || hoTenDiaChiRaw);

    records.push({
      id: `TD-${sttNum}-${year}`,
      stt: sttNum,
      ngayTiep: formatted,
      ngayTiepRaw,
      year,
      month,
      quarter,
      hoTen,
      diaChi: diaChi || 'Phường Trà Câu, tỉnh Quảng Ngãi',
      cccd,
      noiDung,
      loaiDon,
      soNguoi,
      coQuanGiaiQuyet,
      thuLy,
      traLaiHuongDan,
      chuyenDon,
      theoDoiKetQua,
      ghiChu,
      toDanPho,
    });
  }

  return records;
}

/**
 * Parse Sổ Xử Lý Đơn CSV
 */
export function parseXuLyDonCSV(csvText: string): XuLyDonRecord[] {
  const rows = parseCSV(csvText);
  let headerIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.some(cell => cell.includes('STT') || cell.includes('Số đến') || cell.includes('Ngày nhận'))) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    return [];
  }

  const dataRows = rows.slice(headerIndex + 1);
  const records: XuLyDonRecord[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length < 5 || !row[0]?.trim()) continue;

    const sttNum = parseInt(row[0].trim(), 10);
    if (isNaN(sttNum)) continue;

    const ngayNhanRaw = row[1]?.trim() || '';
    const { year, month, quarter, formatted } = parseDateComponents(ngayNhanRaw);

    const soDen = row[2]?.trim() || `Đ-2026-${String(sttNum).padStart(3, '0')}`;
    const nguonNhan = row[3]?.trim() || 'Trực tiếp';
    const hoTenNguoiGui = row[4]?.trim() || '';
    const diaChiLienHe = row[5]?.trim() || 'Phường Trà Câu, tỉnh Quảng Ngãi';
    const loaiDon = row[6]?.trim() || 'Phản ánh';
    const tomTatNoiDung = row[7]?.trim() || '';
    const duDieuKien = (row[8]?.trim() || 'Có') as 'Có' | 'Không';
    const thuocThamQuyen = (row[9]?.trim() || 'Có') as 'Có' | 'Không';
    const huongXuLy = row[10]?.trim() || 'Thụ lý giải quyết';
    const soNgayVB = row[11]?.trim() || '';
    const coQuanNhanChuTri = row[12]?.trim() || 'UBND phường Trà Câu';
    const ngayChuyenHuongDan = row[13]?.trim() || '';
    const hanTheoDoi = row[14]?.trim() || '';
    const tinhTrang = row[15]?.trim() || 'Đang giải quyết';
    const ketQuaGiaiQuyet = row[16]?.trim() || 'Chưa có kết quả';
    const ngayCoKetQua = row[17]?.trim() || '';
    const canBoTheoDoi = row[18]?.trim() || 'Cán bộ tư pháp - tiếp công dân';
    const ghiChu = row[19]?.trim() || '';

    records.push({
      id: `XLD-${sttNum}-${year}`,
      stt: sttNum,
      ngayNhan: formatted,
      ngayNhanRaw,
      year,
      month,
      quarter,
      soDen,
      nguonNhan,
      hoTenNguoiGui,
      diaChiLienHe,
      loaiDon,
      tomTatNoiDung,
      duDieuKien,
      thuocThamQuyen,
      huongXuLy,
      soNgayVB,
      coQuanNhanChuTri,
      ngayChuyenHuongDan,
      hanTheoDoi,
      tinhTrang,
      ketQuaGiaiQuyet,
      ngayCoKetQua,
      canBoTheoDoi,
      ghiChu,
    });
  }

  return records;
}
