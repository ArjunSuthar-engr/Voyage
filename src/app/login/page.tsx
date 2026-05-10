"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Map, Plane } from "lucide-react";
import { toast } from "sonner";

import { EnvCallout } from "@/components/setup/env-callout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const demoEmail = "demo@voyage.test";
const demoPassword = "voyager@321";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function redirectIfSignedIn() {
      if (!isSupabaseConfigured) return;
      const { data } = await supabase.auth.getUser();
      if (data.user) router.replace("/dashboard");
    }

    redirectIfSignedIn();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        router.replace("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created");
          router.replace("/dashboard");
        } else {
          toast.success("Account created. Check email confirmation if enabled.");
          setMode("login");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    const redirectTo =
      process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? `${window.location.origin}/login` : undefined);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  }

  function useDemoLogin() {
    setMode("login");
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success("Demo credentials filled");
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-600 shadow-sm">
            <Plane className="h-4 w-4 text-teal-700" />
            Multi-city planning for hackathon-speed travel teams
          </div>
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Map className="h-5 w-5" />
              </span>
              <span className="text-2xl font-semibold text-stone-950">Voyage</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
              Build shareable city loops with costs, stops, and activity plans.
            </h1>
            <p className="text-lg leading-8 text-stone-600">
              Create a trip, add cities with durations, pick activities from quick templates, track budget pressure, and publish a clean itinerary link.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Stops by city", "Budget breakdowns", "Public itinerary links"].map((item) => (
              <div key={item} className="rounded-lg border border-stone-200 bg-white p-4 text-sm font-medium text-stone-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {!isSupabaseConfigured ? <EnvCallout /> : null}
          <Card>
            <CardHeader>
              <CardTitle>{mode === "login" ? "Sign in" : "Create account"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-950">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">Demo login for judges</p>
                    <p className="mt-1 text-teal-800">
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
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    minLength={6}
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <Button disabled={!isSupabaseConfigured || loading} type="submit">
                  <Mail className="h-4 w-4" />
                  {loading ? "Working..." : mode === "login" ? "Sign in" : "Sign up"}
                </Button>
              </form>
              <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
                <button className="text-left font-medium text-teal-700" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                  {mode === "login" ? "Need an account?" : "Already have an account?"}
                </button>
                <button className="text-left text-stone-500 hover:text-stone-900" type="button" onClick={resetPassword}>
                  Forgot password
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
