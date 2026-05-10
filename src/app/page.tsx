"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Mail, MapPin, Mountain, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { EnvCallout } from "@/components/setup/env-callout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, toInputDate } from "@/lib/dates";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { createTrip } from "@/lib/trips";
import { getUserDisplayName } from "@/lib/user";

const demoEmail = "demo@voyage.test";
const demoPassword = "voyager@321";

type AuthMode = "login" | "signup" | "profile";

type ProfileSnapshot = {
  name: string;
  email: string;
  avatarSeed: string;
  avatarStyle: string;
  language: string;
  personalizationEnabled: boolean;
  publicProfileEnabled: boolean;
  productUpdatesEnabled: boolean;
};

const recommendedPlans = [
  {
    country: "Japan",
    title: "Tokyo To Kyoto",
    days: "7 days",
    budgetAmount: 95000,
    budgetEstimate: "From ₹95k",
    budgetNote: "per person",
    budget: "₹₹",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1500&q=85",
    route: ["Tokyo", "Hakone", "Kyoto", "Osaka"],
    places: ["Shibuya", "Lake Ashi", "Fushimi Inari", "Dotonbori"],
  },
  {
    country: "Portugal",
    title: "Lisbon Coast",
    days: "5 days",
    budgetAmount: 90000,
    budgetEstimate: "From ₹90k",
    budgetNote: "per person",
    budget: "₹",
    imageUrl: "https://images.unsplash.com/photo-1501927023255-9063be98970c?auto=format&fit=crop&w=1500&q=85",
    route: ["Lisbon", "Sintra", "Cascais"],
    places: ["Alfama", "Pena Palace", "Boca do Inferno", "Time Out Market"],
  },
  {
    country: "Spain",
    title: "Barcelona City Break",
    days: "4 days",
    budgetAmount: 65000,
    budgetEstimate: "From ₹65k",
    budgetNote: "per person",
    budget: "₹₹",
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1500&q=85",
    route: ["Barcelona", "Montserrat", "Sitges"],
    places: ["Sagrada Familia", "Gothic Quarter", "Park Guell", "Barceloneta"],
  },
  {
    country: "India",
    title: "Golden Triangle",
    days: "6 days",
    budgetAmount: 24000,
    budgetEstimate: "From ₹24k",
    budgetNote: "per person",
    budget: "₹₹",
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1500&q=85",
    route: ["Delhi", "Agra", "Jaipur"],
    places: ["India Gate", "Taj Mahal", "Amber Fort", "Hawa Mahal"],
  },
  {
    country: "Europe",
    title: "Alpine Rail Loop",
    days: "8 days",
    budgetAmount: 190000,
    budgetEstimate: "From ₹1.9L",
    budgetNote: "per person",
    budget: "₹₹₹",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=85",
    route: ["Zurich", "Lucerne", "Interlaken", "Milan"],
    places: ["Lake Zurich", "Chapel Bridge", "Jungfrau", "Duomo"],
  },
  {
    country: "USA",
    title: "New York Weekend",
    days: "4 days",
    budgetAmount: 140000,
    budgetEstimate: "From ₹1.4L",
    budgetNote: "per person",
    budget: "₹₹₹",
    imageUrl: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1500&q=85",
    route: ["Manhattan", "Brooklyn", "Queens"],
    places: ["Central Park", "DUMBO", "MoMA", "Times Square"],
  },
];

const plannerStyleOptions = [
  "Food, stays, transit, activities",
  "Culture, museums, neighborhoods",
  "Budget saver route",
  "Premium stays and private transfers",
  "Family friendly pacing",
];

const avatarStyles = ["adventurer", "bottts", "initials", "lorelei"];
const avatarSeeds = ["Voyager", "Atlas", "Summit", "Harbor", "Nomad", "Juniper"];
const languageOptions = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "Japanese", value: "ja" },
];

function getMetadataString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getMetadataBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function getAvatarUrl(style: string, seed: string) {
  const safeStyle = encodeURIComponent(style || "adventurer");
  const safeSeed = encodeURIComponent(seed || "Voyager");
  return `https://api.dicebear.com/9.x/${safeStyle}/svg?seed=${safeSeed}`;
}

