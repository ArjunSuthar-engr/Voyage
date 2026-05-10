import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Menu, Mountain, Users } from "lucide-react";

export default function Home() {
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
          <Link className="hidden transition hover:text-white sm:inline" href="/dashboard">
            Upcoming trips
          </Link>
          <Link className="sm:hidden" href="/dashboard" aria-label="View upcoming trips">
            Trips
          </Link>
        </div>
        <Link className="flex items-center text-xl font-semibold normal-case italic text-white sm:text-2xl" href="/">
          Voyage
        </Link>
        <nav className="flex items-center justify-end gap-4">
          <Link className="hidden transition hover:text-white sm:inline" href="/login">
            Log in
          </Link>
          <Link className="transition hover:text-white" href="/login">
            Sign up
          </Link>
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
          <Link
            className="inline-flex h-12 items-center justify-center gap-3 rounded-none bg-white px-6 text-sm font-semibold uppercase text-slate-950 transition hover:bg-teal-100"
            href="/trips/new"
          >
            Plan Trip
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
