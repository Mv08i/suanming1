// tyme4ts 封装：统一提供农历/节气/干支/时辰信息
// 三类命理咨询算法共用，避免重复计算干支。
//
// 已验证 API（scripts/test-tyme.mjs）：
//   SolarDay.fromYmd(y,m,d) → solarDay
//     solarDay.getLunarDay() → LunarDay，.toString() = "农历乙巳年二月十六"
//     solarDay.getTerm() → 节气，.getName() = "惊蛰"
//   lunarDay.getSixtyCycle() → 日柱，.toString() = "癸未"
//     .getHeavenStem().getName() / .getEarthBranch().getName()
//   lunarDay.getLunarMonth() → LunarMonth
//     .getSixtyCycle() → 月柱
//     .getLunarYear() → LunarYear，.getSixtyCycle() → 年柱
//   LunarHour.fromYmdHms(y,m,d,h,mi,s) → LunarHour
//     .getSixtyCycle() → 时柱
//     .getIndexInDay() → 时辰地支序 0-based（子=0），+1 得 1-based（子=1）

import { SolarDay, LunarHour } from "tyme4ts";

export interface CalendarInfo {
  solarTime: string; // ISO 字符串
  lunarBrief: string; // 农历摘要，如"农历乙巳年二月十六"
  yearGanZhi: string; // 年柱
  monthGanZhi: string; // 月柱
  dayGanZhi: string; // 日柱
  hourGanZhi: string; // 时柱
  hourZhiIndex: number; // 时辰地支序 1-based（子=1, 丑=2, ..., 亥=12）
  solarTerm?: string; // 当前节气名
  // 梅花易数时间起卦用（农历数字）
  lunarYearZhiIndex: number; // 年地支序 1-based（子=1, ..., 亥=12）
  lunarMonthNum: number; // 农历月份数 1-12（闰月按实际，如闰二月=13 之类由库给）
  lunarDayNum: number; // 农历日数 1-30
}

/** 从 Date 取完整日历信息（四柱+农历+节气+时辰序） */
export function getCalendarInfo(date: Date = new Date()): CalendarInfo {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const mi = date.getMinutes();
  const s = date.getSeconds();

  const solarDay = SolarDay.fromYmd(y, m, d);
  const lunarDay = solarDay.getLunarDay();
  const lunarMonth = lunarDay.getLunarMonth();
  const lunarYear = lunarMonth.getLunarYear();

  const lunarHour = LunarHour.fromYmdHms(y, m, d, h, mi, s);

  // 节气可能取不到（极少数边界），容错
  let solarTerm: string | undefined;
  try {
    solarTerm = solarDay.getTerm().getName();
  } catch {
    solarTerm = undefined;
  }

  // 农历月日数字（梅花用）
  // LunarMonth.getDayCount() 给当月天数；LunarDay.getName()="十六"，用 getDay() 取数字
  const lunarMonthNum = lunarMonth.getMonth();
  const lunarDayNum = lunarDay.getDay();
  // 年地支序：lunarYear.getSixtyCycle().getEarthBranch() 取地支，.getIndex() 0-based → +1
  const yearZhiIndex = lunarYear.getSixtyCycle().getEarthBranch().getIndex() + 1;

  return {
    solarTime: date.toISOString(),
    lunarBrief: lunarDay.toString(), // "农历乙巳年二月十六"
    yearGanZhi: lunarYear.getSixtyCycle().toString(), // "乙巳"
    monthGanZhi: lunarMonth.getSixtyCycle().toString(), // "己卯"
    dayGanZhi: lunarDay.getSixtyCycle().toString(), // "癸未"
    hourGanZhi: lunarHour.getSixtyCycle().toString(), // "癸巳"
    hourZhiIndex: lunarHour.getIndexInDay() + 1, // 1-based
    solarTerm,
    lunarYearZhiIndex: yearZhiIndex,
    lunarMonthNum,
    lunarDayNum,
  };
}

/** 日干的天干（用于六爻定六神起点） */
export function dayStem(cal: CalendarInfo): string {
  // dayGanZhi 形如"癸未"，取第一个字
  return cal.dayGanZhi[0];
}
