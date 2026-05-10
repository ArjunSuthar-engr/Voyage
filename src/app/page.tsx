"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function routeUser() {
      if (!isSupabaseConfigured) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase.auth.getUser();
      router.replace(data.user ? "/dashboard" : "/login");
    }

    routeUser();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="text-sm text-stone-500">Opening Voyage...</div>
    </main>
  );
}
