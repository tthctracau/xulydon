import { parseDateComponents, extractTDP, parseTiepDanCSV, parseXuLyDonCSV } from '../utils/csvParser';
import { TiepDanRecord, XuLyDonRecord, NguonNhan, LoaiDon } from '../types';
import { SHEET_URLS } from '../data/initialData';

export const SPREADSHEET_ID = '1wJcwuzMHPiby5oenX7nTS7HAnQ8TzDdW1l_3YiGJoV8';
export const GID_TIEP_DAN = 30479724;
export const GID_XU_LY_DON = 537408158;

export interface AppendResult {
  success: boolean;
  updatedRange?: string;
  error?: string;
}

/**
 * Fetch sheet title for gid=30479724 dynamically
 */
export async function getTiepDanSheetTitle(accessToken: string): Promise<string> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets(properties(sheetId,title))`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.sheets && Array.isArray(data.sheets)) {
        for (const s of data.sheets) {
          if (s.properties?.sheetId === GID_TIEP_DAN) {
            return s.properties.title;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Could not query sheet properties, using default "So tiep dan":', e);
  }
  return 'So tiep dan';
}

/**
 * Fetch sheet title for gid=537408158 dynamically
 */
export async function getXuLyDonSheetTitle(accessToken: string): Promise<string> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets(properties(sheetId,title))`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.sheets && Array.isArray(data.sheets)) {
        for (const s of data.sheets) {
          if (s.properties?.sheetId === GID_XU_LY_DON) {
            return s.properties.title;
          }
        }
      }
    }
  } catch (e) {
    console.warn('Could not query sheet properties, using default "So xu ly don":', e);
  }
  return 'So xu ly don';
}

/**
 * Append citizen record to Google Sheets
 * Format matching columns A -> M:
 * 1: STT
 * 2: Ngày tiếp
 * 3: "Họ tên, địa chỉ"
 * 4: CCCD/Hộ chiếu
 * 5: Nội dung vụ việc
 * 6: Phân loại đơn
 * 7: Số người
 * 8: Cơ quan đã giải quyết
 * 9: Thụ lý để giải quyết (x)
 * 10: Trả lại đơn và hướng dẫn (ghi rõ nơi, số VB)
 * 11: Chuyển đơn (ghi rõ cơ quan, số VB)
 * 12: Theo dõi kết quả giải quyết
 * 13: Ghi chú
 */
export async function appendTiepDanRowToGoogleSheet(
  accessToken: string,
  rowValues: (string | number)[]
): Promise<AppendResult> {
  try {
    const sheetTitle = await getTiepDanSheetTitle(accessToken);
    const range = `'${sheetTitle}'!A:M`;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range,
          majorDimension: 'ROWS',
          values: [rowValues],
        }),
      }
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error?.message || `Lỗi Google Sheets API: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      updatedRange: data?.updates?.updatedRange,
    };
  } catch (error: any) {
    console.error('Failed to append Tiep Dan row to Google Sheet:', error);
    return {
      success: false,
      error: error.message || 'Lỗi không xác định khi lưu vào Google Sheets.',
    };
  }
}

/**
 * Append petition processing record to Google Sheets ("So xu ly don")
 * Format matching columns A -> T (20 columns):
 * 1: STT
 * 2: Ngày nhận
 * 3: Số đến
 * 4: Nguồn nhận
 * 5: Họ tên người gửi
 * 6: Địa chỉ/liên hệ
 * 7: Loại đơn
 * 8: Tóm tắt nội dung
 * 9: Đủ điều kiện xử lý?
 * 10: Thuộc thẩm quyền?
 * 11: Hướng xử lý
 * 12: Số, ngày văn bản xử lý
 * 13: Cơ quan nhận/chủ trì
 * 14: Ngày chuyển/hướng dẫn
 * 15: Hạn theo dõi
 * 16: Tình trạng
 * 17: Kết quả giải quyết
 * 18: Ngày có kết quả
 * 19: Cán bộ theo dõi
 * 20: Ghi chú
 */
export async function appendXuLyDonRowToGoogleSheet(
  accessToken: string,
  rowValues: (string | number)[]
): Promise<AppendResult> {
  try {
    const sheetTitle = await getXuLyDonSheetTitle(accessToken);
    const range = `'${sheetTitle}'!A:T`;

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range,
          majorDimension: 'ROWS',
          values: [rowValues],
        }),
      }
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error?.message || `Lỗi Google Sheets API: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      updatedRange: data?.updates?.updatedRange,
    };
  } catch (error: any) {
    console.error('Failed to append Xu Ly Don row to Google Sheet:', error);
    return {
      success: false,
      error: error.message || 'Lỗi không xác định khi lưu vào Google Sheets.',
    };
  }
}

/**
 * Fetch real-time Tiep Dan records from Google Sheets
 */
