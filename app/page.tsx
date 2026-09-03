export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CBT RANK - Latest Answer Keys & Rank Predictor',
  description: 'Calculate your marks, shift rank, and category cutoffs instantly with CBTRank\'s Answer Key Calculator.',
  keywords: ['CBT Rank', 'Answer Key Calculator', 'RRB', 'SSC', 'CBT exam', 'rank predictor'],
  alternates: {
    canonical: 'https://cbtrank.com',
  },
};

interface Exam {
  slug: string;
  title: string;
  subtitle?: string;
  is_latest?: number | string;
  set_on_top?: number | string;
}

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';

const FALLBACK_EXAMS: Exam[] = [
  {
    title: "OSSSC RI,ARI,AMIN,ICDS,SFS,Junior Assistant",
    subtitle: "Check Your Answer Key of OSSSC RI,ARI,AMIN,ICDS,SFS,Junior Assistant",
    slug: "osssc-ri-ari-amin-icds-sfs-junior-assistant",
    is_latest: 1
  },
  {
    title: "RRB NTPC UG 2026 CBT-1",
    subtitle: "Check Your Answer Key of RRB NTPC UG 2026 CBT-1",
    slug: "rrb-ntpc-ug-2026-cbt-1",
    is_latest: 1
  },
  {
    title: "SSC CHSL Mains 2025",
    subtitle: "Check Your Answer Key of SSC CHSL Mains 2025",
    slug: "ssc-chsl-mains-2025",
    is_latest: 1
  },
  {
    title: "SSC JE Mains 2025",
    subtitle: "Check Your Answer Key of SSC JE Mains 2025",
    slug: "ssc-je-mains-2025",
    is_latest: 1
  },
  {
    title: "RRB NTPC CBT-I Graduate Level 2025-26",
    subtitle: "Check Your Answer Key of RRB NTPC CBT-I Graduate Level 2025-26",
    slug: "rrb-ntpc-cbt-i-graduate-level-2025-26",
    is_latest: 0
  },
  {
    title: "RRB Technician Grade-I 2025-26",
    subtitle: "Check Your Answer Key of RRB Technician Grade-I 2025-26",
    slug: "rrb-technician-grade-i-2025-26",
    is_latest: 0
  }
];

async function getExams(): Promise<Exam[]> {
  try {
    const res = await fetch(`${BACKEND_BASE}/exams`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}
  return FALLBACK_EXAMS;
}

function ExamCard({ exam }: { exam: Exam }) {
  const isLatest = Number(exam.is_latest) === 1 || Number(exam.set_on_top) === 1;
  const href = `/${exam.slug}/answerkey`;

  return (
    <div className="exam-card">
      <Link href={href} prefetch={true} aria-label={exam.title}>
        <div className="exam-card-left">
          <div className="exam-title">
            <span>{exam.title}</span>
            {isLatest && <span className="badge-latest">Latest</span>}
          </div>
          {exam.subtitle && <p className="exam-subtitle">{exam.subtitle}</p>}
        </div>
        <div className="exam-arrow" aria-hidden="true">
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const exams = await getExams();

  const CalculatorIcon = () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
    </svg>
  );

  return (
    <main>
      <div className="home-main">
        {/* Mobile Top CTA */}
        <div className="mobile-cta">
          <Link href="/answerkey" className="btn-cta full-width">
            <CalculatorIcon />
            Answerkey Calculator
          </Link>
        </div>

        <div className="content-grid">
          {/* Exams Section */}
          <section id="exams-section">
            <div className="section-header">
              <div>
                <h1 className="section-title">Latest Answer Keys</h1>
                <p className="section-subtitle">Select your exam to check marks &amp; rank</p>
              </div>
              <Link href="/answerkey" className="btn-cta" id="desktop-inline-cta">
                <CalculatorIcon />
                Answerkey Calculator
              </Link>
            </div>

            <div className="exam-list" id="exam-list">
              {exams.length === 0 ? (
                <div className="empty-state">
                  No exams available right now. Check back soon!
                </div>
              ) : (
                exams.map((exam) => (
                  <ExamCard key={exam.slug} exam={exam} />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
