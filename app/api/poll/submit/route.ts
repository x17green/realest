import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendPollResultsSummaryEmail } from '@/lib/emailService';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://realest.ng';

const DEFAULT_FORM_SLUG = 'realest-launch-intelligence-2026';

const SEGMENT_LABELS: Record<string, string> = {
  buyer_renter: 'Buyers and Renters',
  owner_landlord: 'Property Owners and Landlords',
  agent: 'Real Estate Agents',
  investor: 'Property Investors',
  developer_agency: 'Developers and Agencies',
  bank_mortgage: 'Financial Institutions',
};

type PollAnswerValue = string | number | boolean | string[] | null;

function isNonEmptyAnswer(value: PollAnswerValue): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

function formatAnswerForLegacy(value: PollAnswerValue): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value ?? '');
}

function formatAnswerForEmail(value: PollAnswerValue): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value ?? '').trim();
}

function normalizeOptionLabel(options: Array<{ value: string; label: string }>, value: string): string {
  const found = options.find((opt) => opt.value === value);
  return found?.label ?? value;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let body: {
    formSlug?: string;
    segment?: string;
    fullName?: string;
    email?: string;
    optInEmailResults?: boolean;
    ref?: string;
    answers?: Record<string, PollAnswerValue>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const formSlug = (body.formSlug ?? DEFAULT_FORM_SLUG).trim();
  const segment = (body.segment ?? '').trim();
  const fullName = (body.fullName ?? '').trim();
  const email = (body.email ?? '').trim().toLowerCase();
  const ref = (body.ref ?? '').trim();
  const answers = body.answers ?? {};
  const optInEmailResults = !!body.optInEmailResults;

  if (!segment) {
    return NextResponse.json({ ok: false, error: 'Please select a poll segment.' }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ ok: false, error: 'Full name is required.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'A valid email address is required.' }, { status: 400 });
  }

  try {
    const supabase = createServiceClient() as any;

    const { data: form, error: formError } = await supabase
      .from('poll_forms')
      .select('id, slug, title')
      .eq('slug', formSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (formError || !form) {
      return NextResponse.json({ ok: false, error: 'Poll form not found.' }, { status: 404 });
    }

    const { data: questions, error: questionError } = await supabase
      .from('poll_questions')
      .select('question_key, prompt, question_type, options, is_required, display_order')
      .eq('form_id', form.id)
      .eq('segment', segment)
      .order('display_order', { ascending: true });

    if (questionError) {
      return NextResponse.json({ ok: false, error: questionError.message }, { status: 500 });
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ ok: false, error: 'No questions found for this segment.' }, { status: 400 });
    }

    const missingRequired = questions
      .filter((q: any) => q.is_required)
      .filter((q: any) => !isNonEmptyAnswer(answers[q.question_key]))
      .map((q: any) => q.prompt);

    if (missingRequired.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing required answer(s): ${missingRequired.join('; ')}` },
        { status: 400 },
      );
    }

    const { data: submission, error: submissionError } = await supabase
      .from('poll_submissions')
      .insert({
        form_id: form.id,
        segment,
        full_name: fullName,
        email,
        opt_in_email_results: optInEmailResults,
        referral_code: ref || null,
        source: 'web',
      })
      .select('id')
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { ok: false, error: submissionError?.message ?? 'Unable to save submission.' },
        { status: 500 },
      );
    }

    const answerRows = questions
      .filter((q: any) => isNonEmptyAnswer(answers[q.question_key]))
      .map((q: any) => ({
        submission_id: submission.id,
        question_key: q.question_key,
        answer: { value: answers[q.question_key] },
      }));

    if (answerRows.length > 0) {
      const { error: answerError } = await supabase.from('poll_submission_answers').insert(answerRows);
      if (answerError) {
        return NextResponse.json({ ok: false, error: answerError.message }, { status: 500 });
      }
    }

    // Keep writing legacy rows for existing admin poll analytics compatibility.
    const legacyRows = questions
      .filter((q: any) => isNonEmptyAnswer(answers[q.question_key]))
      .map((q: any) => ({
        question_key: q.question_key,
        answer: formatAnswerForLegacy(answers[q.question_key]),
        ref: ref || null,
      }));

    if (legacyRows.length > 0) {
      await supabase.from('poll_responses').insert(legacyRows);
    }

    if (optInEmailResults) {
      const summary = questions
        .filter((q: any) => isNonEmptyAnswer(answers[q.question_key]))
        .map((q: any) => {
          const value = answers[q.question_key];
          const options = Array.isArray(q.options) ? q.options : [];

          if (typeof value === 'string' && options.length > 0) {
            return {
              question: q.prompt,
              answer: normalizeOptionLabel(options, value),
            };
          }

          if (Array.isArray(value) && options.length > 0) {
            return {
              question: q.prompt,
              answer: value.map((v) => normalizeOptionLabel(options, v)).join(', '),
            };
          }

          return {
            question: q.prompt,
            answer: formatAnswerForEmail(value),
          };
        });

      await sendPollResultsSummaryEmail(email, {
        fullName,
        segmentLabel: SEGMENT_LABELS[segment] ?? segment,
        submissionId: submission.id,
        answers: summary,
        detailsUrl: `${BASE_URL}/poll/${submission.id}`,
      });
    }

    return NextResponse.json({ ok: true, submissionId: submission.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 },
    );
  }
}
