import { redirect } from "next/navigation";

// 首页直接跳命理咨询页：游客可见、浏览自由，用到起卦/解读时再要求登录
export default function Home() {
  redirect("/divine");
}
