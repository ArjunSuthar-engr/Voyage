"use client";

import { Copy, Globe2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Trip } from "@/lib/types";

type ShareControlsProps = {
  trip: Trip;
  onToggle: (isPublic: boolean) => Promise<void>;
};

export function ShareControls({ trip, onToggle }: ShareControlsProps) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const shareUrl = `${siteUrl.replace(/\/$/, "")}/share/${trip.public_slug}`;

  async function copyShareUrl() {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Badge className={trip.is_public ? "border-teal-300/30 bg-teal-400/12 text-teal-100" : ""}>
            {trip.is_public ? <Globe2 className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
            {trip.is_public ? "Public itinerary" : "Private itinerary"}
          </Badge>
          {trip.is_public ? <p className="break-all text-xs text-white/50">{shareUrl}</p> : null}
        </div>
        <div className="flex gap-2">
          {trip.is_public ? (
            <Button type="button" variant="secondary" onClick={copyShareUrl}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          ) : null}
          <Button type="button" variant={trip.is_public ? "secondary" : "accent"} onClick={() => onToggle(!trip.is_public)}>
            {trip.is_public ? "Make private" : "Publish"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
