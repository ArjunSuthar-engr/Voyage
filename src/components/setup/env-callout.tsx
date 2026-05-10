import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EnvCallout() {
  return (
    <Card className="border-amber-300/30 bg-amber-400/12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-100">
          <AlertTriangle className="h-5 w-5" />
          Supabase setup needed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-amber-100/80">
        <p>Add your project values to `.env.local`, then restart `npm run dev`.</p>
        <pre className="overflow-auto rounded-none border border-amber-300/20 bg-black/20 p-3 text-xs text-amber-50">
          NEXT_PUBLIC_SUPABASE_URL=...{"\n"}
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
        </pre>
      </CardContent>
    </Card>
  );
}
