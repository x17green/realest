import * as React from 'react';
import { Link, Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ReferralInviteEmailData {
  firstName: string;
  referralCode?: string;
  referralUrl?: string;
  rewardDescription?: string;
  rewardForReferee?: string;
  unsubscribeUrl?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['12']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  heroEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['3']}`,
  },
  heroHeadline: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandLight,
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    margin: `0 0 ${spacing['4']}`,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.accentMuted,
    lineHeight: '1.6',
    margin: 0,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['5']}`,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['4']}`,
  },
  rewardBox: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['6']} ${spacing['8']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  rewardEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.accentMuted,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  rewardValue: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    margin: `0 0 ${spacing['1']}`,
    lineHeight: '1.1',
  },
  rewardSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.brandLight,
    margin: 0,
  },
  refCodeContainer: {
    border: `2px dashed ${colors.brandAccent}`,
    padding: `${spacing['4']} ${spacing['6']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  refCodeLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.textMuted,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  refCode: {
    fontFamily: fonts.mono,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandDark,
    letterSpacing: '0.1em',
    margin: `0 0 ${spacing['3']}`,
  },
  refLinkBox: {
    backgroundColor: colors.pageBg,
    border: `1px solid ${colors.border}`,
    padding: `${spacing['3']} ${spacing['4']}`,
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    wordBreak: 'break-all' as const,
    textDecoration: 'none',
  },
  stepRow: {
    marginBottom: spacing['4'],
  },
  stepNum: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    backgroundColor: colors.brandDark,
    width: '24px',
    height: '24px',
    textAlign: 'center' as const,
    lineHeight: '24px',
    display: 'inline-block' as const,
    marginRight: spacing['3'],
    verticalAlign: 'middle' as const,
  },
  stepText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    margin: 0,
    lineHeight: '1.5',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ReferralInviteEmail({
  firstName = '',
  referralCode = '',
  referralUrl = '',
  rewardDescription = 'priority verification on your first listing',
  rewardForReferee = '1 month of premium visibility',
  unsubscribeUrl = '',
}: ReferralInviteEmailData) {
  const shareUrl = referralUrl || (referralCode
    ? `${BASE_URL}/join?ref=${referralCode}`
    : `${BASE_URL}/join`);

  const steps = [
    `Share your referral link with a verified landlord or licensed agent you know.`,
    `They sign up using your link and complete their profile.`,
    `You both unlock your rewards — no verification hoops to jump through.`,
  ];

  return (
    <EmailLayout preview={`${firstName}, invite a verified landlord and unlock your referral reward — both of you benefit.`}>
      <EmailHeader />

      {/* Hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>Referral Programme</Text>
        <Text style={s.heroHeadline}>
          You've earned it.{' '}
          <span style={{ color: colors.brandAccent }}>
            Invite one verified landlord, and you both win.
          </span>
        </Text>
        <Text style={s.heroSub}>
          RealEST grows through trust — and trust begins with people like you.
          Every verified landlord you bring to the platform makes Nigeria's property
          market a little more honest.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          You joined RealEST's waitlist because you believe Nigeria deserves a better way
          to buy, sell, and rent property. We agree. And right now, the most powerful thing
          you can do to make that happen — apart from using the platform yourself — is to{' '}
          <strong>invite a verified landlord or licensed agent</strong> who shares that vision.
        </Text>

        <Text style={s.paragraph}>
          As our thank-you, here's what happens when someone signs up using your referral:
        </Text>
      </EmailSection>

      <EmailSection>
        {/* Reward box - 2-column */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: spacing['6'] }}>
          <tbody>
            <tr>
              <td style={{ ...s.rewardBox as React.CSSProperties, width: '48%', verticalAlign: 'top' }}>
                <Text style={s.rewardEyebrow}>You get</Text>
                <Text style={s.rewardValue}>{rewardDescription}</Text>
                <Text style={s.rewardSub}>credited to your account automatically</Text>
              </td>
              <td width="4%" />
              <td style={{ ...s.rewardBox as React.CSSProperties, width: '48%', verticalAlign: 'top' }}>
                <Text style={s.rewardEyebrow}>They get</Text>
                <Text style={s.rewardValue}>{rewardForReferee}</Text>
                <Text style={s.rewardSub}>when they complete their first listing</Text>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Referral code block */}
        {referralCode && (
          <div style={s.refCodeContainer}>
            <Text style={s.refCodeLabel}>Your referral code</Text>
            <Text style={s.refCode}>{referralCode}</Text>
          </div>
        )}

        {/* Shareable link */}
        <Text style={s.sectionLabel}>Your shareable link</Text>
        <div style={s.refLinkBox}>
          <Link href={shareUrl} style={{ color: colors.brandDark, textDecoration: 'none' }}>
            {shareUrl}
          </Link>
        </div>
      </EmailSection>

      <EmailSection>
        <Text style={s.sectionLabel}>How it works</Text>

        {steps.map((step, i) => (
          <table key={i} width="100%" cellPadding={0} cellSpacing={0}
            style={{ marginBottom: spacing['4'] }}>
            <tbody>
              <tr>
                <td style={{ width: '32px', verticalAlign: 'top' }}>
                  <span style={s.stepNum}>{i + 1}</span>
                </td>
                <td style={{ verticalAlign: 'top', paddingLeft: spacing['3'] }}>
                  <Text style={s.stepText}>{step}</Text>
                </td>
              </tr>
            </tbody>
          </table>
        ))}

        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.sm,
          color: colors.textMuted,
          lineHeight: '1.5',
          margin: `${spacing['2']} 0 ${spacing['6']}`,
        }}>
          Referral rewards apply to accounts in good standing. Both accounts must complete
          email verification before rewards are credited.
        </Text>

        <EmailButton href={shareUrl} variant="primary">
          Share My Referral Link →
        </EmailButton>
      </EmailSection>

      <EmailFooter
        showUnsubscribe={true}
        unsubscribeUrl={unsubscribeUrl || undefined}
        footerNote="Verified properties only. No fake agents. No scams. No movement fees!"
      />
    </EmailLayout>
  );
}

ReferralInviteEmail.subject = (data: ReferralInviteEmailData) =>
  `${data.firstName}, you've earned it — share RealEST and claim your reward`;

export default ReferralInviteEmail;

export const previewProps: ReferralInviteEmailData = {
  firstName: 'Nkechi',
  referralCode: 'NKECHI-REF01',
  referralUrl: 'https://realest.ng/join?ref=NKECHI-REF01',
  rewardDescription: 'priority verification on your first listing',
  rewardForReferee: '1 month of premium visibility',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
};
