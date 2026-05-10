import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border border-white/15 bg-white/10 px-2.5 py-0.5 text-xs font-semibold uppercase text-white/72",
        className,
      )}
      {...props}
    />
  );
}
