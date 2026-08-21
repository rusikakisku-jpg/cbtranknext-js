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
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
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

  async function handleDownloadImageScorecard() {
    const templateEl = document.getElementById('cbrank-download-template');
    if (!templateEl) return;

    try {
      setIsGeneratingImg(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2canvasModule = (await import('html2canvas')) as any;
      const html2canvas = html2canvasModule.default || html2canvasModule;

      const canvas = await html2canvas(templateEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 520,
        windowWidth: 520
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      // Trigger direct download as "CBT Rank.png"
      const link = document.createElement('a');
      link.download = 'CBT Rank.png';
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating image scorecard:', err);
    } finally {
      setIsGeneratingImg(false);
    }
  }

  if (!resultData) {
    return (ENABLE_TELEGRAM_DIALOG && showTelegramModal) ? <TelegramPortalModal onJoin={handleTelegramJoinClick} /> : null;
  }

  const { raw, totalRight, totalWrong, totalUnattempted } = calcMarks(resultData.sections, rightVal, wrongVal);
  const totalAttempted = totalRight + totalWrong;
  const totalQuestions = totalRight + totalWrong + totalUnattempted;
  const accuracy = totalAttempted > 0 ? ((totalRight / totalAttempted) * 100).toFixed(1) : '0.0';

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
              <div className="recalc-controls no-print">
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
                    <th>Section</th>
                    <th>Total</th>
                    <th className="th-right">Right</th>
                    <th className="th-wrong">Wrong</th>
                    <th className="th-unatt">Unattempted</th>
                    <th className="th-marks">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.sections.map((sec, idx) => {
                    const sm = calcSectionMarks(sec, rightVal, wrongVal);
                    return (
                      <tr key={idx}>
                        <td className="td-sec-name">{sec.name}</td>
                        <td>{sec.total}</td>
                        <td className="td-right">{sec.correct}</td>
                        <td className="td-wrong">{sec.wrong}</td>
                        <td className="td-unatt">{sec.unattempted}</td>
                        <td className={`td-marks ${sm < 0 ? 'neg' : ''}`}>
                          {sm.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="tfoot-row">
                    <td>Total</td>
                    <td>{totalQuestions}</td>
                    <td className="td-right">{totalRight}</td>
                    <td className="td-wrong">{totalWrong}</td>
                    <td className="td-unatt">{totalUnattempted}</td>
                    <td className={`td-marks ${raw < 0 ? 'neg' : ''}`}>
                      {raw.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 3 Action Buttons under Subject Breakdown (Hidden on Print / Hidden on Downloaded Image) */}
          <div className="no-print" style={{
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
              disabled={isGeneratingImg}
              onClick={handleDownloadImageScorecard}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: isGeneratingImg ? '#94a3b8' : '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #cbd5e1',
                padding: '14px 20px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: isGeneratingImg ? 'wait' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
            >
              {isGeneratingImg ? (
                <span>Generating Scorecard...</span>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Download Scorecard
                </>
              )}
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

    {/* ─────────────────────────────────────────────────────────── */}
    {/* Dedicated Portrait Scorecard Template (RankGuruji Design)  */}
    {/* Captured by html2canvas when "Download Scorecard" is clicked */}
    {/* ─────────────────────────────────────────────────────────── */}
    <div
      id="cbrank-download-template"
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '520px',
        background: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#0f172a',
        padding: '18px 20px',
        boxSizing: 'border-box',
        border: '2px solid #0044cc',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Top Branding Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0044cc 0%, #0f172a 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: '#f59e0b', color: '#0f172a', fontSize: '0.7rem', fontWeight: 900, padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CBT RANK
            </span>
            <span style={{ fontSize: '0.72rem', opacity: 0.85, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.03em' }}>
              Scorecard Report
            </span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '0.68rem',
            fontWeight: 900,
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <span>✔</span> VERIFIED
          </div>
        </div>

        <h2 style={{ fontSize: '1.08rem', fontWeight: 900, margin: '4px 0 0', lineHeight: 1.3, color: '#ffffff' }}>
          {resultData.examName || resultData.headerBannerText || 'CBT Competitive Examination'}
        </h2>
      </div>

      {/* Candidate Information Box (2-Column Portrait Grid) */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 14px',
        marginBottom: '14px'
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#0044cc', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          👤 Candidate Details
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 12px', fontSize: '0.8rem' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Candidate Name</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>{resultData.candidateName || 'Verified Candidate'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Roll / Reg. Number</div>
            <div style={{ fontWeight: 900, color: '#0044cc', fontFamily: 'monospace', marginTop: '1px' }}>{resultData.rollNo || 'N/A'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Category / Community</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>{formData?.category || 'UR'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Gender</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px', textTransform: 'capitalize' }}>{formData?.gender || 'N/A'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Exam Date</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>{resultData.testDate || 'N/A'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Exam Shift / Time</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>{resultData.testTime || 'N/A'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>State / Zone</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px' }}>{formData?.state || 'All India'}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Paper Language</div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '1px', textTransform: 'capitalize' }}>{formData?.paper_language || 'English'}</div>
          </div>

          {resultData.testCenter && (
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Exam Center / Venue</div>
              <div style={{ fontWeight: 700, color: '#334155', marginTop: '1px', fontSize: '0.78rem' }}>{resultData.testCenter}</div>
            </div>
          )}
        </div>
      </div>

      {/* Performance & Score Highlight Badges (3-Column x 2-Row Portrait Grid - Pure Scorecard Metrics) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
        {/* Raw Score */}
        <div style={{ background: '#eff6ff', border: '1.5px solid #3b82f6', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>RAW MARKS</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: raw >= 0 ? '#1d4ed8' : '#dc2626', marginTop: '1px', fontFamily: 'monospace' }}>
            {raw.toFixed(2)}
          </div>
        </div>

        {/* Accuracy */}
        <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>ACCURACY</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#047857', marginTop: '1px' }}>
            {accuracy}%
          </div>
        </div>

        {/* Total Attempted */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #94a3b8', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>ATTEMPTED</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginTop: '1px' }}>
            {totalAttempted}/{totalQuestions}
          </div>
        </div>

        {/* Correct Answers */}
        <div style={{ background: '#f0fdf4', border: '1.5px solid #22c55e', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>CORRECT (+{rightVal})</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d', marginTop: '1px' }}>
            {totalRight}
          </div>
        </div>

        {/* Wrong Answers */}
        <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>WRONG (-{wrongVal})</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#b91c1c', marginTop: '1px' }}>
            {totalWrong}
          </div>
        </div>

        {/* Skipped */}
        <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>SKIPPED</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#b45309', marginTop: '1px' }}>
            {totalUnattempted}
          </div>
        </div>
      </div>

      {/* Subject-Wise Performance Breakdown Table (Portrait Optimized) */}
      <div style={{
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
        marginBottom: '14px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Section</th>
              <th style={{ padding: '8px 4px' }}>Total</th>
              <th style={{ padding: '8px 4px', color: '#4ade80' }}>Right (+{rightVal})</th>
              <th style={{ padding: '8px 4px', color: '#f87171' }}>Wrong (-{wrongVal})</th>
              <th style={{ padding: '8px 4px', color: '#fbbf24' }}>Skipped</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {resultData.sections.map((sec, idx) => {
              const sm = calcSectionMarks(sec, rightVal, wrongVal);
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800, color: '#0f172a' }}>{sec.name}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 700 }}>{sec.total}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 800, color: '#16a34a' }}>{sec.correct}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 800, color: '#dc2626' }}>{sec.wrong}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 700, color: '#d97706' }}>{sec.unattempted}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 900, color: sm >= 0 ? '#0f172a' : '#dc2626' }}>
                    {sm.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontWeight: 900, fontSize: '0.82rem' }}>
              <td style={{ padding: '10px 10px', textAlign: 'left', color: '#0f172a' }}>TOTAL</td>
              <td style={{ padding: '10px 4px', color: '#0f172a' }}>{totalQuestions}</td>
              <td style={{ padding: '10px 4px', color: '#16a34a' }}>{totalRight}</td>
              <td style={{ padding: '10px 4px', color: '#dc2626' }}>{totalWrong}</td>
              <td style={{ padding: '10px 4px', color: '#d97706' }}>{totalUnattempted}</td>
              <td style={{ padding: '10px 10px', textAlign: 'right', color: raw >= 0 ? '#0044cc' : '#dc2626', fontSize: '0.95rem', fontFamily: 'monospace' }}>
                {raw.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Scorecard Footer Verification & Branding */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '8px',
        borderTop: '1px solid #e2e8f0',
        fontSize: '0.68rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          <strong>CBTRANK.COM</strong> — Official Scorecard Report
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: '#475569' }}>
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </div>
    </>
  );
}
