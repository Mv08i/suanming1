// 64卦静态数据 + 纳甲 + 六亲 + 六神 + 世应推导
// 数据来源：京房八宫归藏法 + 传统纳甲口诀
// trigram 二进制（bit2 bit1 bit0 从下到上爻）：
//   0=坤(000) 1=震(001) 2=坎(010) 3=兑(011) 4=艮(100) 5=离(101) 6=巽(110) 7=乾(111)

// 八卦信息（按二进制值索引 0-7）
export const TRIGRAM_NAME = ["坤", "震", "坎", "兑", "艮", "离", "巽", "乾"];
export const TRIGRAM_NATURE = ["地", "雷", "水", "泽", "山", "火", "风", "天"];
export const TRIGRAM_ELEMENT = ["土", "木", "水", "金", "土", "火", "木", "金"]; // 八卦五行

// 先天序数(1-8) → 二进制值：1乾2兑3离4震5巽6坎7艮8坤
export const XIANTIAN_TO_BIN = [7, 3, 5, 1, 6, 2, 4, 0];

/** 单卦描述 */
export interface TrigramInfo {
  bin: number;
  name: string; // 乾/兑/...
  nature: string; // 天/泽/...
  element: string; // 金/火/...
  lines: [number, number, number]; // 三爻 0阴1阳，从下到上
}

export function trigramByBin(bin: number): TrigramInfo {
  return {
    bin,
    name: TRIGRAM_NAME[bin],
    nature: TRIGRAM_NATURE[bin],
    element: TRIGRAM_ELEMENT[bin],
    lines: [(bin & 1) ? 1 : 0, (bin & 2) ? 1 : 0, (bin & 4) ? 1 : 0],
  };
}

export function trigramByXiantian(n: number): TrigramInfo {
  return trigramByBin(XIANTIAN_TO_BIN[n - 1]);
}

// ===== 64卦表：GUA_RAW[lowerBin][upperBin] =====
// 规则：卦名 = 上卦特性 + 下卦特性 + 名（如"水天需"=上坎水+下乾天）
// 已逐宫核对（乾/坤/坎/离/震/巽/艮/兑 八宫各 8 卦归属正确）
const GUA_RAW: [string, string, number][][] = [
  // 下坤(0,地)
  [["坤为地","坤",1],["雷地豫","震",2],["水地比","坤",8],["泽地萃","兑",3],["山地剥","乾",6],["火地晋","乾",7],["风地观","乾",5],["天地否","乾",4]],
  // 下震(1,雷)
  [["地雷复","坤",2],["震为雷","震",1],["水雷屯","坎",3],["泽雷随","震",8],["山雷颐","巽",7],["火雷噬嗑","巽",6],["风雷益","巽",4],["天雷无妄","巽",5]],
  // 下坎(2,水)
  [["地水师","坎",8],["雷水解","震",3],["坎为水","坎",1],["泽水困","兑",2],["山水蒙","离",5],["火水未济","离",4],["风水涣","离",6],["天水讼","离",7]],
  // 下兑(3,泽)
  [["地泽临","坤",3],["雷泽归妹","兑",8],["水泽节","坎",2],["兑为泽","兑",1],["山泽损","艮",4],["火泽睽","艮",5],["风泽中孚","艮",7],["天泽履","艮",6]],
  // 下艮(4,山)
  [["地山谦","兑",6],["雷山小过","兑",7],["水山蹇","兑",5],["泽山咸","兑",4],["艮为山","艮",1],["火山旅","离",2],["风山渐","艮",8],["天山遁","乾",3]],
  // 下离(5,火)
  [["地火明夷","坎",7],["雷火丰","坎",6],["水火既济","坎",4],["泽火革","坎",5],["山火贲","艮",2],["离为火","离",1],["风火家人","巽",3],["天火同人","离",8]],
  // 下巽(6,风)
  [["地风升","震",5],["雷风恒","震",4],["水风井","震",6],["泽风大过","震",7],["山风蛊","巽",8],["火风鼎","离",3],["巽为风","巽",1],["天风姤","乾",2]],
  // 下乾(7,天)
  [["地天泰","坤",4],["雷天大壮","坤",5],["水天需","坤",7],["泽天夬","坤",6],["山天大畜","艮",3],["火天大有","乾",8],["风天小畜","巽",2],["乾为天","乾",1]],
];

export interface GuaInfo {
  name: string;
  palace: string; // 宫名：乾/坎/艮/震/巽/离/坤/兑
  position: number; // 宫中位置 1-8（1本卦,2一世,...,6五世,7游魂,8归魂）
  lowerBin: number;
  upperBin: number;
}

