'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APP_FEATURE_FLAGS } from '../config/features';
import { fetchLiveRankAction } from '../actions/calculate';
import { cbtGet, cbtGetString, cbtSave, STORAGE_KEYS } from '../utils/storage';

interface Section {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  bonus?: number;
  unattempted: number;
}

interface ResultData {
  candidateName: string;
  rollNo: string;
  testDate: string;
  testTime: string;
  testCenter: string;
  examName: string;
  examId?: string;
  headerImgUrl: string;
  headerBannerText?: string;
  infoRows: Array<{ label: string; value: string }>;
  sections: Section[];
  correctCount: number;
  wrongCount: number;
  bonusCount?: number;
  rawBonusQuestions?: string | number;
  unattemptedCount: number;
  overallRank: number;
  shiftRank: number;
  categoryRank: number;
  genderRank?: number;
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
  exam_slug?: string;
  exam_id?: string;
}

export default function RankPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [rightVal, setRightVal] = useState(1.0);
  const [wrongVal, setWrongVal] = useState(0.25);
  const [liveRank, setLiveRank] = useState<{
    overallRank: number;
    totalOverall: number;
    shiftRank: number;
    totalShift: number;
    categoryRank: number;
    totalCategory: number;
    genderRank?: number;
    totalGender?: number;
    percentile: number;
  } | null>(null);
  const [loadingRank, setLoadingRank] = useState(true);

  useEffect(() => {
    try {
      const rawResult = cbtGet<ResultData>(STORAGE_KEYS.RESULT_DATA);
      const rawForm   = cbtGet<FormData>(STORAGE_KEYS.FORM_DATA);

      if (!rawResult) {
        router.push('/');
        return;
      }

      const result = rawResult as ResultData;
      const form   = rawForm as FormData | null;

      const savedRight = cbtGetString(STORAGE_KEYS.MARKS_RIGHT);
      const savedWrong = cbtGetString(STORAGE_KEYS.MARKS_WRONG);

      let currentRight = 1.0;
      let currentWrong = 0;

      if (savedRight !== null && savedRight !== undefined && savedRight !== '') {
        currentRight = parseFloat(savedRight);
      } else if (form?.marks_right !== undefined && form?.marks_right !== null) {
        currentRight = Number(form.marks_right);
      }
      setRightVal(currentRight);

      if (savedWrong !== null && savedWrong !== undefined && savedWrong !== '') {
        currentWrong = parseFloat(savedWrong);
      } else if (form?.marks_wrong !== undefined && form?.marks_wrong !== null) {
        currentWrong = Number(form.marks_wrong);
      }
      setWrongVal(currentWrong);

      setResultData(result);
      setFormData(form);

      // Compute raw marks for live database query
      let tRight = 0, tWrong = 0, tBonus = 0;
      if (result.sections && result.sections.length > 0) {
        result.sections.forEach(s => {
          tRight += s.correct;
          tWrong += s.wrong;
          tBonus += (s.bonus || 0);
        });
      } else {
        tRight = Number(result.correctCount || 0);
        tWrong = Number(result.wrongCount || 0);
      }
      if (tBonus === 0 && (result.bonusCount || result.rawBonusQuestions)) {
        tBonus = Number(result.bonusCount || result.rawBonusQuestions || 0);
      }
      const rawScore = ((tRight + tBonus) * currentRight) - (tWrong * currentWrong);

      const authCommRow = result.infoRows?.find(r => /community|caste|category/i.test(r.label));
      const effCategory = (result as any).category || authCommRow?.value || form?.category || 'UR';
      const authGenderRow = result.infoRows?.find(r => /gender|sex/i.test(r.label));
      const effGender = (result as any).gender || authGenderRow?.value || form?.gender || '';
      const rNum = result.rollNo || result.infoRows?.find(r => /roll|registration|id/i.test(r.label))?.value || '';
      const ansUrl = form?.ans_key_url || '';

      const officialExamId = result.examId || form?.exam_id || '';

      if ((result as any).liveRank) {
        const cached = (result as any).liveRank;
        setLiveRank(cached);
        if (cached && cached.genderRank !== undefined && cached.totalGender !== undefined) {
          setLoadingRank(false);
        }
      }

      fetchLiveRankAction({
        examId: officialExamId,
        examSlug: (result as any).exam_slug || (result as any).slug || form?.exam_slug || '',
        examDate: result.testDate || '',
        examTime: result.testTime || '',
        category: effCategory,
        gender: effGender,
        totalMarks: rawScore,
        userId: rNum,
        url: ansUrl
      }).then(res => {
        if (res && res.success && res.data) {
          setLiveRank(res.data);
          try {
            cbtSave(STORAGE_KEYS.RESULT_DATA, {
              ...result,
              overallRank: res.data.overallRank,
              totalOverall: res.data.totalOverall,
              shiftRank: res.data.shiftRank,
              totalShift: res.data.totalShift,
              categoryRank: res.data.categoryRank,
              totalCategory: res.data.totalCategory,
              genderRank: res.data.genderRank,
              totalGender: res.data.totalGender,
              liveRank: res.data
            });
          } catch (e) {}
        }
        setLoadingRank(false);
      }).catch(() => {
        setLoadingRank(false);
      });

    } catch (e) {
      router.push('/');
    }
  }, [router]);

  if (!resultData) {
    return null;
  }

  const candidateName = resultData.candidateName || resultData.infoRows?.find(r => /name|candidate/i.test(r.label))?.value || 'Verified Candidate';
  const rollNumber = resultData.rollNo || resultData.infoRows?.find(r => /roll|registration|id/i.test(r.label))?.value || '';
  const authenticCommunityRow = resultData.infoRows?.find(r => /community|caste|category/i.test(r.label));
  const effectiveCommunity = authenticCommunityRow ? authenticCommunityRow.value : (formData?.category || 'UR');

  const authGenderRow = resultData.infoRows?.find(r => /gender|sex/i.test(r.label));
  const rawGender = (resultData as any).gender || authGenderRow?.value || formData?.gender || '';
  const effectiveGender = rawGender ? (rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()) : '';

  const overallRank = liveRank?.overallRank || resultData.overallRank || 1;
  const totalOverall = liveRank?.totalOverall || (resultData as any).totalOverall || (overallRank <= 1 ? 1 : overallRank);
  const shiftRank = liveRank?.shiftRank || resultData.shiftRank || 1;
  const totalShift = liveRank?.totalShift || (resultData as any).totalShift || (shiftRank <= 1 ? 1 : shiftRank);
  const categoryRank = liveRank?.categoryRank || resultData.categoryRank || 1;
  const totalCategory = liveRank?.totalCategory || (resultData as any).totalCategory || (categoryRank <= 1 ? 1 : categoryRank);
  const genderRank = (liveRank && liveRank.genderRank) ? liveRank.genderRank : (resultData.genderRank || 1);
  const totalGender = (liveRank && liveRank.totalGender) ? liveRank.totalGender : ((resultData as any).totalGender || (genderRank <= 1 ? 1 : genderRank));

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

              {/* Candidate Info Summary Header (Visible at Top on Mobile & Print) */}
              <div className="candidate-top-summary" style={{
                marginBottom: '14px',
                padding: '10px 12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px 12px', fontSize: '9pt' }}>
                  <div><strong>Candidate:</strong> {candidateName}</div>
                  {rollNumber && <div><strong>Roll No:</strong> <span style={{ fontFamily: 'monospace', color: '#0044cc', fontWeight: 800 }}>{rollNumber}</span></div>}
                  {resultData.testDate && <div><strong>Date:</strong> {resultData.testDate}</div>}
                  {resultData.testTime && <div><strong>Time:</strong> {resultData.testTime}</div>}
                  {effectiveCommunity && <div><strong>Category:</strong> {effectiveCommunity}</div>}
                  {effectiveGender && <div><strong>Gender:</strong> {effectiveGender}</div>}
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

              {/* Beautiful Live Rank Summary Showcase Card */}
              <div style={{
                background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                border: '1.5px solid #bfdbfe',
                borderRadius: '16px',
                padding: '22px 20px',
                marginBottom: '20px',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.06)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Accent top line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3.5px',
                  background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)'
                }} />

                {/* Status Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '10px'
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    display: 'inline-block'
                  }} />
                  Live Rank Generated
                </div>

                <p style={{
                  fontSize: '0.84rem',
                  color: '#475569',
                  maxWidth: '560px',
                  margin: '0 auto 16px',
                  lineHeight: 1.55,
                  fontWeight: 500
                }}>
                  Live rank breakdown calculated among participating candidates for this exam.
                </p>

                {/* 4 Metric Live Rank Cards */}
                <div className="live-rank-grid">
                  <div className="rank-metric-card card-overall">
                    <span className="rank-card-label">🥇 Overall Rank</span>
                    <div className="rank-card-value rank-val-overall">
                      {loadingRank && !liveRank ? '...' : `#${liveRank ? liveRank.overallRank : overallRank}`}
                      <span className="rank-card-total">
                        {' / '}{liveRank ? liveRank.totalOverall : totalOverall}
                      </span>
                    </div>
                  </div>

                  <div className="rank-metric-card card-shift">
                    <span className="rank-card-label">⏱️ Shift Rank</span>
                    <div className="rank-card-value rank-val-shift">
                      {loadingRank && !liveRank ? '...' : `#${liveRank ? liveRank.shiftRank : shiftRank}`}
                      <span className="rank-card-total">
                        {' / '}{liveRank ? liveRank.totalShift : totalShift}
                      </span>
                    </div>
                  </div>

                  <div className="rank-metric-card card-category">
                    <span className="rank-card-label">👥 Category Rank</span>
                    <div className="rank-card-value rank-val-category">
                      {loadingRank && !liveRank ? '...' : `#${liveRank ? liveRank.categoryRank : categoryRank}`}
                      <span className="rank-card-total">
                        {' / '}{liveRank ? liveRank.totalCategory : totalCategory}
                      </span>
                    </div>
                    {effectiveCommunity && (
                      <span className="rank-subtag rank-subtag-category">
                        {effectiveCommunity}
                      </span>
                    )}
                  </div>

                  <div className="rank-metric-card card-gender">
                    <span className="rank-card-label">🚻 Gender Rank</span>
                    <div className="rank-card-value rank-val-gender">
                      {loadingRank && (!liveRank || !liveRank.genderRank) ? '...' : `#${liveRank && liveRank.genderRank ? liveRank.genderRank : genderRank}`}
                      <span className="rank-card-total">
                        {' / '}{liveRank && liveRank.totalGender ? liveRank.totalGender : totalGender}
                      </span>
                    </div>
                    {effectiveGender && (
                      <span className="rank-subtag rank-subtag-gender">
                        {effectiveGender}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, #0044cc 0%, #003399 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0, 68, 204, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Live Rank Status
                  </button>
                </div>
              </div>

              {/* Subject-Wise Performance Breakdown Table */}
              {resultData.sections && resultData.sections.length > 0 && (() => {
                const bonusCountFromData = Number(resultData.bonusCount || resultData.rawBonusQuestions || 0);
                const sectionsHaveBonus = Boolean(resultData.sections.some(s => s.bonus && s.bonus > 0));
                const hasBonus = Boolean(sectionsHaveBonus || (bonusCountFromData > 0));
                const fallbackBonus = (!sectionsHaveBonus && resultData.sections.length === 1) ? bonusCountFromData : 0;

                let totBonus = 0;
                resultData.sections.forEach(s => {
                  totBonus += (s.bonus || 0);
                });
                if (totBonus === 0 && hasBonus) {
                  totBonus = bonusCountFromData;
                }

                const totQuestions = resultData.sections.reduce((acc, s) => acc + (s.total || 0), 0);
                const totUnattempted = resultData.sections.reduce((acc, s) => acc + (s.unattempted || 0), 0);
                const totAttempted = totQuestions - totUnattempted;
                const totCorrect = resultData.sections.reduce((acc, s) => acc + (s.correct || 0), 0);
                const totWrong = resultData.sections.reduce((acc, s) => acc + (s.wrong || 0), 0);
                const totScore = ((totCorrect + totBonus) * rightVal) - (totWrong * wrongVal);

                return (
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
                            <th className="rank-desktop-col" style={{ padding: '10px 8px' }}>Attempted</th>
                            <th className="rank-desktop-col" style={{ padding: '10px 8px', color: '#d97706' }}>Unattempted</th>
                            <th style={{ padding: '10px 8px', color: '#059669' }}>Correct</th>
                            <th style={{ padding: '10px 8px', color: '#ef4444' }}>Wrong</th>
                            {hasBonus && (
                              <th style={{ padding: '10px 8px', color: '#9333ea', fontWeight: 800 }}>Bonus</th>
                            )}
                            <th className="rank-mobile-col" style={{ padding: '10px 8px', color: '#d97706' }}>Skip</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultData.sections.map((sec, idx) => {
                            const secBonus = (sec.bonus !== undefined && sec.bonus !== null) ? sec.bonus : fallbackBonus;
                            const secAttempted = sec.total - sec.unattempted;
                            const secScore = ((sec.correct + (secBonus || 0)) * rightVal) - (sec.wrong * wrongVal);
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                                <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: '#0f172a' }}>{sec.name}</td>
                                <td style={{ padding: '10px 8px', fontWeight: 700 }}>{sec.total}</td>
                                <td className="rank-desktop-col" style={{ padding: '10px 8px', fontWeight: 700 }}>{secAttempted}</td>
                                <td className="rank-desktop-col" style={{ padding: '10px 8px', fontWeight: 700, color: '#d97706' }}>{sec.unattempted}</td>
                                <td style={{ padding: '10px 8px', fontWeight: 800, color: '#059669' }}>{sec.correct}</td>
                                <td style={{ padding: '10px 8px', fontWeight: 800, color: '#ef4444' }}>{sec.wrong}</td>
                                {hasBonus && (
                                  <td style={{ padding: '10px 8px', fontWeight: 800, color: '#9333ea' }}>{secBonus || 0}</td>
                                )}
                                <td className="rank-mobile-col" style={{ padding: '10px 8px', fontWeight: 700, color: '#d97706' }}>{sec.unattempted}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 900, color: secScore < 0 ? '#ef4444' : '#0f172a' }}>{secScore.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1', fontWeight: 900, color: '#0f172a', fontSize: '0.82rem' }}>
                            <td style={{ padding: '12px 12px', textAlign: 'left', fontWeight: 900, color: '#0f172a' }}>Total</td>
                            <td style={{ padding: '12px 8px', fontWeight: 900 }}>{totQuestions}</td>
                            <td className="rank-desktop-col" style={{ padding: '12px 8px', fontWeight: 900 }}>{totAttempted}</td>
                            <td className="rank-desktop-col" style={{ padding: '12px 8px', fontWeight: 900, color: '#d97706' }}>{totUnattempted}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 900, color: '#059669' }}>{totCorrect}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 900, color: '#ef4444' }}>{totWrong}</td>
                            {hasBonus && (
                              <td style={{ padding: '12px 8px', fontWeight: 900, color: '#9333ea' }}>{totBonus}</td>
                            )}
                            <td className="rank-mobile-col" style={{ padding: '12px 8px', fontWeight: 900, color: '#d97706' }}>{totUnattempted}</td>
                            <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 900, color: totScore < 0 ? '#ef4444' : '#0f172a', fontSize: '0.88rem' }}>
                              {totScore.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })()}

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
            <div className="sidebar-profile-card" style={{
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
                {effectiveGender && !resultData.infoRows?.some(r => /gender|sex/i.test(r.label)) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Gender:</span>
                    <strong style={{ color: '#0f172a' }}>{effectiveGender}</strong>
                  </div>
                )}
              </div>

              {/* Integrated Review Answerkey Button directly below User Info */}
              {APP_FEATURE_FLAGS.SHOW_REVIEW_ANSWERKEY && (
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
              )}

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
