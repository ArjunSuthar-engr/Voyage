import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EnvCallout() {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-950">
          <AlertTriangle className="h-5 w-5" />
          Supabase setup needed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-amber-900">
        <p>Add your project values to `.env.local`, then restart `npm run dev`.</p>
        <pre className="overflow-auto rounded-md bg-white/80 p-3 text-xs">
          NEXT_PUBLIC_SUPABASE_URL=...{"\n"}
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
        </pre>
      </CardContent>
    </Card>
  );
}
