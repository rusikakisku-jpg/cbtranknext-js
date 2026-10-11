/**
 * Monetag Configuration
 * 
 * Safely control Monetag verification and ad settings.
 * 
 * TO ENABLE / DISABLE ADS:
 * VIGNETTE_ENABLED: true (Active) / false (Disabled)
 */

export const MONETAG_CONFIG = {
  // Domain Verification Code
  VERIFICATION_CODE: 'baf9441e9849cf106ffc694c6b2169bc',

  // Master ads toggle (true = Active, false = Disabled)
  ENABLED: process.env.NEXT_PUBLIC_MONETAG_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_MONETAG_ENABLED === 'true'
    : true,

  // Vignette Banner Ads toggle (true = Active, false = Disabled)
  VIGNETTE_ENABLED: process.env.NEXT_PUBLIC_MONETAG_VIGNETTE_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_MONETAG_VIGNETTE_ENABLED === 'true'
    : true,

  // Vignette Zone & Script details
  VIGNETTE_ZONE_ID: '12007232',
  VIGNETTE_SCRIPT_URL: 'https://n6wxm.com/vignette.min.js',

  // In-Page Push (IPP) Ads toggle (true = Active, false = Disabled)
  IN_PAGE_PUSH_ENABLED: process.env.NEXT_PUBLIC_MONETAG_IPP_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_MONETAG_IPP_ENABLED === 'true'
    : true,

  // In-Page Push Zone & Script details
  IN_PAGE_PUSH_ZONE_ID: '12007302',
  IN_PAGE_PUSH_SCRIPT_URL: 'https://nap5k.com/tag.min.js',
};
