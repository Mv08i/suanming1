// 三式算命的详细介绍内容（双语：zh / en）
// 用于 /divine 分类页与各算命页介绍区

export interface DivineIntro {
  fullName: string;
  origin: string;
  principle: string;
  suitable: string;
  feature: string;
}

export type DivineIntros = Record<"LIUYAO" | "MEIHUA" | "QIMEN", { zh: DivineIntro; en: DivineIntro }>;

export const DIVINE_INTROS: DivineIntros = {
  LIUYAO: {
    zh: {
      fullName: "六爻预测法（纳甲法 / 火珠林）",
      origin:
        "源于西汉京房易，完善于唐宋，是周易预测的重要分支，民间俗称「摇卦」。以铜钱代蓍，简化古法而体系严密。",
      principle:
        "以三枚铜钱摇掷六次，自下而上成初、二、三、四、五、上六爻。依铜钱正反得老阴(6)、少阳(7)、少阴(8)、老阳(9)四象，组成本卦与变卦。再配纳甲（天干地支）、六亲（父母、兄弟、子孙、妻财、官鬼）、六神（青龙、朱雀、勾陈、腾蛇、白虎、玄武）、世应，以用神与动爻生克断吉凶。",
      suitable: "具体之事的吉凶成败，如财运、婚姻、事业、考试、失物、出行、疾病等。",
      feature: "断事具体细致，体系严密，以动爻与用神生克为核心，重实事实断。",
    },
    en: {
      fullName: "Liu Yao (Na Jia / Coin Casting)",
      origin:
        "Originated from Jing Fang of the Western Han, refined through the Tang and Song. A major branch of Zhou Yi prediction, colloquially called 'coin shaking'. Uses coins in place of yarrow stalks, simplifying the ancient method while keeping a rigorous system.",
      principle:
        "Three coins are shaken six times to form six lines (bottom to top). Each throw yields one of four states: Old Yin (6), Young Yang (7), Young Yin (8), or Old Yang (9), composing the primary and changed hexagrams. Lines are then assigned Na Jia (heavenly stems & earthly branches), Six Relations (Parents, Brothers, Children, Wealth, Officials), Six Spirits (Azure Dragon, Vermilion Bird, Hooked Chen, Flying Serpent, White Tiger, Black Warrior), and Shi/Ying positions. Fortune is judged from the Yong (focus) line and moving lines' interactions.",
      suitable: "Specific questions of fortune: wealth, marriage, career, exams, lost items, travel, illness, etc.",
      feature: "Concrete and detailed; rigorous system centered on moving lines and Yong-Shen interactions.",
    },
  },
  MEIHUA: {
    zh: {
      fullName: "梅花易数（心易）",
      origin:
        "相传为北宋邵雍（康节）先生所创，以「万物皆可起卦」为旨，属象数易学一脉。",
      principle:
        "以时间（年月日时辰）、数字、方位、声音、颜色等任意机锋起卦，得上卦、下卦与动爻。以「体用」为核心——不动为体卦，动爻所在为用卦，看体用五行生克（用生体吉、体生用泄、体克用得、用克体凶、比和顺），兼看互卦与变卦。",
      suitable: "随机机锋、突发之事、心中一动、见闻起卦，灵活简便，不拘仪轨。",
      feature: "心易相通，重象数与体用关系，起卦灵活，善断机锋与心境之事。",
    },
    en: {
      fullName: "Plum Blossom Divination (Heart Yi)",
      origin:
        "Attributed to Shao Yong (Kangjie) of the Northern Song. Holds that 'all things can form a hexagram'. Belongs to the Image-Number school of Yi learning.",
      principle:
        "A hexagram is cast from time (year/month/day/hour), numbers, direction, sound, color, or any omen, yielding upper trigram, lower trigram, and a moving line. The core is Ti-Yong (body-use): the static trigram is Ti, the one with the moving line is Yong. Fortune is read from the Five Phases interaction between Ti and Yong (Yong generating Ti = auspicious; Ti generating Yong = draining; Ti overcoming Yong = gain; Yong overcoming Ti = ill; parallel = smooth), together with mutual and changed hexagrams.",
      suitable: "Random omens, sudden events, intuitive flashes; flexible and requires no ritual setup.",
      feature: "Heart and Image intertwined; centered on Ti-Yong and Five Phases; flexible casting, good for reading omens and states of mind.",
    },
  },
  QIMEN: {
    zh: {
      fullName: "奇门遁甲",
      origin:
        "古称「帝王之学」，与太乙神数、大六壬并称「三式」。相传始于黄帝、风后，姜太公、张良、诸葛亮皆精此术。",
      principle:
        "以起卦时辰排盘，先定阳遁/阴遁（依冬至至夏至节气），再定局数（一至九局），布九宫（洛书）、天地盘、八门（休生伤杜景死惊开）、九星、八神、值符值使，以格局生克断趋避之道。",
      suitable: "择方行事、谋略决断、趋吉避凶、大事方位选择。",
      feature:
        "本站为简化体验版，仅定阴阳遁与局数提示，未严格按置闰定局排正经九宫盘；AI 基于四柱节气推演，仅供参考。",
    },
    en: {
      fullName: "Qi Men Dun Jia",
      origin:
        "Known in antiquity as 'the study of emperors'; together with Tai Yi and Liu Ren it forms the 'Three Styles'. Legend traces it to the Yellow Emperor and Feng Hou; Jiang Tai Gong, Zhang Liang, and Zhuge Liang were all masters.",
      principle:
        "A chart is arranged by the casting hour: first determine Yang-dun or Yin-dun (by solar terms from winter to summer solstice), then the Ju number (1-9), then distribute the Nine Palaces (Luo Shu), heaven and earth plates, Eight Gates (Rest, Life, Harm, Block, View, Death, Alarm, Open), Nine Stars, Eight Spirits, and the Duty Star/Duty Gate. Fortune and strategy are read from the interactions of these patterns.",
      suitable: "Choosing directions, strategy and decisions, seeking auspice and avoiding harm, selecting bearings for important matters.",
      feature:
        "This site runs a simplified edition: it determines Yang/Yin-dun and the Ju number hint, but does not fully arrange the strict Nine-Palace chart with intercalary rules. The AI extrapolates from the four pillars and solar term; for reference only.",
    },
  },
};

/** 介绍字段标签（双语） */
export const INTRO_FIELDS: { label: { zh: string; en: string }; field: keyof DivineIntro }[] = [
  { label: { zh: "全称", en: "Full name" }, field: "fullName" },
  { label: { zh: "源流", en: "Origin" }, field: "origin" },
  { label: { zh: "原理", en: "Principle" }, field: "principle" },
  { label: { zh: "适用", en: "Suitable for" }, field: "suitable" },
  { label: { zh: "特点", en: "Feature" }, field: "feature" },
];
