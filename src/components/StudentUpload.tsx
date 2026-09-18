import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle2, Download } from 'lucide-react';
import { StudentFileInfo } from '../types';

interface StudentUploadProps {
  file: File | null;
  isDragging: boolean;
  setIsDragging: (b: boolean) => void;
  studentFileInfo: StudentFileInfo | null;
  onSelectStudentFile: (file: File) => void;
  onClearStudentFile: (e: React.MouseEvent) => void;
  isProcessing: boolean;
  onProcessFile: () => void;
  processSuccessMessage: string | null;
  onDismissSuccessMessage: () => void;
}

export const StudentUpload: React.FC<StudentUploadProps> = ({
  file,
  isDragging,
  setIsDragging,
  studentFileInfo,
  onSelectStudentFile,
  onClearStudentFile,
  isProcessing,
  onProcessFile,
  processSuccessMessage,
  onDismissSuccessMessage,
}) => {
  const studentFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSelectStudentFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Upload danh sách học sinh (Excel)
          </label>
          <span className="text-[11px] text-slate-500">Hỗ trợ file .xlsx, .xls</span>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          File Excel có thể gồm nhiều sheet (mỗi sheet là 1 lớp). Hệ thống tự động nhận diện cột <strong>STT</strong> và <strong>Họ và tên</strong> (bỏ qua các cột khác).
        </p>

        <div
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
              onSelectStudentFile(droppedFile);
            }
          }}
          onClick={() => studentFileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center w-full min-h-36 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/90 ring-4 ring-blue-200 scale-[1.005]'
              : file
              ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60'
              : 'border-slate-300 bg-slate-50/80 hover:bg-slate-100/80'
          }`}
        >
          <input
            ref={studentFileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
          />

          {file ? (
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-950 text-sm">{file.name}</span>
                    {studentFileInfo && (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                        {studentFileInfo.size}
                      </span>
                    )}
                  </div>
                  {studentFileInfo && studentFileInfo.classSummaries.length > 0 ? (
                    <p className="text-xs text-emerald-800 mt-1">
                      ✓ Đã nhận diện <strong>{studentFileInfo.classSummaries.length} lớp</strong> (tổng khoảng {studentFileInfo.totalStudents} học sinh):{' '}
                      <span className="font-semibold">{studentFileInfo.classSummaries.map(c => `${c.name} (${c.count} HS)`).join(', ')}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-800 mt-1">
                      ✓ Đã tải file thành công. Sẵn sàng tính toán xếp chỗ!
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    studentFileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shadow-2xs"
                >
                  Đổi file khác
                </button>
                <button
                  type="button"
                  onClick={onClearStudentFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Bỏ chọn file này"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className={`w-9 h-9 mb-2.5 transition-transform ${isDragging ? 'scale-110 text-blue-600' : 'text-slate-400'}`} />
              <p className="mb-1 text-sm text-slate-800 font-medium">
                <span className="font-semibold text-blue-600 hover:underline">Nhấn để chọn file</span> hoặc kéo thả file danh sách học sinh vào đây
              </p>
              <p className="text-xs text-slate-500">Định dạng hỗ trợ: XLSX, XLS (chứa 1 lớp hoặc nhiều sheet nhiều lớp)</p>
            </div>
          )}
        </div>
      </div>

      {processSuccessMessage && (
        <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{processSuccessMessage}</div>
          <button
            type="button"
            onClick={onDismissSuccessMessage}
            className="text-emerald-700 hover:text-emerald-900 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Nút hành động chính */}
      <button
        type="button"
        onClick={onProcessFile}
        disabled={!file || isProcessing}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold transition-all shadow-sm cursor-pointer ${
          !file || isProcessing
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-500/20'
        }`}
      >
        <Download className="w-4 h-4" />
        <span>
          {isProcessing ? 'Đang xếp chỗ & xuất file Excel 35 tuần...' : 'Xếp Chỗ & Xuất Excel 35 Tuần (.xlsx)'}
        </span>
      </button>
    </div>
  );
};
