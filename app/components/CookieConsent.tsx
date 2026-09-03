'use client';

/**
 * CookieConsent Component
 * ─────────────────────────────────────────────────────────────────
 * Compliant with:
 *  - India's Digital Personal Data Protection (DPDP) Act, 2023
 *  - EU GDPR (General Data Protection Regulation)
 *
 * Behaviour:
 *  - Shows banner on first visit (bottom of screen)
 *  - "Accept All"  → saves consent, enables Google Analytics
 *  - "Reject All"  → saves rejection, GA does NOT run
 *  - "Manage"      → opens a simple modal with per-category toggles
 *  - Consent stored in localStorage for 365 days
 *  - Banner never re-appears once user has decided
 *  - Fires window.dispatchEvent('cbtrank:consent') so GoogleAnalytics
 *    component can conditionally load GA only after consent
 */

import { useEffect, useState } from 'react';

const CONSENT_KEY   = 'cbtrank_cookie_consent';
const CONSENT_TTL   = 365 * 24 * 60 * 60 * 1000; // 365 days

type ConsentState = {
  analytics: boolean;
  decided: boolean;
  timestamp: number;
};

function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState & { expiry: number };
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean) {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({
        analytics,
        decided: true,
        timestamp: Date.now(),
        expiry: Date.now() + CONSENT_TTL,
      })
    );
    // Notify rest of app about consent decision
    window.dispatchEvent(
      new CustomEvent('cbtrank:consent', { detail: { analytics } })
    );
  } catch { /* localStorage blocked — fail silently */ }
}

export default function CookieConsent() {
  const [visible, setVisible]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(true);

  useEffect(() => {
    const existing = readConsent();
    if (!existing || !existing.decided) {
      // Small delay so page content renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
    // Already decided → fire event so GA loads if consented
    if (existing.analytics) {
      window.dispatchEvent(
        new CustomEvent('cbtrank:consent', { detail: { analytics: true } })
      );
    }
  }, []);

  function handleAcceptAll() {
    saveConsent(true);
    setVisible(false);
    setShowModal(false);
  }

  function handleRejectAll() {
    saveConsent(false);
    setVisible(false);
    setShowModal(false);
  }

  function handleSavePreferences() {
    saveConsent(analyticsOn);
    setVisible(false);
    setShowModal(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* ── BANNER ─────────────────────────────────────────────── */}
      {!showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            width: 'min(680px, calc(100vw - 24px))',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>🍪</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.97rem', color: '#0f172a', marginBottom: '4px' }}>
                We use cookies
              </p>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55 }}>
                We use cookies and similar tracking technologies to analyse traffic and improve
                your experience. Under India's{' '}
                <strong>DPDP Act 2023</strong> and <strong>GDPR</strong>, we need your
                consent before using non-essential cookies.{' '}
                <a
                  href="/privacy-policy"
                  style={{ color: '#0044cc', textDecoration: 'underline' }}
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleAcceptAll}
              style={{
                background: '#0044cc',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 22px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Accept All
            </button>
            <button
              onClick={handleRejectAll}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '9px 22px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Reject All
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: 'transparent',
                color: '#0044cc',
                border: '1px solid #0044cc',
                borderRadius: '8px',
                padding: '9px 22px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Manage Preferences
            </button>
          </div>
        </div>
      )}

      {/* ── MANAGE MODAL ───────────────────────────────────────── */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cookie preferences"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0,0,0,0.45)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              width: 'min(560px, 100%)',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '28px',
              fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              🍪 Cookie Preferences
            </h2>

            {/* Essential cookies — always on */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  Essential Cookies
                </span>
                <span style={{
                  background: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0',
                  borderRadius: '20px',
                  padding: '2px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  Always Active
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                Required for the website to function. These include cookies for storing your
                exam results, marks settings, and preferences. Cannot be disabled.
              </p>
            </div>

            {/* Analytics cookies — toggleable */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  Analytics Cookies
                </span>
                {/* Toggle switch */}
                <button
                  onClick={() => setAnalyticsOn((v) => !v)}
                  aria-pressed={analyticsOn}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: analyticsOn ? '#0044cc' : '#cbd5e1',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: analyticsOn ? '22px' : '2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      transition: 'left 0.2s',
                    }}
                  />
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                Google Analytics — helps us understand how visitors use CBTRank so we can improve the
                experience. No personal data is sold. You can opt out anytime.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleSavePreferences}
                style={{
                  background: '#0044cc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                Save My Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                Accept All
              </button>
            </div>

            <p style={{ fontSize: '0.73rem', color: '#94a3b8', textAlign: 'center' }}>
              By continuing to use this site without selecting a preference, only essential cookies will be used.
              <br />
              <a href="/privacy-policy" style={{ color: '#0044cc', textDecoration: 'underline' }}>
                Read our Privacy Policy
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
