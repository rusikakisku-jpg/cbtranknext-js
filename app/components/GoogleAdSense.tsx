'use client';

import Script from 'next/script';
import { ADSENSE_CONFIG, getAdSenseClientId } from '../config/adsense';

export default function GoogleAdSense() {
  const clientId = getAdSenseClientId();

  // Agar publisher ID paste nahi ki gayi ya disabled hai, toh load na karein
  if (!ADSENSE_CONFIG.ENABLED || !clientId) {
    return null;
  }

  return (
    <Script
      id="google-adsense-script"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}

/**
 * Reusable Ad Banner Component for manual ad placements (e.g., inside blog posts or sidebars)
 */
interface AdBannerProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AdBanner({
  slotId,
  format = 'auto',
  responsive = true,
  className = '',
  style = { display: 'block' },
}: AdBannerProps) {
  const clientId = getAdSenseClientId();

  if (!ADSENSE_CONFIG.ENABLED || !clientId || !slotId) {
    return null;
  }

  return (
    <div className={`cbtrank-ad-wrapper my-4 text-center ${className}`.trim()}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
      <Script id={`adsbygoogle-push-${slotId}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
