'use client';

import { useEffect, useState } from 'react';
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

interface ResultData {
  candidateName: string;
  rollNo: string;
  testDate: string;
  testTime: string;
  testCenter: string;
  examName: string;
  headerImgUrl: string;
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

export default function ResultPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [rightVal, setRightVal] = useState(1.0);
  const [wrongVal, setWrongVal] = useState(0.25);
  const [noData, setNoData] = useState(false);

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
            {resultData.headerImgUrl && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultData.headerImgUrl} alt="Exam Header Logo" className="exam-logo" />
              </div>
            )}
            {resultData.examName && (
              <h1 className="exam-name-title">{resultData.examName}</h1>
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

        </div>
      </div>
    </main>
  );
}
