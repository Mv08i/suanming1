import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardNav from "./dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200">
        <DashboardNav email={session.user.email ?? ""} />
      </header>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
