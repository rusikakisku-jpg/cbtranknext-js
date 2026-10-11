'use client';

import { useEffect } from 'react';
import { MONETAG_CONFIG } from '../config/monetag';

export default function MonetagVignette() {
  useEffect(() => {
    // Only run if both master toggle and vignette toggle are enabled
    if (
      !MONETAG_CONFIG.ENABLED ||
      !MONETAG_CONFIG.VIGNETTE_ENABLED ||
      !MONETAG_CONFIG.VIGNETTE_ZONE_ID ||
      !MONETAG_CONFIG.VIGNETTE_SCRIPT_URL
    ) {
      return;
    }

    // Prevent duplicate script injection across route navigations
    const existing = document.querySelector(
      `script[data-zone="${MONETAG_CONFIG.VIGNETTE_ZONE_ID}"]`
    );
    if (existing) {
      return;
    }

    try {
      const s = document.createElement('script');
      s.dataset.zone = MONETAG_CONFIG.VIGNETTE_ZONE_ID;
      s.src = MONETAG_CONFIG.VIGNETTE_SCRIPT_URL;
      s.async = true;
      s.setAttribute('data-cfasync', 'false');

      const target = document.body || document.documentElement;
      if (target) {
        target.appendChild(s);
      }
    } catch (err) {
      console.error('[Monetag] Failed to inject Vignette banner:', err);
    }
  }, []);

  return null;
}
