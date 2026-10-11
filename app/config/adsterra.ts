/**
 * Adsterra Configuration
 * 
 * ==============================================================================
 * ADS ON / OFF KAISE KAREIN:
 * ==============================================================================
 * 1. SOCIAL BAR ADS:
 *    ENABLED: true (Active) / false (Disabled)
 * 
 * 2. NATIVE BANNER ADS:
 *    NATIVE_BANNER_ENABLED: true (Active) / false (Disabled)
 * 
 * 3. 300x250 BANNER ADS (Calculator & Homepage):
 *    BANNER_300x250_ENABLED: true (Active) / false (Disabled)
 * 
 * 4. 320x50 (300x50) BANNER ADS (All Pages Bottom):
 *    BANNER_320x50_ENABLED: true (Active) / false (Disabled)
 * 
 * Ya environment variables se bhi control kar sakte hain:
 * NEXT_PUBLIC_ADSTERRA_ENABLED=true / false
 * NEXT_PUBLIC_ADSTERRA_NATIVE_ENABLED=true / false
 * NEXT_PUBLIC_ADSTERRA_300x250_ENABLED=true / false
 * NEXT_PUBLIC_ADSTERRA_320x50_ENABLED=true / false
 * ==============================================================================
 */

export const ADSTERRA_CONFIG = {
  // 1. Social Bar toggle (true = Active, false = Disabled)
  ENABLED: process.env.NEXT_PUBLIC_ADSTERRA_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === 'true'
    : true,
  SCRIPT_URL: process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_URL || 'https://bauval.org/14/5991cf8792c639f07a4b5b09b1a7c1fd',

  // 2. Native Banner Ads toggle
  NATIVE_BANNER_ENABLED: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ENABLED === 'true'
    : false,
  NATIVE_BANNER_CONTAINER_ID: 'container-06cb6e91c088798f75b3e90c4f7fd49a',
  NATIVE_BANNER_SCRIPT_URL: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SCRIPT_URL || 'https://bauval.org/21/06cb6e91c088798f75b3e90c4f7fd49a',

  // 3. Banner 300x250 Ads toggle (true = Active, false = Disabled)
  BANNER_300x250_ENABLED: process.env.NEXT_PUBLIC_ADSTERRA_300x250_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_ADSTERRA_300x250_ENABLED === 'true'
    : true,
  BANNER_300x250_KEY: '356d922d4c39757870b963b7933a3640',

  // 4. Banner 320x50 (Bottom) Ads toggle (true = Active, false = Disabled)
  BANNER_320x50_ENABLED: process.env.NEXT_PUBLIC_ADSTERRA_320x50_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_ADSTERRA_320x50_ENABLED === 'true'
    : true,
  BANNER_320x50_KEY: '9069c27b76ceea1c963d624a5ec3b299',
};
