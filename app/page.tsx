'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Metadata } from 'next';

const WORKER_BASE = 'https://cbtrank.rusikakisku.workers.dev';

interface Exam {
  slug: string;
  title: string;
  subtitle?: string;
  is_latest?: number | string;
  set_on_top?: number | string;
}

function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-left">
        <div className="skeleton-line title"></div>
        <div className="skeleton-line sub"></div>
      </div>
      <div className="skeleton-badge"></div>
    </div>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  const isLatest = Number(exam.is_latest) === 1 || Number(exam.set_on_top) === 1;

  const handleCardClick = () => {
    try {
      sessionStorage.setItem('cbtrank_active_exam', JSON.stringify(exam));
      sessionStorage.setItem('cbtrank_home_scroll', String(window.scrollY));
    } catch (e) {}
  };

  // Clean URL: /{slug}/answerkey
  const href = `/${exam.slug}/answerkey`;

  return (
    <div className="exam-card">
      <Link href={href} onClick={handleCardClick} aria-label={exam.title}>
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

export default function HomePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlogs] = useState(false);

  useEffect(() => {
    // 1. Read cached exams for instant 0ms load
    try {
      const cached = localStorage.getItem('cbtrank_cached_exams');
      if (cached) {
        const parsed = JSON.parse(cached) as Exam[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExams(parsed);
          setLoading(false);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh exams in background
    async function fetchExams() {
      try {
        const res = await fetch(`${WORKER_BASE}/exams`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setExams(data);
            try {
              localStorage.getItem('cbtrank_cached_exams');
              localStorage.setItem('cbtrank_cached_exams', JSON.stringify(data));
            } catch (e) {}
          }
        }
      } catch (e) {}
      setLoading(false);
    }
    fetchExams();
  }, []);

  // Restore list scroll position when returning to Home Page
  useEffect(() => {
    if (!loading && exams.length > 0) {
      const savedScroll = sessionStorage.getItem('cbtrank_home_scroll');
      if (savedScroll) {
        const top = parseInt(savedScroll, 10);
        if (!isNaN(top) && top > 0) {
          setTimeout(() => {
            window.scrollTo({ top, behavior: 'instant' });
          }, 60);
        }
      }
    }
  }, [loading, exams]);

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

        <div className={`content-grid${showBlogs ? ' two-col' : ''}`}>
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
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : exams.length === 0 ? (
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
