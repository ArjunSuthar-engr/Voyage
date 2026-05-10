import type { ReactNode } from "react";

import { TopNav, type TopNavSignOutMode } from "@/components/layout/top-nav";

type AppShellProps = {
  children: ReactNode;
  signOutMode?: TopNavSignOutMode;
};

export function AppShell({ children, signOutMode }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#14171b] text-white">
      <TopNav signOutMode={signOutMode} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
