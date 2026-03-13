"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, FileCheck2 } from "lucide-react";

type PollOption = { value: string; label: string };

type PollQuestion = {
  key: string;
  prompt: string;
  type: "single_choice" | "multi_choice" | "text" | "number" | "boolean";
  required: boolean;
  options: PollOption[];
  order: number;
};

type PollSegment = {
  key: string;
  label: string;
  description: string;
  questions: PollQuestion[];
};

type PollCatalogResponse = {
  ok: boolean;
  form: {
    slug: string;
    title: string;
    description: string;
  };
  segments: PollSegment[];
  error?: string;
};

export default function PollPage() {
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [formSlug, setFormSlug] = useState("realest-launch-intelligence-2026");
  const [segments, setSegments] = useState<PollSegment[]>([]);
  const [segmentKey, setSegmentKey] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [optInEmailResults, setOptInEmailResults] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoadingCatalog(true);
      setCatalogError(null);
      try {
        const response = await fetch("/api/poll/catalog");
        const json = (await response.json()) as PollCatalogResponse;
        if (!response.ok || !json.ok) {
          setCatalogError(json.error ?? "Unable to load poll questions.");
          return;
        }

        setFormSlug(json.form.slug);
        setSegments(json.segments);
        setSegmentKey(json.segments[0]?.key ?? "");
      } catch {
        setCatalogError("Unable to load poll questions.");
      } finally {
        setLoadingCatalog(false);
      }
    };

    loadCatalog();
  }, []);

  const selectedSegment = useMemo(
    () => segments.find((segment) => segment.key === segmentKey) ?? null,
    [segments, segmentKey],
  );

  const setSingleAnswer = (questionKey: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  const toggleMultiChoiceAnswer = (questionKey: string, value: string) => {
    setAnswers((prev) => {
      const existing = Array.isArray(prev[questionKey]) ? (prev[questionKey] as string[]) : [];
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
      return { ...prev, [questionKey]: next };
    });
  };

  const validateBeforeSubmit = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email address.";
    if (!selectedSegment) return "Please select a poll segment.";

    const missing = selectedSegment.questions
      .filter((question) => question.required)
      .find((question) => {
        const value = answers[question.key];
        if (Array.isArray(value)) return value.length === 0;
        return !value || value.toString().trim().length === 0;
      });

    if (missing) return `Please answer: ${missing.prompt}`;
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    if (!selectedSegment) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/poll/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formSlug,
          segment: selectedSegment.key,
          fullName,
          email,
          optInEmailResults,
          answers,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.ok) {
        setSubmitError(json.error ?? "Failed to submit poll response.");
        return;
      }

      setSuccessId(json.submissionId ?? "submitted");
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <Badge className="mb-4 uppercase tracking-widest text-xs bg-primary text-primary-foreground">
            RealEST Poll Intelligence
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Launch Intelligence Poll</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Help us prioritize verified supply, demand hotspots, and launch readiness. Select your segment,
            answer the questions, and optionally receive your summary by email.
          </p>
        </div>

        {successId ? (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-6 md:p-8">
            <div className="flex items-center gap-2 text-success font-semibold">
              <CheckCircle className="h-5 w-5" />
              Poll response submitted
            </div>
            <p className="mt-2 text-sm text-foreground">
              Submission ID: <span className="font-mono">{successId}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {optInEmailResults
                ? "A summary email will be sent to your inbox shortly."
                : "You opted out of summary email delivery."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Your details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full name *</label>
                  <Input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Adaeze Okonkwo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email address *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="adaeze@example.com"
                  />
                </div>
              </div>
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={optInEmailResults}
                  onChange={(event) => setOptInEmailResults(event.target.checked)}
                />
                Send me my poll response summary by email.
              </label>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Select your segment *</h2>

              {loadingCatalog ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading poll questions...
                </div>
              ) : catalogError ? (
                <p className="text-sm text-danger">{catalogError}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {segments.map((segment) => (
                    <button
                      type="button"
                      key={segment.key}
                      onClick={() => setSegmentKey(segment.key)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        segmentKey === segment.key
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{segment.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{segment.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSegment && (
              <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
                <div className="mb-4 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{selectedSegment.label} Questions</h3>
                </div>
                <div className="space-y-5">
                  {selectedSegment.questions.map((question, index) => {
                    const value = answers[question.key];
                    return (
                      <div key={question.key} className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          {index + 1}. {question.prompt} {question.required ? "*" : ""}
                        </label>

                        {question.type === "single_choice" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options.map((option) => (
                              <button
                                type="button"
                                key={option.value}
                                onClick={() => setSingleAnswer(question.key, option.value)}
                                className={`rounded-lg border px-3 py-2 text-sm text-left ${
                                  value === option.value
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/40"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {question.type === "multi_choice" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options.map((option) => {
                              const selected = Array.isArray(value) ? value.includes(option.value) : false;
                              return (
                                <button
                                  type="button"
                                  key={option.value}
                                  onClick={() => toggleMultiChoiceAnswer(question.key, option.value)}
                                  className={`rounded-lg border px-3 py-2 text-sm text-left ${
                                    selected
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-primary/40"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {(question.type === "text" || question.type === "boolean") && (
                          <Input
                            value={typeof value === "string" ? value : ""}
                            onChange={(event) => setSingleAnswer(question.key, event.target.value)}
                            placeholder="Type your answer"
                          />
                        )}

                        {question.type === "number" && (
                          <Input
                            type="number"
                            value={typeof value === "string" ? value : ""}
                            onChange={(event) => setSingleAnswer(question.key, event.target.value)}
                            placeholder="Enter a number"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {submitError && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {submitError}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting || loadingCatalog}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Poll"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
