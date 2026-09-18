import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx-js-style';
import { Header } from './components/Header';
import { MachineConfig } from './components/MachineConfig';
import { StudentUpload } from './components/StudentUpload';
import { SeatingPreview } from './components/SeatingPreview';
import {
  ClassSeatingResult,
  StudentFileInfo,
  BrokenFileStatus
} from './types';
import {
  generate35WeekSeating,
  getSampleClasses
} from './utils/seatingLogic';
import {
  downloadExcelFromData,
  downloadBrokenMachinesTemplate
} from './utils/excelExport';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [studentFileInfo, setStudentFileInfo] = useState<StudentFileInfo | null>(null);

  const [totalMachines, setTotalMachines] = useState<number>(44);
  const [brokenMachinesStr, setBrokenMachinesStr] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [assignShared, setAssignShared] = useState<boolean>(true);
  const [processSuccessMessage, setProcessSuccessMessage] = useState<string | null>(null);

  // States for calculated seating preview
  const [resultClasses, setResultClasses] = useState<ClassSeatingResult[]>([]);
  const [selectedClassIdx, setSelectedClassIdx] = useState<number>(0);

  // States for broken machines Excel file
  const [brokenExcelFile, setBrokenExcelFile] = useState<File | null>(null);
  const [brokenFileStatus, setBrokenFileStatus] = useState<BrokenFileStatus | null>(null);

  // Parse broken machines list
  const parsedBrokenList = useMemo(() => {
    return Array.from(
      new Set(
        brokenMachinesStr
          .split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n) && n > 0)
      )
    ).sort((a, b) => a - b);
  }, [brokenMachinesStr]);

  const goodMachinesCount = Math.max(0, totalMachines - parsedBrokenList.length);

  // Phân tích và nạp danh sách học sinh
  const handleSelectStudentFile = (selectedFile: File) => {
    if (!selectedFile) return;
    const nameLower = selectedFile.name.toLowerCase();
    if (!nameLower.endsWith('.xlsx') && !nameLower.endsWith('.xls')) {
      alert('Vui lòng chọn file Excel có đuôi .xlsx hoặc .xls');
      return;
    }

    setFile(selectedFile);
    setProcessSuccessMessage(null);
    setResultClasses([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const summaries: { name: string; count: number }[] = [];
        let totalCount = 0;

        workbook.SheetNames.forEach((sName) => {
          const sheet = workbook.Sheets[sName];
          if (!sheet) return;
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
          if (!json || json.length < 2) return;

          let studentCount = 0;
          for (let r = 0; r < json.length; r++) {
            const row = json[r];
            if (!row || row.length === 0) continue;
            const textCells = row.map(c => String(c || '').trim()).filter(Boolean);
            const hasStt = textCells.some(t => /^\d+$/.test(t));
            const hasName = textCells.some(t =>
              t.length > 2 &&
              !/^\d+$/.test(t) &&
              !t.toLowerCase().includes('stt') &&
              !t.toLowerCase().includes('họ và tên') &&
              !t.toLowerCase().startsWith('tổng') &&
              !t.toLowerCase().startsWith('ngày')
            );
            if (hasStt && hasName) {
              studentCount++;
            }
          }

          if (studentCount > 0) {
            summaries.push({ name: sName, count: studentCount });
            totalCount += studentCount;
          }
        });

        const sizeKb = (selectedFile.size / 1024).toFixed(1) + ' KB';
        setStudentFileInfo({
          fileName: selectedFile.name,
          size: sizeKb,
          classSummaries: summaries.length > 0 ? summaries : [{ name: selectedFile.name, count: totalCount }],
          totalStudents: totalCount
        });
      } catch (err) {
        console.warn('Lỗi đọc nhanh tóm tắt file:', err);
        setStudentFileInfo({
          fileName: selectedFile.name,
          size: (selectedFile.size / 1024).toFixed(1) + ' KB',
          classSummaries: [],
          totalStudents: 0
        });
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleClearStudentFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setStudentFileInfo(null);
    setResultClasses([]);
    setProcessSuccessMessage(null);
  };

  // Nạp dữ liệu mẫu thử nghiệm
  const handleLoadSampleData = () => {
    const sampleClasses = getSampleClasses();
    const brokenMachines = new Set(parsedBrokenList);
    const goodMachines: number[] = [];
    for (let i = 1; i <= totalMachines; i++) {
      if (!brokenMachines.has(i)) {
        goodMachines.push(i);
      }
    }

    if (goodMachines.length === 0) {
      alert('Vui lòng kiểm tra lại cấu hình: cần ít nhất 1 máy tính tốt!');
      return;
    }

    const computed: ClassSeatingResult[] = sampleClasses.map((cls) => ({
      className: cls.className,
      totalGoodMachines: goodMachines.length,
      students: generate35WeekSeating(
        cls.students.map(s => ({ stt: s.stt, name: s.name })),
        goodMachines,
        assignShared
      )
    }));

    setResultClasses(computed);
    setSelectedClassIdx(0);
    setProcessSuccessMessage(
      `Đã nạp thành công dữ liệu mẫu gồm 2 lớp (10A1 và 10A2) với ${goodMachines.length} máy tốt. Bạn có thể xem kết quả trực tiếp hoặc bấm "Tải lại file Excel (.xlsx)"!`
    );
  };

  // Xử lý tính toán và xuất Excel
  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const brokenMachines = new Set(parsedBrokenList);
      const goodMachines: number[] = [];
      for (let i = 1; i <= totalMachines; i++) {
        if (!brokenMachines.has(i)) {
          goodMachines.push(i);
        }
      }

      const countGood = goodMachines.length;
      if (countGood <= 0) {
        alert('Không có máy tính hoạt động tốt để xếp!');
        setIsProcessing(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const computedClasses: ClassSeatingResult[] = [];
          let totalStudentsProcessed = 0;

          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) return;
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];

            if (!json || json.length < 2) return;

            let headerRowIdx = -1;
            let sttColIdx = -1;
            let nameColIdx = -1;
            let hoColIdx = -1;
            let tenColIdx = -1;

            const maxScan = Math.min(25, json.length);
            for (let r = 0; r < maxScan; r++) {
              const row = json[r];
              if (!row || !Array.isArray(row)) continue;

              let tempStt = -1;
              let tempName = -1;
              let tempHo = -1;
              let tempTen = -1;

              row.forEach((cell, cIdx) => {
                const txt = String(cell || '').toLowerCase().trim();
                if (txt === 'stt' || txt.startsWith('stt') || txt.includes('số tt') || txt.includes('thứ tự')) {
                  tempStt = cIdx;
                } else if (
                  txt === 'họ và tên' ||
                  txt === 'họ tên' ||
                  txt === 'ho va ten' ||
                  txt === 'ho ten' ||
                  txt.includes('họ và tên') ||
                  txt.includes('họ tên') ||
                  txt.includes('tên học sinh') ||
                  txt === 'học sinh'
                ) {
                  tempName = cIdx;
                } else if (txt === 'họ' || txt === 'họ và' || txt === 'họ và đệm' || txt === 'họ lót' || txt === 'ho dem' || txt === 'ho lot') {
                  tempHo = cIdx;
                } else if (txt === 'tên' || txt === 'ten') {
                  tempTen = cIdx;
                }
              });

              if (tempName !== -1 || (tempHo !== -1 && tempTen !== -1)) {
                headerRowIdx = r;
                sttColIdx = tempStt;
                nameColIdx = tempName;
                hoColIdx = tempHo;
                tenColIdx = tempTen;
                break;
              }
            }

            if (headerRowIdx === -1) {
              for (let r = 0; r < Math.min(5, json.length); r++) {
                const row = json[r];
                if (row && row.length >= 2) {
                  const val0 = String(row[0] || '').trim();
                  const val1 = String(row[1] || '').trim();
                  if ((/^\d+$/.test(val0) || val0.toLowerCase().includes('stt')) && val1.length > 1) {
                    headerRowIdx = /^\d+$/.test(val0) ? r - 1 : r;
                    sttColIdx = 0;
                    nameColIdx = 1;
                    break;
                  }
                }
              }
            }

            if (headerRowIdx === -1) {
              headerRowIdx = 0;
              sttColIdx = 0;
              nameColIdx = 1;
            }

            interface StudentItem {
              stt: number | string;
              name: string;
            }

            const students: StudentItem[] = [];
            let autoIndex = 1;
            const startDataRow = Math.max(0, headerRowIdx + 1);

            for (let r = startDataRow; r < json.length; r++) {
              const row = json[r];
              if (!row || row.length === 0) continue;

              let fullName = '';
              if (nameColIdx !== -1 && row[nameColIdx] !== undefined && row[nameColIdx] !== null) {
                fullName = String(row[nameColIdx]).trim();
              } else if (hoColIdx !== -1 && tenColIdx !== -1) {
                const ho = String(row[hoColIdx] || '').trim();
                const ten = String(row[tenColIdx] || '').trim();
                fullName = `${ho} ${ten}`.trim();
              } else if (row[1] !== undefined && row[1] !== null) {
                fullName = String(row[1]).trim();
              }

              if (!fullName) continue;
              const lowerName = fullName.toLowerCase();
              if (
                lowerName === 'họ và tên' ||
                lowerName === 'họ tên' ||
                lowerName.startsWith('tổng số') ||
                lowerName.startsWith('tổng cộng') ||
                lowerName.startsWith('danh sách') ||
                lowerName.startsWith('ngày') ||
                lowerName.includes('hiệu trưởng') ||
                lowerName.includes('giáo viên') ||
                lowerName.includes('người lập')
              ) {
                continue;
              }

              let sttVal: number | string = autoIndex;
              if (sttColIdx !== -1 && row[sttColIdx] !== undefined && row[sttColIdx] !== null) {
                const rawStt = String(row[sttColIdx]).trim();
                const parsedStt = parseInt(rawStt, 10);
                if (!isNaN(parsedStt) && parsedStt > 0) {
                  sttVal = parsedStt;
                }
              }

              students.push({
                stt: sttVal,
                name: fullName
              });
              autoIndex++;
            }

            const N = students.length;
            if (N === 0) return;

            totalStudentsProcessed += N;

            const assignments = generate35WeekSeating(students, goodMachines, assignShared);

            computedClasses.push({
              className: sheetName,
              totalGoodMachines: countGood,
              students: assignments
            });
          });

          if (computedClasses.length === 0) {
            alert('Không tìm thấy danh sách học sinh hợp lệ trong file Excel đã chọn. Vui lòng kiểm tra lại cấu trúc file (cần có ít nhất cột STT và Họ và tên)!');
            setIsProcessing(false);
            return;
          }

          // Xuất file Excel chuẩn ExcelJS có đầy đủ 37 cột và Sheet 1 là Thống kê
          await downloadExcelFromData(computedClasses, totalMachines, countGood, parsedBrokenList);

          // Cập nhật kết quả vào state để người dùng xem trực tiếp trên web
          setResultClasses(computedClasses);
          setSelectedClassIdx(0);
          setProcessSuccessMessage(
            `Đã xuất thành công file xếp chỗ cho ${computedClasses.length} lớp (${totalStudentsProcessed} học sinh)! File Excel đã được tải về máy tính.`
          );
          setIsProcessing(false);
        } catch (err) {
          console.error(err);
          alert('Có lỗi xảy ra khi xử lý file: ' + (err instanceof Error ? err.message : String(err)));
          setIsProcessing(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi xử lý file!');
      setIsProcessing(false);
    }
  };

  const handleExportAllExcel = () => {
    if (resultClasses.length === 0) return;
    downloadExcelFromData(resultClasses, totalMachines, goodMachinesCount, parsedBrokenList);
  };

  return (
    <div
      className="min-h-screen bg-slate-100/60 py-6 px-3 sm:px-6 lg:px-8 font-sans text-slate-900"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Main Card */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* Header & Instructions */}
          <Header
            totalMachines={totalMachines}
            onLoadSampleData={handleLoadSampleData}
          />

          {/* Machine & Broken Configuration */}
          <MachineConfig
            totalMachines={totalMachines}
            setTotalMachines={setTotalMachines}
            brokenMachinesStr={brokenMachinesStr}
            setBrokenMachinesStr={setBrokenMachinesStr}
            parsedBrokenList={parsedBrokenList}
            goodMachinesCount={goodMachinesCount}
            assignShared={assignShared}
            setAssignShared={setAssignShared}
            brokenExcelFile={brokenExcelFile}
            setBrokenExcelFile={setBrokenExcelFile}
            brokenFileStatus={brokenFileStatus}
            setBrokenFileStatus={setBrokenFileStatus}
            onDownloadBrokenTemplate={() => downloadBrokenMachinesTemplate(totalMachines)}
          />

          {/* Student Upload & Execution */}
          <StudentUpload
            file={file}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            studentFileInfo={studentFileInfo}
            onSelectStudentFile={handleSelectStudentFile}
            onClearStudentFile={handleClearStudentFile}
            isProcessing={isProcessing}
            onProcessFile={processFile}
            processSuccessMessage={processSuccessMessage}
            onDismissSuccessMessage={() => setProcessSuccessMessage(null)}
          />
        </div>

        {/* Step 4: Preview Table & Statistics */}
        <SeatingPreview
          resultClasses={resultClasses}
          selectedClassIdx={selectedClassIdx}
          setSelectedClassIdx={setSelectedClassIdx}
          goodMachinesCount={goodMachinesCount}
          onExportAllExcel={handleExportAllExcel}
        />
      </div>
    </div>
  );
}
