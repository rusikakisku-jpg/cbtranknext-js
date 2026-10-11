import { MONETAG_CONFIG } from '../config/monetag';

/**
 * MonetagVignette Component
 * 
 * Note: The Vignette script is placed directly in <head> of layout.tsx
 * to ensure 100% crawler verification by Monetag's automated checker,
 * while respecting MONETAG_CONFIG.VIGNETTE_ENABLED.
 */
export default function MonetagVignette() {
  return null;
}
