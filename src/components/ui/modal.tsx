"use client";

import { X } from "lucide-react";
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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-stone-950/35 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className={cn("max-h-[92vh] w-full overflow-auto rounded-lg bg-white shadow-xl sm:max-w-2xl", className)}>
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
            {description ? <p className="mt-1 text-sm text-stone-500">{description}</p> : null}
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
