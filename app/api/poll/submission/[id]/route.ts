import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "edge";

interface SubmissionRow {
  id: string;
  segment: string;
  full_name: string;
  email: string;
  opt_in_email_results: boolean;
  created_at: string;
  poll_forms: { slug: string; title: string } | null;
}

interface AnswerRow {
  question_key: string;
  answer: { value: unknown };
}

interface QuestionRow {
  question_key: string;
  prompt: string;
  options: Array<{ value: string; label: string }> | null;
  display_order: number;
  segment: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid submission ID." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch submission
  const { data: sub, error: subErr } = await supabase
    .from("poll_submissions")
    .select("id, segment, full_name, email, opt_in_email_results, created_at, poll_forms(slug, title)")
    .eq("id", id)
    .single<SubmissionRow>();

  if (subErr || !sub) {
    return NextResponse.json({ ok: false, error: "Submission not found." }, { status: 404 });
  }

  // Fetch answers
  const { data: answerRows, error: ansErr } = await supabase
    .from("poll_submission_answers")
    .select("question_key, answer")
    .eq("submission_id", id)
    .returns<AnswerRow[]>();

  if (ansErr) {
    return NextResponse.json({ ok: false, error: "Failed to load answers." }, { status: 500 });
  }

  // Fetch question prompts + options for this segment
  const { data: questions, error: qErr } = await supabase
    .from("poll_questions")
    .select("question_key, prompt, options, display_order, segment")
    .eq("segment", sub.segment)
    .order("display_order", { ascending: true })
    .returns<QuestionRow[]>();

  if (qErr) {
    return NextResponse.json({ ok: false, error: "Failed to load questions." }, { status: 500 });
  }

  // Build enriched answer list
  const answerMap = new Map(
    (answerRows ?? []).map((r) => [r.question_key, r.answer?.value]),
  );

  const enrichedAnswers = (questions ?? [])
    .filter((q) => answerMap.has(q.question_key))
    .map((q) => {
      const raw = answerMap.get(q.question_key);
      const opts: Array<{ value: string; label: string }> = Array.isArray(q.options)
        ? q.options
        : [];
      let displayAnswer: string;
      if (Array.isArray(raw)) {
        displayAnswer = raw
          .map((v: string) => opts.find((o) => o.value === v)?.label ?? v)
          .join(", ");
      } else {
        displayAnswer = opts.find((o) => o.value === raw)?.label ?? String(raw ?? "");
      }
      return { question: q.prompt, answer: displayAnswer, key: q.question_key };
    });

  const formData = Array.isArray(sub.poll_forms)
    ? sub.poll_forms[0]
    : (sub.poll_forms ?? null);

  return NextResponse.json({
    ok: true,
    submission: {
      id: sub.id,
      segment: sub.segment,
      full_name: sub.full_name,
      email: sub.email,
      opt_in_email_results: sub.opt_in_email_results,
      created_at: sub.created_at,
      form_title: formData?.title ?? "RealEST Launch Intelligence Poll",
    },
    answers: enrichedAnswers,
  });
}
