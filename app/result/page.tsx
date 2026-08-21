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
        logging: false
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

  const candidateName = resultData.candidateName || resultData.infoRows?.find(r => /name|candidate|participant/i.test(r.label))?.value || 'Verified Candidate';
  const candidateRollNo = resultData.rollNo || resultData.infoRows?.find(r => /roll|registration|id|applicant|user|ticket/i.test(r.label))?.value || formData?.ans_key_url?.match(/[\/=](\d{8,12})/)?.[1] || formData?.ans_key_url?.match(/\/pub\/([^\/]+)\//i)?.[1] || '';
  const candidateCategory = resultData.infoRows?.find(r => /community|caste|category/i.test(r.label))?.value || formData?.category || 'UR';
  const candidateTestDate = resultData.testDate || resultData.infoRows?.find(r => /date/i.test(r.label))?.value || '';
  const candidateTestTime = resultData.testTime || resultData.infoRows?.find(r => /time|shift/i.test(r.label))?.value || '';
  const candidateTestCenter = resultData.testCenter || resultData.infoRows?.find(r => /center|venue/i.test(r.label))?.value || '';

  return (
    <>
      {ENABLE_TELEGRAM_DIALOG && showTelegramModal && <TelegramPortalModal onJoin={handleTelegramJoinClick} />}

      <main>
      <div className="result-main">

        {/* Main Scorecard Card */}
        <div className="scorecard-card" id="cbrank-scorecard-card" style={{ position: 'relative', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>

          {/* Watermark */}
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            fontSize: '6rem', fontWeight: 900, color: 'rgba(0, 68, 204, 0.025)',
            letterSpacing: '12px', pointerEvents: 'none', userSelect: 'none',
            zIndex: 0, whiteSpace: 'nowrap', textTransform: 'uppercase'
          }}>
            CBT RANK
          </div>

          {/* 1. Exam & Candidate Info Header */}
          <div className="info-section-header" style={{ position: 'relative', zIndex: 1, width: '100%', boxSizing: 'border-box' }}>
            {resultData.headerImgUrl ? (
              <div style={{ width: '100%', textAlign: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultData.headerImgUrl} alt="Exam Header Logo" className="exam-logo" style={{ margin: '0 auto' }} />
              </div>
            ) : resultData.headerBannerText ? (
              <h1 className="exam-name-title" style={{ width: '100%', textAlign: 'center' }}>{resultData.headerBannerText}</h1>
            ) : (
              resultData.examName && (
                <h1 className="exam-name-title" style={{ width: '100%', textAlign: 'center' }}>{resultData.examName}</h1>
              )
            )}

            {/* Candidate & Examination Info Table (2-Column Format: Label | Value) */}
            <div style={{
              width: '100%',
              boxSizing: 'border-box',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              overflow: 'hidden',
              marginTop: '12px',
              background: '#ffffff'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ width: '35%', background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                      Candidate Name
                    </th>
                    <td style={{ width: '65%', background: '#ffffff', padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>
                      {candidateName}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                      Roll / Reg. Number
                    </th>
                    <td style={{ background: '#ffffff', padding: '8px 12px', fontWeight: 900, color: '#0044cc', fontFamily: 'monospace' }}>
                      {candidateRollNo || 'N/A'}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                      Category / Community
                    </th>
                    <td style={{ background: '#ffffff', padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>
                      {candidateCategory}
                    </td>
                  </tr>

                  {formData?.gender && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                        Gender
                      </th>
                      <td style={{ background: '#ffffff', padding: '8px 12px', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
                        {formData.gender}
                      </td>
                    </tr>
                  )}

                  {candidateTestDate && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                        Exam Date
                      </th>
                      <td style={{ background: '#ffffff', padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>
                        {candidateTestDate}
                      </td>
                    </tr>
                  )}

                  {candidateTestTime && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                        Exam Shift / Time
                      </th>
                      <td style={{ background: '#ffffff', padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>
                        {candidateTestTime}
                      </td>
                    </tr>
                  )}

                  {formData?.state && (
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                        {formData.location_label || 'State / Zone'}
                      </th>
                      <td style={{ background: '#ffffff', padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>
                        {formData.state}
                      </td>
                    </tr>
                  )}

                  {formData?.paper_language && (
                    <tr style={{ borderBottom: candidateTestCenter ? '1px solid #e2e8f0' : 'none' }}>
                      <th style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                        Paper Language
                      </th>
                      <td style={{ background: '#ffffff', padding: '8px 12px', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
                        {formData.paper_language}
                      </td>
                    </tr>
                  )}

                  {candidateTestCenter && (
                    <tr>
                      <th style={{ background: '#f8fafc', padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                        Exam Center / Venue
                      </th>
                      <td style={{ background: '#ffffff', padding: '8px 12px', fontWeight: 700, color: '#334155', fontSize: '0.8rem' }}>
                        {candidateTestCenter}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
    {/* Dedicated Full-Bleed Table Scorecard (RankGuruji Design)    */}
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
        padding: 0,
        boxSizing: 'border-box',
        border: '5px solid #0044cc',
        borderTop: '5px solid #0044cc',
        borderRight: '5px solid #0044cc',
        borderBottom: '5px solid #0044cc',
        borderLeft: '5px solid #0044cc',
        overflow: 'hidden'
      }}
    >
      {/* Multiple Repeating Security Watermarks: CBT Rank */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(5, 1fr)',
          gap: '24px 10px',
          alignItems: 'center',
          justifyItems: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 99,
          overflow: 'hidden',
          padding: '16px'
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              transform: 'rotate(-25deg)',
              fontSize: '1.45rem',
              fontWeight: 900,
              color: '#0044cc',
              opacity: 0.055,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            CBT Rank
          </div>
        ))}
      </div>

      {/* 1. Header Section (Exam Name, Full Width, Flush) */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(135deg, #0044cc 0%, #0f172a 100%)',
        color: '#ffffff',
        padding: '12px 16px',
        textAlign: 'center',
        borderBottom: '2px solid #0044cc'
      }}>
        <h2 style={{ fontSize: '1.08rem', fontWeight: 900, margin: 0, lineHeight: 1.3, color: '#ffffff' }}>
          {resultData.examName || resultData.headerBannerText || 'CBT Competitive Examination'}
        </h2>
      </div>

      {/* Candidate Details Table (Edge to Edge, 2 Columns: Label | Value) */}
      <table style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.78rem',
        borderBottom: '2px solid #0044cc'
      }}>
        <tbody>
          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <th style={{ width: '38%', background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
              Candidate Name
            </th>
            <td style={{ width: '62%', background: '#ffffff', padding: '6px 12px', fontWeight: 800, color: '#0f172a' }}>
              {candidateName}
            </td>
          </tr>

          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <th style={{ background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
              Roll / Reg. Number
            </th>
            <td style={{ background: '#ffffff', padding: '6px 12px', fontWeight: 900, color: '#0044cc', fontFamily: 'monospace' }}>
              {candidateRollNo || 'N/A'}
            </td>
          </tr>

          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
            <th style={{ background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
              Category / Community
            </th>
            <td style={{ background: '#ffffff', padding: '6px 12px', fontWeight: 800, color: '#0f172a' }}>
              {candidateCategory}
            </td>
          </tr>

          {formData?.gender && (
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
                Gender
              </th>
              <td style={{ background: '#ffffff', padding: '6px 12px', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
                {formData.gender}
              </td>
            </tr>
          )}

          {candidateTestDate && (
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
                Exam Date
              </th>
              <td style={{ background: '#ffffff', padding: '6px 12px', fontWeight: 800, color: '#0f172a' }}>
                {candidateTestDate}
              </td>
            </tr>
          )}

          {candidateTestTime && (
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
                Exam Shift / Time
              </th>
              <td style={{ background: '#ffffff', padding: '6px 12px', fontWeight: 800, color: '#0f172a' }}>
                {candidateTestTime}
              </td>
            </tr>
          )}

          {formData?.state && (
            <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
                State / Zone
              </th>
              <td style={{ background: '#ffffff', padding: '6px 12px', fontWeight: 800, color: '#0f172a' }}>
                {formData.state}
              </td>
            </tr>
          )}

          {formData?.paper_language && (
            <tr style={{ borderBottom: candidateTestCenter ? '1px solid #cbd5e1' : 'none' }}>
              <th style={{ background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
                Paper Language
              </th>
              <td style={{ background: '#ffffff', padding: '6px 12px', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
                {formData.paper_language}
              </td>
            </tr>
          )}

          {candidateTestCenter && (
            <tr>
              <th style={{ background: '#f8fafc', padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', borderRight: '1px solid #cbd5e1' }}>
                Exam Center / Venue
              </th>
              <td style={{ background: '#ffffff', padding: '6px 12px', fontWeight: 700, color: '#334155', fontSize: '0.75rem' }}>
                {candidateTestCenter}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Subject-Wise Performance Table (Edge to Edge, 100% Flush) */}
      <table style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.78rem',
        textAlign: 'center',
        borderBottom: '1px solid #cbd5e1'
      }}>
        <thead>
          <tr style={{ background: '#0f172a', color: '#ffffff', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderRight: '1px solid #334155' }}>Section</th>
            <th style={{ padding: '8px 4px', borderRight: '1px solid #334155' }}>Total</th>
            <th style={{ padding: '8px 4px', color: '#4ade80', borderRight: '1px solid #334155' }}>Right (+{rightVal})</th>
            <th style={{ padding: '8px 4px', color: '#f87171', borderRight: '1px solid #334155' }}>Wrong (-{wrongVal})</th>
            <th style={{ padding: '8px 4px', color: '#fbbf24', borderRight: '1px solid #334155' }}>Skipped</th>
            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {resultData.sections.map((sec, idx) => {
            const sm = calcSectionMarks(sec, rightVal, wrongVal);
            return (
              <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{sec.name}</td>
                <td style={{ padding: '8px 4px', fontWeight: 700, borderRight: '1px solid #cbd5e1' }}>{sec.total}</td>
                <td style={{ padding: '8px 4px', fontWeight: 800, color: '#16a34a', borderRight: '1px solid #cbd5e1' }}>{sec.correct}</td>
                <td style={{ padding: '8px 4px', fontWeight: 800, color: '#dc2626', borderRight: '1px solid #cbd5e1' }}>{sec.wrong}</td>
                <td style={{ padding: '8px 4px', fontWeight: 700, color: '#d97706', borderRight: '1px solid #cbd5e1' }}>{sec.unattempted}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 900, color: sm >= 0 ? '#0f172a' : '#dc2626' }}>
                  {sm.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#eff6ff', borderTop: '2px solid #3b82f6', fontWeight: 900, fontSize: '0.82rem' }}>
            <td style={{ padding: '9px 12px', textAlign: 'left', color: '#1e3a8a', borderRight: '1px solid #cbd5e1' }}>GRAND TOTAL</td>
            <td style={{ padding: '9px 4px', color: '#0f172a', borderRight: '1px solid #cbd5e1' }}>{totalQuestions}</td>
            <td style={{ padding: '9px 4px', color: '#16a34a', borderRight: '1px solid #cbd5e1' }}>{totalRight}</td>
            <td style={{ padding: '9px 4px', color: '#dc2626', borderRight: '1px solid #cbd5e1' }}>{totalWrong}</td>
            <td style={{ padding: '9px 4px', color: '#d97706', borderRight: '1px solid #cbd5e1' }}>{totalUnattempted}</td>
            <td style={{ padding: '9px 12px', textAlign: 'right', color: raw >= 0 ? '#0044cc' : '#dc2626', fontSize: '0.95rem', fontFamily: 'monospace' }}>
              {raw.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 4. Scorecard Footer (With Colored Top Border and Framed Badges) */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: '#eff6ff',
        borderTop: '2px solid #0044cc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '9px 14px',
        fontSize: '0.7rem',
        color: '#1e3a8a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          <strong style={{ color: '#0044cc', letterSpacing: '0.02em' }}>CBTRANK.COM</strong>
          <span style={{ color: '#64748b' }}>— Official Scorecard Report</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 800, color: '#0044cc', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px', border: '1px solid #93c5fd' }}>
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </div>
    </>
  );
}
