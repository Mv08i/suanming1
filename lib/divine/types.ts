// 命理咨询功能共享类型定义

export type DivinationType = "LIUYAO" | "MEIHUA" | "QIMEN";

// 爻的四种性质（铜钱和值 6/7/8/9）
// 老阴(6,变阳) / 少阳(7) / 少阴(8) / 老阳(9,变阴)
export type LineNature = "old-yin" | "young-yang" | "young-yin" | "old-yang";

/** 起卦公共信息 */
export interface BaseCast {
  type: DivinationType;
  question?: string;
  solarTime: string; // 起卦时刻 ISO 字符串，用于复现
  lunarBrief: string; // 农历/干支摘要，展示用
  // 四柱（年/月/日/时），用于 prompt
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  hourGanZhi: string;
  hourZhiIndex: number; // 时辰地支序 1-based（子=1, 丑=2, ..., 亥=12）
  solarTerm?: string; // 当前节气
}

// ===== 六爻 =====
export interface LiuYaoLine extends LineInfo {
  position: number; // 1-6（初爻→上爻）
  nature: LineNature;
  isMoving: boolean; // 是否动爻（老阴/老阳）
  yinYang: "阴" | "阳"; // 阴阳（少阳/老阳=阳，少阴/老阴=阴）
  changedYinYang: "阴" | "阳" | null; // 变后阴阳（仅动爻有值）
}

export interface LineInfo {
  ganZhi: string; // 纳甲干支（六爻用）
  element: string; // 地支五行
  relation: string; // 六亲（六爻用）：父母/兄弟/子孙/妻财/官鬼
  spirit: string; // 六神（六爻用）：青龙/朱雀/勾陈/腾蛇/白虎/玄武
  shiYing: "世" | "应" | null; // 世应（六爻用）
}

export interface LiuYaoCast extends BaseCast {
  type: "LIUYAO";
  coinSums: [number, number, number, number, number, number]; // 初→上，每值 ∈ {6,7,8,9}
  primary: {
    name: string; // 卦名，如"乾为天"
    palace: string; // 八宫，如"乾宫"
    palaceElement: string; // 宫五行，如"金"
    lines: LiuYaoLine[]; // 初→上
  };
  changed: {
    name: string;
    lines: LiuYaoLine[];
  } | null; // 变卦（无动爻则 null）
  movingLines: number[]; // 动爻位 1-6
}

// ===== 梅花易数 =====
export interface MeihuaCast extends BaseCast {
  type: "MEIHUA";
  method: "time" | "number";
  upperNumber: number; // 上卦数
  lowerNumber: number; // 下卦数
  movingNumber: number; // 动爻数
  upperTrigram: string; // 上卦名（先天八卦：乾兑离震巽坎艮坤）
  lowerTrigram: string; // 下卦名
  upperElement: string; // 上卦五行
  lowerElement: string; // 下卦五行
  primary: { name: string; lines: (0 | 1)[] }; // 本卦，0阴1阳，下→上
  mutual: { name: string; lines: (0 | 1)[] }; // 互卦
  changed: { name: string; lines: (0 | 1)[] }; // 变卦
  movingLine: number; // 动爻 1-6
  tiYong: {
    ti: "upper" | "lower"; // 体卦位置
    yong: "upper" | "lower"; // 用卦位置
    tiElement: string;
    yongElement: string;
    relation: string; // 用生体/体生用/体克用/用克体/比和
    verdict: string; // 吉凶断语
  };
}

// ===== 奇门遁甲（简化版）=====
export interface QiMenCast extends BaseCast {
  type: "QIMEN";
  simplified: true; // 标注简化版
  dun: "yang" | "yin"; // 阳遁/阴遁（基于节气推断）
  juHint: string; // 局数提示（简化，非严格定局）
  lunarBrief: string;
  solarTerm: string;
  // 简化版不排正经九宫盘，盘面由 AI 在 prompt 里基于时间元数据生成
  hourGanZhi: string; // 时柱（值符定位参考）
  dayGanZhi: string; // 日柱
}

export type AnyCast = LiuYaoCast | MeihuaCast | QiMenCast;
