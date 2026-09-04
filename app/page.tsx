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
  id?: number;
  slug: string;
  title: string;
  subtitle?: string;
  is_latest?: number | string;
  set_on_top?: number | string;
  is_visible?: number | boolean;
}

// Hardcoded reliable endpoints with fallback
const PRIMARY_API = 'https://api.cbtrank.com/exams';
const SECONDARY_API = 'https://cbtrank.rusikakisku.workers.dev/exams';

const ALL_EXAMS_FALLBACK: Exam[] = [
  {
    "id": 47,
    "slug": "ossc-physical-measurement-and-physical-efficiencytest-2025",
    "title": "OSSC Physical Measurement and Physical EfficiencyTest - 2025",
    "subtitle": "Check Your Answer Key of OSSC Physical Measurement and Physical EfficiencyTest - 2025",
    "is_latest": 1,
    "set_on_top": 1
  },
  {
    "id": 46,
    "slug": "rrb-group-d-2026-answer-key",
    "title": "RRB Group D 2026 Answer Key",
    "subtitle": "Check Your Answer Key of RRB Group D 2026 Answer Key",
    "is_latest": 1,
    "set_on_top": 0
  },
  {
    "id": 45,
    "slug": "osssc-ri-ari-amin-icds-sfs-junior-assistant",
    "title": "OSSSC RI,ARI,AMIN,ICDS,SFS,Junior Assistant",
    "subtitle": "Check Your Answer Key of OSSSC RI,ARI,AMIN,ICDS,SFS,Junior Assistant",
    "is_latest": 1,
    "set_on_top": 0
  },
  {
    "id": 44,
    "slug": "rrb-ntpc-ug-2026-cbt-1",
    "title": "RRB NTPC UG 2026 CBT-1",
    "subtitle": "Check Your Answer Key of RRB NTPC UG 2026 CBT-1",
    "is_latest": 1,
    "set_on_top": 0
  },
  {
    "id": 43,
    "slug": "ssc-chsl-mains-2025",
    "title": "SSC CHSL Mains 2025",
    "subtitle": "Check Your Answer Key of SSC CHSL Mains 2025",
    "is_latest": 1,
    "set_on_top": 0
  },
  {
    "id": 42,
    "slug": "ssc-je-mains-2025",
    "title": "SSC JE Mains 2025",
    "subtitle": "Check Your Answer Key of SSC JE Mains 2025",
    "is_latest": 1,
    "set_on_top": 0
  },
  {
    "id": 41,
    "slug": "rrb-ntpc-cbt-i-graduate-level-2025-26",
    "title": "RRB NTPC CBT-I Graduate Level 2025-26",
    "subtitle": "Check Your Answer Key of RRB NTPC CBT-I Graduate Level 2025-26",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 40,
    "slug": "rrb-technician-grade-i-2025-26",
    "title": "RRB Technician Grade-I 2025-26",
    "subtitle": "Check Your Answer Key of RRB Technician Grade-I 2025-26",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 39,
    "slug": "rrb-paramedical-exam-2025-26",
    "title": "RRB Paramedical Exam 2025-26",
    "subtitle": "Check Your Answer Key of RRB Paramedical Exam 2025-26",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 38,
    "slug": "rrb-technician-grade-3-2025-26",
    "title": "RRB Technician Grade-3 2025-26",
    "subtitle": "Check Your Answer Key of RRB Technician Grade-3 2025-26",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 37,
    "slug": "rrb-alp-cbt-1-2025-26-2",
    "title": "RRB ALP CBT-1 2025-26",
    "subtitle": "Check Your Answer Key of RRB ALP CBT-1 2025-26",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 36,
    "slug": "rrb-section-controller-cbt-i-2026",
    "title": "RRB Section Controller CBT-I 2026",
    "subtitle": "Check Your Answer Key of RRB Section Controller CBT-I 2026",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 35,
    "slug": "ssc-mts-2025-26",
    "title": "SSC MTS 2025-26",
    "subtitle": "Check Your Answer Key of SSC MTS 2025-26",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 34,
    "slug": "rrb-group-d-2024-25-2",
    "title": "RRB Group-D 2024-25",
    "subtitle": "Check Your Answer Key of RRB Group-D 2024-25",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 33,
    "slug": "rrb-alp-cbt-1-2025-26",
    "title": "RRB ALP CBT-1 2025-26",
    "subtitle": "Check Your Answer Key of RRB ALP CBT-1 2025-26",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 32,
    "slug": "rrb-je-cbt-1-2025-26",
    "title": "RRB JE CBT-1 2025-26",
    "subtitle": "Check Your Answer Key of RRB JE CBT-1 2025-26",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 31,
    "slug": "rrb-section-controller-cbt-1",
    "title": "RRB Section Controller CBT-1",
    "subtitle": "Check Your Answer Key of RRB Section Controller CBT-1",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 30,
    "slug": "rrb-group-d-2024-25",
    "title": "RRB Group-D 2024-25",
    "subtitle": "Check Your Answer Key of RRB Group-D 2024-25",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 29,
    "slug": "ssc-delhi-police-awo-tpo-2025",
    "title": "SSC Delhi Police AWO/TPO 2025",
    "subtitle": "Check Your Answer Key of SSC Delhi Police AWO/TPO 2025",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 28,
    "slug": "ssc-delhi-police-head-constable-2025",
    "title": "SSC Delhi Police Head Constable 2025",
    "subtitle": "Check Your Answer Key of SSC Delhi Police Head Constable 2025",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 27,
    "slug": "ssc-cgl-mains-2025",
    "title": "SSC CGL Mains 2025",
    "subtitle": "Check Your Answer Key of SSC CGL Mains 2025",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 26,
    "slug": "ssc-delhi-police-constable-2025",
    "title": "SSC Delhi Police Constable 2025",
    "subtitle": "Check Your Answer Key of SSC Delhi Police Constable 2025",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 25,
    "slug": "ssc-delhi-police-driver-2025",
    "title": "SSC Delhi Police Driver 2025",
    "subtitle": "Check Your Answer Key of SSC Delhi Police Driver 2025",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 23,
    "slug": "rrb-ntpc-ug-cbt-ii-2024-25",
    "title": "RRB NTPC UG CBT-II  2024-25",
    "subtitle": "Check Your Answer Key of RRB NTPC UG CBT-II  2024-25",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 22,
    "slug": "rrb-ntpc-2025-cbt-2",
    "title": "RRB NTPC 2025 CBT 2",
    "subtitle": "Check Your Answer Key of RRB NTPC 2025 CBT 2.",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 21,
    "slug": "rrb-ministerial-isolated-categories-2025",
    "title": "RRB Ministerial & Isolated Categories 2025",
    "subtitle": "Check Your Answer Key of RRB Ministerial & Isolated Categories 2025",
    "is_latest": 0,
    "set_on_top": 0
  },
  {
    "id": 20,
    "slug": "rrb-ntpc-ug-under-graduate-2025",
    "title": "RRB NTPC UG (Under Graduate) 2025",
    "subtitle": "Check Your Answer Key of RRB NTPC UG (Under Graduate) 2025",
    "is_latest": 0,
    "set_on_top": 0
  }
];

async function fetchEndpoint(url: string): Promise<Exam[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 CBTRank/1.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      signal: controller.signal,
      next: { revalidate: 0 }
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
          </section>
        </div>
      </div>
    </main>
  );
}