export default function Home() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const lastScrollY = useRef(0);
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [savedProfile, setSavedProfile] = useState<ProfileSnapshot | null>(null);
  const [avatarSeed, setAvatarSeed] = useState("Voyager");
  const [avatarStyle, setAvatarStyle] = useState("adventurer");
  const [language, setLanguage] = useState("en");
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [publicProfileEnabled, setPublicProfileEnabled] = useState(false);
  const [productUpdatesEnabled, setProductUpdatesEnabled] = useState(false);
  const [tripDestination, setTripDestination] = useState(recommendedPlans[0]?.title ?? "");
  const [travelStart, setTravelStart] = useState("");
  const [travelEnd, setTravelEnd] = useState("");
  const [tripStyle, setTripStyle] = useState("Food, stays, transit, activities");
  const [loading, setLoading] = useState(false);
  const [addingPlan, setAddingPlan] = useState(false);
  const [postAuthPath, setPostAuthPath] = useState("/");
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const selectedPlan = recommendedPlans[selectedPlanIndex] ?? recommendedPlans[0];

  // Smart sticky nav: appear after hero, hide on scroll-down, show on scroll-up
  useEffect(() => {
    const HERO_THRESHOLD = 80;
    function handleScroll() {
      const currentY = window.scrollY;
      if (currentY < HERO_THRESHOLD) {
        setNavVisible(false);
      } else if (currentY < lastScrollY.current) {
        setNavVisible(true);
      } else if (currentY > lastScrollY.current + 4) {
        setNavVisible(false);
      }
      lastScrollY.current = currentY;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const displayAvatarStyle = savedProfile?.avatarStyle ?? avatarStyle;
  const displayAvatarSeed = savedProfile?.avatarSeed ?? avatarSeed;
  const profileDirty =
    mode === "profile" &&
    savedProfile !== null &&
    (name !== savedProfile.name ||
      email !== savedProfile.email ||
      avatarSeed !== savedProfile.avatarSeed ||
      avatarStyle !== savedProfile.avatarStyle ||
      language !== savedProfile.language ||
      personalizationEnabled !== savedProfile.personalizationEnabled ||
      publicProfileEnabled !== savedProfile.publicProfileEnabled ||
      productUpdatesEnabled !== savedProfile.productUpdatesEnabled);

  function applyUserProfile(user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]) {
    const userName = getUserDisplayName(user);
    const metadata = user?.user_metadata ?? {};
    const preferences = metadata.preferences && typeof metadata.preferences === "object" ? metadata.preferences : {};
    const privacy = metadata.privacy && typeof metadata.privacy === "object" ? metadata.privacy : {};
    const nextProfile = {
      name: userName,
      email: user?.email ?? "",
      avatarSeed: getMetadataString(metadata.avatar_seed, userName || "Voyager"),
      avatarStyle: getMetadataString(metadata.avatar_style, "adventurer"),
      language: getMetadataString(metadata.language, "en"),
      personalizationEnabled: getMetadataBoolean("personalization" in preferences ? preferences.personalization : undefined, true),
      productUpdatesEnabled: getMetadataBoolean("product_updates" in preferences ? preferences.product_updates : undefined, false),
      publicProfileEnabled: getMetadataBoolean("public_profile" in privacy ? privacy.public_profile : undefined, false),
    };

    setSavedProfile(nextProfile);
    setDisplayName(nextProfile.name);
    setName(nextProfile.name);
    setEmail(nextProfile.email);
    setAvatarSeed(nextProfile.avatarSeed);
    setAvatarStyle(nextProfile.avatarStyle);
    setLanguage(nextProfile.language);
    setPersonalizationEnabled(nextProfile.personalizationEnabled);
    setProductUpdatesEnabled(nextProfile.productUpdatesEnabled);
    setPublicProfileEnabled(nextProfile.publicProfileEnabled);
  }

  useEffect(() => {
    async function loadUser() {
      if (!isSupabaseConfigured) return;

      const { data } = await supabase.auth.getUser();
      applyUserProfile(data.user);
    }

    loadUser();

    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("auth");

    if (requestedMode === "login" || requestedMode === "signup") {
      window.setTimeout(() => {
        setMode(requestedMode);
        setPostAuthPath(params.get("next") || "/");
        setAuthOpen(true);
        router.replace("/", { scroll: false });
      }, 0);
    }
  }, [router]);

  async function openAuthPanel(nextMode: AuthMode, targetPath: string) {
    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        applyUserProfile(data.user);
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

  function buildTripPlannerPath() {
    const params = new URLSearchParams();
    const destination = tripDestination.trim();

    if (destination) params.set("destination", destination);
    if (travelStart) params.set("start", travelStart);
    if (travelEnd) params.set("end", travelEnd);
    if (tripStyle) params.set("style", tripStyle);

    const query = params.toString();
    return `/trips/new${query ? `?${query}` : ""}`;
  }

  async function handlePlannerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (travelStart && travelEnd && travelEnd < travelStart) {
      toast.error("End date must be after start date");
      return;
    }

    await openAuthPanel("login", buildTripPlannerPath());
  }

  async function addRecommendedPlanToTrips() {
    if (!selectedPlan) return;

    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setMode("login");
        setPostAuthPath("/");
        setAuthOpen(true);
        return;
      }
    }

    const start = addDays(new Date(), 21);
    const dayCount = Number.parseInt(selectedPlan.days, 10) || Math.max(selectedPlan.route.length, 4);
    const tripStart = toInputDate(start);
    const tripEnd = toInputDate(addDays(start, Math.max(dayCount - 1, selectedPlan.route.length - 1)));

    setAddingPlan(true);
    try {
      const trip = await createTrip({
        name: selectedPlan.title,
        description: `Pre-planned ${selectedPlan.country} itinerary with ${selectedPlan.route.join(", ")} plus suggested places, dates, and budget.`,
        start_date: tripStart,
        end_date: tripEnd,
        budget_amount: selectedPlan.budgetAmount,
        currency: "INR",
      });

      const stopCount = selectedPlan.route.length;
      const stayBudget = Math.round(selectedPlan.budgetAmount * 0.42);
      const transportBudget = Math.round(selectedPlan.budgetAmount * 0.23);
      const activityBudget = Math.round(selectedPlan.budgetAmount * 0.16);
      const stops = selectedPlan.route.map((city, index) => {
        const startOffset = Math.floor((index * dayCount) / stopCount);
        const endOffset = Math.max(startOffset, Math.floor(((index + 1) * dayCount) / stopCount) - 1);

        return {
          trip_id: trip.id,
          city,
          country: selectedPlan.country === "Europe" ? (city === "Milan" ? "Italy" : "Switzerland") : selectedPlan.country,
          start_date: toInputDate(addDays(start, startOffset)),
          end_date: toInputDate(addDays(start, endOffset)),
          stay_cost: Math.round(stayBudget / stopCount),
          transport_cost: Math.round(transportBudget / stopCount),
          notes: `Pre-planned stop for ${selectedPlan.title}.`,
          sort_order: index + 1,
        };
      });

      const { data: createdStops, error: stopError } = await supabase
        .from("stops")
        .insert(stops)
        .select("*")
        .order("sort_order", { ascending: true });
      if (stopError) throw stopError;

      const activities = (createdStops ?? []).flatMap((stop, index) => {
        const place = selectedPlan.places[index] ?? selectedPlan.places[index % selectedPlan.places.length] ?? stop.city;
        return [
          {
            trip_id: trip.id,
            stop_id: stop.id,
            activity_date: stop.start_date,
            title: `${place} sightseeing block`,
            category: "activity",
            start_time: "10:00",
            duration_minutes: 180,
            cost: Math.round(activityBudget / Math.max(selectedPlan.route.length, 1)),
            notes: `Suggested highlight for ${stop.city}.`,
          },
          {
            trip_id: trip.id,
            stop_id: stop.id,
            activity_date: stop.end_date,
            title: `${stop.city} local food walk`,
            category: "food",
            start_time: "18:00",
            duration_minutes: 120,
            cost: Math.round((selectedPlan.budgetAmount * 0.09) / Math.max(selectedPlan.route.length, 1)),
            notes: "Flexible evening plan based on nearby neighborhoods.",
          },
        ];
      });

      const { error: activityError } = await supabase.from("activities").insert(activities);
      if (activityError) throw activityError;

      router.push(`/trips/${trip.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add this itinerary");
    } finally {
      setAddingPlan(false);
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
        const nextEmail = email.trim();
        if (!nextEmail) {
          toast.error("Enter your email");
          return;
        }

        const { data, error } = await supabase.auth.updateUser({
          email: nextEmail,
          data: {
            full_name: displayName,
            name: displayName,
            avatar_seed: avatarSeed,
            avatar_style: avatarStyle,
            avatar_url: getAvatarUrl(avatarStyle, avatarSeed),
            language,
            preferences: {
              personalization: personalizationEnabled,
              product_updates: productUpdatesEnabled,
            },
            privacy: {
              public_profile: publicProfileEnabled,
            },
          },
        });
        if (error) throw error;

        applyUserProfile(data.user);
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
        applyUserProfile(profileData.user ?? data.user);

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
        applyUserProfile(data.user);
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

  function randomizeAvatar() {
    const nextSeed = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)] ?? "Voyager";
    setAvatarSeed(`${nextSeed}-${Math.floor(Math.random() * 1000)}`);
  }

  function discardProfileChanges() {
    if (!savedProfile) return;

    setName(savedProfile.name);
    setEmail(savedProfile.email);
    setAvatarSeed(savedProfile.avatarSeed);
    setAvatarStyle(savedProfile.avatarStyle);
    setLanguage(savedProfile.language);
    setPersonalizationEnabled(savedProfile.personalizationEnabled);
    setPublicProfileEnabled(savedProfile.publicProfileEnabled);
    setProductUpdatesEnabled(savedProfile.productUpdatesEnabled);
  }

  async function signOut() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setDisplayName("");
      setSavedProfile(null);
      setName("");
      setEmail("");
      setPassword("");
      setAuthOpen(false);
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out");
    } finally {
      setLoading(false);
    }
  }

  function deleteAccount() {
    toast.error("Account deletion needs a Supabase Edge Function or server action with admin privileges.");
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#16191d] text-white">
      {/* Smart sticky nav — hidden in hero, appears on scroll-up */}
      <header
        aria-hidden={!navVisible}
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#101216]/95 backdrop-blur transition-transform duration-300 ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto grid h-20 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 text-xs font-semibold uppercase text-white/72 sm:px-6 lg:px-8">
          <nav className="flex min-w-0 items-center gap-4">
            <button
              className="transition hover:text-white"
              type="button"
              onClick={() => openAuthPanel("login", "/trips")}
            >
              Trips
            </button>
          </nav>
          <button
            className="justify-self-center font-serif text-2xl font-semibold italic normal-case text-white"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Voyage
          </button>
          <nav className="flex items-center justify-end gap-3">
            {displayName ? (
              <button
                className="flex max-w-36 items-center gap-2 truncate text-right text-xs font-semibold uppercase text-white/55 transition hover:text-white sm:max-w-44"
                type="button"
                onClick={openProfilePanel}
              >
                <span
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 rounded-full border border-white/25 bg-white/90 bg-cover bg-center"
                  style={{ backgroundImage: `url("${getAvatarUrl(displayAvatarStyle, displayAvatarSeed)}")` }}
                />
                <span className="truncate">{displayName}</span>
              </button>
            ) : (
              <>
                <button
                  className="hidden transition hover:text-white sm:inline"
                  type="button"
                  onClick={() => openAuthPanel("login", "/")}
                >
                  Log in
                </button>
                <button
                  className="transition hover:text-white"
                  type="button"
                  onClick={() => openAuthPanel("signup", "/")}
                >
                  Sign up
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section id="home" className="relative min-h-screen scroll-mt-20 overflow-hidden bg-slate-950">
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

        <header className="relative z-10 mx-auto grid h-18 max-w-7xl grid-cols-[1fr_auto_1fr] items-center border-b border-white/15 px-6 text-sm font-semibold uppercase tracking-[0.08em] text-white/82 sm:h-20 sm:px-8">
          <div className="flex items-center">
            <button className="hidden py-2 transition hover:text-white sm:inline" type="button" onClick={() => openAuthPanel("login", "/trips")}>
              Upcoming trips
            </button>
            <button className="py-2 transition hover:text-white sm:hidden" type="button" aria-label="View upcoming trips" onClick={() => openAuthPanel("login", "/trips")}>
              Trips
            </button>
          </div>
          <button className="justify-self-center font-serif text-3xl font-semibold italic normal-case tracking-normal text-white drop-shadow-sm transition hover:text-teal-100 sm:text-[2rem]" type="button">
            Voyage
          </button>
          <nav className="flex items-center justify-end gap-5 sm:gap-6">
            {displayName ? (
              <button
                className="inline-flex max-w-44 items-center justify-end gap-2 py-2 text-right text-white/92 transition hover:text-teal-100 sm:max-w-56"
                type="button"
                onClick={openProfilePanel}
              >
                <span
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 rounded-full border border-white/25 bg-white/90 bg-cover bg-center"
                  style={{ backgroundImage: `url("${getAvatarUrl(displayAvatarStyle, displayAvatarSeed)}")` }}
                />
                <span className="truncate">{displayName}</span>
              </button>
            ) : (
              <>
                <button className="hidden py-2 transition hover:text-white sm:inline" type="button" onClick={() => openAuthPanel("login", "/")}>
                  Log in
                </button>
                <button className="py-2 transition hover:text-white" type="button" onClick={() => openAuthPanel("signup", "/")}>
                  Sign up
                </button>
                <ArrowRight className="hidden h-3.5 w-3.5 text-white/70 sm:block" />
              </>
            )}
          </nav>
        </header>

        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-6 pb-44 pt-16 sm:min-h-[calc(100vh-6rem)] sm:px-8 lg:pb-40">
          <div className="max-w-4xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
              <Mountain className="h-4 w-4" />
              Multi-city journeys, planned in minutes
            </p>
            <h1 className="max-w-5xl font-serif text-6xl font-thin italic leading-[0.96] tracking-normal text-white/88 drop-shadow-sm sm:text-7xl lg:text-8xl">
              Plan Beautiful Trips Across Every Stop
            </h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-white/78 sm:text-lg">
              Build routes with cities, dates, activities, budgets, and a public itinerary link.
            </p>
          </div>
        </section>

        <form
          className="absolute inset-x-4 bottom-8 z-20 mx-auto max-w-6xl border border-white/18 bg-slate-950/48 p-4 shadow-2xl backdrop-blur-md sm:bottom-10 sm:p-5"
          onSubmit={handlePlannerSubmit}
        >
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div className="border-b border-white/20 pb-3">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55" htmlFor="hero-destination">
                <MapPin className="h-3.5 w-3.5" />
                Destination
              </label>
              <div className="relative">
                <select
                  id="hero-destination"
                  className="w-full cursor-pointer bg-transparent pr-8 text-sm font-medium text-white outline-none [color-scheme:dark]"
                  required
                  value={tripDestination}
                  onChange={(event) => {
                    const nextDestination = event.target.value;
                    const nextIndex = recommendedPlans.findIndex((plan) => plan.title === nextDestination);
                    setTripDestination(nextDestination);
                    if (nextIndex >= 0) setSelectedPlanIndex(nextIndex);
                  }}
                >
                  {recommendedPlans.map((plan) => (
                    <option key={plan.title} className="bg-slate-950 text-white" value={plan.title}>
                      {plan.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-b border-white/20 pb-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55">
                <CalendarDays className="h-3.5 w-3.5" />
                Dates
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Start date"
                  className="min-w-0 bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
                  min={toInputDate(new Date())}
                  type="date"
                  value={travelStart}
                  onChange={(event) => {
                    const nextStart = event.target.value;
                    setTravelStart(nextStart);
                    if (!travelEnd && nextStart) setTravelEnd(toInputDate(addDays(new Date(`${nextStart}T00:00:00`), 7)));
                  }}
                />
                <input
                  aria-label="End date"
                  className="min-w-0 bg-transparent text-sm font-medium text-white outline-none [color-scheme:dark]"
                  min={travelStart || toInputDate(new Date())}
                  type="date"
                  value={travelEnd}
                  onChange={(event) => setTravelEnd(event.target.value)}
                />
              </div>
            </div>
            <div className="border-b border-white/20 pb-3">
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/55" htmlFor="hero-style">
                <Users className="h-3.5 w-3.5" />
                Style
              </label>
              <div className="relative">
                <select
                  id="hero-style"
                  className="w-full cursor-pointer bg-transparent pr-8 text-sm font-medium text-white outline-none [color-scheme:dark]"
                  value={tripStyle}
                  onChange={(event) => setTripStyle(event.target.value)}
                >
                  {plannerStyleOptions.map((option) => (
                    <option key={option} className="bg-slate-950 text-white" value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              className="inline-flex h-12 items-center justify-center gap-3 rounded-none bg-white px-6 text-sm font-semibold uppercase text-slate-950 transition hover:bg-teal-100"
              type="submit"
            >
              Plan Trip
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>

      <section id="recommended" className="relative z-10 scroll-mt-20 border-y border-white/10 bg-[#181b20] px-4 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-normal text-white/40">Pre-planned picks</p>
            <h2 className="mx-auto mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Recommended Destinations, Ready To Add.
            </h2>
          </div>

          <div className="grid overflow-hidden border border-white/10 bg-black/42 lg:grid-cols-[0.34fr_0.66fr]">
            <div className="border-b border-white/10 bg-black/58 p-3 backdrop-blur-md lg:border-b-0 lg:border-r lg:p-4">
              <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-semibold uppercase text-white/34">
                <span>Places</span>
                <span>{recommendedPlans.length} routes</span>
              </div>
              <div className="grid max-h-[330px] gap-2 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.28)_transparent] [scrollbar-width:thin] lg:max-h-[438px]">
              {recommendedPlans.map((plan, index) => (
                <button
                  key={plan.country}
                  className={`relative flex w-full items-center justify-between gap-4 border p-4 text-left transition ${
                    selectedPlanIndex === index
                      ? "border-white/16 bg-black/68 text-white shadow-[inset_3px_0_0_rgba(204,251,241,0.85)] backdrop-blur-md"
                      : "border-white/10 bg-white/[0.04] text-white/58 hover:border-white/20 hover:bg-white/[0.08] hover:text-white/82"
                  }`}
                  type="button"
                  onClick={() => setSelectedPlanIndex(index)}
                >
                  <span className="min-w-0">
                    <span className={`block text-[11px] font-semibold uppercase ${selectedPlanIndex === index ? "text-white/55" : "text-white/34"}`}>
                      {plan.country}
                    </span>
                    <span className="mt-1.5 block truncate font-serif text-lg font-semibold sm:text-xl">{plan.title}</span>
                    <span className={`mt-2 block truncate text-xs ${selectedPlanIndex === index ? "text-white/50" : "text-white/35"}`}>
                      {plan.days} / {plan.route.length} stops
                    </span>
                  </span>
                  <span
                    className={`shrink-0 border px-3 py-2 text-right text-xs font-semibold leading-tight ${
                      selectedPlanIndex === index ? "border-white/12 bg-white/12 text-white" : "border-white/10 text-white/48"
                    }`}
                  >
                    <span className="block">{plan.budgetEstimate}</span>
                    <span className="mt-0.5 block text-[10px] font-medium uppercase text-white/42">{plan.budgetNote}</span>
                  </span>
                </button>
              ))}
              </div>
            </div>

            <article className="relative min-h-[380px] overflow-hidden sm:min-h-[460px] lg:min-h-[520px]">
              <Image
                key={selectedPlan.imageUrl}
                alt={selectedPlan.title}
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 68vw, 100vw"
                src={selectedPlan.imageUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/8 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/30 p-4 backdrop-blur-[2px] sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-serif text-2xl font-semibold leading-none text-white sm:text-4xl lg:text-5xl">
                      {selectedPlan.title}
                    </h3>
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold uppercase text-white/38">Route</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedPlan.route.map((stop) => (
                          <span key={stop} className="bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90">
                            {stop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:items-end">
                    <div className="border border-white/12 bg-black/32 px-4 py-2 text-left sm:text-right">
                      <p className="text-[10px] font-semibold uppercase text-white/42">Estimated budget</p>
                      <p className="mt-1 text-lg font-semibold text-white">{selectedPlan.budgetEstimate}</p>
                      <p className="text-[11px] font-medium uppercase text-white/45">{selectedPlan.budgetNote}</p>
                    </div>
                    <button
                      className="inline-flex h-11 w-full items-center justify-center gap-3 bg-white px-5 text-xs font-semibold uppercase text-slate-950 transition hover:bg-teal-100 sm:w-auto"
                      disabled={addingPlan}
                      type="button"
                      onClick={addRecommendedPlanToTrips}
                    >
                      {addingPlan ? "Adding..." : "Add to my trips"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer id="contact" className="relative z-10 scroll-mt-20 border-t border-white/10 bg-black px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm font-semibold uppercase text-white/62 sm:flex-row sm:items-center sm:justify-between">
          <a className="font-serif text-3xl font-semibold italic normal-case text-white transition hover:text-teal-100" href="#home">
            Voyage
          </a>

          <nav className="flex flex-wrap items-center gap-5">
            {displayName ? (
              <button className="inline-flex max-w-60 items-center gap-2 text-white transition hover:text-teal-100" type="button" onClick={openProfilePanel}>
                <span
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 rounded-full border border-white/20 bg-white/90 bg-cover bg-center"
                  style={{ backgroundImage: `url("${getAvatarUrl(displayAvatarStyle, displayAvatarSeed)}")` }}
                />
                <span className="truncate">{displayName}</span>
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
          </nav>
        </div>
      </footer>

      {authOpen ? (
        <aside className="fixed bottom-4 right-4 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-hidden border border-white/25 bg-white/12 p-5 text-white shadow-2xl backdrop-blur-2xl sm:bottom-8 sm:right-8 sm:max-h-[calc(100dvh-4rem)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.36),transparent_22%),radial-gradient(circle_at_82%_6%,rgba(20,184,166,0.24),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]" />
          <div className="relative max-h-[calc(100dvh-4.5rem)] overflow-y-auto pb-20 pr-1 [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin] sm:max-h-[calc(100dvh-6.5rem)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-white/60">
                  {mode === "profile" ? "Preferences and privacy" : mode === "login" ? "Welcome back" : "Start planning"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {mode === "profile" ? "Account controls" : mode === "login" ? "Sign in" : "Create account"}
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

            {mode !== "profile" ? (
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
            ) : null}

            <form id="home-auth-form" className="grid gap-4" onSubmit={handleSubmit}>
              {mode === "profile" ? (
                <div className="grid gap-3 border border-white/12 bg-black/16 p-3">
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="h-16 w-16 shrink-0 border border-white/20 bg-white/90 bg-cover bg-center"
                      style={{ backgroundImage: `url("${getAvatarUrl(avatarStyle, avatarSeed)}")` }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Avatar</p>
                      <p className="mt-1 text-xs leading-5 text-white/55">Pick an illustrated avatar. No photo upload needed.</p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <select
                      className="min-w-0 border border-white/20 bg-white/18 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
                      value={avatarStyle}
                      onChange={(event) => setAvatarStyle(event.target.value)}
                    >
                      {avatarStyles.map((style) => (
                        <option key={style} className="bg-slate-950 text-white" value={style}>
                          {style}
                        </option>
                      ))}
                    </select>
                    <Button className="border border-white/20 bg-white/10 text-white hover:bg-white/18" type="button" variant="ghost" onClick={randomizeAvatar}>
                      Change avatar
                    </Button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {avatarSeeds.map((seed) => (
                      <button
                        key={seed}
                        aria-label={`Use ${seed} avatar`}
                        className={`aspect-square border bg-white/90 bg-cover bg-center transition ${
                          avatarSeed.startsWith(seed) ? "border-teal-100 ring-2 ring-teal-100/40" : "border-white/15 hover:border-white/45"
                        }`}
                        style={{ backgroundImage: `url("${getAvatarUrl(avatarStyle, seed)}")` }}
                        type="button"
                        onClick={() => setAvatarSeed(seed)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

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
              {mode === "profile" ? (
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
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <p className="text-xs leading-5 text-white/45">Supabase may ask you to confirm a changed email address.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-white/85" htmlFor="home-language">
                      Language preference
                    </Label>
                    <select
                      id="home-language"
                      className="border border-white/20 bg-white/18 px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
                      value={language}
                      onChange={(event) => setLanguage(event.target.value)}
                    >
                      {languageOptions.map((option) => (
                        <option key={option.value} className="bg-slate-950 text-white" value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 border border-white/12 bg-black/16 p-3 text-sm">
                    <label className="flex items-start gap-3 text-white/78">
                      <input
                        checked={personalizationEnabled}
                        className="mt-1"
                        type="checkbox"
                        onChange={(event) => setPersonalizationEnabled(event.target.checked)}
                      />
                      <span>
                        <span className="block font-medium text-white">Personalized planning</span>
                        <span className="mt-1 block text-xs leading-5 text-white/50">Use saved preferences to prefill future trip planning.</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 text-white/78">
                      <input
                        checked={publicProfileEnabled}
                        className="mt-1"
                        type="checkbox"
                        onChange={(event) => setPublicProfileEnabled(event.target.checked)}
                      />
                      <span>
                        <span className="block font-medium text-white">Public profile on shared trips</span>
                        <span className="mt-1 block text-xs leading-5 text-white/50">Show your display name on public itinerary pages.</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 text-white/78">
                      <input
                        checked={productUpdatesEnabled}
                        className="mt-1"
                        type="checkbox"
                        onChange={(event) => setProductUpdatesEnabled(event.target.checked)}
                      />
                      <span>
                        <span className="block font-medium text-white">Product updates</span>
                        <span className="mt-1 block text-xs leading-5 text-white/50">Allow occasional trip-planning tips and product emails.</span>
                      </span>
                    </label>
                  </div>
                </>
              ) : (
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
              )}
              {mode !== "profile" ? (
                <Button className="bg-white text-slate-950 hover:bg-teal-100" disabled={!isSupabaseConfigured || loading} type="submit">
                  <Mail className="h-4 w-4" />
                  {loading ? "Working..." : mode === "login" ? "Sign in" : "Sign up"}
                </Button>
              ) : null}
            </form>

            {mode === "profile" ? (
              <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm">
                <Button className="border border-white/20 bg-white/10 text-white hover:bg-white/18" disabled={loading} type="button" variant="ghost" onClick={signOut}>
                  Sign out
                </Button>
                <button className="text-left text-red-200/85 transition hover:text-red-100" type="button" onClick={deleteAccount}>
                  Delete account
                </button>
                <p className="text-xs leading-5 text-white/42">
                  Account deletion requires a Supabase admin function so private auth records are not exposed in the browser.
                </p>
              </div>
            ) : (
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
            )}
          </div>
          {profileDirty ? (
            <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-slate-950/72 p-1.5 shadow-2xl backdrop-blur-xl">
              <Button className="rounded-full bg-white/92 px-5 text-slate-950 hover:bg-teal-100" disabled={!isSupabaseConfigured || loading} form="home-auth-form" size="sm" type="submit">
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                className="rounded-full border border-white/15 bg-white/10 px-5 text-white hover:bg-white/18"
                disabled={loading}
                size="sm"
                type="button"
                variant="ghost"
                onClick={discardProfileChanges}
              >
                Discard
              </Button>
            </div>
          ) : null}
        </aside>
      ) : null}
    </main>
  );
}
