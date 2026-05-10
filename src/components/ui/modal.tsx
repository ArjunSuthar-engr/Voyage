"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export function Modal({ open, title, description, children, onClose, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end overscroll-contain bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className={cn("max-h-[92vh] w-full overflow-auto overscroll-contain rounded-none border border-white/10 bg-[#1d2127] text-white shadow-2xl sm:max-w-2xl", className)}>
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-white/55">{description}</p> : null}
          </div>
          <Button aria-label="Close dialog" size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
