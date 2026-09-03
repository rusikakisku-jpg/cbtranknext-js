'use client';

/**
 * GoogleAnalytics Component
 * ─────────────────────────────────────────────────────────────────
 * Loads GA ONLY after the user has given analytics consent via
 * the CookieConsent component (cbtrank:consent event).
 *
 * If the user already consented (stored in localStorage),
 * GA loads immediately on next visit.
 */

import Script from 'next/script';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'cbtrank_cookie_consent';

function hasStoredAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.analytics === true && parsed?.decided === true && Date.now() < parsed?.expiry;
  } catch {
    return false;
  }
}

interface GoogleAnalyticsProps {
  gaId?: string;
}

export default function GoogleAnalytics({
  gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-RDZ060ZF0S',
}: GoogleAnalyticsProps) {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check if user already consented on a previous visit
    if (hasStoredAnalyticsConsent()) {
      setConsentGiven(true);
      return;
    }

    // Listen for fresh consent event from CookieConsent component
    function handleConsent(e: Event) {
      const detail = (e as CustomEvent<{ analytics: boolean }>).detail;
      if (detail?.analytics === true) {
        setConsentGiven(true);
      }
    }

    window.addEventListener('cbtrank:consent', handleConsent);
    return () => window.removeEventListener('cbtrank:consent', handleConsent);
  }, []);

  // Do NOT load GA until user has consented
  if (!gaId || !consentGiven) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
