import * as React from "react";

import { cn } from "@/lib/utils";

export function NativeSelect({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-none border border-white/15 bg-[#1d2127] px-3 text-sm text-white outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
