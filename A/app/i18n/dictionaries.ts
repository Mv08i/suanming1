// 全站中英文字典
// 命名约定：page.section.element 或 component.element

export type Locale = "en" | "zh";

export const DICT = {
  // ===== 通用 =====
  "common.brand": { zh: "卜微", en: "BuWei" },
  "common.loading": { zh: "…", en: "…" },
  "common.credits": { zh: "积分", en: "credits" },

  // ===== 导航 =====
  "nav.cast": { zh: "起卦", en: "Cast" },
  "nav.history": { zh: "历史", en: "History" },
  "nav.dashboard": { zh: "控制台", en: "Dashboard" },
  "nav.chat": { zh: "对话", en: "Chat" },
  "nav.credits": { zh: "充值", en: "Credits" },
  "nav.logout": { zh: "登出", en: "Log out" },
  "nav.login": { zh: "登录 / 注册", en: "Sign in / Sign up" },
  "nav.balance": { zh: "余额", en: "Balance" },

  // ===== 算命首页 =====
  "divine.home.subtitle": {
    zh: "AI 智能解卦 · 六爻 · 梅花易数 · 奇门遁甲 · 起卦问事，尽得玄机",
    en: "AI-powered Chinese divination — Liu Yao, Plum Blossom & Qi Men Dun Jia. Cast your hexagram, get your reading.",
  },
  "divine.home.introsTitle": { zh: "三式介绍", en: "Three Methods Intro" },
  "divine.home.introLabel": { zh: "介绍", en: "Intro" },

  // ===== 三式卡片（首页） =====
  "divine.liuyao.tag": { zh: "铜钱起卦", en: "Coin Cast" },
  "divine.liuyao.title": { zh: "六爻", en: "Liu Yao" },
  "divine.liuyao.desc": {
    zh: "摇铜钱六次成卦，纳甲六亲、世应动爻，断所问之事吉凶。",
    en: "Shake six coins to form a hexagram; uses Na Jia, Six Relations, and moving lines to judge fortune.",
  },
  "divine.meihua.tag": { zh: "时间/数字", en: "Time/Number" },
  "divine.meihua.title": { zh: "梅花易数", en: "Plum Blossom" },
  "divine.meihua.desc": {
    zh: "以时间或数字起卦，体用五行生克，互变卦象，断机于微。",
    en: "Cast by time or number; uses Ti-Yong (body-use) and Five Phases interactions to read the omen.",
  },
  "divine.qimen.tag": { zh: "简化体验版", en: "Simplified" },
  "divine.qimen.title": { zh: "奇门遁甲", en: "Qi Men Dun Jia" },
  "divine.qimen.desc": {
    zh: "以时辰排盘，值符值使、九宫天地盘、八门九星八神，断趋避之道。",
    en: "Arranges a chart by hour; uses Nine Palaces, Eight Gates, Nine Stars, and Eight Spirits to find the auspicious path.",
  },

  // ===== 六爻起卦页 =====
  "liuyao.heading": { zh: "六爻起卦", en: "Liu Yao Casting" },
  "liuyao.hint": {
    zh: "摇铜钱六次（初→上）成卦；或切到「手动选卦」直接点选爻象。起卦免费，AI 解卦扣 5 积分。",
    en: "Shake six coins (bottom to top) to cast; or switch to Manual to pick lines directly. Casting is free; AI reading costs 5 credits.",
  },
  "liuyao.questionPlaceholder": {
    zh: "所问之事（可选，如：问近期财运）",
    en: "Your question (optional, e.g. recent fortune)",
  },
  "liuyao.tabShake": { zh: "摇铜钱", en: "Shake Coins" },
  "liuyao.tabManual": { zh: "手动选卦", en: "Manual" },
  "liuyao.btnReset": { zh: "重置", en: "Reset" },
  "liuyao.shakenCount": { zh: "已摇 {n}/6 爻", en: "Shaken {n}/6" },
  "liuyao.btnShake": { zh: "摇第 {n} 爻", en: "Shake line {n}" },
  "liuyao.shaking": { zh: "摇卦中…", en: "Shaking…" },
  "liuyao.done": { zh: "已摇完", en: "Done" },
  "liuyao.manualHint": { zh: "点选每爻阴阳，勾选动爻", en: "Pick Yin/Yang for each line, check moving lines" },
  "liuyao.yang": { zh: "阳 ▬▬", en: "Yang ▬▬" },
  "liuyao.yin": { zh: "阴 ▬ ▬", en: "Yin ▬ ▬" },
  "liuyao.moving": { zh: "动爻", en: "Moving" },
  "liuyao.btnCast": { zh: "起卦", en: "Cast" },
  "liuyao.castFailed": { zh: "起卦失败", en: "Casting failed" },
  "liuyao.castRequestFailed": { zh: "起卦请求失败", en: "Cast request failed" },

  // ===== 卦象展示 =====
  "gua.primary": { zh: "本卦", en: "Primary" },
  "gua.changed": { zh: "变卦", en: "Changed" },
  "gua.moving": { zh: "动爻", en: "Moving" },
  "gua.noMoving": { zh: "无（静卦）", en: "None (static)" },
  "gua.thLine": { zh: "爻", en: "Line" },
  "gua.thYinYang": { zh: "阴阳", en: "Yin/Yang" },
  "gua.thNaJia": { zh: "纳甲", en: "Na Jia" },
  "gua.thRelation": { zh: "六亲", en: "Relation" },
  "gua.thSpirit": { zh: "六神", en: "Spirit" },
  "gua.thShiYing": { zh: "世应", en: "Shi/Ying" },
  "gua.movingMark": { zh: "○动", en: " ○move" },
  "gua.palaceSuffix": { zh: "宫", en: " palace" },
  "gua.daySuffix": { zh: "日", en: "" },

  // ===== AI 解卦面板 =====
  "interp.title": { zh: "AI 解卦", en: "AI Reading" },
  "interp.btnStop": { zh: "停止", en: "Stop" },
  "interp.btnStart": { zh: "开始解卦（扣 5 积分）", en: "Start reading (5 credits)" },
  "interp.btnRestart": { zh: "重新解卦", en: "Read again" },
  "interp.thinking": { zh: "AI 思考中", en: "AI is thinking" },
  "interp.meta": { zh: "模型 {model} · 扣 {credits} 积分 · 余额 {balance}", en: "Model {model} · {credits} credits · Balance {balance}" },
  "interp.doneMeta": { zh: "完成 · 输入 {in} / 输出 {out} token · 余额 {balance}", en: "Done · in {in} / out {out} tokens · balance {balance}" },

  // ===== 爻名 =====
  "yao.1": { zh: "初", en: "1st" },
  "yao.2": { zh: "二", en: "2nd" },
  "yao.3": { zh: "三", en: "3rd" },
  "yao.4": { zh: "四", en: "4th" },
  "yao.5": { zh: "五", en: "5th" },
  "yao.6": { zh: "上", en: "6th" },
  "yao.suffix": { zh: "爻", en: "" },

  // ===== 铜钱正反 =====
  "coin.back": { zh: "背", en: "B" },
  "coin.face": { zh: "字", en: "F" },
  "coin.oldYin": { zh: "老阴·动", en: "Old Yin·move" },
  "coin.oldYang": { zh: "老阳·动", en: "Old Yang·move" },
  "coin.youngYang": { zh: "少阳", en: "Young Yang" },
  "coin.youngYin": { zh: "少阴", en: "Young Yin" },

  // ===== 梅花易数页 =====
  "meihua.heading": { zh: "梅花易数", en: "Plum Blossom Divination" },
  "meihua.hint": {
    zh: "选时间起卦或输入数字起卦，得本卦、互卦、变卦与体用分析。起卦免费，AI 解卦扣 5 积分。",
    en: "Cast by time or by number; yields primary, mutual, changed hexagrams and Ti-Yong analysis. Casting is free; AI reading costs 5 credits.",
  },
  "meihua.tabTime": { zh: "时间起卦", en: "By Time" },
  "meihua.tabNumber": { zh: "数字起卦", en: "By Number" },
  "meihua.numberPlaceholder": { zh: "输入数字（如 123）", en: "Enter a number (e.g. 123)" },
  "meihua.numberInvalid": { zh: "请输入有效数字", en: "Please enter a valid number" },
  "meihua.btnCast": { zh: "起卦", en: "Cast" },

  // ===== 奇门遁甲页 =====
  "qimen.heading": { zh: "奇门遁甲", en: "Qi Men Dun Jia" },
  "qimen.hint": {
    zh: "以当前时辰起盘（简化体验版）。起盘免费，AI 解卦扣 5 积分。",
    en: "Arranges a chart by current hour (simplified edition). Charting is free; AI reading costs 5 credits.",
  },
  "qimen.btnCast": { zh: "起盘", en: "Draw Chart" },
  "qimen.castFailed": { zh: "起盘失败", en: "Charting failed" },
  "qimen.castRequestFailed": { zh: "起盘请求失败", en: "Chart request failed" },
  "qimen.simplifiedNote": { zh: "简化体验版", en: "Simplified edition" },
  "qimen.dunLabel": { zh: "遁", en: "dun" },
  "qimen.juLabel": { zh: "局", en: "ju" },
  "qimen.termLabel": { zh: "节气", en: "Solar term" },
  "qimen.fourPillars": { zh: "四柱", en: "Four Pillars" },
  "qimen.yearLabel": { zh: "年", en: "Year" },
  "qimen.monthLabel": { zh: "月", en: "Month" },
  "qimen.dayLabel": { zh: "日", en: "Day" },
  "qimen.hourLabel": { zh: "时", en: "Hour" },

  // ===== 历史页 =====
  "history.title": { zh: "算命历史", en: "Divination History" },
  "history.empty": { zh: "暂无记录", en: "No records yet" },
  "history.btnRecast": { zh: "再算一卦", en: "Cast again" },
  "history.colTime": { zh: "时间", en: "Time" },
  "history.colType": { zh: "类型", en: "Type" },
  "history.colQuestion": { zh: "所问", en: "Question" },
  "history.colSummary": { zh: "摘要", en: "Summary" },

  // ===== 登录页 =====
  "login.heading": { zh: "登录", en: "Sign in" },
  "login.subheading": { zh: "使用邮箱和密码登录", en: "Sign in with email and password" },
  "login.email": { zh: "邮箱", en: "Email" },
  "login.password": { zh: "密码", en: "Password" },
  "login.btnSubmit": { zh: "登录", en: "Sign in" },
  "login.btnSubmitting": { zh: "登录中...", en: "Signing in..." },
  "login.linkRegister": { zh: "注册", en: "Sign up" },
  "login.noAccount": { zh: "还没有账号？", en: "No account?" },
  "login.termsPrefix": { zh: "登录即表示你同意我们的", en: "By signing in you agree to our" },
  "login.termsLink": { zh: "服务条款", en: "Terms" },
  "login.privacyLink": { zh: "隐私政策", en: "Privacy Policy" },
  "login.andJoiner": { zh: "与", en: "and" },
  "login.errorEmpty": { zh: "邮箱和密码不能为空", en: "Email and password are required" },
  "login.errorInvalid": { zh: "邮箱或密码错误", en: "Invalid email or password" },

  // ===== 注册页 =====
  "register.heading": { zh: "注册账号", en: "Create account" },
  "register.subheading": { zh: "创建账号开始使用", en: "Create an account to get started" },
  "register.name": { zh: "昵称（可选）", en: "Name (optional)" },
  "register.email": { zh: "邮箱", en: "Email" },
  "register.password": { zh: "密码（至少 8 位）", en: "Password (at least 8 chars)" },
  "register.btnSubmit": { zh: "注册", en: "Sign up" },
  "register.btnSubmitting": { zh: "注册中...", en: "Signing up..." },
  "register.linkLogin": { zh: "去登录", en: "Sign in" },
  "register.hasAccount": { zh: "已有账号？", en: "Already have an account?" },
  "register.termsPrefix": { zh: "注册即表示你同意我们的", en: "By signing up you agree to our" },
  "register.termsLink": { zh: "服务条款", en: "Terms of Service" },
  "register.privacyLink": { zh: "隐私政策", en: "Privacy Policy" },
  "register.andJoiner": { zh: "与", en: "and" },
  "register.errorExists": { zh: "该邮箱已注册", en: "Email already registered" },
  "register.errorShort": { zh: "密码至少 8 位", en: "Password must be at least 8 characters" },
  "register.errorAutoLogin": { zh: "自动登录失败，请前往登录页手动登录", en: "Auto-login failed, please sign in manually" },

  // ===== 控制台 =====
  "dashboard.welcome": { zh: "欢迎，", en: "Welcome, " },
  "dashboard.balanceTitle": { zh: "当前积分余额", en: "Current balance" },
  "dashboard.totalCharged": { zh: "累计充值", en: "Total charged" },
  "dashboard.totalUsed": { zh: "累计消耗", en: "Total used" },
  "dashboard.successCount": { zh: "AI 对话成功次数", en: "Successful AI calls" },
  "dashboard.failedCount": { zh: "失败次数（自动回退积分）", en: "Failed (auto-refunded)" },
  "dashboard.failedHint": { zh: "每次失败会自动把扣的 5 积分退回", en: "Failed calls auto-refund 5 credits" },
  "dashboard.recentTx": { zh: "最近流水", en: "Recent transactions" },
  "dashboard.goChat": { zh: "AI 对话 →", en: "AI Chat →" },
  "dashboard.goCast": { zh: "去对话 →", en: "Go to chat →" },
  "dashboard.recharge": { zh: "充值", en: "Recharge" },
  "dashboard.txRecharge": { zh: "充值", en: "Recharge" },
  "dashboard.txConsume": { zh: "消耗", en: "Use" },
  "dashboard.txRefund": { zh: "回退", en: "Refund" },
  "dashboard.txSignupBonus": { zh: "注册赠送 {n} 积分", en: "Signup bonus {n} credits" },

  // ===== 充值页 =====
  "credits.title": { zh: "充值积分", en: "Buy credits" },
  "credits.subtitle": { zh: "选择套餐，跳转 Creem 安全支付", en: "Pick a package and pay securely via Creem" },
  "credits.bonusSuffix": { zh: "积分赠送", en: "bonus credits" },
  "credits.btnBuy": { zh: "购买", en: "Buy" },
  "credits.redirecting": { zh: "跳转支付中…", en: "Redirecting to checkout…" },
  "credits.backDashboard": { zh: "← 返回控制台", en: "← Back to dashboard" },
  "credits.success.title": { zh: "充值成功", en: "Payment successful" },
  "credits.success.body": { zh: "积分已到账，可继续使用 AI 对话或算命。", en: "Credits added. You can continue using AI chat or divination." },
  "credits.success.back": { zh: "返回控制台", en: "Back to dashboard" },

  // ===== 对话页 =====
  "chat.title": { zh: "AI 对话", en: "AI Chat" },
  "chat.placeholder": { zh: "输入消息...", en: "Type a message..." },
  "chat.btnSend": { zh: "发送", en: "Send" },
  "chat.sending": { zh: "发送中...", en: "Sending..." },
  "chat.stop": { zh: "停止", en: "Stop" },
  "chat.back": { zh: "← 返回控制台", en: "← Back to dashboard" },
  "chat.emptyHint": { zh: "输入消息开始对话，每次扣 5 积分", en: "Type a message to start, 5 credits per message" },
  "chat.welcome": {
    zh: "你好！我是 AI 助手。每次对话固定扣除 5 积分。请在下方输入你的问题，按回车发送。",
    en: "Hi! I'm your AI assistant. Each message costs 5 credits. Type your question below and press Enter to send.",
  },
  "chat.costHint": { zh: "每次对话固定扣除 5 积分 · 流式响应", en: "5 credits per message · streaming" },
  "chat.balanceLabel": { zh: "当前余额：", en: "Balance: " },
  "chat.creditsUnit": { zh: "积分", en: "credits" },
  "chat.loading": { zh: "加载中...", en: "Loading..." },
  "chat.thinking": { zh: "思考中...", en: "Thinking..." },
  "chat.costThis": { zh: "本次消耗", en: "Cost" },
  "chat.balanceWord": { zh: "余额", en: "balance" },
  "chat.inputPlaceholder": {
    zh: "输入你的问题...（回车发送，Shift+Enter 换行）",
    en: "Type your question... (Enter to send, Shift+Enter for newline)",
  },
  "chat.errorNetwork": { zh: "网络错误", en: "Network error" },
  "chat.errorStream": { zh: "无法读取响应流", en: "Cannot read response stream" },
  "chat.errorCancelled": { zh: "已取消", en: "Cancelled" },
  "chat.errorRequestFailed": { zh: "请求失败", en: "Request failed" },

  // ===== 合规页 =====
  "legal.effective": { zh: "生效日期：", en: "Effective: " },
  "legal.contact": { zh: "联系我们", en: "Contact" },
  "legal.backHome": { zh: "← 返回首页", en: "← Back home" },
  "legal.termsTitle": { zh: "服务条款", en: "Terms of Service" },
  "legal.privacyTitle": { zh: "隐私政策", en: "Privacy Policy" },
  "legal.termsLink": { zh: "服务条款", en: "Terms of Service" },
  "legal.privacyLink": { zh: "隐私政策", en: "Privacy Policy" },

  // ===== 语言切换 =====
  "lang.en": { zh: "EN", en: "EN" },
  "lang.zh": { zh: "中", en: "中" },
} as const;

export type DictKey = keyof typeof DICT;

/** 从字典取文案，支持插值 */
export function translate(
  locale: Locale,
  key: DictKey,
  params?: Record<string, string | number>,
): string {
  const entry = DICT[key] as Record<Locale, string>;
  let s: string = entry[locale] ?? entry.en;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}
