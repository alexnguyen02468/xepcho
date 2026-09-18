import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ClassSeatingResult } from '../types';
import { computeClassMachineStats } from './seatingLogic';

/**
 * Xuất file Excel chuẩn cấu trúc bằng ExcelJS:
 * Sheet 1 (Đầu tiên): Thống kê phân bổ máy (Số máy ngồi 1 HS, 2 HS, 3 HS) của từng lớp
 * Sheet 2 trở đi: Chi tiết xếp chỗ 35 tuần của từng lớp (37 cột: STT, Họ và tên, Tuần 1 .. Tuần 35)
 */
export async function downloadExcelFromData(
  classesToExport: ClassSeatingResult[],
  totalMachines: number,
  goodMachinesCount: number,
  parsedBrokenList: number[]
): Promise<void> {
  if (!classesToExport || classesToExport.length === 0) return;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Alex Truong';
  workbook.created = new Date();

  // ==========================================
  // SHEET 1: THỐNG KÊ PHÂN BỔ MÁY THEO TỪNG LỚP
  // ==========================================
  const statsWs = workbook.addWorksheet('Thống kê phân bổ máy');

  statsWs.columns = [
    { key: 'stt', width: 8 },
    { key: 'className', width: 18 },
    { key: 'studentCount', width: 14 },
    { key: 'goodMachines', width: 14 },
    { key: 'm1hs', width: 24 },
    { key: 'm2hs', width: 24 },
    { key: 'm3hs', width: 24 },
    { key: 'm0hs', width: 18 },
    { key: 'note', width: 34 },
  ];

  // Dòng 1: Tiêu đề lớn
  statsWs.mergeCells('A1:I1');
  const titleCell = statsWs.getCell('A1');
  titleCell.value = 'BẢNG TỔNG HỢP & THỐNG KÊ PHÂN BỔ MÁY THỰC HÀNH';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  statsWs.getRow(1).height = 34;

  // Dòng 2: Thông tin cấu hình phòng máy
  statsWs.mergeCells('A2:I2');
  const subTitleCell = statsWs.getCell('A2');
  const brokenText = parsedBrokenList.length > 0 ? `Máy hỏng: ${parsedBrokenList.length} máy (${parsedBrokenList.join(', ')})` : 'Máy hỏng: 0 máy';
  subTitleCell.value = `Tổng số máy: ${totalMachines} máy | ${brokenText} | Số máy tốt hoạt động: ${goodMachinesCount} máy | Tổng số lớp: ${classesToExport.length} lớp`;
  subTitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF334155' } };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  statsWs.getRow(2).height = 22;

  // Dòng 3: Dòng trống phân cách
  statsWs.getRow(3).height = 8;

  // Dòng 4: Header bảng thống kê
  const statHeaderRow = statsWs.getRow(4);
  statHeaderRow.height = 28;
  const statHeaders = [
    { col: 1, text: 'STT', fg: 'FFE2E8F0', fontColor: 'FF0F172A' },
    { col: 2, text: 'Lớp', fg: 'FFE2E8F0', fontColor: 'FF0F172A' },
    { col: 3, text: 'Sĩ số (HS)', fg: 'FFE2E8F0', fontColor: 'FF0F172A' },
    { col: 4, text: 'Số máy tốt', fg: 'FFE2E8F0', fontColor: 'FF0F172A' },
    { col: 5, text: 'Máy ngồi 1 HS', fg: 'FFD1FAE5', fontColor: 'FF065F46' },
    { col: 6, text: 'Máy ngồi 2 HS', fg: 'FFFEF3C7', fontColor: 'FF92400E' },
    { col: 7, text: 'Máy ngồi 3 HS', fg: 'FFEDE9FE', fontColor: 'FF5B21B6' },
    { col: 8, text: 'Máy trống (0 HS)', fg: 'FFE2E8F0', fontColor: 'FF0F172A' },
    { col: 9, text: 'Đánh giá phân bổ máy', fg: 'FFE2E8F0', fontColor: 'FF0F172A' },
  ];

  statHeaders.forEach(h => {
    const cell = statHeaderRow.getCell(h.col);
    cell.value = h.text;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: h.fontColor } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: h.fg } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } },
    };
  });

  let sumStudents = 0;
  let sum1HSMachines = 0;
  let sum1HSStudents = 0;
  let sum2HSMachines = 0;
  let sum2HSStudents = 0;
  let sum3HSMachines = 0;
  let sum3HSStudents = 0;
  let sum0HSMachines = 0;

  classesToExport.forEach((item, cIdx) => {
    const gMachines = item.totalGoodMachines ?? goodMachinesCount;
    const stats = computeClassMachineStats(item.students.length, gMachines);

    sumStudents += item.students.length;
    sum1HSMachines += stats.count1HS;
    sum1HSStudents += stats.students1HS;
    sum2HSMachines += stats.count2HS;
    sum2HSStudents += stats.students2HS;
    sum3HSMachines += stats.count3HS;
    sum3HSStudents += stats.students3HS;
    sum0HSMachines += stats.count0HS;

    let assessment = 'Đủ máy, 100% ngồi 1 HS/máy';
    if (stats.count3HS > 0) {
      assessment = `Thiếu máy, phải ghép 3 HS (${stats.count3HS} máy)`;
    } else if (stats.count2HS > 0 && stats.count1HS > 0) {
      assessment = `Xen kẽ ${stats.count2HS} máy ngồi 2 HS & ${stats.count1HS} máy ngồi 1 HS`;
    } else if (stats.count2HS > 0) {
      assessment = `Chia đều tất cả ${stats.count2HS} máy ngồi 2 HS`;
    }

    const row = statsWs.addRow({
      stt: cIdx + 1,
      className: item.className || `Lớp ${cIdx + 1}`,
      studentCount: item.students.length,
      goodMachines: gMachines,
      m1hs: stats.count1HS > 0 ? `${stats.count1HS} máy (${stats.students1HS} HS)` : '0 máy',
      m2hs: stats.count2HS > 0 ? `${stats.count2HS} máy (${stats.students2HS} HS)` : '0 máy',
      m3hs: stats.count3HS > 0 ? `${stats.count3HS} máy (${stats.students3HS} HS)` : '0 máy',
      m0hs: stats.count0HS > 0 ? `${stats.count0HS} máy` : '0 máy',
      note: assessment,
    });
    row.height = 23;

    const isEven = cIdx % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: 'Arial',
        size: 10,
        bold: colNumber === 2,
        color: { argb: 'FF1F2937' }
      };
      if (!isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 2 || colNumber === 9 ? 'left' : 'center'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // Dòng tổng cộng (Summary Row)
  const totalRow = statsWs.addRow({
    stt: 'Tổng',
    className: `${classesToExport.length} lớp`,
    studentCount: sumStudents,
    goodMachines: goodMachinesCount,
    m1hs: `${sum1HSMachines} lượt máy (${sum1HSStudents} HS)`,
    m2hs: `${sum2HSMachines} lượt máy (${sum2HSStudents} HS)`,
    m3hs: `${sum3HSMachines} lượt máy (${sum3HSStudents} HS)`,
    m0hs: `${sum0HSMachines} lượt máy`,
    note: 'Tổng hợp toàn trường',
  });
  totalRow.height = 26;
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: colNumber === 2 || colNumber === 9 ? 'left' : 'center'
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF64748B' } },
      bottom: { style: 'medium', color: { argb: 'FF64748B' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // ==========================================
  // SHEET 2 TRỞ ĐI: TỪNG LỚP KÈM ĐẦY ĐỦ 37 CỘT
  // ==========================================
  classesToExport.forEach((item, classIdx) => {
    const rawName = item.className || `Lop_${classIdx + 1}`;
    const safeSheetName = rawName.replace(/[\\/?*[\]:]/g, '_').substring(0, 31) || `Lop ${classIdx + 1}`;
    const ws = workbook.addWorksheet(safeSheetName);

    // Cấu hình chính xác 37 cột: STT, Họ và tên, Tuần 1 đến Tuần 35
    ws.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Họ và tên', key: 'name', width: 28 },
      ...Array.from({ length: 35 }, (_, i) => ({
        header: `Tuần ${i + 1}`,
        key: `week_${i + 1}`,
        width: 16
      }))
    ];

    // Định dạng dòng tiêu đề (Dòng 1)
    const headerRow = ws.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1E3A8A' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    });

    // Ghi dữ liệu từng học sinh kèm 35 tuần
    item.students.forEach((std, sIdx) => {
      const rowData: Record<string, any> = {
        stt: std.stt ?? (sIdx + 1),
        name: std.name,
      };
      for (let w = 1; w <= 35; w++) {
        rowData[`week_${w}`] = std.weeks[w - 1] || '';
      }
      const dataRow = ws.addRow(rowData);
      dataRow.height = 22;

      const isEven = sIdx % 2 === 0;
      dataRow.eachCell((cell, colNumber) => {
        const isName = colNumber === 2;
        cell.font = {
          name: 'Arial',
          size: 10,
          bold: isName,
          color: { argb: 'FF1F2937' }
        };
        if (!isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }
        cell.alignment = {
          vertical: 'middle',
          horizontal: isName ? 'left' : 'center'
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, 'XepChoThucHanh_35Tuan.xlsx');
}

/**
 * Tải file Excel mẫu khai báo máy hỏng
 */
export async function downloadBrokenMachinesTemplate(totalMachines: number): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('MayHong');

  ws.columns = [
    { header: 'Số máy', key: 'soMay', width: 14 },
    { header: 'Bị hỏng', key: 'biHong', width: 16 }
  ];

  const headerRow = ws.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const count = totalMachines > 0 ? totalMachines : 44;
  for (let i = 1; i <= count; i++) {
    const row = ws.addRow({
      soMay: i,
      biHong: '' // Đánh dấu 'x' nếu hỏng
    });
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, 'Mau_Khai_Bao_May_Hong.xlsx');
}

/**
 * Tải file Excel mẫu danh sách học sinh (nhiều lớp, mỗi sheet 1 lớp)
 */
export async function downloadStudentListTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  const classData = [
    {
      name: '10A1',
      students: [
        'Nguyễn An Bình', 'Trần Bảo Châu', 'Lê Hoàng Dũng', 'Phạm Quỳnh Giang',
        'Hoàng Minh Hải', 'Vũ Thu Hương', 'Đặng Gia Huy', 'Bùi Bích Hạnh',
        'Đỗ Tuấn Kiệt', 'Hồ Mỹ Linh', 'Ngô Quang Long', 'Dương Thúy Mai',
        'Lý Quốc Nam', 'Võ Phương Nga', 'Trịnh Hữu Nghĩa', 'Phan Kim Ngân',
        'Mai Trọng Nhân', 'Cao Tuyết Nhung', 'Lương Thành Phát', 'Tô Lan Phương',
        'Tạ Hữu Phước', 'Đinh Thanh Quân', 'Lâm Thảo Quyên', 'Chu Minh Sang',
        'Đoàn Như Quỳnh', 'Hà Vĩnh Thụy', 'Bạch Ngọc Trinh', 'Diệp Anh Tú',
        'Nghiêm Quốc Uy', 'Lục Thùy Vân', 'Quách Đình Vũ', 'Chung Cẩm Tú',
        'Thái Nhật Minh', 'Phùng Khánh Linh', 'Tôn Thất Bách', 'Trương Vĩnh Kỳ'
      ]
    },
    {
      name: '10A2',
      students: [
        'Nguyễn Văn An', 'Lê Thị Ánh', 'Trần Quốc Bảo', 'Phạm Đình Chiểu',
        'Hoàng Đức Duy', 'Vũ Hồng Đăng', 'Đỗ Minh Đức', 'Bùi Hoàng Gia',
        'Đặng Ngọc Hà', 'Hồ Thái Hưng', 'Ngô Đức Khang', 'Dương Khánh Linh',
        'Lý Gia Mẫn', 'Võ Hoài Nam', 'Trịnh Bích Ngọc', 'Phan Hải Phong',
        'Mai Đăng Quang', 'Cao Thùy Trang', 'Lương Vĩnh Thuận', 'Tô Minh Tiến',
        'Tạ Phương Thảo', 'Đinh Quốc Toàn', 'Lâm Tuấn Tú', 'Chu Ánh Tuyết',
        'Đoàn Văn Tuyên', 'Hà Thảo Vy', 'Bạch Gia Uyên', 'Diệp Minh Vương',
        'Nghiêm Hoàng Long', 'Lục Tấn Đạt', 'Quách Gia Bảo', 'Chung Thanh Bình'
      ]
    }
  ];

  classData.forEach(c => {
    const ws = workbook.addWorksheet(c.name);
    ws.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Họ và tên', key: 'name', width: 30 },
      { header: 'Ngày sinh', key: 'dob', width: 14 },
      { header: 'Giới tính', key: 'gender', width: 12 }
    ];

    const hRow = ws.getRow(1);
    hRow.height = 26;
    hRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    c.students.forEach((name, idx) => {
      const row = ws.addRow({
        stt: idx + 1,
        name,
        dob: '15/08/2009',
        gender: idx % 2 === 0 ? 'Nam' : 'Nữ'
      });
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, 'Mau_Danh_Sach_Hoc_Sinh.xlsx');
}

/**
 * Xuất file CSV dự phòng tương thích cao cho 1 lớp
 */
export function handleDownloadCsv(classItem: ClassSeatingResult): void {
  if (!classItem) return;
  const headers = ['STT', 'Họ và tên', ...Array.from({ length: 35 }, (_, i) => `Tuần ${i + 1}`)];
  const rows = classItem.students.map(s => [
    s.stt,
    `"${s.name.replace(/"/g, '""')}"`,
    ...s.weeks.map(w => `"${(w || '').replace(/"/g, '""')}"`)
  ]);
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const cleanClassName = (classItem.className || 'Lop').replace(/[^a-zA-Z0-9_-]/g, '_');
  saveAs(blob, `XepCho_${cleanClassName}_35Tuan.csv`);
}
