import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

export interface PollResultsSummaryEmailData {
  fullName: string;
  segmentLabel: string;
  submissionId: string;
  answers: Array<{ question: string; answer: string }>;
  unsubscribeUrl?: string;
}

const s = {
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['10']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  heroTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
    fontWeight: 700 as const,
    color: colors.brandLight,
    margin: `0 0 ${spacing['3']}`,
    lineHeight: '1.25',
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.accentMuted,
    margin: 0,
    lineHeight: '1.6',
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['4']}`,
  },
  card: {
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.pageBg,
    padding: spacing['5'],
    marginBottom: spacing['3'],
  },
  question: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.textMuted,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  answer: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.brandNeutral,
    margin: 0,
    lineHeight: '1.6',
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textLight,
    margin: `${spacing['4']} 0 0`,
  },
};

export function PollResultsSummaryEmail({
  fullName,
  segmentLabel,
  submissionId,
  answers,
  unsubscribeUrl,
}: PollResultsSummaryEmailData) {
  return (
    <EmailLayout preview={`Your RealEST poll summary is ready, ${fullName}.`}>
      <EmailHeader />

      <Section style={s.heroBg}>
        <Text style={s.eyebrow}>Poll Submission Received</Text>
        <Text style={s.heroTitle}>Thanks for sharing market intelligence</Text>
        <Text style={s.heroSub}>
          We received your responses for the <strong>{segmentLabel}</strong> track.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {fullName},</Text>
        <Text style={s.paragraph}>
          Thanks for completing the RealEST intelligence poll. Your responses will help shape
          verified supply, demand matching, and launch priorities in Nigeria.
        </Text>

        {answers.map((item, idx) => (
          <div key={`${idx}-${item.question}`} style={s.card}>
            <Text style={s.question}>{item.question}</Text>
            <Text style={s.answer}>{item.answer}</Text>
          </div>
        ))}

        <Text style={s.meta}>Submission ID: {submissionId}</Text>
        <Text style={s.meta}>RealEST: {BASE_URL}</Text>
      </EmailSection>

      <EmailFooter
        showUnsubscribe={true}
        unsubscribeUrl={unsubscribeUrl || undefined}
        footerNote="You received this because you opted in to get your poll summary by email."
      />
    </EmailLayout>
  );
}

PollResultsSummaryEmail.subject = (_data: PollResultsSummaryEmailData) =>
  'Your RealEST poll response summary';

export default PollResultsSummaryEmail;

export const previewProps: PollResultsSummaryEmailData = {
  fullName: 'Aisha Bello',
  segmentLabel: 'Buyers and Renters',
  submissionId: 'sample-submission-id',
  answers: [
    { question: 'Are you currently looking for a property?', answer: 'Yes now' },
    { question: 'What are you searching for?', answer: 'Apartment' },
    { question: 'Which city are you interested in?', answer: 'Lagos' },
  ],
};
