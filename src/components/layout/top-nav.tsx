"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Map, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { getUserDisplayName } from "@/lib/user";

export function TopNav() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setDisplayName(getUserDisplayName(data.user));
    }

    loadUser();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-base font-semibold text-stone-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700 text-white">
            <Map className="h-4 w-4" />
          </span>
          Voyage
        </Link>
        <nav className="flex items-center gap-2">
          {displayName ? (
            <span className="hidden max-w-44 truncate text-sm font-medium text-stone-700 sm:inline">
              {displayName}
            </span>
          ) : null}
          <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => router.push("/trips/new")}>
            <Plus className="h-4 w-4" />
            New trip
          </Button>
          <Button aria-label="Create trip" size="icon" variant="secondary" className="sm:hidden" onClick={() => router.push("/trips/new")}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button aria-label="Sign out" size="icon" variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
