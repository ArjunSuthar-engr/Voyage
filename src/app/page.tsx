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
import { getUserDisplayName } from "@/lib/user";

const demoEmail = "demo@voyage.test";
const demoPassword = "voyager@321";

type AuthMode = "login" | "signup" | "profile";

const recommendedPlans = [
  {
    country: "Japan",
    title: "Tokyo To Kyoto",
    days: "7 days",
    budget: "₹₹",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1500&q=85",
    route: ["Tokyo", "Hakone", "Kyoto", "Osaka"],
    places: ["Shibuya", "Lake Ashi", "Fushimi Inari", "Dotonbori"],
  },
  {
    country: "Portugal",
    title: "Lisbon Coast",
    days: "5 days",
    budget: "₹",
    imageUrl: "https://images.unsplash.com/photo-1501927023255-9063be98970c?auto=format&fit=crop&w=1500&q=85",
    route: ["Lisbon", "Sintra", "Cascais"],
    places: ["Alfama", "Pena Palace", "Boca do Inferno", "Time Out Market"],
  },
  {
    country: "Spain",
    title: "Barcelona City Break",
    days: "4 days",
    budget: "₹₹",
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1500&q=85",
    route: ["Barcelona", "Montserrat", "Sitges"],
    places: ["Sagrada Familia", "Gothic Quarter", "Park Guell", "Barceloneta"],
  },
];

const budgetHighlights = [
  { label: "Saver", value: "₹", detail: "Hostels, trains, street food" },
  { label: "Balanced", value: "₹₹", detail: "Hotels, tours, local dining" },
  { label: "Premium", value: "₹₹₹", detail: "Boutique stays, private transfers" },
];