export function lookupGua(lowerBin: number, upperBin: number): GuaInfo {
  const row = GUA_RAW[lowerBin];
  if (!row) throw new Error(`无效下卦: ${lowerBin}`);
  const cell = row[upperBin];
  if (!cell) throw new Error(`无效上卦: ${upperBin}`);
  return {
    name: cell[0],
    palace: cell[1],
    position: cell[2],
    lowerBin,
    upperBin,
  };
}

// ===== 宫五行 =====
export const PALACE_ELEMENT: Record<string, string> = {
  乾: "金", 兑: "金", 离: "火", 震: "木", 巽: "木", 坎: "水", 艮: "土", 坤: "土",
};

// ===== 纳甲表（按宫，初→上 6 爻干支）=====
export const NA_JIA: Record<string, string[]> = {
  乾: ["甲子", "甲寅", "甲辰", "壬午", "壬申", "壬戌"],
  坤: ["乙未", "乙巳", "乙卯", "癸丑", "癸亥", "癸酉"],
  坎: ["戊寅", "戊辰", "戊午", "戊申", "戊戌", "戊子"],
  离: ["己卯", "己丑", "己亥", "己酉", "己未", "己巳"],
  震: ["庚子", "庚寅", "庚辰", "庚午", "庚申", "庚戌"],
  巽: ["辛丑", "辛亥", "辛酉", "辛未", "辛巳", "辛卯"],
  艮: ["丙辰", "丙午", "丙申", "丙戌", "丙子", "丙寅"],
  兑: ["丁巳", "丁卯", "丁丑", "丁亥", "丁酉", "丁未"],
};

// ===== 地支五行 =====
export const ZHI_ELEMENT: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

/** 从纳甲干支取地支 */
export function zhiOfGanZhi(gz: string): string {
  return gz[1]; // "甲子"→"子"
}

// ===== 六亲（以宫五行为"我"，地支五行为"他"）=====
// 生我=父母, 同我=兄弟, 我生=子孙, 我克=妻财, 克我=官鬼
const WU_XING_RELATION: Record<string, Record<string, string>> = {
  // 我五行 → 他五行 → 关系
  金: { 土: "父母", 金: "兄弟", 水: "子孙", 木: "妻财", 火: "官鬼" },
  木: { 水: "父母", 木: "兄弟", 火: "子孙", 土: "妻财", 金: "官鬼" },
  水: { 金: "父母", 水: "兄弟", 木: "子孙", 火: "妻财", 土: "官鬼" },
  火: { 木: "父母", 火: "兄弟", 土: "子孙", 水: "妻财", 金: "官鬼" },
  土: { 火: "父母", 土: "兄弟", 金: "子孙", 水: "妻财", 木: "官鬼" },
};

export function sixRelation(palaceElement: string, zhiElement: string): string {
  return WU_XING_RELATION[palaceElement]?.[zhiElement] ?? "未知";
}

// ===== 六神 =====
export const SIX_SPIRITS = ["青龙", "朱雀", "勾陈", "腾蛇", "白虎", "玄武"];

// 日干 → 六神起点索引（在 SIX_SPIRITS 中的位置）
const DAY_STEM_TO_SPIRIT_START: Record<string, number> = {
  甲: 0, 乙: 0, 丙: 1, 丁: 1, 戊: 2, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5,
};

/** 取某爻的六神：dayStem(甲乙丙丁...) + 爻位(1-6) */
export function spiritOfDay(dayStem: string, position: number): string {
  const start = DAY_STEM_TO_SPIRIT_START[dayStem] ?? 0;
  return SIX_SPIRITS[(start + position - 1) % 6];
}

// ===== 世应 =====
// position(1-8) → 世爻位置(1-6)
const POSITION_TO_SHI: Record<number, number> = {
  1: 6, // 本卦：世在上
  2: 1, // 一世：初
  3: 2, // 二世：二
  4: 3, // 三世：三
  5: 4, // 四世：四
  6: 5, // 五世：五
  7: 4, // 游魂：四
  8: 3, // 归魂：三
};

/** 取世爻位置（1-6） */
export function shiPosition(position: number): number {
  return POSITION_TO_SHI[position] ?? 1;
}

/** 取应爻位置（世隔两位） */
export function yingPosition(position: number): number {
  const shi = shiPosition(position);
  return ((shi + 1) % 6) + 1; // 世+2，超6回绕
}
