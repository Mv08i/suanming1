import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ChatClientPage from "./chat-client";
import ChatHeader from "./chat-header";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const balance = await prisma.creditBalance.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="min-h-screen">
      <ChatHeader
        email={session.user.email ?? ""}
        balance={balance?.balance ?? 0}
      />
      <main className="mx-auto max-w-5xl p-4">
        <ChatClientPage />
      </main>
    </div>
  );
}
