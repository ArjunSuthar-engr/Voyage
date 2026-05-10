"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#101216]/95 backdrop-blur">
      <div className="mx-auto grid h-20 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 text-xs font-semibold uppercase text-white/72 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-4">
          <Link className="transition hover:text-white" href="/dashboard">
            Trips
          </Link>
        </nav>
        <Link href="/dashboard" className="font-serif text-2xl font-semibold italic normal-case text-white">
          Voyage
        </Link>
        <nav className="flex items-center justify-end gap-2 sm:gap-3">
          {displayName ? (
            <span className="hidden max-w-44 truncate text-right text-xs font-semibold uppercase text-white/55 sm:inline">
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
