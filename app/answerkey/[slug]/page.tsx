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
      a: `To calculate your marks, copy your official response sheet link from the exam portal and paste it into the CBTRank Answer Key Calculator. The tool automatically calculates right answers, wrong answers, negative marking, and provides a section-wise score breakdown.`
    },
    {
      q: `Does CBTRank calculate official negative marking for ${formattedTitle}?`,
      a: `Yes, CBTRank automatically applies exact official negative marking rules as per the exam notification while calculating your total raw and normalized scores.`
    },
    {
      q: `How is Shift Rank and Category Rank calculated for ${formattedTitle}?`,
      a: `Ranks are computed by comparing your raw score against all candidates who participated in the same shift and overall category in the examination.`
    },
    {
      q: `How can I copy my response sheet URL?`,
      a: `Open your response sheet on the official candidate portal, click the browser address bar (URL starts with digialm.com / cbexams / tcsion), copy the full link, and paste it directly into the calculator URL box.`
    }
  ];

  return (
    <>
      <AnswerkeyCalculator examSlug={slug} />

      {/* Sleek Visible FAQ Accordion Section */}
      <section
        style={{
          maxWidth: '820px',
          margin: '32px auto 48px',
          padding: '0 16px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px 20px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0044cc 0%, #2563eb 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.9rem',
              }}
            >
              ❓
            </div>
            <div>
              <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Frequently Asked Questions ({formattedTitle})
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Common questions about answer key, marks calculation &amp; rank prediction
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, index) => (
              <details
                key={index}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <summary
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                    userSelect: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{faq.q}</span>
                </summary>
                <p
                  style={{
                    fontSize: '0.83rem',
                    color: '#475569',
                    marginTop: '10px',
                    marginBottom: '2px',
                    lineHeight: 1.6,
                    borderTop: '1px dashed #cbd5e1',
                    paddingTop: '8px',
                  }}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
