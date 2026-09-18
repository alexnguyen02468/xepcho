export interface StudentAssignment {
  stt: number | string;
  name: string;
  weeks: string[]; // 35 tuần
}

export interface ClassSeatingResult {
  className: string;
  students: StudentAssignment[];
  totalGoodMachines?: number;
}

export interface ClassMachineStats {
  count1HS: number;
  count2HS: number;
  count3HS: number;
  count0HS: number;
  countOther: number;
  students1HS: number;
  students2HS: number;
  students3HS: number;
}

export interface StudentFileInfo {
  fileName: string;
  size: string;
  classSummaries: { name: string; count: number }[];
  totalStudents: number;
}

export interface BrokenFileStatus {
  fileName: string;
  brokenCount: number;
  totalInFile: number;
  brokenList: number[];
}
