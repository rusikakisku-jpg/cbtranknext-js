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
      {/* ── BANNER (Full-width professional bottom bar) ─────────────── */}
      {!showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent"
          className="cbtrank-cookie-bar"
        >
          {/* Subtle top accent gradient */}
          <div className="cbtrank-cookie-accent" />

          <div className="cbtrank-cookie-inner">
            {/* Left: Icon & Description */}
            <div className="cbtrank-cookie-content">
              <div className="cbtrank-cookie-icon-wrapper" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0044cc"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className="cbtrank-cookie-text">
                <div className="cbtrank-cookie-title-row">
                  <span className="cbtrank-cookie-title">Quick Cookie &amp; Privacy Check</span>
                  <span className="cbtrank-cookie-badge">DPDP &amp; GDPR Compliant</span>
                </div>
                <p className="cbtrank-cookie-desc">
                  We use essential cookies to keep your rank preferences intact and optional cookies to make CBTRank lightning fast. Choose how you want to proceed.{' '}
                  <a href="/privacy-policy" className="cbtrank-cookie-link">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="cbtrank-cookie-actions">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="cbtrank-cookie-btn cbtrank-cookie-btn-primary"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleRejectAll}
                className="cbtrank-cookie-btn cbtrank-cookie-btn-secondary"
              >
                Reject All
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="cbtrank-cookie-btn cbtrank-cookie-btn-outline"
              >
                Manage Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cbtrank-cookie-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 99999;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.08);
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: cbtrankSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cbtrankSlideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .cbtrank-cookie-accent {
          height: 3px;
          width: 100%;
          background: linear-gradient(90deg, #0044cc 0%, #2563eb 50%, #38bdf8 100%);
        }

        .cbtrank-cookie-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .cbtrank-cookie-content {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          flex: 1;
        }

        .cbtrank-cookie-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .cbtrank-cookie-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .cbtrank-cookie-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .cbtrank-cookie-title {
          font-weight: 700;
          font-size: 0.94rem;
          color: #0f172a;
          line-height: 1.3;
        }

        .cbtrank-cookie-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #0044cc;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 9999px;
          padding: 1px 8px;
          letter-spacing: 0.02em;
          display: inline-block;
        }

        .cbtrank-cookie-desc {
          font-size: 0.81rem;
          color: #475569;
          line-height: 1.45;
          margin: 0;
        }

        .cbtrank-cookie-link {
          color: #0044cc;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s;
        }

        .cbtrank-cookie-link:hover {
          color: #003399;
        }

        .cbtrank-cookie-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .cbtrank-cookie-btn {
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          text-align: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
        }

        .cbtrank-cookie-btn-primary {
          background: #0044cc;
          color: #ffffff;
          border: 1px solid #0044cc;
          box-shadow: 0 1px 3px rgba(0, 68, 204, 0.25);
        }

        .cbtrank-cookie-btn-primary:hover {
          background: #0037a3;
          border-color: #0037a3;
          box-shadow: 0 3px 8px rgba(0, 68, 204, 0.35);
          transform: translateY(-1px);
        }

        .cbtrank-cookie-btn-secondary {
          background: #f8fafc;
          color: #334155;
          border: 1px solid #cbd5e1;
        }

        .cbtrank-cookie-btn-secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .cbtrank-cookie-btn-outline {
          background: #ffffff;
          color: #0044cc;
          border: 1px solid #bfdbfe;
        }

        .cbtrank-cookie-btn-outline:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #0037a3;
        }

        @media (max-width: 900px) {
          .cbtrank-cookie-inner {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
            padding: 14px 16px;
          }

          .cbtrank-cookie-content {
            align-items: flex-start;
          }

          .cbtrank-cookie-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            width: 100%;
          }

          .cbtrank-cookie-btn-primary {
            grid-column: span 2;
            padding: 10px 18px;
          }

          .cbtrank-cookie-btn-secondary,
          .cbtrank-cookie-btn-outline {
            padding: 9px 12px;
            font-size: 0.8rem;
          }
        }
      `}</style>

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
