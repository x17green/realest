"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Gift, Users, Star } from "lucide-react";

function ReferContent() {
  const params = useSearchParams();
  const ref = params.get("ref");

  const registerUrl = ref
    ? `/register?ref=${encodeURIComponent(ref)}`
    : "/register";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section
        className="py-24 px-4 text-center text-white"
        style={{ backgroundColor: "#07402F" }}
      >
        <div className="container mx-auto max-w-2xl">
          {ref ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-white/20 bg-white/10 text-sm">
                <Gift className="w-4 h-4" />
                You were invited
              </div>
              <h1 className="text-4xl font-bold mb-4">
                Someone saved you a spot
              </h1>
              <p className="text-white/80 text-lg mb-2">
                Your referral code{" "}
                <span
                  className="font-mono font-bold px-2 py-0.5 rounded text-sm"
                  style={{ backgroundColor: "#ADF434", color: "#07402F" }}
                >
                  {ref}
                </span>{" "}
                gives you priority access and exclusive first-launch perks.
              </p>
              <p className="text-white/60 text-sm mb-8">
                Create your account to lock in your spot before it expires.
              </p>
              <Button
                asChild
                size="lg"
                className="font-semibold"
                style={{ backgroundColor: "#ADF434", color: "#07402F" }}
              >
                <Link href={registerUrl}>
                  Claim My Spot <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Badge className="mb-4 uppercase tracking-widest text-xs border-white/30 bg-white/10 text-white">
                Refer &amp; Earn
              </Badge>
              <h1 className="text-4xl font-bold mb-4">
                Share RealEST. Earn Rewards.
              </h1>
              <p className="text-white/80 text-lg mb-8">
                Refer friends, colleagues, and landlords to RealEST. When they
                join, both of you unlock exclusive perks at launch.
              </p>
              <Button
                asChild
                size="lg"
                className="font-semibold"
                style={{ backgroundColor: "#ADF434", color: "#07402F" }}
              >
                <Link href="/register">
                  Join &amp; Get Your Code <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-10">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                step: "1",
                title: "Sign up",
                body: "Create your free RealEST account and get a unique referral link.",
              },
              {
                icon: Gift,
                step: "2",
                title: "Share your link",
                body: "Send it to friends, on WhatsApp, Twitter, or anywhere. Each click is tracked.",
              },
              {
                icon: Star,
                step: "3",
                title: "Earn rewards",
                body: "When your referrals join, both of you move up the queue and unlock launch perks.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <p
                  className="text-xs font-medium uppercase tracking-widest mb-1"
                  style={{ color: "#ADF434" }}
                >
                  Step {item.step}
                </p>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href={registerUrl}>
                {ref ? "Claim My Referral Spot" : "Get My Referral Link"}{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function ReferPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading…</div>
        </div>
      }
    >
      <ReferContent />
    </Suspense>
  );
}
