'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next';

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

export default function ResultPage() {
  const router = useRouter();
  const breakdownRef = useRef<HTMLDivElement>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [rightVal, setRightVal] = useState(1.0);
  const [wrongVal, setWrongVal] = useState(0.25);
  const [noData, setNoData] = useState(false);
  const [activeSecTab, setActiveSecTab] = useState('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');
  const [showTelegramModal, setShowTelegramModal] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const lastPopupTime = localStorage.getItem('cbtrank_tg_popup_last_time');
      const now = Date.now();
      const twoMinutesMs = 2 * 60 * 1000;
      return !lastPopupTime || (now - parseInt(lastPopupTime, 10)) > twoMinutesMs;
    } catch (e) {
      return true;
    }
  });

  function handleTelegramJoinClick() {
    try {
      localStorage.setItem('cbtrank_tg_popup_last_time', Date.now().toString());
    } catch (e) {}
    setShowTelegramModal(false);
  }

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

  function handleStatusFilterChange(st: string, e: React.MouseEvent) {
    e.preventDefault();
    const currentScrollY = window.scrollY;
    const topPos = breakdownRef.current ? breakdownRef.current.getBoundingClientRect().top + window.scrollY : null;
    
    setActiveStatusFilter(st);
    
    // Lock scroll position to prevent page jump
    requestAnimationFrame(() => {
      if (topPos !== null && currentScrollY > topPos) {
        window.scrollTo({ top: topPos - 20, behavior: 'instant' as ScrollBehavior });
      } else {
        window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
      }
    });
  }

  function handleSecTabChange(secName: string, e: React.MouseEvent) {
    e.preventDefault();
    const currentScrollY = window.scrollY;
    const topPos = breakdownRef.current ? breakdownRef.current.getBoundingClientRect().top + window.scrollY : null;
    
    setActiveSecTab(secName);
    
    // Lock scroll position to prevent page jump
    requestAnimationFrame(() => {
      if (topPos !== null && currentScrollY > topPos) {
        window.scrollTo({ top: topPos - 20, behavior: 'instant' as ScrollBehavior });
      } else {
        window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
      }
    });
  }

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
    return null;
  }

  const { raw, totalRight, totalWrong, totalUnattempted } = calcMarks(resultData.sections, rightVal, wrongVal);
  const totalAttempted = totalRight + totalWrong;
  const totalQuestions = totalRight + totalWrong + totalUnattempted;
  const accuracy = totalAttempted > 0 ? Math.round((totalRight / totalAttempted) * 100) : 0;

  // Determine authentic community from JSON infoRows first, fallback to user form category
  const authenticCommunityRow = resultData.infoRows?.find(r => /community|caste|category/i.test(r.label));
  const effectiveCommunity = authenticCommunityRow ? authenticCommunityRow.value : (formData?.category || 'UR');

  const allQuestions = resultData.questionsSummary || [];
  const filteredQuestions = allQuestions.filter(q => {
    const matchesSec = activeSecTab === 'ALL' || q.section === activeSecTab;
    const matchesStatus = activeStatusFilter === 'ALL' || q.status === activeStatusFilter;
    return matchesSec && matchesStatus;
  });

  return (
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
              {/* Dynamic Candidate Info Rows */}
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

              {/* Submitted State / Location / RRB Zone */}
              {formData?.state && !resultData.infoRows?.some(r => /state|zone|location/i.test(r.label)) && (
                <div className="meta-box">
                  <label>{formData.location_label || 'State / UT'}</label>
                  <span>{formData.state}</span>
                </div>
              )}

              {/* Submitted Community (Only if authentic JSON did NOT provide Community/Category) */}
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
                  Correct:{' '}
                  <input
                    type="number"
                    id="right-val-input"
                    value={rightVal}
                    step="0.25"
                    min="0"
                    style={{ width: '60px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900, fontSize: '0.82rem', outline: 'none' }}
                    onChange={e => setRightVal(parseFloat(e.target.value) || 1)}
                  />
                </label>
                <label>
                  Wrong:{' '}
                  <input
                    type="number"
                    id="wrong-val-input"
                    value={wrongVal}
                    step="0.05"
                    min="0"
                    style={{ width: '60px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900, fontSize: '0.82rem', outline: 'none' }}
                    onChange={e => setWrongVal(parseFloat(e.target.value) || 0.25)}
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

          {/* 3. Overall Key Metric Cards */}
          <div style={{ position: 'relative', zIndex: 1, padding: '12px 8px', borderRadius: '18px', background: 'rgba(248, 250, 252, 0.6)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px', textAlign: 'center' }}>
              Overall Key Analysis
            </h3>

            <div className="metrics-grid" style={{ position: 'relative', zIndex: 1 }}>
              <div className="metric-card blue">
                <span className="lbl">Raw Marks</span>
                <span className="val" id="metric-raw-score">{raw.toFixed(2)}</span>
                <span className="sub" id="metric-marks-sub">+{rightVal} / -{wrongVal}</span>
              </div>

              <div className="metric-card emerald">
                <span className="lbl">Accuracy</span>
                <span className="val" id="metric-norm-score">{accuracy}%</span>
                <span className="sub" id="metric-pct-sub">Attempted: {totalAttempted}</span>
              </div>

              <div className="metric-card purple">
                <span className="lbl">Overall Rank</span>
                <span className="val" id="metric-overall-rank">#{resultData.overallRank}</span>
                <span className="sub">All India Rank</span>
              </div>

              <div className="metric-card indigo">
                <span className="lbl">Community Rank</span>
                <span className="val" id="metric-cat-rank">#{resultData.categoryRank}</span>
                <span className="sub" id="metric-cat-cand">Community: {effectiveCommunity}</span>
              </div>

              <div className="metric-card amber">
                <span className="lbl">Shift Rank</span>
                <span className="val" id="metric-shift-rank">#{resultData.shiftRank}</span>
                <span className="sub">Shift Rank</span>
              </div>
            </div>
          </div>

          {/* 4. Section-Wise Question Breakdown & Key Analysis */}
          {allQuestions.length > 0 && (
            <div ref={breakdownRef} id="question-breakdown-section" style={{ position: 'relative', zIndex: 1, marginTop: '24px', padding: '16px 12px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Question Wise Performance Breakdown
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Section-wise detailed analysis of right, wrong & unattempted questions
                  </p>
                </div>

                {/* Filter Status Pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['ALL', 'Correct', 'Wrong', 'Unattempted'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={(e) => handleStatusFilterChange(st, e)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'all 0.2s ease',
                        background: activeStatusFilter === st ? (
                          st === 'Correct' ? '#10b981' : st === 'Wrong' ? '#ef4444' : st === 'Unattempted' ? '#f59e0b' : '#2563eb'
                        ) : '#f1f5f9',
                        color: activeStatusFilter === st ? '#ffffff' : '#475569'
                      }}
                    >
                      {st === 'ALL' ? `All (${allQuestions.length})` : 
                       st === 'Correct' ? `Correct (${totalRight})` : 
                       st === 'Wrong' ? `Wrong (${totalWrong})` : 
                       `Unattempted (${totalUnattempted})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Selector Tabs */}
              {resultData.sections && resultData.sections.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleSecTabChange('ALL', e)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      border: activeSecTab === 'ALL' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: activeSecTab === 'ALL' ? '#eff6ff' : '#ffffff',
                      color: activeSecTab === 'ALL' ? '#1d4ed8' : '#334155'
                    }}
                  >
                    All Sections ({allQuestions.length})
                  </button>
                  {resultData.sections.map(sec => (
                    <button
                      key={sec.name}
                      type="button"
                      onClick={(e) => handleSecTabChange(sec.name, e)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        border: activeSecTab === sec.name ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: activeSecTab === sec.name ? '#eff6ff' : '#ffffff',
                        color: activeSecTab === sec.name ? '#1d4ed8' : '#334155'
                      }}
                    >
                      {sec.name} ({sec.total})
                    </button>
                  ))}
                </div>
              )}

              {/* Question Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredQuestions.map((q, idx) => {
                  const isCorrect = q.status === 'Correct';
                  const isWrong = q.status === 'Wrong';

                  return (
                    <div key={idx} style={{
                      borderRadius: '12px',
                      border: isCorrect ? '1px solid #a7f3d0' : isWrong ? '1px solid #fecaca' : '1px solid #e2e8f0',
                      background: isCorrect ? '#f0fdf4' : isWrong ? '#fef2f2' : '#f8fafc',
                      padding: '14px 16px'
                    }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#0f172a' }}>Q.{q.q_no}</span>
                          <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                            {q.section}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 900, padding: '3px 10px', borderRadius: '12px',
                          background: isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#64748b',
                          color: '#ffffff'
                        }}>
                          {isCorrect ? `Correct (+${rightVal})` : isWrong ? `Wrong (-${wrongVal})` : 'Unattempted (0.0)'}
                        </span>
                      </div>

                      {/* Question Text / Image / HTML */}
                      <div style={{ fontSize: '0.88rem', color: '#1e293b', marginBottom: '12px', fontWeight: 600, lineHeight: 1.5 }}>
                        {q.question_html ? (
                          <div dangerouslySetInnerHTML={{ __html: q.question_html }} />
                        ) : q.question_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={q.question_image} alt={`Question ${q.q_no}`} style={{ maxWidth: '100%', borderRadius: '6px' }} />
                        ) : (
                          <div>{q.question_text}</div>
                        )}
                      </div>

                      {/* Options List */}
                      {q.options && q.options.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {q.options.map(opt => {
                            const isOptRight = opt.is_correct;
                            const isOptChosen = (q.chosen_option_id && opt.option_id && q.chosen_option_id === opt.option_id) || 
                                               (q.chosen_option && String(q.chosen_option) === String(opt.option_no));

                            let bg = '#ffffff';
                            let border = '1px solid #e2e8f0';
                            let color = '#334155';
                            let badgeText = '';

                            if (isOptRight) {
                              bg = '#d1fae5';
                              border = '1.5px solid #10b981';
                              color = '#065f46';
                              badgeText = '✓ Correct Answer';
                            }
                            if (isOptChosen && !isOptRight) {
                              bg = '#fee2e2';
                              border = '1.5px solid #ef4444';
                              color = '#991b1b';
                              badgeText = '✗ Your Answer';
                            }

                            return (
                              <div key={opt.option_no} style={{
                                padding: '8px 12px', borderRadius: '8px', background: bg, border: border, color: color,
                                fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontWeight: 800, marginRight: '6px' }}>{opt.option_no}.</span>
                                  {opt.option_html ? (
                                    <span dangerouslySetInnerHTML={{ __html: opt.option_html }} />
                                  ) : opt.option_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={opt.option_image} alt={`Option ${opt.option_no}`} style={{ maxHeight: '40px', verticalAlign: 'middle' }} />
                                  ) : (
                                    <span>{opt.option_text}</span>
                                  )}
                                </div>
                                {badgeText && (
                                  <span style={{ fontSize: '0.7rem', fontWeight: 900, marginLeft: '8px', whiteSpace: 'nowrap' }}>
                                    {badgeText}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* OneSignal Style Push / Telegram Subscription Modal */}
      {showTelegramModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.70)',
          backdropFilter: 'blur(5px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          animation: 'fadeInModal 0.25s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '400px',
            width: '100%',
            padding: '28px 24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            position: 'relative',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {/* Glowing OneSignal Style Telegram Bell Icon */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0088cc 0%, #00a8ff 100%)',
              margin: '0 auto 18px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0, 136, 204, 0.4)'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>

            {/* Title & Sub-text */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.3 }}>
              Get Instant Exam &amp; Rank Updates!
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Join our official Telegram Channel to get instant notifications about upcoming Answer Keys, Ranks &amp; Cut-offs updates!
            </p>

            {/* Mandatory Action Button (No Skip) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="https://t.me/cbtrank"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleTelegramJoinClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #0088cc 0%, #00a8ff 100%)',
                  color: '#ffffff',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0, 136, 204, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.59 4.6-1.87 5.12-1.88.11 0 .37.03.54.18.14.12.18.29.2.46-.01.07.01.24-.02.4z"/>
                </svg>
                Join Official Telegram Channel
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
