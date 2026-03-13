import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

const DEFAULT_FORM_SLUG = 'realest-launch-intelligence-2026';

const SEGMENT_META: Record<string, { label: string; description: string }> = {
  buyer_renter: {
    label: 'Buyers and Renters',
    description: 'Demand discovery: locations, budgets, and pain points.',
  },
  owner_landlord: {
    label: 'Property Owners and Landlords',
    description: 'Supply readiness: inventory, listing behavior, and conversion blockers.',
  },
  agent: {
    label: 'Real Estate Agents',
    description: 'Agent growth: lead quality, tooling needs, and monetization readiness.',
  },
  investor: {
    label: 'Property Investors',
    description: 'Capital intent: preferred assets, ranges, and required confidence signals.',
  },
  developer_agency: {
    label: 'Developers and Agencies',
    description: 'Institutional supply: annual project volume, demand insight, and partnerships.',
  },
  bank_mortgage: {
    label: 'Financial Institutions',
    description: 'Mortgage ecosystem: financing offers and partnership interest.',
  },
};

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')?.trim() || DEFAULT_FORM_SLUG;

  try {
    const supabase = createServiceClient() as any;

    const { data: form, error: formError } = await supabase
      .from('poll_forms')
      .select('id, slug, title, description, is_active')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (formError || !form) {
      return NextResponse.json({ ok: false, error: 'Poll form not found.' }, { status: 404 });
    }

    const { data: questions, error: questionError } = await supabase
      .from('poll_questions')
      .select('question_key, segment, prompt, question_type, options, is_required, display_order')
      .eq('form_id', form.id)
      .order('display_order', { ascending: true });

    if (questionError) {
      return NextResponse.json({ ok: false, error: questionError.message }, { status: 500 });
    }

    const bySegment = new Map<string, any[]>();

    for (const row of questions ?? []) {
      const key = row.segment as string;
      if (!bySegment.has(key)) bySegment.set(key, []);
      bySegment.get(key)?.push({
        key: row.question_key,
        prompt: row.prompt,
        type: row.question_type,
        required: !!row.is_required,
        options: Array.isArray(row.options) ? row.options : [],
        order: row.display_order,
      });
    }

    const segments = [...bySegment.entries()].map(([key, segmentQuestions]) => ({
      key,
      label: SEGMENT_META[key]?.label ?? key,
      description: SEGMENT_META[key]?.description ?? 'Survey segment',
      questions: segmentQuestions,
    }));

    return NextResponse.json({
      ok: true,
      form: {
        slug: form.slug,
        title: form.title,
        description: form.description,
      },
      segments,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    );
  }
}
