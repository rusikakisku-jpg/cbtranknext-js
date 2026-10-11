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
 * Ya environment variables se bhi control kar sakte hain:
 * NEXT_PUBLIC_ADSTERRA_ENABLED=true / false
 * NEXT_PUBLIC_ADSTERRA_NATIVE_ENABLED=true / false
 * ==============================================================================
 */

export const ADSTERRA_CONFIG = {
  // Social Bar toggle (true = Active, false = Disabled)
  ENABLED: process.env.NEXT_PUBLIC_ADSTERRA_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === 'true'
    : true,

  // Adsterra Social Bar Script URL
  SCRIPT_URL: process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_URL || 'https://bauval.org/14/5991cf8792c639f07a4b5b09b1a7c1fd',

  // Native Banner Ads toggle (true = Active, false = Disabled)
  NATIVE_BANNER_ENABLED: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ENABLED === 'true'
    : true,

  // Native Banner Container ID & Script URL
  NATIVE_BANNER_CONTAINER_ID: 'container-06cb6e91c088798f75b3e90c4f7fd49a',
  NATIVE_BANNER_SCRIPT_URL: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SCRIPT_URL || 'https://bauval.org/21/06cb6e91c088798f75b3e90c4f7fd49a',
};
