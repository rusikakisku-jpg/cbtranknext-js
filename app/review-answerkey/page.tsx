'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function ReviewAnswerkeyPage() {
  const router = useRouter();
  const breakdownRef = useRef<HTMLDivElement>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [rightVal, setRightVal] = useState(1.0);
  const [wrongVal, setWrongVal] = useState(0.25);
  const [activeSecTab, setActiveSecTab] = useState('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');

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
    
    requestAnimationFrame(() => {
      if (topPos !== null && currentScrollY > topPos) {
        window.scrollTo({ top: topPos - 20, behavior: 'instant' as ScrollBehavior });
      } else {
        window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
      }
    });
  }

  if (!resultData) {
    return null;
  }

  const allQuestions = resultData.questionsSummary || [];

  let totalRight = 0, totalWrong = 0, totalUnattempted = 0;
  resultData.sections.forEach(s => {
    totalRight += s.correct;
    totalWrong += s.wrong;
    totalUnattempted += s.unattempted;
  });

  const selectedSecObj = activeSecTab !== 'ALL'
    ? resultData.sections.find(s => s.name === activeSecTab || s.name.trim().toLowerCase() === activeSecTab.trim().toLowerCase())
    : null;

  const currentSecQuestions = activeSecTab === 'ALL'
    ? allQuestions
    : allQuestions.filter(q => (q.section || '').trim().toLowerCase() === activeSecTab.trim().toLowerCase());

  const pillTotalCount = activeSecTab === 'ALL'
    ? allQuestions.length
    : (selectedSecObj ? selectedSecObj.total : currentSecQuestions.length);

  const pillCorrectCount = activeSecTab === 'ALL'
    ? totalRight
    : (selectedSecObj ? selectedSecObj.correct : currentSecQuestions.filter(q => q.status === 'Correct').length);

  const pillWrongCount = activeSecTab === 'ALL'
    ? totalWrong
    : (selectedSecObj ? selectedSecObj.wrong : currentSecQuestions.filter(q => q.status === 'Wrong').length);

  const pillUnattemptedCount = activeSecTab === 'ALL'
    ? totalUnattempted
    : (selectedSecObj ? selectedSecObj.unattempted : currentSecQuestions.filter(q => q.status === 'Unattempted').length);

  const filteredQuestions = currentSecQuestions.filter(q => {
    return activeStatusFilter === 'ALL' || q.status === activeStatusFilter;
  });

  const candidateName = resultData.candidateName || resultData.infoRows?.find(r => /name|candidate/i.test(r.label))?.value || 'Candidate';
  const rollNumber = resultData.rollNo || resultData.infoRows?.find(r => /roll|registration|id/i.test(r.label))?.value || '';

  return (
    <main>
      <div className="result-main">
        <div className="scorecard-card" style={{ position: 'relative', overflow: 'hidden' }}>

          {/* Navigation Bar / Quick Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
            <Link
              href="/result"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1',
                padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem',
                textDecoration: 'none'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Scorecard
            </Link>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link
                href="/rank"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff', padding: '8px 14px', borderRadius: '10px',
                  fontWeight: 800, fontSize: '0.82rem', textDecoration: 'none'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                View Your Rank
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1',
                  padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Print / PDF
              </button>
            </div>
          </div>

          {/* Candidate & Exam Banner Summary */}
          <div className="info-section-header" style={{ position: 'relative', zIndex: 1, marginBottom: '18px' }}>
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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 14px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Candidate Name</span>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{candidateName}</strong>
              </div>
              {rollNumber && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 14px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Roll Number</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a', fontFamily: 'monospace' }}>{rollNumber}</strong>
                </div>
              )}
              {resultData.testDate && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 14px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block' }}>Exam Date</span>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{resultData.testDate}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Question Breakdown Section */}
          <div ref={breakdownRef} id="question-breakdown-section" style={{ position: 'relative', zIndex: 1, padding: '14px 12px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            
            {/* Colorful Filter Status Pills Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              
              {/* ALL Pill */}
              <button
                type="button"
                onClick={(e) => handleStatusFilterChange('ALL', e)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: activeStatusFilter === 'ALL' ? '1px solid #1d4ed8' : '1px solid #bfdbfe',
                  transition: 'all 0.2s ease',
                  background: activeStatusFilter === 'ALL' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#eff6ff',
                  color: activeStatusFilter === 'ALL' ? '#ffffff' : '#1d4ed8',
                  boxShadow: activeStatusFilter === 'ALL' ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none'
                }}
              >
                All ({pillTotalCount})
              </button>

              {/* Correct Pill */}
              <button
                type="button"
                onClick={(e) => handleStatusFilterChange('Correct', e)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: activeStatusFilter === 'Correct' ? '1px solid #047857' : '1px solid #a7f3d0',
                  transition: 'all 0.2s ease',
                  background: activeStatusFilter === 'Correct' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#ecfdf5',
                  color: activeStatusFilter === 'Correct' ? '#ffffff' : '#047857',
                  boxShadow: activeStatusFilter === 'Correct' ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none'
                }}
              >
                Correct ({pillCorrectCount})
              </button>

              {/* Wrong Pill */}
              <button
                type="button"
                onClick={(e) => handleStatusFilterChange('Wrong', e)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: activeStatusFilter === 'Wrong' ? '1px solid #b91c1c' : '1px solid #fecaca',
                  transition: 'all 0.2s ease',
                  background: activeStatusFilter === 'Wrong' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '#fef2f2',
                  color: activeStatusFilter === 'Wrong' ? '#ffffff' : '#b91c1c',
                  boxShadow: activeStatusFilter === 'Wrong' ? '0 2px 8px rgba(239, 68, 68, 0.35)' : 'none'
                }}
              >
                Wrong ({pillWrongCount})
              </button>

              {/* Unattempted Pill */}
              <button
                type="button"
                onClick={(e) => handleStatusFilterChange('Unattempted', e)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: activeStatusFilter === 'Unattempted' ? '1px solid #b45309' : '1px solid #fde68a',
                  transition: 'all 0.2s ease',
                  background: activeStatusFilter === 'Unattempted' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : '#fffbeb',
                  color: activeStatusFilter === 'Unattempted' ? '#ffffff' : '#b45309',
                  boxShadow: activeStatusFilter === 'Unattempted' ? '0 2px 8px rgba(245, 158, 11, 0.35)' : 'none'
                }}
              >
                Unattempted ({pillUnattemptedCount})
              </button>

            </div>

            {/* Colorful Dynamic Section Selector Tabs */}
            {resultData.sections && resultData.sections.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={(e) => handleSecTabChange('ALL', e)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: activeSecTab === 'ALL' ? '1px solid #4338ca' : '1px solid #e2e8f0',
                    background: activeSecTab === 'ALL' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#f8fafc',
                    color: activeSecTab === 'ALL' ? '#ffffff' : '#475569',
                    boxShadow: activeSecTab === 'ALL' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  All Sections ({allQuestions.length})
                </button>
                {resultData.sections.map(sec => {
                  const isActive = activeSecTab === sec.name;
                  return (
                    <button
                      key={sec.name}
                      type="button"
                      onClick={(e) => handleSecTabChange(sec.name, e)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '10px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: isActive ? '1px solid #4338ca' : '1px solid #e2e8f0',
                        background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#f8fafc',
                        color: isActive ? '#ffffff' : '#475569',
                        boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                    >
                      {sec.name} ({sec.total})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Question Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredQuestions.map((q, idx) => {
                const isCorrect = q.status === 'Correct';
                const isWrong = q.status === 'Wrong';

                return (
                  <div key={idx} style={{
                    borderRadius: '12px',
                    border: isCorrect ? '1px solid #a7f3d0' : isWrong ? '1px solid #fecaca' : '1px solid #e2e8f0',
                    background: isCorrect ? '#f0fdf4' : isWrong ? '#fef2f2' : '#f8fafc',
                    padding: '12px 14px'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.82rem', color: '#0f172a' }}>Q.{q.q_no}</span>
                        <span style={{ fontSize: '0.68rem', background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {q.section}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 900, padding: '2px 8px', borderRadius: '10px',
                        background: isCorrect ? '#10b981' : isWrong ? '#ef4444' : '#64748b',
                        color: '#ffffff'
                      }}>
                        {isCorrect ? `Correct (+${rightVal})` : isWrong ? `Wrong (-${wrongVal})` : 'Unattempted (0.0)'}
                      </span>
                    </div>

                    {/* Question Text / Image / HTML */}
                    <div style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: '10px', fontWeight: 600, lineHeight: 1.45 }}>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
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

                          const cleanOptHtml = opt.option_html ? opt.option_html.replace(new RegExp(`^(\\s*(?:<[^>]+>\\s*)*)${opt.option_no}[\\.\\)]\\s*`, 'i'), '$1') : '';
                          const cleanOptText = opt.option_text ? opt.option_text.replace(new RegExp(`^(\\s*)${opt.option_no}[\\.\\)]\\s*`, 'i'), '$1') : '';

                          return (
                            <div key={opt.option_no} style={{
                              padding: '6px 10px', borderRadius: '6px', background: bg, border: border, color: color,
                              fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                              <div style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 800, flexShrink: 0 }}>{opt.option_no}.</span>
                                {cleanOptHtml ? (
                                  <span style={{ display: 'inline-flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: cleanOptHtml }} />
                                ) : opt.option_image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={opt.option_image} alt={`Option ${opt.option_no}`} style={{ maxHeight: '36px', verticalAlign: 'middle' }} />
                                ) : (
                                  <span>{cleanOptText}</span>
                                )}
                              </div>
                              {badgeText && (
                                <span style={{ fontSize: '0.68rem', fontWeight: 900, marginLeft: '6px', whiteSpace: 'nowrap' }}>
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

          {/* Bottom Navigation */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link
              href="/result"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff', padding: '12px 24px', borderRadius: '12px',
                fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              ← Back to Scorecard
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
