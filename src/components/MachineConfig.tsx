import React, { useRef } from 'react';
import { Monitor, AlertTriangle, CheckCircle2, Download, FileUp, X } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { BrokenFileStatus } from '../types';

interface MachineConfigProps {
  totalMachines: number;
  setTotalMachines: (n: number) => void;
  brokenMachinesStr: string;
  setBrokenMachinesStr: (s: string) => void;
  parsedBrokenList: number[];
  goodMachinesCount: number;
  assignShared: boolean;
  setAssignShared: (b: boolean) => void;
  brokenExcelFile: File | null;
  setBrokenExcelFile: (f: File | null) => void;
  brokenFileStatus: BrokenFileStatus | null;
  setBrokenFileStatus: (status: BrokenFileStatus | null) => void;
  onDownloadBrokenTemplate: () => void;
}

export const MachineConfig: React.FC<MachineConfigProps> = ({
  totalMachines,
  setTotalMachines,
  brokenMachinesStr,
  setBrokenMachinesStr,
  parsedBrokenList,
  goodMachinesCount,
  assignShared,
  setAssignShared,
  brokenExcelFile,
  setBrokenExcelFile,
  brokenFileStatus,
  setBrokenFileStatus,
  onDownloadBrokenTemplate
}) => {
  const brokenFileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse Excel file for broken machines (Column A: Số máy, Column B: Bị hỏng)
  const handleBrokenMachinesFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          alert('File Excel rỗng!');
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

        if (!json || json.length === 0) {
          alert('Sheet dữ liệu trong file Excel rỗng!');
          return;
        }

        let machineColIndex = 0;
        let statusColIndex = 1;
        let startRowIndex = 0;

        let headerFound = false;
        const maxScanRows = Math.min(10, json.length);
        for (let r = 0; r < maxScanRows; r++) {
          const row = json[r];
          if (!row || !Array.isArray(row)) continue;

          let foundMachineCol = -1;
          let foundStatusCol = -1;

          row.forEach((cell, idx) => {
            const cellStr = String(cell || '').toLowerCase().trim();
            if (cellStr.includes('số máy') || cellStr.includes('so may') || cellStr === 'máy' || cellStr === 'may') {
              foundMachineCol = idx;
            }
            if (
              cellStr.includes('bị hỏng') ||
              cellStr.includes('bi hong') ||
              cellStr.includes('hỏng') ||
              cellStr.includes('hư') ||
              cellStr.includes('tình trạng') ||
              cellStr.includes('status')
            ) {
              foundStatusCol = idx;
            }
          });

          if (foundMachineCol !== -1 && foundStatusCol !== -1) {
            machineColIndex = foundMachineCol;
            statusColIndex = foundStatusCol;
            startRowIndex = r + 1;
            headerFound = true;
            break;
          }
        }

        if (!headerFound && json.length > 0) {
          const firstRow = json[0];
          const firstCellStr = String(firstRow?.[0] || '').trim();
          if (isNaN(Number(firstCellStr)) && !/\d+/.test(firstCellStr)) {
            startRowIndex = 1;
          } else {
            startRowIndex = 0;
          }
        }

        const brokenList: number[] = [];
        let maxMachineNumber = 0;

        for (let r = startRowIndex; r < json.length; r++) {
          const row = json[r];
          if (!row || row.length === 0) continue;

          const machineCell = row[machineColIndex];
          const statusCell = row[statusColIndex];

          if (machineCell === undefined || machineCell === null || String(machineCell).trim() === '') {
            continue;
          }

          let machineNum: number | null = null;
          if (typeof machineCell === 'number') {
            machineNum = Math.floor(machineCell);
          } else {
            const match = String(machineCell).match(/\d+/);
            if (match) {
              machineNum = parseInt(match[0], 10);
            }
          }

          if (machineNum !== null && !isNaN(machineNum) && machineNum > 0) {
            if (machineNum > maxMachineNumber) {
              maxMachineNumber = machineNum;
            }

            const statusStr = String(statusCell ?? '').trim().toLowerCase();
            const isBroken =
              statusStr === 'x' ||
              statusStr.startsWith('x') ||
              statusStr.includes('hỏng') ||
              statusStr.includes('hư') ||
              statusStr === '1';

            if (isBroken) {
              brokenList.push(machineNum);
            }
          }
        }

        const uniqueBroken = Array.from(new Set(brokenList)).sort((a, b) => a - b);
        setBrokenMachinesStr(uniqueBroken.join(', '));

        if (maxMachineNumber > 0 && maxMachineNumber > totalMachines) {
          setTotalMachines(maxMachineNumber);
        }

        setBrokenExcelFile(uploadedFile);
        setBrokenFileStatus({
          fileName: uploadedFile.name,
          brokenCount: uniqueBroken.length,
          totalInFile: maxMachineNumber || totalMachines,
          brokenList: uniqueBroken
        });
      } catch (err) {
        console.error('Lỗi khi đọc file máy hỏng:', err);
        alert('Có lỗi xảy ra khi đọc file Excel máy hỏng. Vui lòng kiểm tra lại cấu trúc file!');
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleClearBrokenExcel = () => {
    setBrokenExcelFile(null);
    setBrokenFileStatus(null);
    if (brokenFileInputRef.current) {
      brokenFileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-600" />
          <span>Cấu hình phòng máy & Danh sách máy hư</span>
        </h3>
        <button
          type="button"
          onClick={onDownloadBrokenTemplate}
          className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold bg-white hover:bg-blue-50/50 border border-blue-200 rounded-lg px-2.5 py-1.5 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Tải file Excel mẫu máy hỏng</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Số máy tính của phòng
          </label>
          <input
            type="number"
            min="1"
            value={totalMachines}
            onChange={e => setTotalMachines(parseInt(e.target.value) || 0)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Danh sách máy hư (nhập tay cách nhau bởi dấu phẩy)
          </label>
          <input
            type="text"
            value={brokenMachinesStr}
            onChange={e => setBrokenMachinesStr(e.target.value)}
            placeholder="Ví dụ: 4, 6, 8, 9, 11, 13, 14, 15"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow font-medium"
          />
        </div>
      </div>

      {/* Nhập từ file Excel máy hỏng */}
      <div className="pt-2 border-t border-slate-200/80">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          📁 Nhập từ file Excel máy hỏng (Cột A: Số máy | Cột B: Bị hỏng đánh dấu 'x')
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            ref={brokenFileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleBrokenMachinesFileUpload}
            className="hidden"
            id="broken-excel-upload"
          />
          <label
            htmlFor="broken-excel-upload"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-300 rounded-lg cursor-pointer transition-colors shadow-2xs"
          >
            <FileUp className="w-4 h-4 text-blue-600" />
            <span>{brokenExcelFile ? 'Chọn file Excel máy hỏng khác...' : 'Chọn file Excel máy hỏng (.xlsx, .xls)'}</span>
          </label>

          {brokenFileStatus && (
            <div className="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-emerald-900">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  <strong>{brokenFileStatus.fileName}</strong>: Phát hiện <strong>{brokenFileStatus.brokenCount} máy hỏng</strong> (Máy {brokenFileStatus.brokenList.join(', ') || 'không có'})
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearBrokenExcel}
                className="ml-2 text-emerald-700 hover:text-red-600 transition-colors p-1"
                title="Bỏ file này"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tóm tắt số lượng máy */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="inline-flex items-center gap-1.5 bg-slate-200/80 text-slate-800 px-3 py-1.5 rounded-lg font-medium">
          <Monitor className="w-3.5 h-3.5 text-slate-600" />
          Tổng phòng: <strong>{totalMachines}</strong> máy
        </span>
        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Máy hỏng: <strong>{parsedBrokenList.length}</strong> máy {parsedBrokenList.length > 0 && `(${parsedBrokenList.join(', ')})`}
        </span>
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Hoạt động tốt: <strong>{goodMachinesCount}</strong> máy
        </span>
      </div>

      {/* Checkbox chia đều */}
      <div className="flex items-start gap-2.5 bg-blue-50/70 p-3 rounded-lg border border-blue-100">
        <input
          type="checkbox"
          id="assignShared"
          checked={assignShared}
          onChange={(e) => setAssignShared(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer mt-0.5"
        />
        <div>
          <label htmlFor="assignShared" className="text-xs font-semibold text-blue-950 cursor-pointer select-none">
            Tự động chia đều máy cho các học sinh dư (Ghi rõ: "Ngồi chung Máy...")
          </label>
          <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
            Thuật toán chia đều thông minh: Ưu tiên 1 học sinh/máy; nếu sĩ số nhiều hơn máy tốt sẽ ghép 2 hs/máy; nếu thiếu nhiều máy sẽ cân đối đều 2 và 3 hs/máy (không bao giờ dồn 4–5 học sinh vào 1 máy).
          </p>
        </div>
      </div>
    </div>
  );
};
