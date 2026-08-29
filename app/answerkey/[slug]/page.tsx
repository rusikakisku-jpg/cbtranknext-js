export const runtime = 'edge';

import type { Metadata } from 'next';
import AnswerkeyCalculator from '../../components/AnswerkeyCalculator';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatExamTitle(slug: string): string {
  if (!slug) return 'Exam';
  return slug
    .split('-')
    .map((w: string) => {
      const upper = w.toUpperCase();
      if (['RRB', 'SSC', 'NTPC', 'CBT', 'UG', 'JE', 'CHSL', 'CGL', 'MTS', 'GD', 'OSSSC', 'OSSC', 'RI', 'ARI', 'AMIN', 'SFS', 'ICDS', 'AWO', 'TPO', 'ASI', 'SI'].includes(upper)) {
        return upper;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = formatExamTitle(slug);
  const canonicalUrl = `https://cbtrank.com/${slug}/answerkey`;

  return {
    title: `${formattedTitle} Answer Key Calculator & Rank Predictor`,
    description: `Calculate your ${formattedTitle} marks, shift rank, and category rank instantly with official negative marking on CBTRank's Answer Key Calculator.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${formattedTitle} Answer Key Calculator | CBT RANK`,
      description: `Calculate your ${formattedTitle} marks, shift rank, and category rank instantly.`,
      url: canonicalUrl,
    },
  };
}

export default async function AltExamAnswerkeyPage({ params }: PageProps) {
  const { slug } = await params;
  const formattedTitle = formatExamTitle(slug);

  const faqs = [
    {
      q: `How to check ${formattedTitle} Answer Key and calculate marks?`,
      a: `To calculate your marks, copy your official response sheet link from the exam portal and paste it into the CBTRank Answer Key Calculator. The tool automatically counts correct answers, wrong answers, negative marking, and provides a section-wise score breakdown instantly.`
    },
    {
      q: `Does CBTRank calculate official negative marking for ${formattedTitle}?`,
      a: `Yes, CBTRank automatically applies exact official negative marking rules as per the exam notification while calculating your total raw and normalized scores.`
    },
    {
      q: `How is Shift Rank and Category Rank calculated for ${formattedTitle}?`,
      a: `Ranks are computed in real-time by comparing your raw score against all verified candidates who appeared in the same shift and overall category in the examination.`
    },
    {
      q: `How can I copy my official response sheet URL?`,
      a: `Open your response sheet on the official candidate portal, click your browser's address bar (the URL starts with digialm.com / cbexams / tcsion), copy the full link, and paste it directly into the calculator URL box.`
    }
  ];

  return (
    <>
      <AnswerkeyCalculator examSlug={slug} />

      {/* Premium Professional FAQ Section */}
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
            padding: 28px 28px 20px;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
            border-bottom: 1px solid #f1f5f9;
            position: relative;
          }
          .cbtrank-faq-badge {
            display: inline-flex;
            align-items: border;
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
            margin-bottom: 12px;
          }
          .cbtrank-faq-title {
            font-size: 1.25rem;
            font-weight: 900;
            color: #0f172a;
            margin: 0 0 6px 0;
            line-height: 1.35;
          }
          .cbtrank-faq-title span {
            color: #0044cc;
          }
          .cbtrank-faq-sub {
            font-size: 0.85rem;
            color: #64748b;
            margin: 0;
            line-height: 1.5;
          }
          .cbtrank-faq-body {
            padding: 20px 24px 28px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .cbtrank-faq-item {
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 14px;
            overflow: hidden;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .cbtrank-faq-item:hover {
            border-color: #93c5fd;
            background: #ffffff;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.06);
            transform: translateY(-1px);
          }
          .cbtrank-faq-item[open] {
            border-color: #3b82f6;
            background: #ffffff;
            box-shadow: 0 6px 18px rgba(37, 99, 235, 0.08);
          }
          .cbtrank-faq-summary {
            padding: 16px 18px;
            cursor: pointer;
            outline: none;
            user-select: none;
            display: flex;
            align-items: center;
            justifyContent: space-between;
            gap: 12px;
            list-style: none;
          }
          .cbtrank-faq-summary::-webkit-details-marker {
            display: none;
          }
          .cbtrank-faq-q-text {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.92rem;
            font-weight: 800;
            color: #1e293b;
            line-height: 1.4;
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
          }
          .cbtrank-faq-item[open] .cbtrank-faq-num-pill {
            background: #2563eb;
            color: #ffffff;
          }
          .cbtrank-faq-chevron {
            width: 20px;
            height: 20px;
            border-radius: 6px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            display: flex;
            align-items: center;
            justifyContent: center;
            flex-shrink: 0;
            transition: transform 0.25s ease, background 0.25s ease;
            color: #64748b;
          }
          .cbtrank-faq-item[open] .cbtrank-faq-chevron {
            transform: rotate(180deg);
            background: #eff6ff;
            color: #2563eb;
            border-color: #bfdbfe;
          }
          .cbtrank-faq-answer {
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
            margin-top: 8px;
            padding: 14px 18px;
            background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justifyContent: space-between;
            flex-wrap: wrap;
            gap: 12px;
          }
          @media (max-width: 640px) {
            .cbtrank-faq-header { padding: 20px 16px 16px; }
            .cbtrank-faq-body { padding: 16px; }
            .cbtrank-faq-summary { padding: 14px; }
            .cbtrank-faq-q-text { font-size: 0.86rem; }
            .cbtrank-faq-answer { padding: 0 14px 14px 44px; font-size: 0.82rem; }
          }
        `}</style>

        <div className="cbtrank-faq-wrapper">
          {/* Top Gradient Bar */}
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

          {/* Accordion Questions List */}
          <div className="cbtrank-faq-body">
            {faqs.map((faq, index) => (
              <details key={index} className="cbtrank-faq-item" open={index === 0}>
                <summary className="cbtrank-faq-summary">
                  <div className="cbtrank-faq-q-text">
                    <span className="cbtrank-faq-num-pill">Q{index + 1}</span>
                    <span>{faq.q}</span>
                  </div>
                  <div className="cbtrank-faq-chevron">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </summary>
                <p className="cbtrank-faq-answer">
                  {faq.a}
                </p>
              </details>
            ))}

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
    </>
  );
}
