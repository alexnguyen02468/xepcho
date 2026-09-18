import React from 'react';
import { Eye, Download, FileSpreadsheet } from 'lucide-react';
import { ClassSeatingResult } from '../types';
import { SeatingStats } from './SeatingStats';
import { handleDownloadCsv } from '../utils/excelExport';

interface SeatingPreviewProps {
  resultClasses: ClassSeatingResult[];
  selectedClassIdx: number;
  setSelectedClassIdx: (idx: number) => void;
  goodMachinesCount: number;
  onExportAllExcel: () => void;
}

export const SeatingPreview: React.FC<SeatingPreviewProps> = ({
  resultClasses,
  selectedClassIdx,
  setSelectedClassIdx,
  goodMachinesCount,
  onExportAllExcel
}) => {
  if (resultClasses.length === 0) return null;

  const currentClass = resultClasses[selectedClassIdx];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Bước 4: Bảng xem trước kết quả & Thống kê phân bổ máy
            </h3>
            <p className="text-xs text-slate-500">
              Thống kê chi tiết số lượng máy ngồi 1 HS, 2 HS, 3 HS cho từng lớp và lịch xoay vòng 35 tuần
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onExportAllExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải lại file Excel (.xlsx)</span>
          </button>
          {currentClass && (
            <button
              type="button"
              onClick={() => handleDownloadCsv(currentClass)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Tải file CSV cho lớp đang xem"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Tải CSV lớp này</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary & Machine Breakdown */}
      <SeatingStats
        resultClasses={resultClasses}
        selectedClassIdx={selectedClassIdx}
        setSelectedClassIdx={setSelectedClassIdx}
        goodMachinesCount={goodMachinesCount}
      />

      {/* Tab Switcher for Multiple Classes */}
      {resultClasses.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Chọn lớp xem chi tiết:</span>
          <div className="flex items-center gap-1.5">
            {resultClasses.map((cls, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedClassIdx(idx)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedClassIdx === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cls.className || `Lớp ${idx + 1}`} ({cls.students.length} HS)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 35-Week Interactive Table */}
      {currentClass && (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              Danh sách chỗ ngồi 35 tuần — Lớp {currentClass.className} ({currentClass.students.length} học sinh)
            </span>
            <span className="italic text-slate-500">
              * Cột STT & Họ tên cố định, cuộn ngang để xem tất cả 35 tuần
            </span>
          </div>

          <div className="overflow-x-auto max-h-[520px] scrollbar-thin">
            <table className="min-w-full text-xs divide-y divide-slate-200 text-center border-collapse">
              <thead className="bg-indigo-50 sticky top-0 z-20 shadow-2xs">
                <tr>
                  <th className="py-2.5 px-3 font-bold text-indigo-950 border-r border-indigo-100 sticky left-0 bg-indigo-50 z-30 w-12 text-center">
                    STT
                  </th>
                  <th className="py-2.5 px-4 font-bold text-indigo-950 border-r border-indigo-100 sticky left-12 bg-indigo-50 z-30 min-w-[190px] text-left">
                    Họ và tên
                  </th>
                  {Array.from({ length: 35 }, (_, w) => (
                    <th
                      key={w}
                      className="py-2.5 px-3 font-bold text-indigo-950 border-r border-indigo-100 min-w-[115px] whitespace-nowrap"
                    >
                      Tuần {w + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {currentClass.students.map((student, sIdx) => {
                  const isEven = sIdx % 2 === 0;
                  return (
                    <tr
                      key={sIdx}
                      className={isEven ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/70 hover:bg-blue-50/40'}
                    >
                      <td
                        className={`py-2 px-3 font-medium text-slate-600 border-r border-slate-200 sticky left-0 z-10 ${
                          isEven ? 'bg-white' : 'bg-slate-50'
                        }`}
                      >
                        {student.stt}
                      </td>
                      <td
                        className={`py-2 px-4 font-semibold text-slate-900 border-r border-slate-200 text-left sticky left-12 z-10 whitespace-nowrap ${
                          isEven ? 'bg-white' : 'bg-slate-50'
                        }`}
                      >
                        {student.name}
                      </td>
                      {student.weeks.map((seat, wIdx) => {
                        const isShared = seat.startsWith('Ngồi chung');
                        return (
                          <td
                            key={wIdx}
                            className="py-1.5 px-2 border-r border-slate-100 whitespace-nowrap text-center"
                          >
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium tracking-tight ${
                                isShared
                                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              }`}
                            >
                              {seat}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
