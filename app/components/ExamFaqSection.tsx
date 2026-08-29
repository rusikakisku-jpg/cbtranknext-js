'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

interface ExamFaqSectionProps {
  formattedTitle: string;
  faqs: FaqItem[];
}

export default function ExamFaqSection({ formattedTitle, faqs }: ExamFaqSectionProps) {
  // All FAQ items closed by default, expand only on click
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="cbtrank-faq-section" style={{ maxWidth: '860px', margin: '40px auto 60px', padding: '0 16px' }}>
      <style>{`
        .cbtrank-faq-wrapper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px -5px rgba(0, 68, 204, 0.05), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
          transition: all 0.3s ease;
        }
        .cbtrank-faq-header {
          padding: 26px 26px 18px;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          border-bottom: 1px solid #f1f5f9;
          position: relative;
        }
        .cbtrank-faq-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 999px;
          border: 1px solid #bfdbfe;
          margin-bottom: 10px;
        }
        .cbtrank-faq-title {
          font-size: 1.22rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0 0 6px 0;
          line-height: 1.35;
        }
        .cbtrank-faq-title span {
          color: #0044cc;
        }
        .cbtrank-faq-sub {
          font-size: 0.84rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }
        .cbtrank-faq-body {
          padding: 20px 24px 26px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cbtrank-faq-item-card {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cbtrank-faq-item-card:hover {
          border-color: #93c5fd;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.06);
          transform: translateY(-1px);
        }
        .cbtrank-faq-item-card.is-open {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
        }
        .cbtrank-faq-trigger-btn {
          width: 100%;
          padding: 16px 18px;
          cursor: pointer;
          background: transparent;
          border: none;
          outline: none;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          text-align: left;
        }
        .cbtrank-faq-q-text {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.92rem;
          font-weight: 800;
          color: #1e293b;
          line-height: 1.4;
          flex: 1;
        }
        .cbtrank-faq-num-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 0.72rem;
          font-weight: 900;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .cbtrank-faq-item-card.is-open .cbtrank-faq-num-pill {
          background: #2563eb;
          color: #ffffff;
        }
        .cbtrank-faq-toggle-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1.15rem;
          font-weight: 900;
          line-height: 1;
          transition: all 0.2s ease;
          color: #475569;
        }
        .cbtrank-faq-item-card.is-open .cbtrank-faq-toggle-icon {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #93c5fd;
          transform: rotate(180deg);
        }
        .cbtrank-faq-content-area {
          padding: 0 18px 16px 54px;
          font-size: 0.865rem;
          color: #475569;
          line-height: 1.65;
          margin: 0;
          animation: cbtrankFadeDown 0.25s ease;
        }
        @keyframes cbtrankFadeDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cbtrank-faq-cta-banner {
          margin-top: 6px;
          padding: 14px 18px;
          background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .cbtrank-faq-header { padding: 18px 16px 14px; }
          .cbtrank-faq-body { padding: 14px; }
          .cbtrank-faq-trigger-btn { padding: 14px 12px; }
          .cbtrank-faq-q-text { font-size: 0.86rem; }
          .cbtrank-faq-content-area { padding: 0 12px 14px 44px; font-size: 0.82rem; }
        }
      `}</style>

      <div className="cbtrank-faq-wrapper">
        {/* Top Gradient Accent Bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #0044cc 0%, #38bdf8 50%, #6366f1 100%)' }} />

        {/* Header */}
        <div className="cbtrank-faq-header">
          <div className="cbtrank-faq-badge">
            <span>💡 Help &amp; FAQs</span>
          </div>
          <h2 className="cbtrank-faq-title">
            Frequently Asked Questions <span>({formattedTitle})</span>
          </h2>
          <p className="cbtrank-faq-sub">
            Everything you need to know about official response sheets, negative marking, and rank calculation.
          </p>
        </div>

        {/* Accordion List with 1-Click Toggle and + / - Icons */}
        <div className="cbtrank-faq-body">
          {faqs.map((faq, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div
                key={index}
                className={`cbtrank-faq-item-card ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="cbtrank-faq-trigger-btn"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <div className="cbtrank-faq-q-text">
                    <span className="cbtrank-faq-num-pill">Q{index + 1}</span>
                    <span>{faq.q}</span>
                  </div>
                  <div className="cbtrank-faq-toggle-icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </div>
                </button>

                {isOpen && (
                  <p className="cbtrank-faq-content-area">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}

          {/* Micro Help Desk Banner */}
          <div className="cbtrank-faq-cta-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🚀</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e3a8a' }}>
                Need instant updates for upcoming answer keys and shift ranks?
              </span>
            </div>
            <a
              href="https://t.me/cbtrank"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#0088cc',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '6px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 136, 204, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              Join Telegram Channel →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
