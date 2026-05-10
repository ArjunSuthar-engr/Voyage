"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Mail, MapPin, Menu, Mountain, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { EnvCallout } from "@/components/setup/env-callout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const demoEmail = "demo@voyage.test";
const demoPassword = "voyager@321";

type AuthMode = "login" | "signup";

export default function Home() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [postAuthPath, setPostAuthPath] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("auth");

    if (requestedMode === "login" || requestedMode === "signup") {
      window.setTimeout(() => {
        setMode(requestedMode);
        setPostAuthPath(params.get("next") || "/dashboard");
        setAuthOpen(true);
        router.replace("/", { scroll: false });
      }, 0);
    }
  }, [router]);

  async function openAuthPanel(nextMode: AuthMode, targetPath: string) {
    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.push(targetPath);
        return;
      }
    }

    setMode(nextMode);
    setPostAuthPath(targetPath);
    setAuthOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        router.push(postAuthPath);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.session) {
        toast.success("Account created");
        router.push(postAuthPath);
      } else {
        toast.success("Account created. Check email confirmation if enabled.");
        setMode("login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function useDemoLogin() {
    setMode("login");
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success("Demo credentials filled");
  }

  async function resetPassword() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }

    const redirectTo =
      process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? `${window.location.origin}/` : undefined);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <Image
        alt="Misty mountain valley"
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85"
      />
      <div className="absolute inset-0 bg-sky-950/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-slate-900/10 to-slate-950/80" />
      <header className="relative z-10 mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] border-b border-white/20 px-4 text-xs font-semibold uppercase tracking-normal text-white/85 sm:h-24 sm:px-8">
        <div className="flex items-center gap-4">
          <Menu className="h-4 w-4" />
          <button className="hidden transition hover:text-white sm:inline" type="button" onClick={() => openAuthPanel("login", "/dashboard")}>
            Upcoming trips
          </button>
          <button className="sm:hidden" type="button" aria-label="View upcoming trips" onClick={() => openAuthPanel("login", "/dashboard")}>
            Trips
          </button>
        </div>
        <button className="flex items-center text-xl font-semibold normal-case italic text-white sm:text-2xl" type="button">
          Voyage
        </button>
        <nav className="flex items-center justify-end gap-4">
          <button className="hidden transition hover:text-white sm:inline" type="button" onClick={() => openAuthPanel("login", "/dashboard")}>
            Log in
          </button>
          <button className="transition hover:text-white" type="button" onClick={() => openAuthPanel("signup", "/dashboard")}>
            Sign up
          </button>
          <ArrowRight className="hidden h-4 w-4 sm:block" />
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-6 pb-44 pt-16 sm:min-h-[calc(100vh-6rem)] sm:px-8 lg:pb-40">
        <div className="max-w-4xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
            <Mountain className="h-4 w-4" />
            Multi-city journeys, planned in minutes
          </p>
          <h1 className="max-w-5xl font-serif text-6xl font-semibold italic leading-[0.95] tracking-normal text-white drop-shadow-sm sm:text-7xl lg:text-8xl">
            Plan Beautiful Trips Across Every Stop
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
            Build a polished route with cities, dates, activities, budgets, and a public itinerary link your group can review.
          </p>
        </div>
      </section>

      <section className="absolute inset-x-4 bottom-8 z-20 mx-auto max-w-6xl border border-white/18 bg-slate-950/48 p-4 shadow-2xl backdrop-blur-md sm:bottom-10 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div className="border-b border-white/20 pb-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55">
              <MapPin className="h-3.5 w-3.5" />
              Destination
            </p>
            <p className="text-sm font-medium text-white">Tokyo, Kyoto, Lisbon...</p>
          </div>
          <div className="border-b border-white/20 pb-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55">
              <CalendarDays className="h-3.5 w-3.5" />
              Dates
            </p>
            <p className="text-sm font-medium text-white">Choose your travel window</p>
          </div>
          <div className="border-b border-white/20 pb-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55">
              <Users className="h-3.5 w-3.5" />
              Style
            </p>
            <p className="text-sm font-medium text-white">Food, stays, transit, activities</p>
          </div>
          <button
            className="inline-flex h-12 items-center justify-center gap-3 rounded-none bg-white px-6 text-sm font-semibold uppercase text-slate-950 transition hover:bg-teal-100"
            type="button"
            onClick={() => openAuthPanel("login", "/trips/new")}
          >
            Plan Trip
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {authOpen ? (
        <aside className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md overflow-hidden border border-white/25 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-2xl sm:bottom-8 sm:right-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.36),transparent_22%),radial-gradient(circle_at_82%_6%,rgba(20,184,166,0.24),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]" />
          <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:7px_7px]" />
          <div className="relative">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-white/60">{mode === "login" ? "Welcome back" : "Start planning"}</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{mode === "login" ? "Sign in" : "Create account"}</h2>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center border border-white/20 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                type="button"
                aria-label="Close sign in panel"
                onClick={() => setAuthOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isSupabaseConfigured ? <EnvCallout /> : null}

            <div className="mb-4 border border-teal-200/40 bg-teal-100/12 p-3 text-sm text-teal-50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Demo login for judges</p>
                  <p className="mt-1 text-teal-50/80">
                    {demoEmail} / {demoPassword}
                  </p>
                </div>
                <Button size="sm" type="button" variant="secondary" onClick={useDemoLogin}>
                  Use demo login
                </Button>
              </div>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label className="text-white/85" htmlFor="home-email">
                  Email
                </Label>
                <Input
                  id="home-email"
                  className="border-white/20 bg-white/18 text-white placeholder:text-white/45 focus:border-white/45 focus:ring-white/15"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/85" htmlFor="home-password">
                  Password
                </Label>
                <Input
                  id="home-password"
                  className="border-white/20 bg-white/18 text-white placeholder:text-white/45 focus:border-white/45 focus:ring-white/15"
                  minLength={6}
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button className="bg-white text-slate-950 hover:bg-teal-100" disabled={!isSupabaseConfigured || loading} type="submit">
                <Mail className="h-4 w-4" />
                {loading ? "Working..." : mode === "login" ? "Sign in" : "Sign up"}
              </Button>
            </form>

            <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
              <button
                className="text-left font-medium text-teal-100 hover:text-white"
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "Need an account?" : "Already have an account?"}
              </button>
              {mode === "login" ? (
                <button className="text-left text-white/65 hover:text-white" type="button" onClick={resetPassword}>
                  Forgot password
                </button>
              ) : null}
            </div>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
