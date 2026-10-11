/**
 * Monetag Configuration
 * 
 * Safely control Monetag verification and ad settings.
 */

export const MONETAG_CONFIG = {
  // Domain Verification Code
  VERIFICATION_CODE: 'baf9441e9849cf106ffc694c6b2169bc',

  // Master ads toggle (true = Active, false = Disabled)
  ENABLED: process.env.NEXT_PUBLIC_MONETAG_ENABLED !== undefined
    ? process.env.NEXT_PUBLIC_MONETAG_ENABLED === 'true'
    : true,
};