export async function fetchTiepDanRealtime(accessToken?: string | null, customUrl?: string): Promise<TiepDanRecord[]> {
  // Method 1: Google Sheets REST API v4
  if (accessToken) {
    try {
      const sheetTitle = await getTiepDanSheetTitle(accessToken);
      const range = `'${sheetTitle}'!A:M`;
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const rows: string[][] = json.values || [];
        let headerIdx = -1;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i]?.some(c => c && (c.includes('STT') || c.includes('Ngày tiếp')))) {
            headerIdx = i;
            break;
          }
        }
        if (headerIdx !== -1) {
          const dataRows = rows.slice(headerIdx + 1);
          const records: TiepDanRecord[] = [];
          for (const row of dataRows) {
            if (!row || row.length < 3 || !row[0]?.trim()) continue;
            const stt = parseInt(row[0].trim(), 10);
            if (isNaN(stt)) continue;
            const ngayTiepRaw = row[1]?.trim() || '';
            const { year, month, quarter, formatted } = parseDateComponents(ngayTiepRaw);
            const hoTenDiaChiRaw = row[2]?.trim() || '';
            let hoTen = hoTenDiaChiRaw;
            let diaChi = '';
            if (hoTenDiaChiRaw.includes('\n')) {
              const lines = hoTenDiaChiRaw.split('\n');
              hoTen = lines[0].trim();
              diaChi = lines.slice(1).join(', ').trim();
            }
            const cccd = row[3]?.trim() || '';
            const noiDung = row[4]?.trim() || '';
            const loaiDon = row[5]?.trim() || 'Phản ánh';
            const soNguoi = parseInt(row[6]?.trim() || '1', 10) || 1;
            const coQuanGiaiQuyet = row[7]?.trim() || 'UBND phường Trà Câu';
            const thuLy = (row[8]?.trim().toLowerCase() === 'x' || row[8]?.trim().toLowerCase() === 'có');
            const traLaiHuongDan = row[9]?.trim() || '';
            const chuyenDon = row[10]?.trim() || '';
            const theoDoiKetQua = row[11]?.trim() || 'Đang theo dõi';
            const ghiChu = row[12]?.trim() || '';
            const toDanPho = extractTDP(diaChi || hoTenDiaChiRaw);

            records.push({
              id: `TD-${stt}-${year}`,
              stt,
              ngayTiep: formatted,
              ngayTiepRaw,
              year,
              month,
              quarter,
              hoTen,
              diaChi,
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
          if (records.length > 0) return records;
        }
      }
    } catch (e) {
      console.warn('Google Sheets API v4 fetch for Tiep Dan failed, falling back to export endpoint:', e);
    }
  }

  // Method 2: Direct CSV Export with cache-busting timestamp
  try {
    const targetUrl = `${customUrl || SHEET_URLS.tiepDan}&_cb=${Date.now()}`;
    const res = await fetch(targetUrl);
    if (res.ok) {
      const text = await res.text();
      const parsed = parseTiepDanCSV(text);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('CSV export fetch for Tiep Dan failed:', e);
  }

  return [];
}

/**
 * Fetch real-time Xu Ly Don records from Google Sheets
 */
export async function fetchXuLyDonRealtime(accessToken?: string | null, customUrl?: string): Promise<XuLyDonRecord[]> {
  // Method 1: Google Sheets REST API v4
  if (accessToken) {
    try {
      const sheetTitle = await getXuLyDonSheetTitle(accessToken);
      const range = `'${sheetTitle}'!A:T`;
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const rows: string[][] = json.values || [];
        let headerIdx = -1;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i]?.some(c => c && (c.includes('STT') || c.includes('Số đến') || c.includes('Ngày nhận')))) {
            headerIdx = i;
            break;
          }
        }
        if (headerIdx !== -1) {
          const dataRows = rows.slice(headerIdx + 1);
          const records: XuLyDonRecord[] = [];
          for (const row of dataRows) {
            if (!row || row.length < 5 || !row[0]?.trim()) continue;
            const sttNum = parseInt(row[0].trim(), 10);
            if (isNaN(sttNum)) continue;
            const ngayNhanRaw = row[1]?.trim() || '';
            const { year, month, quarter, formatted } = parseDateComponents(ngayNhanRaw);
            const soDen = row[2]?.trim() || `Đ-2026-${String(sttNum).padStart(3, '0')}`;
            const nguonNhan = (row[3]?.trim() || 'Trực tiếp') as NguonNhan;
            const hoTenNguoiGui = row[4]?.trim() || '';
            const diaChiLienHe = row[5]?.trim() || 'Phường Trà Câu, tỉnh Quảng Ngãi';
            const loaiDon = (row[6]?.trim() || 'Phản ánh') as LoaiDon;
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
          if (records.length > 0) return records;
        }
      }
    } catch (e) {
      console.warn('Google Sheets API v4 fetch for Xu Ly Don failed, falling back to export endpoint:', e);
    }
  }

  // Method 2: Direct CSV Export with cache-busting timestamp
  try {
    const targetUrl = `${customUrl || SHEET_URLS.xuLyDon}&_cb=${Date.now()}`;
    const res = await fetch(targetUrl);
    if (res.ok) {
      const text = await res.text();
      const parsed = parseXuLyDonCSV(text);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('CSV export fetch for Xu Ly Don failed:', e);
  }

  return [];
}

