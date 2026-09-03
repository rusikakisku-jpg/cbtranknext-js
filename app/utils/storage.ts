/**
 * CBTRank Storage Utility
 * ─────────────────────────────────────────────────────────────────
 * Uses localStorage (instead of sessionStorage) so data survives:
 *   ✅ Page refresh
 *   ✅ Tab close + reopen
 *   ✅ Mobile browser going to background
 *
 * All keys have a TTL (time-to-live) of 4 hours by default.
 * After expiry the data is auto-deleted on next read.
 *
 * Falls back gracefully when localStorage is blocked
 * (e.g., some incognito/private modes or cookie-disabled browsers).
 */

const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

interface StorageItem<T> {
  data: T;
  expiry: number; // Unix timestamp ms
}

/** Check if localStorage is available */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__cbtrank_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save a value to localStorage with an expiry time.
 * @param key    Storage key
 * @param value  Any JSON-serializable value
 * @param ttlMs  Time-to-live in milliseconds (default: 4 hours)
 */
export function cbtSave<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  if (!isLocalStorageAvailable()) return;
  try {
    const item: StorageItem<T> = {
      data: value,
      expiry: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    // localStorage full or blocked — fail silently
    console.warn(`[CBTRank] Could not save "${key}" to localStorage.`, e);
  }
}

/**
 * Read a value from localStorage.
 * Returns null if key doesn't exist or has expired.
 * @param key  Storage key
 */
export function cbtGet<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const item: StorageItem<T> = JSON.parse(raw);

    // Check expiry
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key); // Auto-clean expired data
      return null;
    }

    return item.data;
  } catch {
    return null;
  }
}

/**
 * Remove a key from localStorage.
 * @param key  Storage key
 */
export function cbtRemove(key: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // fail silently
  }
}

/**
 * Save a plain string value (no TTL wrapper) — for simple flags like 'true'.
 * @param key    Storage key
 * @param value  String value
 * @param ttlMs  Time-to-live in milliseconds (default: 4 hours)
 */
export function cbtSaveString(key: string, value: string, ttlMs: number = DEFAULT_TTL_MS): void {
  cbtSave<string>(key, value, ttlMs);
}

/**
 * Read a plain string value.
 * Returns null if not found or expired.
 */
export function cbtGetString(key: string): string | null {
  return cbtGet<string>(key);
}

// ─── CBTRank Storage Key Constants ───────────────────────────────
// Centralised so we never have typos across files.
export const STORAGE_KEYS = {
  RESULT_DATA:       'cbtrank_result_data',
  FORM_DATA:         'cbtrank_form_data',
  MARKS_RIGHT:       'cbtrank_exam_marks_right',
  MARKS_WRONG:       'cbtrank_exam_marks_wrong',
  ACTIVE_EXAM:       'cbtrank_active_exam',
  SHOW_TG_POPUP:     'cbtrank_show_tg_popup',
} as const;
