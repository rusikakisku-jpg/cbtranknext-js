'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { ADSTERRA_CONFIG } from '../config/adsterra';

/**
 * Checks if the current URL is an answer key page:
 * Matches:
 * - /answerkey
 * - /[slug]/answerkey (e.g. /ssc-cgl-tier-1/answerkey, /rrb-ntpc/answerkey)
 * Does NOT match:
 * - / (homepage)
 * - /blog, /blog/[slug]
 * - /result, /rank
 * - /review-answerkey
 */
export function isAnswerKeyRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  const cleanPath = pathname.replace(/\/$/, '');
  return cleanPath === '/answerkey' || cleanPath.endsWith('/answerkey') || cleanPath.startsWith('/answerkey/');
}

export default function AdsterraSocialBar() {
  const pathname = usePathname();

  // If ads are disabled in config, do not render
  if (!ADSTERRA_CONFIG.ENABLED || !ADSTERRA_CONFIG.SCRIPT_URL) {
    return null;
  }

  // Only render on /answerkey and /[slug]/answerkey routes
  if (!isAnswerKeyRoute(pathname)) {
    return null;
  }

  return (
    <Script
      id="adsterra-social-bar"
      src={ADSTERRA_CONFIG.SCRIPT_URL}
      strategy="afterInteractive"
      data-cfasync="false"
    />
  );
}
