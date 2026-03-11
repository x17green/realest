"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, MapPin } from "lucide-react";

const CITIES: Record<
  string,
  { description: string; highlight: string }
> = {
  lagos: {
    description:
      "Nigeria's commercial hub — high demand, diverse neighbourhoods, from Lekki to Surulere.",
    highlight: "Lagos",
  },
  abuja: {
    description:
      "The capital — premium residential estates, diplomatic zones, and rapid infrastructure growth.",
    highlight: "Abuja",
  },
  "port harcourt": {
    description:
      "South-South's largest city — oil-industry professionals, island homes, and waterfront living.",
    highlight: "Port Harcourt",
  },
  ibadan: {
    description:
      "Oyo State's heartbeat — one of Africa's most populous cities with a thriving rental market.",
    highlight: "Ibadan",
  },
  kano: {
    description:
      "Northern Nigeria's centre of commerce — diverse housing from high-gate estates to traditional compounds.",
    highlight: "Kano",
  },
  enugu: {
    description:
      "Coal City — serene residential areas, growing tech community, and affordable housing.",
    highlight: "Enugu",
  },
};

function normalize(raw: string | null) {
  return (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
}

function PollCityContent() {
  const params = useSearchParams();
  const rawAnswer = params.get("answer");
  const ref = params.get("ref");

  const key = normalize(rawAnswer);
  const city = CITIES[key];
  const displayName = city?.highlight ?? rawAnswer ?? "your city";

  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current || !rawAnswer) return;
    recorded.current = true;
    fetch("/api/poll/city", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: rawAnswer, ref: ref ?? "" }),
    }).catch(() => {});
  }, [rawAnswer, ref]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section
        className="py-24 px-4 text-center text-white"
        style={{ backgroundColor: "#07402F" }}
      >
        <div className="container mx-auto max-w-xl">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#ADF434" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: "#07402F" }} />
          </div>
          <Badge className="mb-4 uppercase tracking-widest text-xs border-white/30 bg-white/10 text-white">
            Vote recorded
          </Badge>
          <h1 className="text-3xl font-bold mb-3">
            Thanks for voting{" "}
            <span style={{ color: "#ADF434" }}>{displayName}</span>!
          </h1>
          <p className="text-white/80 text-base">
            Your vote helps us prioritise which cities we launch in first. We
            appreciate your input.
          </p>
        </div>
      </section>

      {/* City highlight */}
      {city && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">{city.highlight}</h2>
            </div>
            <p className="text-muted-foreground">{city.description}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 px-4 bg-muted/30 border-t border-border text-center">
        <div className="container mx-auto max-w-sm">
          <h3 className="font-semibold mb-2">
            Want early access in {displayName}?
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Join the waitlist to be notified when RealEST launches in your
            city.
          </p>
          <Button asChild size="lg">
            <Link href="/waitlist">
              Join the Waitlist <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function PollCityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading…</div>
        </div>
      }
    >
      <PollCityContent />
    </Suspense>
  );
}
