'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function TelegramPortalModal({ onJoin }: { onJoin: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      id="cbtrank-tg-portal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(10, 18, 40, 0.88)',
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '400px',
        width: '100%',
        padding: '32px 24px 28px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.15)',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0088cc 0%, #29b6f6 100%)',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 12px rgba(0,136,204,0.12), 0 8px 24px rgba(0,136,204,0.45)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.59 4.6-1.87 5.12-1.88.11 0 .37.03.54.18.14.12.18.29.2.46-.01.07.01.24-.02.4z"/>
          </svg>
        </div>

        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg,#0088cc,#29b6f6)',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '3px 12px',
          borderRadius: '999px',
          marginBottom: '12px',
        }}>Official Channel</div>

        <h3 style={{ fontSize: '1.22rem', fontWeight: 900, color: '#0a1228', margin: '0 0 10px', lineHeight: 1.3 }}>
          Get Instant Exam &amp; Rank Updates!
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 26px', lineHeight: 1.6 }}>
          Join our official Telegram Channel to get instant notifications about upcoming <strong>Answer Keys</strong>, <strong>Ranks</strong> &amp; <strong>Cut-offs</strong> updates!
        </p>

        <a
          href="https://t.me/cbtrank"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onJoin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #0088cc 0%, #29b6f6 100%)',
            color: '#ffffff',
            padding: '15px 20px',
            borderRadius: '14px',
            fontWeight: 800,
            fontSize: '0.97rem',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(0,136,204,0.4)',
            letterSpacing: '0.01em',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.59 4.6-1.87 5.12-1.88.11 0 .37.03.54.18.14.12.18.29.2.46-.01.07.01.24-.02.4z"/>
          </svg>
          🚀 Join Official Telegram Channel
        </a>
      </div>
    </div>,
    document.body
  );
}

interface Section {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
}

interface QuestionItem {
  q_no: number;
  question_id?: string;
  question_type?: string;
  section: string;
  question_text: string;
  question_image: string;
  question_html: string;
  options: Array<{
    option_no: number;
    option_id?: string;
    option_text: string;
    option_image: string;
    option_html: string;
    is_correct: boolean;
  }>;
  chosen_option: string;
  chosen_option_id?: string;
  right_option: string;
  right_option_no?: number;
  status: string;
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
  questionsSummary?: QuestionItem[];
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

const ENABLE_TELEGRAM_DIALOG = false;

export default function ResultPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [rightVal, setRightVal] = useState(1.0);
  const [wrongVal, setWrongVal] = useState(0.25);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const pendingRedirect = useRef(false);

  function handleTelegramJoinClick() {
    try {
      localStorage.setItem('cbtrank_tg_popup_last_time', Date.now().toString());
      sessionStorage.removeItem('cbtrank_show_tg_popup');
    } catch (e) {}
    setShowTelegramModal(false);
    if (pendingRedirect.current) {
      pendingRedirect.current = false;
      router.push('/');
    }
  }

