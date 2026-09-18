import React from 'react';
import { BarChart3, Monitor } from 'lucide-react';
import { ClassSeatingResult } from '../types';
import { computeClassMachineStats } from '../utils/seatingLogic';

interface SeatingStatsProps {
  resultClasses: ClassSeatingResult[];
  selectedClassIdx: number;
  setSelectedClassIdx: (idx: number) => void;
  goodMachinesCount: number;
}

export const SeatingStats: React.FC<SeatingStatsProps> = ({
  resultClasses,
  selectedClassIdx,
  setSelectedClassIdx,
  goodMachinesCount
}) => {
  const curClass = resultClasses[selectedClassIdx];
  const curGoodMachines = curClass?.totalGoodMachines ?? goodMachinesCount;
  const curStats = curClass ? computeClassMachineStats(curClass.students.length, curGoodMachines) : null;

  return (
    <div className="space-y-4">
      {/* BẢNG TỔNG HỢP PHÂN BỔ MÁY THEO TỪNG LỚP */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>BẢNG TỔNG HỢP PHÂN BỔ MÁY THEO TỪNG LỚP ({resultClasses.length} lớp)</span>
          </div>
          <span className="text-[11px] text-slate-500 italic">
            * Bấm vào dòng của lớp bất kỳ để xem chi tiết bảng 35 tuần
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-2xs">
          <table className="min-w-full text-xs divide-y divide-slate-200 text-center">
            <thead className="bg-slate-100/90 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-left">Lớp</th>
                <th className="py-2.5 px-3">Sĩ số</th>
                <th className="py-2.5 px-3">Số máy tốt</th>
                <th className="py-2.5 px-3 bg-emerald-50 text-emerald-900 border-x border-emerald-100">
                  Máy ngồi 1 HS
                </th>
                <th className="py-2.5 px-3 bg-amber-50 text-amber-900 border-r border-amber-100">
                  Máy ngồi 2 HS
                </th>
                <th className="py-2.5 px-3 bg-purple-50 text-purple-900 border-r border-purple-100">
                  Máy ngồi 3 HS
                </th>
                <th className="py-2.5 px-3 text-slate-600">Máy trống (0 HS)</th>
                <th className="py-2.5 px-3 text-right">Xem chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resultClasses.map((cls, idx) => {
                const stats = computeClassMachineStats(
                  cls.students.length,
                  cls.totalGoodMachines ?? goodMachinesCount
                );
                const isSelected = selectedClassIdx === idx;
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedClassIdx(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-left text-slate-900 font-bold flex items-center gap-2">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                      {cls.className || `Lớp ${idx + 1}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">{cls.students.length} HS</td>
                    <td className="py-2.5 px-3 text-slate-600">{cls.totalGoodMachines ?? goodMachinesCount} máy</td>
                    <td className="py-2.5 px-3 bg-emerald-50/40 text-emerald-800 font-bold border-x border-emerald-50">
                      {stats.count1HS > 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {stats.count1HS} máy ({stats.students1HS} HS)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0 máy</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 bg-amber-50/40 text-amber-800 font-bold border-r border-amber-50">
                      {stats.count2HS > 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                          {stats.count2HS} máy ({stats.students2HS} HS)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0 máy</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 bg-purple-50/40 text-purple-800 font-bold border-r border-purple-50">
                      {stats.count3HS > 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">
                          {stats.count3HS} máy ({stats.students3HS} HS)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0 máy</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {stats.count0HS > 0 ? (
                        <span className="text-slate-700 font-medium">{stats.count0HS} máy</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Đang xem' : 'Xem'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 CARDS THỐNG KÊ CHI TIẾT LỚP ĐANG XEM */}
      {curClass && curStats && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs bg-indigo-50/70 px-3.5 py-2 rounded-xl border border-indigo-100 text-indigo-950 font-medium">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold text-xs">
                {curClass.className}
              </span>
              <span>Sĩ số: <strong>{curClass.students.length} học sinh</strong></span>
              <span className="text-indigo-300">|</span>
              <span>Số máy tốt: <strong>{curGoodMachines} máy</strong></span>
            </div>
            <div>
              <span>Kế hoạch: <strong>35 tuần luân phiên</strong> (Tuần 1 → Tuần 35)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Máy ngồi 1 HS */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-900 text-xs font-semibold">
                <span>Máy ngồi 1 HS</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-950">{curStats.count1HS}</span>
                <span className="text-xs text-emerald-800 font-semibold">máy</span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-800/90 leading-tight">
                {curStats.count1HS > 0
                  ? `${curStats.students1HS} học sinh ngồi riêng (1 HS/máy)`
                  : '0 học sinh ngồi riêng'}
              </div>
            </div>

            {/* Card 2: Máy ngồi 2 HS */}
            <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-900 text-xs font-semibold">
                <span>Máy ngồi 2 HS</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-950">{curStats.count2HS}</span>
                <span className="text-xs text-amber-800 font-semibold">máy</span>
              </div>
              <div className="mt-1 text-[11px] text-amber-800/90 leading-tight">
                {curStats.count2HS > 0
                  ? `${curStats.students2HS} học sinh (${curStats.count2HS} cặp ngồi chung)`
                  : '0 học sinh ngồi chung 2 người'}
              </div>
            </div>

            {/* Card 3: Máy ngồi 3 HS */}
            <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-purple-900 text-xs font-semibold">
                <span>Máy ngồi 3 HS</span>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-purple-950">{curStats.count3HS}</span>
                <span className="text-xs text-purple-800 font-semibold">máy</span>
              </div>
              <div className="mt-1 text-[11px] text-purple-800/90 leading-tight">
                {curStats.count3HS > 0
                  ? `${curStats.students3HS} học sinh (${curStats.count3HS} nhóm ngồi 3)`
                  : '0 máy (không bị quá tải 3 HS)'}
              </div>
            </div>

            {/* Card 4: Tổng máy sử dụng & Máy trống */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
                <span>Tổng máy sử dụng</span>
                <Monitor className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {curStats.count1HS + curStats.count2HS + curStats.count3HS}
                </span>
                <span className="text-xs text-slate-600 font-medium">/ {curGoodMachines} máy tốt</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600 leading-tight">
                {curStats.count0HS > 0
                  ? `Dư ${curStats.count0HS} máy trống không có HS`
                  : 'Tất cả máy tốt đều được sử dụng'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
