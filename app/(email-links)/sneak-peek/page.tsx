"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  MapPin,
  CheckCircle,
  Zap,
  Lock,
  TrendingUp,
  Eye,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useEmailValidation } from "@/lib/hooks/useEmailValidation";

const FEATURES = [
  {
    icon: Shield,
    title: "Document Verification",
    description:
      "C of O, survey plans, and ID documents are verified by our vetting team before any listing goes live.",
  },
  {
    icon: MapPin,
    title: "Geo-Tagging",
    description:
      "Every property is pinned using real coordinates — no more fake addresses or wrong neighbourhoods.",
  },
  {
    icon: CheckCircle,
    title: "Zero Duplicates",
    description:
      "Our ML layer flags duplicate listings in real time. One property, one listing — always.",
  },
  {
    icon: Lock,
    title: "Agent Licensing",
    description:
      "All agents are verified against ESVARBON and CAC records before they can list on RealEST.",
  },
  {
    icon: TrendingUp,
    title: "Market Analytics",
    description:
      "Real-time price trends by LGA so buyers and owners make data-driven decisions.",
  },
  {
    icon: Zap,
    title: "Instant Inquiries",
    description:
      "Connect with verified owners directly — no middlemen, no ghost numbers.",
  },
];

export default function SneakPeekPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValidation = useEmailValidation(email, { debounceMs: 500, minLength: 3 });

  const handleJoin = async () => {
    if (!email || !firstName) {
      setError("Please enter your name and email.");
      return;
    }
    if (!emailValidation.isAvailable) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, source: "sneak_peek" }),
      });
      const json = await res.json();
      if (res.ok || json.isExistingUser) {
        setJoined(true);
      } else {
        setError(json.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-(--color-brand-dark,#07402F) text-white py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <Badge className="mb-6 bg-[#ADF434] text-[#07402F] font-semibold tracking-widest uppercase text-xs">
            Coming Soon
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Nigerian real estate,{" "}
            <span className="text-[#ADF434]">finally fixed.</span>
          </h1>
          <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl mx-auto">
            RealEST is building the first truly verified property marketplace in
            Nigeria — no fake listings, no ghost agents, no duplicates.
          </p>

          {joined ? (
            <div className="bg-[#ADF434] text-[#07402F] rounded-xl px-8 py-5 inline-flex items-center gap-3 font-semibold text-lg">
              <CheckCircle className="w-6 h-6" />
              You&apos;re on the list! We&apos;ll be in touch soon.
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <Input
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 flex-1"
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 flex-1"
                />
                <Button
                  onClick={handleJoin}
                  disabled={loading || !emailValidation.isAvailable || emailValidation.isLoading}
                  className="bg-[#ADF434] text-[#07402F] hover:bg-[#ADF434]/90 font-semibold shrink-0 disabled:opacity-60"
                >
                  {loading || emailValidation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {!emailValidation.isAvailable ? "Already joined" : "Get Early Access"}
                      {emailValidation.isAvailable && <ArrowRight className="w-4 h-4 ml-1" />}
                    </>
                  )}
                </Button>
              </div>

              {/* Already on list */}
              {!emailValidation.isAvailable && emailValidation.userInfo && (
                <div className="mt-3 flex gap-1 items-start text-sm text-white/80 max-w-lg mx-auto">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-white">{emailValidation.userInfo.firstName}</strong>, you&apos;re already on the waitlist
                    {emailValidation.userInfo.position ? <> at <strong className="text-white">#{emailValidation.userInfo.position}</strong></> : null}.{" "}
                    <Link href="/refer" className="text-primary underline underline-offset-2">Refer a friend to move up.</Link>
                  </span>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="mt-3 text-red-300 text-sm">{error}</p>
          )}
        </div>
      </section>

      {/* Features preview */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">
              What we&apos;re building
            </p>
            <h2 className="text-3xl font-bold">
              Every problem in Nigerian real estate, solved.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-background rounded-xl border border-border p-6 hover:border-primary/40 transition-colors"
              >
                <f.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaser stats */}
      <section className="py-16 px-4 bg-background border-t border-border">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "100%", label: "Verified Listings" },
              { value: "0", label: "Duplicate Listings" },
              { value: "24h", label: "Avg. Vetting Time" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-xl text-center">
          <Eye className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Want to see it first?</h2>
          <p className="text-muted-foreground mb-6">
            Join the waitlist and get exclusive first-access when we launch.
          </p>
          <Button asChild size="lg">
            <Link href="/early-access">
              Request Early Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
