import React from 'react';
import { Users, Info, FileSpreadsheet, Download, Sparkles } from 'lucide-react';
import { downloadStudentListTemplate, downloadBrokenMachinesTemplate } from '../utils/excelExport';

interface HeaderProps {
  totalMachines: number;
  onLoadSampleData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ totalMachines, onLoadSampleData }) => {
  return (
    <div className="space-y-4">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Xếp Chỗ Ngồi Thực Hành (35 Tuần)
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                by Alex Truong
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Phân bổ máy tính luân phiên thông minh, tự động xoay vòng đều cho học sinh cả năm học
            </p>
          </div>
        </div>

        {/* Quick Sample Action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onLoadSampleData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="Nạp ngay 2 lớp mẫu (10A1, 10A2) để xem thử kết quả"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Thử dữ liệu mẫu</span>
          </button>

          <button
            type="button"
            onClick={() => downloadStudentListTemplate()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
            title="Tải file Excel mẫu danh sách học sinh"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tải mẫu DS học sinh</span>
          </button>
        </div>
      </div>

      {/* Guide Box */}
      <div className="bg-blue-50/80 border-l-4 border-blue-500 p-4 rounded-r-lg text-sm text-blue-900 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
          <div className="space-y-1.5">
            <p className="font-semibold text-sm text-blue-950">💡 Hướng dẫn sử dụng: Xếp chỗ ngồi thực hành</p>
            <ul className="list-disc pl-5 text-xs text-blue-800 space-y-1">
              <li>
                <strong>Nguồn file:</strong> Chọn hoặc kéo thả File Excel danh sách học sinh vào khung bên dưới. Hệ thống tự động nhận diện và chỉ trích xuất 2 cột <strong>STT</strong> và <strong>Họ và tên</strong> (tự động bỏ qua Mã HS, Ngày sinh, Giới tính, v.v.).
              </li>
              <li>
                <strong>Khai báo máy hỏng:</strong> Có thể nhập tay danh sách máy hư (ví dụ: <code>4, 6, 8, 11</code>) hoặc <strong>nhập file Excel máy hỏng</strong> (Cột A là Số máy, Cột B là "Bị hỏng" đánh dấu chữ <code>x</code> hoặc <code>X</code>).
              </li>
              <li>
                <strong>Xếp chỗ & Xuất Excel:</strong> Bấm nút <strong>"Xếp chỗ & Xuất Excel"</strong>, hệ thống tự động xuất file Excel trong đó <strong>Sheet 1 là Bảng thống kê phân bổ máy</strong> (số máy ngồi 1 HS, 2 HS, 3 HS của từng lớp), các <strong>Sheet tiếp theo là chi tiết 35 tuần của từng lớp</strong> (37 cột: STT, Họ và tên, Tuần 1 đến Tuần 35).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
