// 三类命理咨询 system prompt 构建器
// 硬约束：只依据给定排盘数据，不得臆造卦象/干支/宫位
// 输出结构统一：【卦象总览】【吉凶断语】【分项详解】【趋避建议】

import type { LiuYaoCast, MeihuaCast, QiMenCast } from "./types";

// 英文输出语言指令：让 AI 用英文写解卦，保留中文术词原形并附英文释义
const LANGUAGE_DIRECTIVE_EN = `

【Output Language / 输出语言】Please write your ENTIRE reading in English. You may keep traditional Chinese divination terms (hexagram names 卦名, Gan-Zhi 干支, palace 宫, Na Jia 纳甲, Six Relations 六亲, Six Spirits 六神, Shi-Ying 世应) in their original Chinese where they appear in the chart data above, but explain their meaning in English. Use English section headers: [Overview], [Fortune Verdict], [Detailed Analysis], [Advice]. All analysis, judgments, and advice must be in English.`;


const OUTPUT_STRUCTURE = `请严格按以下四段结构输出，每段以方括号标题开头：
【卦象总览】简述卦象总体含义与动爻影响。
【吉凶断语】给出整体吉凶倾向及核心依据。
【分项详解】结合所问之事分项推断（如问财运看妻财、问事业看官鬼、问感情看世应等）。
【趋避建议】给出可操作的趋避之道。`;

export function buildLiuyaoPrompt(cast: LiuYaoCast, question?: string): string {
  const lines = cast.primary.lines
    .map((l) => {
      const moving = l.isMoving ? `（动→${l.changedYinYang}）` : "";
      const shiYing = l.shiYing ? `[${l.shiYing}]` : "";
      return `  ${l.position}爻 ${l.yinYang}${moving} ${l.ganZhi}(${l.element}) ${l.relation} ${l.spirit} ${shiYing}`;
    })
    .join("\n");

  const changedText = cast.changed
    ? `【变卦】${cast.changed.name}\n${cast.changed.lines
        .map((l) => `  ${l.position}爻 ${l.yinYang} ${l.ganZhi} ${l.relation}`)
        .join("\n")}`
    : "【变卦】无（静卦，无动爻）";

  return `你是精通六爻预测的命理师，口吻沉稳，术语准确。请仅依据以下排盘数据为问卜者解卦，不得更改或臆造任何爻象、纳甲、六亲、六神、世应。

【所问之事】${question ?? "未明示"}

【起卦时间】${cast.lunarBrief}（${cast.solarTime}）
【四柱】年${cast.yearGanZhi} 月${cast.monthGanZhi} 日${cast.dayGanZhi} 时${cast.hourGanZhi}
${cast.solarTerm ? `【节气】${cast.solarTerm}\n` : ""}【本卦】${cast.primary.name}（${cast.primary.palace}宫，宫属${cast.primary.palaceElement}）
${lines}
【动爻】${cast.movingLines.length ? cast.movingLines.join(",") + "爻" : "无"}
${changedText}

${OUTPUT_STRUCTURE}`;
}

export function buildMeihuaPrompt(cast: MeihuaCast, question?: string): string {
  const fmtLines = (lines: (0 | 1)[]) =>
    lines.map((b, i) => `  ${i + 1}爻 ${b ? "阳" : "阴"}`).join("\n");

  return `你是精通梅花易数的命理师，口吻沉稳，术语准确。请仅依据以下排盘数据为问卜者解卦，不得更改或臆造卦象、体用、五行生克。

【所问之事】${question ?? "未明示"}

【起卦时间】${cast.lunarBrief}（${cast.solarTime}）
【四柱】年${cast.yearGanZhi} 月${cast.monthGanZhi} 日${cast.dayGanZhi} 时${cast.hourGanZhi}
【起卦方式】${cast.method === "time" ? "时间起卦" : "数字起卦"}
  上卦数 ${cast.upperNumber} → ${cast.upperTrigram}（${cast.upperElement}）
  下卦数 ${cast.lowerNumber} → ${cast.lowerTrigram}（${cast.lowerElement}）
  动爻数 ${cast.movingNumber}（第${cast.movingLine}爻动）
【本卦】${cast.primary.name}
${fmtLines(cast.primary.lines)}
【互卦】${cast.mutual.name}
${fmtLines(cast.mutual.lines)}
【变卦】${cast.changed.name}
${fmtLines(cast.changed.lines)}
【体用分析】
  体卦：${cast.tiYong.ti === "upper" ? "上卦" : "下卦"}（${cast.tiYong.tiElement}）
  用卦：${cast.tiYong.yong === "upper" ? "上卦" : "下卦"}（${cast.tiYong.yongElement}）
  生克关系：${cast.tiYong.relation}
  断语：${cast.tiYong.verdict}

${OUTPUT_STRUCTURE}`;
}

export function buildQimenPrompt(cast: QiMenCast, question?: string): string {
  return `你是精通奇门遁甲的命理师，口吻沉稳，术语准确。本次为【简化体验版】：服务端未排正经九宫盘，请你基于以下时间元数据，依奇门遁甲法理推演一个示意盘面（含值符值使、九宫天地盘、八门、九星、八神的大致落宫），并据此解局。请务必在盘面段落开头标注「以下盘面为基于时间的简化推演，仅供体验参考，非严格定局」。

【所问之事】${question ?? "未明示"}

【起卦时间】${cast.lunarBrief}（${cast.solarTime}）
【四柱】年${cast.yearGanZhi} 月${cast.monthGanZhi} 日${cast.dayGanZhi} 时${cast.hourGanZhi}（时辰地支序${cast.hourZhiIndex}）
【节气】${cast.solarTerm}
【遁局】${cast.juHint}

请按以下结构输出：
【盘面推演】先给出简化盘面（标注「简化推演，仅供参考」），列值符、值使及九宫大致分布。
${OUTPUT_STRUCTURE.replace("【卦象总览】", "【局象总览】")}`;
}

export function buildPrompt(
  cast: LiuYaoCast | MeihuaCast | QiMenCast,
  question?: string,
  locale?: "en" | "zh",
): string {
  const base = (() => {
    switch (cast.type) {
      case "LIUYAO": return buildLiuyaoPrompt(cast, question);
      case "MEIHUA": return buildMeihuaPrompt(cast, question);
      case "QIMEN": return buildQimenPrompt(cast, question);
    }
  })();
  // 英文 locale 追加语言指令；中文保持原 prompt 不变
  return locale === "en" ? base + LANGUAGE_DIRECTIVE_EN : base;
}