export default function Home() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [postAuthPath, setPostAuthPath] = useState("/dashboard");
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const selectedPlan = recommendedPlans[selectedPlanIndex] ?? recommendedPlans[0];

  useEffect(() => {
    async function loadUser() {
      if (!isSupabaseConfigured) return;

      const { data } = await supabase.auth.getUser();
      const userName = getUserDisplayName(data.user);
      setDisplayName(userName);
      setName(userName);
      setEmail(data.user?.email ?? "");
    }

    loadUser();

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
        const userName = getUserDisplayName(data.user);
        setDisplayName(userName);
        setName(userName);
        setEmail(data.user.email ?? "");
        if (targetPath !== "/") {
          router.push(targetPath);
        }
        return;
      }
    }

    setMode(nextMode);
    setPostAuthPath(targetPath);
    setAuthOpen(true);
  }

  function openProfilePanel() {
    setMode("profile");
    setName(displayName);
    setPostAuthPath("/");
    setAuthOpen(true);
  }

  function handleNameChange(value: string) {
    setNameEdited(true);
    setName(value);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (!nameEdited) {
      setName(value.split("@")[0].replace(/[._-]+/g, " ").trim());
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const displayName = name.trim();
      if (!displayName) {
        toast.error("Enter your name");
        return;
      }

      if (mode === "profile") {
        const { data, error } = await supabase.auth.updateUser({
          data: { full_name: displayName, name: displayName },
        });
        if (error) throw error;

        setDisplayName(getUserDisplayName(data.user));
        setAuthOpen(false);
        return;
      }

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profileData, error: profileError } = await supabase.auth.updateUser({
          data: { full_name: displayName, name: displayName },
        });
        if (profileError) throw profileError;
        setDisplayName(getUserDisplayName(profileData.user ?? data.user));

        setAuthOpen(false);
        if (postAuthPath !== "/") {
          router.push(postAuthPath);
        }
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: displayName, name: displayName } },
      });
      if (error) throw error;

      if (data.session) {
        setDisplayName(getUserDisplayName(data.user));
        setAuthOpen(false);
        if (postAuthPath !== "/") {
          router.push(postAuthPath);
        }
      } else {
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
    setName("Demo Voyager");
    setNameEdited(true);
    setEmail(demoEmail);
    setPassword(demoPassword);
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
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#16191d] text-white">
      <section className="relative min-h-screen overflow-hidden bg-slate-950">
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
            {displayName ? (
              <button
                className="max-w-36 truncate text-right text-white transition hover:text-teal-100 sm:max-w-52"
                type="button"
                onClick={openProfilePanel}
              >
                {displayName}
              </button>
            ) : (
              <>
                <button className="hidden transition hover:text-white sm:inline" type="button" onClick={() => openAuthPanel("login", "/")}>
                  Log in
                </button>
                <button className="transition hover:text-white" type="button" onClick={() => openAuthPanel("signup", "/")}>
                  Sign up
                </button>
                <ArrowRight className="hidden h-4 w-4 sm:block" />
              </>
            )}
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
              Build routes with cities, dates, activities, budgets, and a public itinerary link.
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
      </section>

      <section className="relative z-10 border-y border-white/10 bg-[#181b20] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-white/40">Recommended</p>
            <h2 className="mx-auto mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Top Places, Already Planned.
            </h2>
          </div>

          <div className="grid overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-[0.32fr_0.68fr]">
            <div className="grid gap-px bg-white/10 lg:block">
              {recommendedPlans.map((plan, index) => (
                <button
                  key={plan.country}
                  className={`flex w-full items-center justify-between bg-[#1d2127] p-5 text-left transition hover:bg-[#242b34] ${
                    selectedPlanIndex === index ? "text-white" : "text-white/55"
                  }`}
                  type="button"
                  onClick={() => setSelectedPlanIndex(index)}
                >
                  <span>
                    <span className="block text-xs font-semibold uppercase text-white/40">{plan.country}</span>
                    <span className="mt-2 block font-serif text-2xl font-semibold">{plan.title}</span>
                  </span>
                  <span className="text-sm">{plan.budget}</span>
                </button>
              ))}
            </div>

            <article className="relative min-h-[620px] overflow-hidden">
              <Image
                key={selectedPlan.imageUrl}
                alt={selectedPlan.title}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 68vw, 100vw"
                src={selectedPlan.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/22 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap gap-3 text-xs font-semibold uppercase text-white/58">
                  <span>{selectedPlan.country}</span>
                  <span>{selectedPlan.days}</span>
                  <span>{selectedPlan.budget}</span>
                </div>
                <h3 className="max-w-2xl font-serif text-5xl font-semibold leading-none text-white sm:text-7xl">{selectedPlan.title}</h3>
                <div className="mt-8 flex flex-wrap gap-2">
                  {selectedPlan.route.map((stop) => (
                    <span key={stop} className="border border-white/20 bg-white/12 px-4 py-2 text-sm text-white backdrop-blur">
                      {stop}
                    </span>
                  ))}
                </div>
                <div className="mt-8 grid gap-px overflow-hidden bg-white/12 sm:grid-cols-4">
                  {selectedPlan.places.map((place) => (
                    <div key={place} className="bg-black/28 p-4">
                      <p className="text-sm font-medium text-white">{place}</p>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-8 inline-flex h-12 items-center justify-center gap-3 bg-white px-6 text-xs font-semibold uppercase text-slate-950 transition hover:bg-teal-100"
                  type="button"
                  onClick={() => openAuthPanel("login", "/trips/new")}
                >
                  Plan Trip
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-[#14171b] px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase text-white/40">Budget highlights</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-white sm:text-6xl">Choose By Budget.</h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
            {budgetHighlights.map((item) => (
              <button
                key={item.label}
                className="bg-[#1d2127] p-7 text-left transition hover:bg-[#242b34]"
                type="button"
                onClick={() => openAuthPanel("login", "/trips/new")}
              >
                <p className="font-serif text-6xl font-semibold text-white">{item.value}</p>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xl font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-sm text-white/58">{item.detail}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-[#101216] px-4 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-white/58 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-2xl font-semibold italic text-white">Voyage</p>
          <div className="flex flex-wrap gap-5">
            <button className="transition hover:text-white" type="button" onClick={() => openAuthPanel("login", "/dashboard")}>
              Upcoming trips
            </button>
            {displayName ? (
              <button className="max-w-52 truncate text-white transition hover:text-teal-100" type="button" onClick={openProfilePanel}>
                {displayName}
              </button>
            ) : (
              <>
                <button className="transition hover:text-white" type="button" onClick={() => openAuthPanel("login", "/")}>
                  Log in
                </button>
                <button className="transition hover:text-white" type="button" onClick={() => openAuthPanel("signup", "/")}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {authOpen ? (
        <aside className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md overflow-hidden border border-white/25 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-2xl sm:bottom-8 sm:right-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.36),transparent_22%),radial-gradient(circle_at_82%_6%,rgba(20,184,166,0.24),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]" />
          <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:7px_7px]" />
          <div className="relative">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-white/60">
                  {mode === "profile" ? "Your profile" : mode === "login" ? "Welcome back" : "Start planning"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {mode === "profile" ? "Change name" : mode === "login" ? "Sign in" : "Create account"}
                </h2>
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
                <Label className="text-white/85" htmlFor="home-name">
                  Name
                </Label>
                <Input
                  id="home-name"
                  className="border-white/20 bg-white/18 text-white placeholder:text-white/45 focus:border-white/45 focus:ring-white/15"
                  placeholder="Your name"
                  required
                  type="text"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                />
              </div>
              {mode !== "profile" ? (
                <>
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
                      onChange={(event) => handleEmailChange(event.target.value)}
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
                </>
              ) : null}
              <Button className="bg-white text-slate-950 hover:bg-teal-100" disabled={!isSupabaseConfigured || loading} type="submit">
                <Mail className="h-4 w-4" />
                {loading ? "Working..." : mode === "profile" ? "Save name" : mode === "login" ? "Sign in" : "Sign up"}
              </Button>
            </form>

            {mode !== "profile" ? (
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
            ) : null}
          </div>
        </aside>
      ) : null}
    </main>
  );
}
