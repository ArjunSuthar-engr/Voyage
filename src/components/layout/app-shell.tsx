import type { ReactNode } from "react";

import { TopNav } from "@/components/layout/top-nav";
import type { Trip } from "@/lib/types";

type AppShellProps = {
  children: ReactNode;
  currentTripId?: string;
  trips?: Trip[];
};

export function AppShell({ children, currentTripId, trips }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#14171b] text-white">
      <TopNav currentTripId={currentTripId} trips={trips} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
