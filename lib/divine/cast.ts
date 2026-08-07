// 起卦统一入口：根据 type 调度到三类算法
// 服务端终判：cast/interpret 路由都调此函数，不信任客户端的卦象内容

import { getCalendarInfo } from "./calendar";
import { castLiuYao, validateCoinSums } from "./liuyao";
import { castMeihua } from "./meihua";
import { castQiMen } from "./qimen";
import type { AnyCast, DivinationType } from "./types";

export interface CastRequest {
  type: DivinationType;
  question?: string;
  // 六爻：6 次铜钱和值（初→上，每值 6/7/8/9）
  coinSums?: number[];
  // 梅花：起卦方式 + 数字（数字法用）
  method?: "time" | "number";
  number?: number;
}

/** 执行起卦（服务端终判，date 默认当前时刻） */
export function performCast(req: CastRequest, date: Date = new Date()): AnyCast {
  const cal = getCalendarInfo(date);
  switch (req.type) {
    case "LIUYAO": {
      if (!req.coinSums) throw new Error("六爻需提供 coinSums");
      validateCoinSums(req.coinSums);
      return castLiuYao(
        req.coinSums as [number, number, number, number, number, number],
        cal,
        req.question,
      );
    }
    case "MEIHUA": {
      return castMeihua(req.method ?? "time", cal, req.number, req.question);
    }
    case "QIMEN": {
      return castQiMen(cal, req.question);
    }
    default:
      throw new Error(`未知算命类型: ${(req as { type: string }).type}`);
  }
}
