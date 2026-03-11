import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { colors, fonts, BASE_URL } from '../styles/tokens';

interface EmailFooterProps {
  showUnsubscribe?: boolean;
  unsubscribeUrl?: string;
  /** Optional line rendered above copyright, e.g. mission reminder for marketing emails */
  footerNote?: string;
}

export function EmailFooter({
  showUnsubscribe = true,
  unsubscribeUrl = '{unsubscribe_url}',
  footerNote,
}: EmailFooterProps) {
  const year = new Date().getFullYear();
  // Don't render unsubscribe link if URL is an ESP template placeholder (preview / dev mode)
  const hasValidUnsubscribeUrl = showUnsubscribe && !!unsubscribeUrl && !unsubscribeUrl.startsWith('{');

  return (
    <Section
      style={{
        borderTop: `1px solid ${colors.border}`,
        backgroundColor: colors.borderLight,
        padding: '24px 40px 28px',
        textAlign: 'center' as const,
      }}
    >
      {/* Nav links */}
      <Text style={{ margin: '0 0 10px', lineHeight: '1.6' }}>
        <Link
          href={`${BASE_URL}/privacy`}
          style={{
            fontFamily: fonts.body,
            fontSize: '11.5px',
            color: colors.textMuted,
            textDecoration: 'none',
            margin: '0 10px',
          }}
        >
          Privacy Policy
        </Link>
        <Link
          href={`${BASE_URL}/terms`}
          style={{
            fontFamily: fonts.body,
            fontSize: '11.5px',
            color: colors.textMuted,
            textDecoration: 'none',
            margin: '0 10px',
          }}
        >
          Terms of Service
        </Link>
        {hasValidUnsubscribeUrl && (
          <Link
            href={unsubscribeUrl}
            style={{
              fontFamily: fonts.body,
              fontSize: '11.5px',
              color: colors.textMuted,
              textDecoration: 'none',
              margin: '0 10px',
            }}
          >
            Unsubscribe
          </Link>
        )}
      </Text>

      {/* Optional mission-reminder note (used by marketing emails) */}
      {footerNote && (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: '11.5px',
            color: colors.textMuted,
            fontStyle: 'italic',
            lineHeight: '1.6',
            margin: '0 0 10px',
          }}
        >
          {footerNote}
        </Text>
      )}

      {/* Copyright + contact */}
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: '11px',
          color: colors.textLight,
          lineHeight: '1.7',
          margin: '0',
        }}
      >
        &copy; {year} RealEST Connect &mdash; Nigeria&apos;s Geo-Verified Property Marketplace
        <br />
        <Link
          href={BASE_URL}
          style={{ color: colors.textMuted, textDecoration: 'none' }}
        >
          realest.ng
        </Link>
        {' \u00b7 Lagos, Nigeria'}
      </Text>
    </Section>
  );
}
