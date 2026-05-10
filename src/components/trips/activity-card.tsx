"use client";

import { Edit2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryClasses, categoryLabels, formatCurrency, formatTime } from "@/lib/format";
import type { Activity } from "@/lib/types";

type ActivityCardProps = {
  activity: Activity;
  currency: string;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ActivityCard({ activity, currency, readOnly, onEdit, onDelete }: ActivityCardProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className={categoryClasses[activity.category]}>{categoryLabels[activity.category]}</Badge>
            <span className="text-xs font-medium text-stone-500">{formatTime(activity.start_time)}</span>
            <span className="text-xs font-medium text-stone-500">{formatCurrency(activity.cost, currency)}</span>
          </div>
          <p className="font-medium text-stone-950">{activity.title}</p>
          {activity.notes ? <p className="mt-1 text-sm text-stone-500">{activity.notes}</p> : null}
        </div>
        {!readOnly ? (
          <div className="flex shrink-0 gap-1">
            <Button aria-label="Edit activity" size="icon" type="button" variant="ghost" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button aria-label="Delete activity" size="icon" type="button" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
