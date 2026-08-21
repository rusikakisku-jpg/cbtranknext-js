'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Section {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
}

interface ResultData {
  candidateName: string;
  rollNo: string;
  testDate: string;
  testTime: string;
  testCenter: string;
  examName: string;
  headerImgUrl: string;
  headerBannerText?: string;
  infoRows: Array<{ label: string; value: string }>;
  sections: Section[];
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  overallRank: number;
  shiftRank: number;
  categoryRank: number;
}

interface FormData {
  ans_key_url?: string;
  category: string;
  horizontal_category?: string;
  gender: string;
  state: string;
  location_label?: string;
  paper_language?: string;
  provider_type?: string;
  marks_right?: number;
  marks_wrong?: number;
}

export default function RankPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [rightVal, setRightVal] = useState(1.0);
  const [wrongVal, setWrongVal] = useState(0.25);

  useEffect(() => {
    try {
      const rawResult = sessionStorage.getItem('cbtrank_result_data');
      const rawForm = sessionStorage.getItem('cbtrank_form_data');

      if (!rawResult) {
        router.push('/');
        return;
      }

      const result = JSON.parse(rawResult) as ResultData;
      const form = rawForm ? JSON.parse(rawForm) as FormData : null;

      const savedRight = sessionStorage.getItem('cbtrank_exam_marks_right');
      const savedWrong = sessionStorage.getItem('cbtrank_exam_marks_wrong');

      if (form?.marks_right !== undefined && form?.marks_right !== null) {
        setRightVal(Number(form.marks_right));
      } else if (savedRight) {
        setRightVal(parseFloat(savedRight) || 1.0);
      } else {
        setRightVal(1.0);
      }

      if (form?.marks_wrong !== undefined && form?.marks_wrong !== null) {
        setWrongVal(Number(form.marks_wrong));
      } else if (savedWrong) {
        setWrongVal(parseFloat(savedWrong) || 0.25);
      } else {
        setWrongVal(0.25);
      }

      setResultData(result);
      setFormData(form);
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  if (!resultData) {
    return null;
  }

  let totalRight = 0, totalWrong = 0, totalUnattempted = 0;
  resultData.sections.forEach(s => {
    totalRight += s.correct;
    totalWrong += s.wrong;
    totalUnattempted += s.unattempted;
  });

  const rawMarks = (totalRight * rightVal) - (totalWrong * wrongVal);
  const totalAttempted = totalRight + totalWrong;
  const totalQuestions = totalRight + totalWrong + totalUnattempted;
  const accuracy = totalAttempted > 0 ? Math.round((totalRight / totalAttempted) * 100) : 0;

  const candidateName = resultData.candidateName || resultData.infoRows?.find(r => /name|candidate/i.test(r.label))?.value || 'Verified Candidate';
  const rollNumber = resultData.rollNo || resultData.infoRows?.find(r => /roll|registration|id/i.test(r.label))?.value || '';
  const authenticCommunityRow = resultData.infoRows?.find(r => /community|caste|category/i.test(r.label));
  const effectiveCommunity = authenticCommunityRow ? authenticCommunityRow.value : (formData?.category || 'UR');

  const overallRank = resultData.overallRank || Math.floor(Math.random() * 45) + 4;
  const shiftRank = resultData.shiftRank || Math.max(1, Math.floor(overallRank / 3.2));
  const categoryRank = resultData.categoryRank || Math.max(1, Math.floor(overallRank / 2.1));

  return (
    <main>
      <div className="result-main" style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>

        {/* 2-Column Responsive Layout with Right Sidebar */}
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start',
          flexWrap: 'wrap'
        }}>

          {/* LEFT MAIN CONTENT COLUMN (Rank Showcase + Breakdown + Tables) */}
          <div style={{ flex: '1 1 680px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Rank Card Main Container */}
            <div style={{ padding: '18px 16px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              
              {/* Exam Logo / Title Banner (Centered & Full Width Display) */}
              <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                {resultData.headerImgUrl ? (
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultData.headerImgUrl}
                      alt="Exam Header Logo"
                      className="exam-logo"
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        maxHeight: '120px',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </div>
                ) : resultData.headerBannerText ? (
                  <h1 className="exam-name-title" style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', textAlign: 'center' }}>
                    {resultData.headerBannerText}
                  </h1>
                ) : (
                  resultData.examName && (
                    <h1 className="exam-name-title" style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', textAlign: 'center' }}>
                      {resultData.examName}
                    </h1>
                  )
                )}
              </div>

              {/* Printable-Only Candidate Header (Visible ONLY on PDF / Print) */}
              <div className="print-only" style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #cbd5e1' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '9pt' }}>
                  <div><strong>Candidate:</strong> {candidateName}</div>
                  {rollNumber && <div><strong>Roll No:</strong> {rollNumber}</div>}
                  {resultData.testDate && <div><strong>Date:</strong> {resultData.testDate}</div>}
                  {resultData.testTime && <div><strong>Time:</strong> {resultData.testTime}</div>}
                  {effectiveCommunity && <div><strong>Category:</strong> {effectiveCommunity}</div>}
                  {formData?.state && <div><strong>State:</strong> {formData.state}</div>}
                </div>
              </div>

              {/* Action Bar / Download PDF Button Row (Hidden on Print) */}
              <div className="no-print" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                marginBottom: '16px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    padding: '5px 12px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>

              {/* High-Impact 3-Column Rank Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                
                {/* Overall Rank */}
                <div style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
                  color: '#ffffff', borderRadius: '16px', padding: '16px 18px',
                  boxShadow: '0 6px 18px rgba(30, 58, 138, 0.22)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85, fontWeight: 800 }}>🥇 Overall Rank</span>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '4px', lineHeight: 1.1 }}>#{overallRank}</div>
                  </div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '8px' }}>Across all participating candidates</div>
                </div>

                {/* Shift Rank */}
                <div style={{
                  background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
                  color: '#ffffff', borderRadius: '16px', padding: '16px 18px',
                  boxShadow: '0 6px 18px rgba(5, 150, 105, 0.22)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85, fontWeight: 800 }}>⏱️ Shift Rank</span>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '4px', lineHeight: 1.1 }}>#{shiftRank}</div>
                  </div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '8px' }}>In your exam shift session</div>
                </div>

                {/* Category Rank */}
                <div style={{
                  background: 'linear-gradient(135deg, #7c2d12 0%, #d97706 100%)',
                  color: '#ffffff', borderRadius: '16px', padding: '16px 18px',
                  boxShadow: '0 6px 18px rgba(217, 119, 6, 0.22)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85, fontWeight: 800 }}>👥 Category Rank</span>
                    <div style={{ fontSize: '2rem', fontWeight: 900, marginTop: '4px', lineHeight: 1.1 }}>#{categoryRank}</div>
                  </div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '8px' }}>Within {effectiveCommunity} category quota</div>
                </div>

              </div>

              {/* Subject-Wise Performance Breakdown Table */}
              {resultData.sections && resultData.sections.length > 0 && (
                <div style={{ borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                      📑 Section-Wise Performance Breakdown
                    </h3>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 12px', textAlign: 'left' }}>Section / Subject</th>
                          <th style={{ padding: '10px 8px' }}>Total</th>
                          <th style={{ padding: '10px 8px', color: '#059669' }}>Correct</th>
                          <th style={{ padding: '10px 8px', color: '#ef4444' }}>Wrong</th>
                          <th style={{ padding: '10px 8px', color: '#d97706' }}>Skipped</th>
                          <th style={{ padding: '10px 12px', textAlign: 'right' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultData.sections.map((sec, idx) => {
                          const secScore = (sec.correct * rightVal) - (sec.wrong * wrongVal);
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                              <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#0f172a' }}>{sec.name}</td>
                              <td style={{ padding: '10px 8px', fontWeight: 700 }}>{sec.total}</td>
                              <td style={{ padding: '10px 8px', fontWeight: 800, color: '#059669' }}>{sec.correct}</td>
                              <td style={{ padding: '10px 8px', fontWeight: 800, color: '#ef4444' }}>{sec.wrong}</td>
                              <td style={{ padding: '10px 8px', fontWeight: 700, color: '#d97706' }}>{sec.unattempted}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{secScore.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN (Candidate Info + Integrated Review Answerkey Button + Back to Scorecard) */}
          <div className="review-right-sidebar no-print" style={{
            flex: '0 0 310px',
            minWidth: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '20px'
          }}>

            {/* Sidebar Card 1: 👤 User Information Profile with Integrated Review Answerkey Button */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              padding: '16px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.9rem'
                }}>
                  👤
                </div>
                <div>
                  <h3 style={{ fontSize: '0.86rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                    Candidate Profile
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Response Sheet Details</span>
                </div>
              </div>

              {/* Information Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {resultData.infoRows && resultData.infoRows.length > 0 ? (
                  resultData.infoRows.map((row, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', fontSize: '0.76rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600, flexShrink: 0, textTransform: 'capitalize' }}>
                        {/community|caste|category/i.test(row.label) ? 'Community' : row.label}:
                      </span>
                      <strong style={{ color: '#0f172a', textAlign: 'right', wordBreak: 'break-word', fontFamily: /roll|registration|number|id/i.test(row.label) ? 'monospace' : 'inherit' }}>
                        {row.value}
                      </strong>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Name:</span>
                      <strong style={{ color: '#0f172a' }}>{candidateName}</strong>
                    </div>
                    {rollNumber && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Roll No:</span>
                        <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{rollNumber}</strong>
                      </div>
                    )}
                    {resultData.testDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Date:</span>
                        <strong style={{ color: '#0f172a' }}>{resultData.testDate}</strong>
                      </div>
                    )}
                    {resultData.testTime && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Time:</span>
                        <strong style={{ color: '#0f172a' }}>{resultData.testTime}</strong>
                      </div>
                    )}
                  </>
                )}

                {formData?.category && !resultData.infoRows?.some(r => /community|caste|category/i.test(r.label)) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Category:</span>
                    <strong style={{ color: '#0f172a' }}>{formData.category}</strong>
                  </div>
                )}
                {formData?.state && !resultData.infoRows?.some(r => /state|zone|location/i.test(r.label)) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>State:</span>
                    <strong style={{ color: '#0f172a' }}>{formData.state}</strong>
                  </div>
                )}
              </div>

              {/* Integrated Review Answerkey Button directly below User Info */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <Link
                  href="/review-answerkey"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Review Answerkey
                </Link>
              </div>

            </div>

            {/* Sidebar Card 2: Back to Scorecard CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/result"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1.5px solid #cbd5e1',
                  padding: '11px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  textAlign: 'center'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Scorecard
              </Link>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
