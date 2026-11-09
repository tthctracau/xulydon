import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Settings2, 
  Eye, 
  Sparkles,
  Building,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import { XuLyDonFilterState, XuLyDonRecord } from '../../types';
import { exportToWordDoc } from '../../utils/exportHelpers';

interface XuLyDonAutoReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredRecords: XuLyDonRecord[];
  allRecords: XuLyDonRecord[];
  filter: XuLyDonFilterState;
}

export const XuLyDonAutoReportModal: React.FC<XuLyDonAutoReportModalProps> = ({
  isOpen,
  onClose,
  filteredRecords,
  allRecords,
  filter,
}) => {
  if (!isOpen) return null;

  // Configuration options that user can tune
  const [reportTitle, setReportTitle] = useState(() => {
    let title = 'BÁO CÁO KẾT QUẢ TIẾP NHẬN, PHÂN LOẠI VÀ XỬ LÝ ĐƠN THƯ';
    if (filter.loaiDon !== 'all') {
      title += ` LOẠI ${filter.loaiDon.toUpperCase()}`;
    }
    if (filter.tinhTrang !== 'all') {
      title += ` (${filter.tinhTrang.toUpperCase()})`;
    }
    return title;
  });

  const [signerTitle, setSignerTitle] = useState('CHỦ TỊCH UBND PHƯỜNG');
  const [signerName, setSignerName] = useState('Nguyễn Văn Tuấn');
  const [reporterTitle, setReporterTitle] = useState('CÁN BỘ TIẾP NHẬN & XỬ LÝ ĐƠN');
  const [reporterName, setReporterName] = useState('Trần Văn Bình');
  const [reportDate, setReportDate] = useState(() => {
    const today = new Date();
    return `Trà Câu, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  });
  const [reportNumber, setReportNumber] = useState('48/BC-UBND');
  const [customNotes, setCustomNotes] = useState(
    '100% các đơn tiếp nhận đều được phân loại, xử lý kịp thời theo đúng quy trình; không để xảy ra tình trạng khiếu kiện đông người, vượt cấp phức tạp.'
  );
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'settings'>('preview');
  const [copied, setCopied] = useState(false);

  // Statistics calculation for the report
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const byType: Record<string, number> = {
      'Phản ánh': 0,
      'Khiếu nại': 0,
      'Kiến nghị': 0,
      'Tố cáo': 0,
    };
    const bySource: Record<string, number> = {
      'Trực tiếp': 0,
      'Bưu chính': 0,
      'Trực tuyến': 0,
    };
    let thuocThamQuyen = 0;
    let duDieuKien = 0;
    let dangGiaiQuyet = 0;
    let daHuongDan = 0;
    let daChuyen = 0;
    let daHoanThanh = 0;

    filteredRecords.forEach(r => {
      if (byType[r.loaiDon] !== undefined) byType[r.loaiDon]++;
      else byType[r.loaiDon] = 1;

      if (bySource[r.nguonNhan] !== undefined) bySource[r.nguonNhan]++;
      else bySource[r.nguonNhan] = 1;

      if (r.thuocThamQuyen === 'Có') thuocThamQuyen++;
      if (r.duDieuKien === 'Có') duDieuKien++;

      if (r.tinhTrang.includes('Đang giải quyết') || r.tinhTrang.includes('Đang')) dangGiaiQuyet++;
      if (r.tinhTrang.includes('Đã hướng dẫn')) daHuongDan++;
      if (r.tinhTrang.includes('Đã chuyển')) daChuyen++;
      if (r.tinhTrang.includes('Hoàn thành') || (r.ngayCoKetQua && r.ngayCoKetQua.trim())) daHoanThanh++;
    });

    return {
      total,
      byType,
      bySource,
      thuocThamQuyen,
      duDieuKien,
      dangGiaiQuyet,
      daHuongDan,
      daChuyen,
      daHoanThanh,
    };
  }, [filteredRecords]);

  // Export to Word document (.doc)
  const handleExportWord = () => {
    const element = document.getElementById('printable-report-content');
    if (!element) return;
    exportToWordDoc(`Bao_Cao_Xu_Ly_Don_Thu_UBND_Tra_Cau_${new Date().toISOString().slice(0, 10)}`, element.innerHTML);
  };

  // Copy plain text content
  const handleCopyText = () => {
    const text = `
UBND PHƯỜNG TRÀ CÂU                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Số: ${reportNumber}                        Độc lập - Tự do - Hạnh phúc
                                       ${reportDate}

${reportTitle}

Kính gửi:
- Thường trực Đảng ủy phường Trà Câu;
- Thường trực HĐND phường Trà Câu;
- Chủ tịch, các Phó Chủ tịch UBND phường.

Căn cứ quy định pháp luật về tiếp công dân, giải quyết khiếu nại, tố cáo và Nghị định số 154/2026/NĐ-CP;
Căn cứ dữ liệu theo dõi tiếp nhận, phân loại và xử lý đơn thư tại UBND phường Trà Câu;
UBND phường báo cáo kết quả tổng hợp như sau:

I. TÌNH HÌNH TIẾP NHẬN ĐƠN THƯ
- Tổng số đơn tiếp nhận trong phạm vi báo cáo: ${stats.total} đơn.
- Phân theo nguồn tiếp nhận:
  + Trực tiếp tại bộ phận Một cửa: ${stats.bySource['Trực tiếp'] || 0} đơn.
  + Qua đường bưu chính: ${stats.bySource['Bưu chính'] || 0} đơn.
  + Qua dịch vụ công trực tuyến: ${stats.bySource['Trực tuyến'] || 0} đơn.

II. KẾT QUẢ PHÂN LOẠI VÀ XỬ LÝ
1. Phân loại theo tính chất nội dung:
  + Đơn Phản ánh: ${stats.byType['Phản ánh'] || 0} đơn.
  + Đơn Khiếu nại: ${stats.byType['Khiếu nại'] || 0} đơn.
  + Đơn Kiến nghị: ${stats.byType['Kiến nghị'] || 0} đơn.
  + Đơn Tố cáo: ${stats.byType['Tố cáo'] || 0} đơn.
2. Về điều kiện và thẩm quyền xử lý:
  + Đủ điều kiện xử lý: ${stats.duDieuKien}/${stats.total} đơn (${stats.total > 0 ? Math.round((stats.duDieuKien/stats.total)*100) : 0}%).
  + Thuộc thẩm quyền giải quyết của UBND phường: ${stats.thuocThamQuyen}/${stats.total} đơn (${stats.total > 0 ? Math.round((stats.thuocThamQuyen/stats.total)*100) : 0}%).
3. Kết quả giải quyết:
  + Đang trong hạn giải quyết, xác minh: ${stats.dangGiaiQuyet} đơn.
  + Đã hướng dẫn công dân bổ sung hồ sơ: ${stats.daHuongDan} đơn.
  + Đã chuyển cơ quan có thẩm quyền: ${stats.daChuyen} đơn.
  + Đã có kết quả giải quyết hoàn thành: ${stats.daHoanThanh} đơn.

III. NHẬN XÉT, ĐÁNH GIÁ
${customNotes}

Nơi nhận:                               ${signerTitle}
- Như trên;                             (Ký, ghi rõ họ tên và đóng dấu)
- Lưu VT, Hồ sơ TCD.
                                        ${signerName}
    `;

    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden transform transition-all animate-in fade-in duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Trình Tạo Báo Cáo Tự Động Theo Bộ Lọc Thông Minh
              </h3>
              <p className="text-xs text-slate-300">
                UBND Phường Trà Câu • Tự động tổng hợp số liệu theo thời gian thực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg transition border border-slate-700"
              title="Sao chép nội dung văn bản"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
            </button>

            <button
              onClick={handleExportWord}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium"
              title="Tải văn bản Word (.doc)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file Word</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-medium"
              title="In báo cáo chuẩn A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In báo cáo</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-tab switcher: Preview vs Settings */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeSubTab === 'preview'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước báo cáo A4</span>
            </button>

            <button
              onClick={() => setActiveSubTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeSubTab === 'settings'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Tùy chỉnh thông tin người ký & tiêu đề</span>
            </button>
          </div>

          <div className="text-slate-500 hidden sm:block">
            Đang báo cáo <strong className="text-indigo-600">{filteredRecords.length}</strong> đơn thỏa tiêu chuẩn lọc
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
          {activeSubTab === 'settings' ? (
            /* Settings form */
            <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
              <h4 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-600" />
                Cấu hình thông tin báo cáo hành chính
              </h4>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu đề báo cáo
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số văn bản báo cáo
                  </label>
                  <input
                    type="text"
                    value={reportNumber}
                    onChange={(e) => setReportNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Địa danh & Ngày tháng
                  </label>
                  <input
                    type="text"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chức danh người ký duyệt
                  </label>
                  <input
                    type="text"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ tên người ký duyệt
                  </label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nhận xét & Phương hướng nhiệm vụ bổ sung
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveSubTab('preview')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  Áp dụng & Xem trước báo cáo
                </button>
              </div>
            </div>
          ) : (
            /* Printable Report Preview in Standard Vietnamese A4 Format */
            <div 
              id="printable-report-content"
              className="max-w-[210mm] mx-auto bg-white p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 text-sm leading-relaxed"
              style={{ minHeight: '297mm', fontFamily: "'Times New Roman', Times, serif" }}
            >
              {/* Official Administrative Top Header */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300">
                <div className="text-center">
                  <p className="uppercase text-xs font-semibold text-slate-700">
                    ỦY BAN NHÂN DÂN<br />PHƯỜNG TRÀ CÂU
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    Số: {reportNumber}
                  </p>
                  <div className="w-24 h-[1px] bg-slate-700 mx-auto mt-1"></div>
                </div>

                <div className="text-center">
                  <p className="uppercase text-xs font-bold text-slate-900">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                  </p>
                  <p className="text-xs font-bold text-slate-800 italic underline underline-offset-2">
                    Độc lập - Tự do - Hạnh phúc
                  </p>
                  <p className="text-xs italic text-slate-600 mt-2">
                    {reportDate}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center my-6">
                <h2 className="text-base sm:text-lg font-bold uppercase text-slate-900 tracking-wide">
                  {reportTitle}
                </h2>
                <div className="text-xs text-slate-600 italic mt-1">
                  (Tổng hợp tự động từ phần mềm quản lý Sổ theo dõi tiếp nhận, phân loại và xử lý đơn)
                </div>
              </div>

              {/* Recipient */}
              <div className="mb-6 text-xs italic">
                <p className="font-semibold text-slate-800">Kính gửi:</p>
                <p className="pl-4">- Thường trực Đảng ủy phường Trà Câu;</p>
                <p className="pl-4">- Thường trực Hội đồng nhân dân phường Trà Câu;</p>
                <p className="pl-4">- Lãnh đạo Ủy ban nhân dân phường Trà Câu.</p>
              </div>

              {/* Introductory paragraph */}
              <p className="text-xs leading-relaxed text-justify mb-4">
                Căn cứ Luật Khiếu nại, Luật Tố cáo, Luật Tiếp công dân và Nghị định số 154/2026/NĐ-CP; thực hiện quy chế làm việc và công tác theo dõi tiếp nhận, phân loại và xử lý đơn thư của tổ chức, công dân trên địa bàn, Ủy ban nhân dân phường Trà Câu tổng hợp, báo cáo tình hình xử lý đơn thư cụ thể như sau:
              </p>

              {/* Section 1 */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  I. TÌNH HÌNH TIẾP NHẬN ĐƠN THƯ
                </h4>
                <p className="text-xs text-justify leading-relaxed mb-2">
                  Trong kỳ báo cáo, toàn phường đã tiếp nhận tổng cộng <strong>{stats.total}</strong> đơn thư 
                  {filter.loaiDon !== 'all' ? ` thuộc loại đơn ${filter.loaiDon}` : ''}
                  {filter.tinhTrang !== 'all' ? ` (với trạng thái: ${filter.tinhTrang})` : ''}
                  . Các đơn được tiếp nhận qua nhiều kênh chính thức bảo đảm công khai, minh bạch:
                </p>
                <ul className="text-xs space-y-1 list-disc pl-6">
                  <li>Tiếp nhận trực tiếp tại Bộ phận Một cửa: <strong>{stats.bySource['Trực tiếp'] || 0}</strong> đơn ({stats.total > 0 ? Math.round(((stats.bySource['Trực tiếp'] || 0) / stats.total) * 100) : 0}%).</li>
                  <li>Tiếp nhận qua đường Bưu chính: <strong>{stats.bySource['Bưu chính'] || 0}</strong> đơn ({stats.total > 0 ? Math.round(((stats.bySource['Bưu chính'] || 0) / stats.total) * 100) : 0}%).</li>
                  <li>Tiếp nhận qua Cổng Dịch vụ công / Hệ thống trực tuyến: <strong>{stats.bySource['Trực tuyến'] || 0}</strong> đơn ({stats.total > 0 ? Math.round(((stats.bySource['Trực tuyến'] || 0) / stats.total) * 100) : 0}%).</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  II. KẾT QUẢ PHÂN LOẠI VÀ XỬ LÝ ĐƠN THƯ
                </h4>
                
                <p className="text-xs font-semibold mb-1">1. Về cơ cấu tính chất đơn:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-slate-500 block">Phản ánh:</span>
                    <strong className="text-sm font-bold">{stats.byType['Phản ánh'] || 0}</strong> đơn
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-slate-500 block">Khiếu nại:</span>
                    <strong className="text-sm font-bold">{stats.byType['Khiếu nại'] || 0}</strong> đơn
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-slate-500 block">Kiến nghị:</span>
                    <strong className="text-sm font-bold">{stats.byType['Kiến nghị'] || 0}</strong> đơn
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-slate-500 block">Tố cáo:</span>
                    <strong className="text-sm font-bold">{stats.byType['Tố cáo'] || 0}</strong> đơn
                  </div>
                </div>

                <p className="text-xs font-semibold mb-1">2. Về thẩm quyền và điều kiện thụ lý:</p>
                <ul className="text-xs space-y-1 list-disc pl-6 mb-3">
                  <li>Đơn đủ điều kiện xử lý theo quy định: <strong>{stats.duDieuKien} / {stats.total}</strong> đơn đạt tỷ lệ <strong>{stats.total > 0 ? Math.round((stats.duDieuKien / stats.total) * 100) : 0}%</strong>.</li>
                  <li>Đơn thuộc thẩm quyền trực tiếp của UBND phường: <strong>{stats.thuocThamQuyen} / {stats.total}</strong> đơn ({stats.total > 0 ? Math.round((stats.thuocThamQuyen / stats.total) * 100) : 0}%).</li>
                  <li>Đơn không thuộc thẩm quyền cấp xã/phường: <strong>{stats.total - stats.thuocThamQuyen}</strong> đơn (đã thực hiện thủ tục chuyển đơn hoặc hướng dẫn theo thẩm quyền).</li>
                </ul>

                <p className="text-xs font-semibold mb-1">3. Tiến độ và kết quả giải quyết:</p>
                <ul className="text-xs space-y-1 list-disc pl-6">
                  <li>Số vụ việc đang trong hạn xác minh, thẩm tra giải quyết: <strong>{stats.dangGiaiQuyet}</strong> vụ việc.</li>
                  <li>Số vụ việc đã có văn bản hướng dẫn công dân bổ sung hồ sơ / gửi đúng cơ quan: <strong>{stats.daHuongDan}</strong> vụ việc.</li>
                  <li>Số vụ việc đã lập phiếu chuyển cơ quan cấp trên hoặc chuyên môn: <strong>{stats.daChuyen}</strong> vụ việc.</li>
                  <li>Số vụ việc đã có kết quả giải quyết hoàn thành dứt điểm: <strong>{stats.daHoanThanh}</strong> vụ việc.</li>
                </ul>
              </div>

              {/* Section 3: Summary Table */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  III. BẢNG PHỤ LỤC DANH MỤC CÁC ĐƠN THƯ THEO TIÊU CHÍ LỌC ({filteredRecords.length} ĐƠN)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 text-center font-bold">
                        <th className="border border-slate-400 p-1 w-8">STT</th>
                        <th className="border border-slate-400 p-1 w-16">Số đến</th>
                        <th className="border border-slate-400 p-1 w-20">Người gửi</th>
                        <th className="border border-slate-400 p-1 w-16">Loại đơn</th>
                        <th className="border border-slate-400 p-1">Tóm tắt nội dung vụ việc</th>
                        <th className="border border-slate-400 p-1 w-28">Hướng xử lý</th>
                        <th className="border border-slate-400 p-1 w-20">Hạn theo dõi</th>
                        <th className="border border-slate-400 p-1 w-20">Tình trạng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((r, idx) => (
                        <tr key={r.id} className="align-top">
                          <td className="border border-slate-400 p-1 text-center font-medium">{idx + 1}</td>
                          <td className="border border-slate-400 p-1 font-mono text-center">{r.soDen}</td>
                          <td className="border border-slate-400 p-1 font-semibold">{r.hoTenNguoiGui}</td>
                          <td className="border border-slate-400 p-1 text-center">{r.loaiDon}</td>
                          <td className="border border-slate-400 p-1 text-justify leading-snug">{r.tomTatNoiDung}</td>
                          <td className="border border-slate-400 p-1">{r.huongXuLy}</td>
                          <td className="border border-slate-400 p-1 text-center">{r.hanTheoDoi}</td>
                          <td className="border border-slate-400 p-1 text-center font-medium">{r.tinhTrang}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4 */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                  IV. ĐÁNH GIÁ CHUNG VÀ NHIỆM VỤ TRỌNG TÂM
                </h4>
                <p className="text-xs text-justify leading-relaxed mb-2">
                  {customNotes}
                </p>
                <p className="text-xs text-justify leading-relaxed">
                  Trong thời gian tới, UBND phường Trà Câu tiếp tục chỉ đạo bộ phận chuyên môn, cán bộ phụ trách tư pháp - tiếp dân tăng cường đôn đốc các vụ việc đang xác minh; chủ động theo dõi tiến độ phản hồi từ các cơ quan đã chuyển đơn để thông tin kịp thời cho công dân theo quy định của pháp luật.
                </p>
              </div>

              {/* Signature block */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-xs">
                <div>
                  <p className="font-bold text-slate-800 uppercase">Nơi nhận:</p>
                  <p className="text-[11px] text-slate-600">- Như kính gửi;</p>
                  <p className="text-[11px] text-slate-600">- Chủ tịch, các PCT UBND;</p>
                  <p className="text-[11px] text-slate-600">- Bộ phận Một cửa - Tiếp dân;</p>
                  <p className="text-[11px] text-slate-600">- Lưu: VT, HS TCD.</p>
                </div>

                <div className="text-center">
                  <p className="font-bold uppercase text-slate-900">
                    {signerTitle}
                  </p>
                  <p className="italic text-slate-500 text-[11px]">
                    (Ký, ghi rõ họ tên và đóng dấu)
                  </p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-xs text-slate-300 italic no-print">[Chữ ký & Dấu đỏ điện tử]</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">
                    {signerName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between no-print">
          <div className="text-xs text-slate-500">
            Mẫu báo cáo tuân thủ Nghị định 154/2026/NĐ-CP và Nghị định 30/2020/NĐ-CP về công tác văn thư
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
