export const runtime = 'edge';
export const revalidate = 60;

import Link from 'next/link';
import type { Metadata } from 'next';
import HomeSeoContent from './components/HomeSeoContent';

export const metadata: Metadata = {
  title: 'CBT RANK - Latest Answer Keys & Rank Predictor',
  description: 'Calculate your marks, shift rank, and category cutoffs instantly with CBTRank\'s Answer Key Calculator.',
  keywords: ['CBT Rank', 'Answer Key Calculator', 'RRB', 'SSC', 'CBT exam', 'rank predictor'],
  alternates: {
    canonical: 'https://cbtrank.com',
  },
};

import { Exam, ALL_EXAMS_FALLBACK } from './data/exams';

// Hardcoded reliable endpoints with fallback
const PRIMARY_API = 'https://api.cbtrank.com/exams';
const SECONDARY_API = 'https://cbtrank.rusikakisku.workers.dev/exams';

async function fetchEndpoint(url: string): Promise<Exam[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 CBTRank/1.0',
      },
      signal: controller.signal,
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error(`[CBTRank] Failed fetching exams from ${url}:`, err);
  } finally {
    clearTimeout(timer);
  }
  return null;
}

async function getExams(): Promise<Exam[]> {
  const endpoints: string[] = [PRIMARY_API];

  if (process.env.BACKEND_API_URL) {
    const envUrl = `${process.env.BACKEND_API_URL.replace(/\/+$/, '')}/exams`;
    if (!endpoints.includes(envUrl)) {
      endpoints.push(envUrl);
    }
  }

  if (!endpoints.includes(SECONDARY_API)) {
    endpoints.push(SECONDARY_API);
  }

  let liveExams: Exam[] | null = null;
  for (const ep of endpoints) {
    liveExams = await fetchEndpoint(ep);
    if (liveExams && liveExams.length > 0) {
      break;
    }
  }

  const rawList = liveExams && liveExams.length > 0 ? liveExams : ALL_EXAMS_FALLBACK;

  return rawList
    .filter((exam) => exam && exam.slug && exam.is_visible !== 0 && (exam as any).is_visible !== false)
    .sort((a, b) => {
      const topA = Number(a.set_on_top) === 1 ? 1 : 0;
      const topB = Number(b.set_on_top) === 1 ? 1 : 0;
      if (topB !== topA) return topB - topA;
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      return idB - idA;
    });
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
          </div>
          {exam.subtitle && <p className="exam-subtitle">{exam.subtitle}</p>}
        </div>
        <div className="exam-card-right">
          {isLatest && <span className="badge-latest">Latest</span>}
          <div className="exam-arrow" aria-hidden="true">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
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
        {/* Mobile Compact Calculator Container */}
        <div className="mobile-cta">
          <div className="calc-compact-box">
            <div className="calc-compact-text">
              <span>Can&apos;t find your exam in the list below? Use this</span>
            </div>
            <Link href="/answerkey" className="btn-cta calc-compact-btn full-width">
              <CalculatorIcon />
              <span>Answerkey Calculator</span>
            </Link>
          </div>
        </div>

        <div className="content-grid">
          {/* Exams Section */}
          <section id="exams-section">
            <div className="section-header">
              <div>
                <h1 className="section-title">Latest Answer Keys</h1>
                <p className="section-subtitle">Select your exam to check marks &amp; rank</p>
              </div>

              {/* Desktop Compact Calculator Container */}
              <div className="calc-compact-box desktop-only-calc-box">
                <div className="calc-compact-text">
                  <span>Can&apos;t find your exam in the list below? Use this</span>
                </div>
                <Link href="/answerkey" className="btn-cta calc-compact-btn" id="desktop-inline-cta">
                  <CalculatorIcon />
                  <span>Answerkey Calculator</span>
                </Link>
              </div>
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

            {/* In-depth Informative SEO Section & FAQ */}
            <HomeSeoContent />
          </section>
        </div>
      </div>
    </main>
  );
}
