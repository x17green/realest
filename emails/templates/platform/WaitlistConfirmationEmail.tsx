import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types (re-used from existing lib) ────────────────────────────────────────
export interface WaitlistEmailData {
  email: string;
  firstName: string;
  lastName?: string;
  position?: number;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['5']}`,
  },
  paragraphMuted: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: '1.6',
    margin: `${spacing['6']} 0 0`,
  },
  positionCard: {
    border: `1px solid ${colors.border}`,
    padding: spacing['6'],
    textAlign: 'center' as const,
    margin: `${spacing['6']} 0`,
    backgroundColor: colors.pageBg,
  },
  positionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: `0 0 ${spacing['2']}`,
  },
  positionValue: {
    fontFamily: fonts.heading,
    fontSize: fontSize['2xl'],
    fontWeight: 700,
    color: colors.brandDark,
    margin: `0 0 ${spacing['2']}`,
  },
  positionNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    margin: '0',
  },
  feature: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['2']}`,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function WaitlistConfirmationEmail({ firstName, position }: WaitlistEmailData) {
  return (
    <EmailLayout preview={`${firstName}, your RealEST waitlist spot is confirmed.`}>
      <EmailHeader />

      <EmailSection>
        <Text style={styles.paragraph}>Hi {firstName},</Text>

        <Text style={styles.paragraph}>
          Your spot on the <strong>RealEST</strong> waitlist is confirmed.
        </Text>

        <Section style={styles.positionCard}>
          <Text style={styles.positionLabel}>Waitlist position</Text>
          <Text style={styles.positionValue}>
            {position ? `#${position}` : 'Early Access'}
          </Text>
          <Text style={styles.positionNote}>
            {position
              ? 'The earlier you join, the sooner you get access.'
              : "You're among our earliest supporters."}
          </Text>
        </Section>

        <Text style={styles.paragraph}>
          RealEST is building a verified property marketplace for Nigeria — every listing
          geo-verified, authenticated, and free of duplicates.
        </Text>

        <Text style={styles.feature}>• Geo-verified property locations</Text>
        <Text style={styles.feature}>• Authenticated listings with no duplicates</Text>
        <Text style={styles.feature}>• Real-time property market insights</Text>

        <Text style={styles.paragraphMuted}>
          We&apos;ll notify you as soon as RealEST launches.
        </Text>
      </EmailSection>

      <EmailFooter />
    </EmailLayout>
  );
}

// Subject line helper (called by emailService)
WaitlistConfirmationEmail.subject = (_data: WaitlistEmailData) =>
  `You're on the RealEST waitlist`;

export const previewProps: WaitlistEmailData = {
  email: 'adaeze@example.ng',
  firstName: 'Adaeze',
  lastName: 'Okonkwo',
  position: 42,
};

export default WaitlistConfirmationEmail;
