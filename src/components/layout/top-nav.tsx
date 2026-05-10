"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { supabase } from "@/lib/supabase";
import type { Trip } from "@/lib/types";
import { getUserDisplayName } from "@/lib/user";

type TopNavProps = {
  currentTripId?: string;
  trips?: Trip[];
};

export function TopNav({ currentTripId, trips = [] }: TopNavProps) {
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const hasTripSelector = trips.length > 0 && currentTripId;

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setDisplayName(getUserDisplayName(data.user));
    }

    loadUser();
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && userMenuRef.current?.contains(target)) return;
      setUserMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [userMenuOpen]);

  async function handleSignOut() {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#101216]/95 backdrop-blur">
      <div className="mx-auto grid h-20 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 text-xs font-semibold uppercase text-white/72 sm:px-6 lg:px-8">
        <nav className="flex min-w-0 items-center gap-4">
          {hasTripSelector ? (
            <NativeSelect
              aria-label="Select trip"
              className="h-9 max-w-44 border-white/10 bg-[#181b20] pr-8 text-xs font-semibold uppercase text-white/72 sm:max-w-64"
              value={currentTripId}
              onChange={(event) => router.push(`/trips/${event.target.value}`)}
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </NativeSelect>
          ) : (
            <Link className="transition hover:text-white" href="/trips">
              Trips
            </Link>
          )}
        </nav>
        <Link href="/" className="font-serif text-2xl font-semibold italic normal-case text-white">
          Voyage
        </Link>
        <nav className="flex items-center justify-end gap-2 sm:gap-3">
          <div ref={userMenuRef} className="relative">
            <button
              className="flex max-w-36 items-center gap-2 truncate text-right text-xs font-semibold uppercase text-white/55 transition hover:text-white sm:max-w-44"
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
            >
              <span className="truncate">{displayName || "Account"}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {userMenuOpen ? (
              <div className="absolute right-0 top-full z-50 mt-4 w-44 border border-white/15 bg-[#101216] p-1 shadow-2xl">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase text-white/72 transition hover:bg-white/10 hover:text-white"
                  type="button"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
          <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => router.push("/trips/new")}>
            <Plus className="h-4 w-4" />
            New trip
          </Button>
          <Button aria-label="Create trip" size="icon" variant="secondary" className="sm:hidden" onClick={() => router.push("/trips/new")}>
            <Plus className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
}
