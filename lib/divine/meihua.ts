// 梅花易数起卦算法
// 时间法：上卦=(年支+月+日)%8, 下卦=(年支+月+日+时支)%8, 动爻=(年支+月+日+时支)%6（均 0 取除数）
// 数字法（简化）：上卦=n%8, 下卦=floor(n/8)%8, 动爻=(上+下)%6（0 取除数）
// 先天八卦数→卦：1乾 2兑 3离 4震 5巽 6坎 7艮 8坤

import { trigramByXiantian, lookupGua, TRIGRAM_ELEMENT } from "./hexagrams";
import type { CalendarInfo } from "./calendar";
import type { MeihuaCast } from "./types";

function mod8(n: number): number {
  const r = n % 8;
  return r === 0 ? 8 : r;
}
function mod6(n: number): number {
  const r = n % 6;
  return r === 0 ? 6 : r;
}

const WUXING_SHENG: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const WUXING_KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

function wuxingRelation(ti: string, yong: string): { relation: string; verdict: string } {
  if (ti === yong) return { relation: "比和", verdict: "比和为吉，相助之象" };
  if (WUXING_SHENG[yong] === ti) return { relation: "用生体", verdict: "用生体，吉，有进益之喜" };
  if (WUXING_SHENG[ti] === yong) return { relation: "体生用", verdict: "体生用，泄，多耗散之劳" };
  if (WUXING_KE[ti] === yong) return { relation: "体克用", verdict: "体克用，得，有制财之利" };
  if (WUXING_KE[yong] === ti) return { relation: "用克体", verdict: "用克体，凶，多克害之忧" };
  return { relation: "未知", verdict: "五行关系不明" };
}

// 把 6 爻数组转 [lowerBin, upperBin]
function linesToBins(lines: (0 | 1)[]): [number, number] {
  const lower = (lines[0] ? 1 : 0) | (lines[1] ? 2 : 0) | (lines[2] ? 4 : 0);
  const upper = (lines[3] ? 1 : 0) | (lines[4] ? 2 : 0) | (lines[5] ? 4 : 0);
  return [lower, upper];
}

// 先天数→6爻数组（下→上，1阳0阴）
function xiantianToLines(upperNum: number, lowerNum: number): (0 | 1)[] {
  const lowerTri = trigramByXiantian(lowerNum); // 3爻[bit0,bit1,bit2] 下→上
  const upperTri = trigramByXiantian(upperNum);
  return [...lowerTri.lines, ...upperTri.lines] as (0 | 1)[];
}

// 取互卦（2,3,4爻为下互，3,4,5爻为上互）
function mutualLines(lines: (0 | 1)[]): (0 | 1)[] {
  // 索引 1,2,3 为下互卦；2,3,4 为上互卦
  return [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]];
}

export function castMeihua(
  method: "time" | "number",
  cal: CalendarInfo,
  number?: number,
  question?: string,
): MeihuaCast {
  let upperNumber: number, lowerNumber: number, movingNumber: number;

  if (method === "time") {
    const base = cal.lunarYearZhiIndex + cal.lunarMonthNum + cal.lunarDayNum;
    upperNumber = mod8(base);
    lowerNumber = mod8(base + cal.hourZhiIndex);
    movingNumber = mod6(base + cal.hourZhiIndex);
  } else {
    const n = Math.max(1, Math.floor(number ?? 1));
    upperNumber = mod8(n);
    lowerNumber = mod8(Math.floor(n / 8) + (n % 8 === 0 ? 8 : 0));
    // 简化动爻：上+下
    movingNumber = mod6(upperNumber + lowerNumber);
  }

  const upperTri = trigramByXiantian(upperNumber);
  const lowerTri = trigramByXiantian(lowerNumber);
  const primaryLines = xiantianToLines(upperNumber, lowerNumber);
  const [pLowerBin, pUpperBin] = linesToBins(primaryLines);
  const primaryGua = lookupGua(pLowerBin, pUpperBin);

  // 互卦
  const mutualLinesArr = mutualLines(primaryLines);
  const [mLowerBin, mUpperBin] = linesToBins(mutualLinesArr);
  const mutualGua = lookupGua(mLowerBin, mUpperBin);

  // 变卦：动爻翻转
  const changedLines = primaryLines.map((b, i) => (i + 1 === movingNumber ? (b ? 0 : 1) : b)) as (0 | 1)[];
  const [cLowerBin, cUpperBin] = linesToBins(changedLines);
  const changedGua = lookupGua(cLowerBin, cUpperBin);

  // 体用：动爻所在卦为用，另一为体
  const movingInUpper = movingNumber >= 4; // 4,5,6 爻属上卦
  const ti: "upper" | "lower" = movingInUpper ? "lower" : "upper";
  const yong: "upper" | "lower" = movingInUpper ? "upper" : "lower";
  const tiElement = ti === "upper" ? upperTri.element : lowerTri.element;
  const yongElement = yong === "upper" ? upperTri.element : lowerTri.element;
  const { relation, verdict } = wuxingRelation(tiElement, yongElement);

  return {
    type: "MEIHUA",
    method,
    question,
    solarTime: cal.solarTime,
    lunarBrief: cal.lunarBrief,
    yearGanZhi: cal.yearGanZhi,
    monthGanZhi: cal.monthGanZhi,
    dayGanZhi: cal.dayGanZhi,
    hourGanZhi: cal.hourGanZhi,
    hourZhiIndex: cal.hourZhiIndex,
    solarTerm: cal.solarTerm,
    upperNumber,
    lowerNumber,
    movingNumber,
    upperTrigram: upperTri.name,
    lowerTrigram: lowerTri.name,
    upperElement: upperTri.element,
    lowerElement: lowerTri.element,
    primary: { name: primaryGua.name, lines: primaryLines },
    mutual: { name: mutualGua.name, lines: mutualLinesArr },
    changed: { name: changedGua.name, lines: changedLines },
    movingLine: movingNumber,
    tiYong: {
      ti,
      yong,
      tiElement,
      yongElement,
      relation,
      verdict,
    },
  };
}
