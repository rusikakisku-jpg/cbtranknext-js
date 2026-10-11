'use client';

import { useEffect, useRef } from 'react';
import { ADSTERRA_CONFIG } from '../config/adsterra';

interface AdsterraNativeBannerProps {
  className?: string;
}

export default function AdsterraNativeBanner({ className = '' }: AdsterraNativeBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ADSTERRA_CONFIG.NATIVE_BANNER_ENABLED || !ADSTERRA_CONFIG.NATIVE_BANNER_SCRIPT_URL) {
      return;
    }

    const container = bannerRef.current;
    if (!container) return;

    // Reset container to avoid duplicates during navigation / re-renders
    container.innerHTML = '';

    // Create container div with exact Adsterra ID
    const adContainer = document.createElement('div');
    adContainer.id = ADSTERRA_CONFIG.NATIVE_BANNER_CONTAINER_ID;
    container.appendChild(adContainer);

    // Create and append the Adsterra script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = ADSTERRA_CONFIG.NATIVE_BANNER_SCRIPT_URL;
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  if (!ADSTERRA_CONFIG.NATIVE_BANNER_ENABLED) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      className={`cbtrank-native-banner-wrapper my-6 flex justify-center items-center w-full min-h-[90px] overflow-hidden ${className}`.trim()}
    >
      <div id={ADSTERRA_CONFIG.NATIVE_BANNER_CONTAINER_ID} />
    </div>
  );
}