  useEffect(() => {
    try {
      const rawResult = sessionStorage.getItem('cbtrank_result_data');
      const rawForm = sessionStorage.getItem('cbtrank_form_data');

      if (!rawResult) {
        if (ENABLE_TELEGRAM_DIALOG) {
          const lastPopupTime = localStorage.getItem('cbtrank_tg_popup_last_time');
          const now = Date.now();
          const twoMinutesMs = 2 * 60 * 1000;
          const isCooldownElapsed = !lastPopupTime || (now - parseInt(lastPopupTime, 10)) > twoMinutesMs;
          if (isCooldownElapsed) {
            pendingRedirect.current = true;
            setShowTelegramModal(true);
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
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

      if (ENABLE_TELEGRAM_DIALOG) {
        const showFlag = sessionStorage.getItem('cbtrank_show_tg_popup');
        if (showFlag === 'true') {
          sessionStorage.removeItem('cbtrank_show_tg_popup');
          setShowTelegramModal(true);
        } else {
          const lastPopupTime = localStorage.getItem('cbtrank_tg_popup_last_time');
          const now = Date.now();
          const twoMinutesMs = 2 * 60 * 1000;
          const isCooldownElapsed = !lastPopupTime || (now - parseInt(lastPopupTime, 10)) > twoMinutesMs;
          if (isCooldownElapsed) {
            setShowTelegramModal(true);
          }
        }
      }
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  function calcMarks(sections: Section[], rightMark: number, wrongMark: number) {
    let totalRight = 0, totalWrong = 0, totalUnattempted = 0;
    sections.forEach(s => {
      totalRight += s.correct;
      totalWrong += s.wrong;
      totalUnattempted += s.unattempted;
    });
    const raw = (totalRight * rightMark) - (totalWrong * wrongMark);
    return { raw, totalRight, totalWrong, totalUnattempted };
  }

  function calcSectionMarks(sec: Section, rightMark: number, wrongMark: number) {
    return (sec.correct * rightMark) - (sec.wrong * wrongMark);
  }

  if (!resultData) {
    return (ENABLE_TELEGRAM_DIALOG && showTelegramModal) ? <TelegramPortalModal onJoin={handleTelegramJoinClick} /> : null;
  }

  const { raw, totalRight, totalWrong, totalUnattempted } = calcMarks(resultData.sections, rightVal, wrongVal);
  const totalAttempted = totalRight + totalWrong;
  const totalQuestions = totalRight + totalWrong + totalUnattempted;

  return (
    <>
      {ENABLE_TELEGRAM_DIALOG && showTelegramModal && <TelegramPortalModal onJoin={handleTelegramJoinClick} />}

      <main>
      <div className="result-main">

        {/* Main Scorecard Card */}
        <div className="scorecard-card" id="cbrank-scorecard-card" style={{ position: 'relative', overflow: 'hidden' }}>

          {/* Watermark */}
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            fontSize: '6rem', fontWeight: 900, color: 'rgba(0, 68, 204, 0.05)',
            letterSpacing: '12px', pointerEvents: 'none', userSelect: 'none',
            zIndex: 0, whiteSpace: 'nowrap', textTransform: 'uppercase'
          }}>
            CBT RANK
          </div>

          {/* 1. Exam & Candidate Info Header */}
          <div className="info-section-header" style={{ position: 'relative', zIndex: 1 }}>
            {resultData.headerImgUrl ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultData.headerImgUrl} alt="Exam Header Logo" className="exam-logo" />
              </div>
            ) : resultData.headerBannerText ? (
              <h1 className="exam-name-title">{resultData.headerBannerText}</h1>
            ) : (
              resultData.examName && (
                <h1 className="exam-name-title">{resultData.examName}</h1>
              )
            )}

            {/* Metadata Grid */}
            <div className="metadata-grid" id="metadata-grid">
              {resultData.infoRows && resultData.infoRows.length > 0 ? (
                resultData.infoRows.map((row, idx) => (
                  <div className="meta-box" key={idx}>
                    <label>{/community|caste|category/i.test(row.label) ? 'Community' : row.label}</label>
                    <span className={/roll|registration|number|id/i.test(row.label) ? 'mono' : ''}>
                      {row.value}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="meta-box">
                    <label>Candidate Name</label>
                    <span>{resultData.candidateName || 'Verified Candidate'}</span>
                  </div>
                  {resultData.rollNo && (
                    <div className="meta-box">
                      <label>Roll Number</label>
                      <span className="mono">{resultData.rollNo}</span>
                    </div>
                  )}
                  {resultData.testDate && (
                    <div className="meta-box">
                      <label>Test Date</label>
                      <span>{resultData.testDate}</span>
                    </div>
                  )}
                  {resultData.testTime && (
                    <div className="meta-box">
                      <label>Test Time</label>
                      <span>{resultData.testTime}</span>
                    </div>
                  )}
                  {resultData.testCenter && (
                    <div className="meta-box">
                      <label>Test Center</label>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {resultData.testCenter}
                      </span>
                    </div>
                  )}
                </>
              )}

              {formData?.state && !resultData.infoRows?.some(r => /state|zone|location/i.test(r.label)) && (
                <div className="meta-box">
                  <label>{formData.location_label || 'State / UT'}</label>
                  <span>{formData.state}</span>
                </div>
              )}

              {formData?.category && !resultData.infoRows?.some(r => /community|caste|category/i.test(r.label)) && (
                <div className="meta-box">
                  <label>Community</label>
                  <span>{formData.category}</span>
                </div>
              )}
              {formData?.gender && !resultData.infoRows?.some(r => r.label.toLowerCase() === 'gender') && (
                <div className="meta-box">
                  <label>Gender</label>
                  <span style={{ textTransform: 'capitalize' }}>{formData.gender}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Section Performance Table with Recalc Controls */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="recalc-header">
              <h3 style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subject-Wise Performance Breakdown</h3>
              <div className="recalc-controls">
                <label>
                  Right (+):{' '}
                  <input
                    type="number"
                    inputMode="decimal"
                    id="right-val-input"
                    value={rightVal === 0 ? '' : rightVal}
                    placeholder="0"
                    step="any"
                    min="0"
                    style={{ width: '64px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900, fontSize: '0.88rem', outline: 'none' }}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '') setRightVal(0);
                      else {
                        const n = parseFloat(v);
                        if (!isNaN(n)) setRightVal(n);
                      }
                    }}
                  />
                </label>
                <label>
                  Wrong (-):{' '}
                  <input
                    type="number"
                    inputMode="decimal"
                    id="wrong-val-input"
                    value={wrongVal === 0 ? '' : wrongVal}
                    placeholder="0"
                    step="any"
                    min="0"
                    style={{ width: '64px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900, fontSize: '0.88rem', outline: 'none' }}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '') setWrongVal(0);
                      else {
                        const n = parseFloat(v);
                        if (!isNaN(n)) setWrongVal(n);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '10px' }}>
              <table className="sec-table">
                <thead>
                  <tr>
                    <th>Section / Subject</th>
                    <th>Total Qs</th>
                    <th>Attempted</th>
                    <th>Unattempted</th>
                    <th>Correct</th>
                    <th>Wrong</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody id="sec-table-body">
                  {resultData.sections.map((sec, i) => (
                    <tr key={i}>
                      <td>{sec.name}</td>
                      <td>{sec.total}</td>
                      <td>{sec.correct + sec.wrong}</td>
                      <td>{sec.unattempted}</td>
                      <td className="text-green">{sec.correct}</td>
                      <td className="text-red">{sec.wrong}</td>
                      <td className="text-blue">{calcSectionMarks(sec, rightVal, wrongVal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot id="sec-table-foot">
                  <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>{totalQuestions}</strong></td>
                    <td><strong>{totalAttempted}</strong></td>
                    <td><strong>{totalUnattempted}</strong></td>
                    <td className="text-green"><strong>{totalRight}</strong></td>
                    <td className="text-red"><strong>{totalWrong}</strong></td>
                    <td className="text-blue"><strong>{raw.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 3. Action Buttons Section (Review Answerkey, Download Scorecard, View Your Rank) */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginTop: '24px'
          }}>
            {/* Button 1: Review Answerkey */}
            <Link
              href="/review-answerkey"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                padding: '14px 20px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Review Answerkey
            </Link>

            {/* Button 2: Download Scorecard */}
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                padding: '14px 20px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Scorecard
            </button>

            {/* Button 3: View Your Rank */}
            <Link
              href="/rank"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                padding: '14px 20px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.92rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              View Your Rank
            </Link>
          </div>

        </div>
      </div>
    </main>
    </>
  );
}
