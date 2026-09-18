import { ClassMachineStats, ClassSeatingResult, StudentAssignment } from '../types';

/**
 * Tính toán chính xác số lượng máy ngồi 1 HS, 2 HS, 3 HS cho từng lớp
 */
export function computeClassMachineStats(studentCount: number, goodMachines: number): ClassMachineStats {
  if (goodMachines <= 0) {
    return {
      count1HS: 0,
      count2HS: 0,
      count3HS: 0,
      count0HS: 0,
      countOther: 0,
      students1HS: 0,
      students2HS: 0,
      students3HS: 0
    };
  }
  if (studentCount <= goodMachines) {
    return {
      count1HS: studentCount,
      count2HS: 0,
      count3HS: 0,
      count0HS: goodMachines - studentCount,
      countOther: 0,
      students1HS: studentCount,
      students2HS: 0,
      students3HS: 0
    };
  }
  const S = studentCount - goodMachines;
  const q = Math.floor(S / goodMachines);
  const r = S % goodMachines;

  let count1HS = 0;
  let count2HS = 0;
  let count3HS = 0;
  let count0HS = 0;
  let countOther = 0;

  const addGroup = (studentsPerMachine: number, numMachines: number) => {
    if (numMachines <= 0) return;
    if (studentsPerMachine === 0) count0HS += numMachines;
    else if (studentsPerMachine === 1) count1HS += numMachines;
    else if (studentsPerMachine === 2) count2HS += numMachines;
    else if (studentsPerMachine === 3) count3HS += numMachines;
    else countOther += numMachines;
  };

  addGroup(q + 2, r);
  addGroup(q + 1, goodMachines - r);

  return {
    count1HS,
    count2HS,
    count3HS,
    count0HS,
    countOther,
    students1HS: count1HS * 1,
    students2HS: count2HS * 2,
    students3HS: count3HS * 3
  };
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Tính toán xếp chỗ ngồi luân phiên cho 35 tuần
 */
export function generate35WeekSeating(
  students: { stt: number | string; name: string }[],
  goodMachines: number[],
  assignShared: boolean = true
): StudentAssignment[] {
  const N = students.length;
  const countGood = goodMachines.length;
  if (N === 0 || countGood === 0) return [];

  // Tính bước luân phiên coprime để xoay vòng đều 35 tuần không bị đứng yên
  let step = N <= countGood ? 3 : countGood;
  if (N > 1 && gcd(step, N) > 1) {
    step += 1;
    if (gcd(step, N) > 1) step += 1;
  }

  // Phân bổ 35 tuần
  const weekAssignments: string[][] = [];
  for (let week = 1; week <= 35; week++) {
    const start = ((week - 1) * step) % N;
    const assign: string[] = Array(N).fill('Ngồi chung');
    const numSit = Math.min(countGood, N);

    // 1. Phân bổ máy chính cho học sinh
    for (let k = 0; k < numSit; k++) {
      const pos = (start + k) % N;
      assign[pos] = `Máy ${goodMachines[k]}`;
    }

    // 2. Phân bổ học sinh dư (nếu số học sinh > số máy tốt)
    if (N > countGood) {
      const surplusCount = N - countGood;
      for (let s = 0; s < surplusCount; s++) {
        const surplusPos = (start + countGood + s) % N;
        const targetMachineIdx = (week - 1 + s) % countGood;
        const targetMachine = goodMachines[targetMachineIdx];
        assign[surplusPos] = assignShared ? `Ngồi chung Máy ${targetMachine}` : 'Ngồi chung';
      }
    }

    weekAssignments.push(assign);
  }

  return students.map((std, idx) => ({
    stt: std.stt ?? (idx + 1),
    name: std.name,
    weeks: Array.from({ length: 35 }, (_, w) => weekAssignments[w][idx])
  }));
}

/**
 * Dữ liệu mẫu học sinh tiếng Việt phục vụ kiểm thử nhanh
 */
export function getSampleClasses(): ClassSeatingResult[] {
  const class1Names = [
    'Nguyễn An Bình', 'Trần Bảo Châu', 'Lê Hoàng Dũng', 'Phạm Quỳnh Giang',
    'Hoàng Minh Hải', 'Vũ Thu Hương', 'Đặng Gia Huy', 'Bùi Bích Hạnh',
    'Đỗ Tuấn Kiệt', 'Hồ Mỹ Linh', 'Ngô Quang Long', 'Dương Thúy Mai',
    'Lý Quốc Nam', 'Võ Phương Nga', 'Trịnh Hữu Nghĩa', 'Phan Kim Ngân',
    'Mai Trọng Nhân', 'Cao Tuyết Nhung', 'Lương Thành Phát', 'Tô Lan Phương',
    'Tạ Hữu Phước', 'Đinh Thanh Quân', 'Lâm Thảo Quyên', 'Chu Minh Sang',
    'Đoàn Như Quỳnh', 'Hà Vĩnh Thụy', 'Bạch Ngọc Trinh', 'Diệp Anh Tú',
    'Nghiêm Quốc Uy', 'Lục Thùy Vân', 'Quách Đình Vũ', 'Chung Cẩm Tú',
    'Thái Nhật Minh', 'Phùng Khánh Linh', 'Tôn Thất Bách', 'Trương Vĩnh Kỳ',
    'Hứa Kim Tuyền', 'Ân Quốc Bảo', 'Lê Thị Diệu Hiền', 'Nguyễn Đức Trí'
  ];

  const class2Names = [
    'Nguyễn Văn An', 'Lê Thị Ánh', 'Trần Quốc Bảo', 'Phạm Đình Chiểu',
    'Hoàng Đức Duy', 'Vũ Hồng Đăng', 'Đỗ Minh Đức', 'Bùi Hoàng Gia',
    'Đặng Ngọc Hà', 'Hồ Thái Hưng', 'Ngô Đức Khang', 'Dương Khánh Linh',
    'Lý Gia Mẫn', 'Võ Hoài Nam', 'Trịnh Bích Ngọc', 'Phan Hải Phong',
    'Mai Đăng Quang', 'Cao Thùy Trang', 'Lương Vĩnh Thuận', 'Tô Minh Tiến',
    'Tạ Phương Thảo', 'Đinh Quốc Toàn', 'Lâm Tuấn Tú', 'Chu Ánh Tuyết',
    'Đoàn Văn Tuyên', 'Hà Thảo Vy', 'Bạch Gia Uyên', 'Diệp Minh Vương',
    'Nghiêm Hoàng Long', 'Lục Tấn Đạt', 'Quách Gia Bảo', 'Chung Thanh Bình',
    'Thái Ngọc Diệp', 'Phùng Tấn Khoa', 'Tôn Nữ Quỳnh Như', 'Trương Minh Nhật'
  ];

  return [
    {
      className: '10A1',
      students: class1Names.map((name, i) => ({
        stt: i + 1,
        name,
        weeks: []
      }))
    },
    {
      className: '10A2',
      students: class2Names.map((name, i) => ({
        stt: i + 1,
        name,
        weeks: []
      }))
    }
  ];
}
