import { SideNav } from "@/components/dashboard/side-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TopBar } from "@/components/dashboard/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-x-hidden px-4 pb-20 pt-4 md:px-8 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-5xl space-y-6">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
