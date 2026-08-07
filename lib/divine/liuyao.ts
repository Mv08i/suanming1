// 六爻起卦算法
// 输入：coinSums[6]（6 次摇铜钱和值，初→上，每值 ∈ {6,7,8,9}）
// 输出：LiuYaoCast（本卦/变卦 + 纳甲 + 六亲 + 六神 + 世应）

import {
  lookupGua,
  PALACE_ELEMENT,
  NA_JIA,
  ZHI_ELEMENT,
  zhiOfGanZhi,
  sixRelation,
  spiritOfDay,
  shiPosition,
  yingPosition,
} from "./hexagrams";
import { dayStem, type CalendarInfo } from "./calendar";
import type { LiuYaoCast, LiuYaoLine, LineNature } from "./types";

// 和值 → 爻性质
// 6=老阴(变阳), 7=少阳, 8=少阴, 9=老阳(变阴)
export function coinSumToNature(sum: number): LineNature {
  switch (sum) {
    case 6: return "old-yin";
    case 7: return "young-yang";
    case 8: return "young-yin";
    case 9: return "old-yang";
    default: throw new Error(`无效铜钱和值: ${sum}（应为 6/7/8/9）`);
  }
}

function natureToYinYang(n: LineNature): "阴" | "阳" {
  return n === "young-yang" || n === "old-yang" ? "阳" : "阴";
}

// 动爻变后阴阳
function changedYinYang(n: LineNature): "阴" | "阳" | null {
  if (n === "old-yin") return "阳"; // 老阴变阳
  if (n === "old-yang") return "阴"; // 老阳变阴
  return null;
}

/** 校验 coinSums */
export function validateCoinSums(coinSums: number[]): asserts coinSums is [number, number, number, number, number, number] {
  if (!Array.isArray(coinSums) || coinSums.length !== 6) {
    throw new Error("coinSums 必须是长度 6 的数组");
  }
  for (const s of coinSums) {
    if (![6, 7, 8, 9].includes(s)) {
      throw new Error(`coinSums 含非法值 ${s}（仅允许 6/7/8/9）`);
    }
  }
}

/**
 * 六爻起卦主函数
 * @param coinSums 6 个和值（初→上）
 * @param cal 日历信息（含日柱用于定六神）
 * @param question 用户所问
 */
export function castLiuYao(
  coinSums: [number, number, number, number, number, number],
  cal: CalendarInfo,
  question?: string,
): LiuYaoCast {
  validateCoinSums(coinSums);

  const natures = coinSums.map(coinSumToNature) as LineNature[]; // 初→上
  const yangs = natures.map((n) => (natureToYinYang(n) === "阳" ? 1 : 0)); // 初→上，1阳0阴

  // 下卦 bin：初(bit0) 二(bit1) 三(bit2)
  const lowerBin = (yangs[0] ? 1 : 0) | (yangs[1] ? 2 : 0) | (yangs[2] ? 4 : 0);
  // 上卦 bin：四(bit0) 五(bit1) 上(bit2)
  const upperBin = (yangs[3] ? 1 : 0) | (yangs[4] ? 2 : 0) | (yangs[5] ? 4 : 0);

  const gua = lookupGua(lowerBin, upperBin);
  const palaceElement = PALACE_ELEMENT[gua.palace];
  const naJia = NA_JIA[gua.palace];
  const stem = dayStem(cal); // 日干
  const shiPos = shiPosition(gua.position);
  const yingPos = yingPosition(gua.position);

  // 动爻位（1-6）
  const movingLines: number[] = [];
  natures.forEach((n, i) => {
    if (n === "old-yin" || n === "old-yang") movingLines.push(i + 1);
  });

  // 构建本卦 6 爻信息
  const buildLines = (naturesArr: LineNature[]): LiuYaoLine[] => {
    return naturesArr.map((nature, i) => {
      const position = i + 1; // 1-6
      const ganZhi = naJia[i]; // 纳甲干支（按宫，初→上）
      const zhi = zhiOfGanZhi(ganZhi);
      const element = ZHI_ELEMENT[zhi];
      const relation = sixRelation(palaceElement, element);
      const spirit = spiritOfDay(stem, position);
      const shiYing: "世" | "应" | null =
        position === shiPos ? "世" : position === yingPos ? "应" : null;
      return {
        position,
        nature,
        isMoving: nature === "old-yin" || nature === "old-yang",
        yinYang: natureToYinYang(nature),
        changedYinYang: changedYinYang(nature),
        ganZhi,
        element,
        relation,
        spirit,
        shiYing,
      };
    });
  };

  const primaryLines = buildLines(natures);

  // 变卦：动爻翻转
  let changed: LiuYaoCast["changed"] = null;
  if (movingLines.length > 0) {
    const changedNatures = natures.map((n) => {
      if (n === "old-yin") return "young-yang" as LineNature; // 老阴变阳(少阳)
      if (n === "old-yang") return "young-yin" as LineNature; // 老阳变阴(少阴)
      return n;
    });
    const changedYangs = changedNatures.map((n) => (natureToYinYang(n) === "阳" ? 1 : 0));
    const cLowerBin = (changedYangs[0] ? 1 : 0) | (changedYangs[1] ? 2 : 0) | (changedYangs[2] ? 4 : 0);
    const cUpperBin = (changedYangs[3] ? 1 : 0) | (changedYangs[4] ? 2 : 0) | (changedYangs[5] ? 4 : 0);
    const changedGua = lookupGua(cLowerBin, cUpperBin);
    // 变卦爻象：用翻转后的 nature，纳甲/六亲/六神/世应仍按本宫（六爻传统：变卦六亲用本宫）
    const changedLinesRaw = buildLines(changedNatures);
    changed = {
      name: changedGua.name,
      lines: changedLinesRaw,
    };
  }

  return {
    type: "LIUYAO",
    question,
    solarTime: cal.solarTime,
    lunarBrief: cal.lunarBrief,
    yearGanZhi: cal.yearGanZhi,
    monthGanZhi: cal.monthGanZhi,
    dayGanZhi: cal.dayGanZhi,
    hourGanZhi: cal.hourGanZhi,
    hourZhiIndex: cal.hourZhiIndex,
    solarTerm: cal.solarTerm,
    coinSums,
    primary: {
      name: gua.name,
      palace: gua.palace,
      palaceElement,
      lines: primaryLines,
    },
    changed,
    movingLines,
  };
}
