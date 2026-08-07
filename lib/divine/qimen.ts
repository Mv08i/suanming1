// 奇门遁甲起卦（简化版）
// 不自研完整九宫算法，只取时间元数据（农历/节气/四柱/时辰/阳阴遁/局数提示）
// 盘面（九宫/天地盘/八门/九星/八神）交给 AI 在 prompt 里基于时间元数据生成并解析
// 明确标注「简化体验版」

import type { CalendarInfo } from "./calendar";
import type { QiMenCast } from "./types";

// 24 节气顺序（冬至为 0）
const SOLAR_TERMS_ORDER = [
  "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰",
  "春分", "清明", "谷雨", "立夏", "小满", "芒种",
  "夏至", "小暑", "大暑", "立秋", "处暑", "白露",
  "秋分", "寒露", "霜降", "立冬", "小雪", "大雪",
];

// 各节气上元阳遁/阴遁起局（冬至阳1，夏至阴9，依此推）
// 阳遁：冬至1 小寒2 大寒3 立春8 雨水9 惊蛰1 春分3 清明4 谷雨5 立夏4 小满5 芒种6
// 阴遁：夏至9 小暑8 大暑7 立秋2 处暑1 白露9 秋分7 寒露6 霜降5 立冬6 小雪5 大雪4
const TERM_BASE_JU = [
  1, 2, 3, 8, 9, 1, 3, 4, 5, 4, 5, 6, // 阳遁 0-11
  9, 8, 7, 2, 1, 9, 7, 6, 5, 6, 5, 4, // 阴遁 12-23
];

export function castQiMen(cal: CalendarInfo, question?: string): QiMenCast {
  const termName = cal.solarTerm ?? "未知";
  const termIdx = SOLAR_TERMS_ORDER.indexOf(termName);
  const isYang = termIdx >= 0 && termIdx <= 11;
  const dun = isYang ? "yang" : "yin";

  // 局数提示：基于节气上元起局（简化，不考虑上中下元换局）
  const baseJu = termIdx >= 0 ? TERM_BASE_JU[termIdx] : 1;
  const juHint = `${dun === "yang" ? "阳" : "阴"}遁${baseJu}局（基于节气${termName}上元估算，简化版未严格按元换局）`;

  return {
    type: "QIMEN",
    simplified: true,
    question,
    solarTime: cal.solarTime,
    lunarBrief: cal.lunarBrief,
    yearGanZhi: cal.yearGanZhi,
    monthGanZhi: cal.monthGanZhi,
    dayGanZhi: cal.dayGanZhi,
    hourGanZhi: cal.hourGanZhi,
    hourZhiIndex: cal.hourZhiIndex,
    solarTerm: termName,
    dun,
    juHint,
    // 兼容 BaseCast 字段
  } as QiMenCast & { lunarBrief: string; solarTerm: string };
}
