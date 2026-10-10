/**
 * Adsterra Configuration
 * 
 * ==============================================================================
 * ADS ON / OFF KAISE KAREIN:
 * ==============================================================================
 * Agar ads band karni ho:
 * ENABLED: false
 * 
 * Agar ads chalani ho:
 * ENABLED: true
 * 
 * Ya environment variable se bhi control kar sakte hain:
 * NEXT_PUBLIC_ADSTERRA_ENABLED=false / true
 * ==============================================================================
 */

export const ADSTERRA_CONFIG = {
  // Ads ko ON/OFF karne ke liye toggle (true = Active, false = Disabled)
  ENABLED: process.env.NEXT_PUBLIC_ADSTERRA_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === 'true'
    : true,

  // Adsterra Social Bar Script URL
  SCRIPT_URL: process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_URL || 'https://bauval.org/14/5991cf8792c639f07a4b5b09b1a7c1fd',
};
