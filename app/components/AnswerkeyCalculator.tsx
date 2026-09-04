'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { processAnswerKeyAction, logUserRankAction, fetchLiveRankAction } from '../actions/calculate';
import { cbtSave, cbtGet, cbtRemove, cbtSaveString, cbtGetString, STORAGE_KEYS } from '../utils/storage';

const DEFAULT_RRB_ZONES = [
  "Ahmedabad", "Ajmer", "Prayagraj (Allahabad)", "Bengaluru (Bangalore)", "Bhopal", 
  "Bhubaneswar", "Bilaspur", "Chandigarh", "Chennai", "Gorakhpur", "Guwahati", 
  "Jammu Srinagar", "Kolkata", "Malda", "Mumbai", "Muzaffarpur", "Patna", 
  "Ranchi", "Secunderabad", "Siliguri", "Thiruvananthapuram"
];

const DEFAULT_STATES = [
  "Andaman & Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", 
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

const DEFAULT_LANGUAGES = [
  "Assamese", "Bengali", "English", "Gujarati", "Hindi", "Kannada", 
  "Malayalam", "Marathi", "Odia", "Punjabi", "Tamil", "Telugu", "Urdu"
];

function isRRBSlug(slug: string): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase();
  return s.includes('rrb') || s.includes('railway') || s.includes('alp') ||
    s.includes('technician') || s.includes('paramedical') || s.includes('ntpc');
}

function urlHasHtmlExtension(raw: string): boolean {
  if (!raw) return false;
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
    return /\.html$/i.test(parsed.pathname);
  } catch (e) {
    return /\.html$/i.test(raw.split('?')[0].split('#')[0]);
  }
}

function isDigialmHost(raw: string): boolean {
  if (!raw) return false;
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
    const host = (parsed.hostname || '').toLowerCase();
    const fullUrl = raw.toLowerCase();

    return host === 'digialm.com' || host.endsWith('.digialm.com') ||
           host === 'tcsion.com' || host.endsWith('.tcsion.com') ||
           fullUrl.includes('assessmentqp') || fullUrl.includes('touchstone') || fullUrl.includes('per/g');
  } catch (e) { return false; }
}

function isCbexamsHost(raw: string): boolean {
  if (!raw) return false;
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
    const host = (parsed.hostname || '').toLowerCase();
    return host === 'cbexams.com' || host.endsWith('.cbexams.com');
  } catch (e) { return false; }
}

interface ParseResult {
  correctCount: number;
  wrongCount: number;
  bonusCount?: number;
  rawBonusQuestions?: string | number;
  unattemptedCount: number;
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
  sections: Array<{ name: string; total: number; correct: number; wrong: number; bonus?: number; unattempted: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questionsSummary?: Array<any>;
}

function cleanCandidateVal(raw: any): string {
  if (raw === undefined || raw === null) return '';
  return String(raw).replace(/^[:\s-]+/, '').trim();
}

// Normalize JSON data received from parser clusters (DigiALM & CBExams)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSmartApiResponse(data: any, baseUrl: string): ParseResult {
  const info = data.candidate_info || {};
  const score = data.score_summary || {};
  const secSummary = data.section_summary || {};
  
  const candidateName = cleanCandidateVal(info['Applicant Name'] || info['Candidate Name'] || info['Participant Name'] || info['Name'] || data.candidateName || data.name || 'Verified Candidate');
  const rollNo = cleanCandidateVal(info['Roll Number'] || info['Roll No'] || info['Roll No.'] || info['Registration Number'] || info['Registration No'] || info['Application Id'] || info['Application ID'] || info['Participant ID'] || info['Candidate ID'] || info['User ID'] || Object.entries(info).find(([k]) => /roll|registration|participant\s*id|candidate\s*id|user\s*id|appl(ication)?\s*(id|no)|ticket/i.test(k))?.[1] || data.rollNo || data.exam_info?.user_id || '');
  const testDate = cleanCandidateVal(info['Test Date'] || info['Exam Date'] || info['Date of Exam'] || data.testDate || data.exam_info?.exam_date || '');
  const testTime = cleanCandidateVal(info['Test Time'] || info['Test Time and Shift'] || info['Exam Time'] || info['Shift'] || info['Shift Timing'] || data.testTime || data.exam_info?.exam_time || '');
  const testCenter = cleanCandidateVal(info['Test Centre Name'] || info['Test Center Name'] || info['Test Centre'] || info['Centre Name'] || info['Center Name'] || info['Venue'] || data.testCenter || '');
  const examName = cleanCandidateVal(info['Subject'] || info['Assessment Name'] || info['Post Name'] || info['Exam Name'] || info['Exam'] || data.header_banner_text || data.exam_info?.detected_exam_name || data.examName || '');
  const examId = cleanCandidateVal(data.exam_info?.exam_id || data.exam_id || '');
  const headerImgUrl = data.header_banner_img || data.header_image || data.headerImgUrl || data.logo || '';
  const headerBannerText = data.header_banner_text || data.headerBannerText || examName || '';
  const questionsSummary = data.questions_summary || data.questions || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: Array<{ name: string; total: number; correct: number; wrong: number; bonus?: number; unattempted: number }> = [];

  // Parse section_summary object map or sections array
  if (typeof secSummary === 'object' && secSummary !== null && Object.keys(secSummary).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.entries(secSummary).forEach(([secName, secObj]: [string, any]) => {
      if (secObj && typeof secObj === 'object') {
        const correct = Number(secObj.correct_answers ?? secObj.correct ?? 0);
        const wrong = Number(secObj.wrong_answers ?? secObj.wrong ?? 0);
        const unattempted = Number(secObj.unattempted ?? 0);
        const bonus = Number(secObj.bonus_questions ?? secObj.bonus ?? 0);
        const total = Number(secObj.total_questions ?? secObj.total ?? (correct + wrong + unattempted));
        sections.push({ name: secName, total, correct, wrong, bonus, unattempted });
      }
    });
  } else if (Array.isArray(data.sections)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections.push(...data.sections.map((sec: any, idx: number) => ({
      name: sec.name || sec.section_name || `Section ${idx + 1}`,
      total: Number(sec.total ?? sec.total_questions ?? 0),
      correct: Number(sec.correct ?? sec.correct_answers ?? 0),
      wrong: Number(sec.wrong ?? sec.wrong_answers ?? 0),
      bonus: Number(sec.bonus ?? sec.bonus_questions ?? 0),
      unattempted: Number(sec.unattempted ?? 0),
    })));
  }

  const rawBonus = score.bonus_questions ?? data.bonus_questions ?? data.score_summary?.bonus_questions ?? '';
  const bonusCount = (rawBonus !== '' && rawBonus !== null && rawBonus !== undefined && !isNaN(Number(rawBonus))) ? Number(rawBonus) : 0;

  let correctCount = Number(score.correct_answers ?? data.correctCount ?? 0);
  let wrongCount = Number(score.wrong_answers ?? data.wrongCount ?? 0);
  let unattemptedCount = Number(score.unattempted ?? data.unattemptedCount ?? 0);

  if (correctCount === 0 && wrongCount === 0 && sections.length > 0) {
    sections.forEach(s => {
      correctCount += s.correct;
      wrongCount += s.wrong;
      unattemptedCount += s.unattempted;
    });
  }

  const infoRows: Array<{ label: string; value: string }> = [];
  if (typeof info === 'object' && info !== null && Object.keys(info).length > 0) {
    Object.entries(info).forEach(([label, value]) => {
      const cleanVal = cleanCandidateVal(value);
      if (cleanVal !== '') {
        const cleanLabel = /community|caste/i.test(label) ? 'Community' : label.replace(/^[:\s-]+/, '').replace(/[:\s-]+$/, '').trim();
        infoRows.push({ label: cleanLabel, value: cleanVal });
      }
    });
  } else {
    if (candidateName) infoRows.push({ label: 'Candidate Name', value: candidateName });
    if (rollNo) infoRows.push({ label: 'Roll Number', value: rollNo });
    if (testDate) infoRows.push({ label: 'Test Date', value: testDate });
    if (testTime) infoRows.push({ label: 'Test Time', value: testTime });
    if (testCenter) infoRows.push({ label: 'Test Center', value: testCenter });
    if (examName) infoRows.push({ label: 'Subject', value: examName });
  }

  return {
    correctCount,
    wrongCount,
    bonusCount,
    rawBonusQuestions: rawBonus,
    unattemptedCount,
    candidateName,
    rollNo,
    testDate,
    testTime,
    testCenter,
    examName,
    examId,
    headerImgUrl,
    headerBannerText,
    infoRows,
    sections,
    questionsSummary
  };
}

// ─────────────────────────────────────────────────────────────────
// Props: examSlug = the URL slug (e.g. "osssc-ri-ari-amin-icds-sfs-junior-assistant")
function formatExamSlugTitle(slug: string): string {
  if (!slug) return 'Answer Key Calculator';
  const formatted = slug
    .split('-')
    .map((w: string) => {
      const upper = w.toUpperCase();
      if (['RRB', 'SSC', 'NTPC', 'CBT', 'UG', 'JE', 'CHSL', 'CGL', 'MTS', 'GD', 'OSSSC', 'OSSC', 'RI', 'ARI', 'AMIN', 'SFS', 'ICDS', 'AWO', 'TPO', 'ASI', 'SI'].includes(upper)) {
        return upper;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
  return `${formatted} Answer Key Calculator`;
}

interface AnswerkeyCalculatorProps {
  examSlug?: string;
  initialTitle?: string;
}

export default function AnswerkeyCalculator({ examSlug = '', initialTitle = '' }: AnswerkeyCalculatorProps) {
  const router = useRouter();

  const isRRB = isRRBSlug(examSlug);
  const defaultBannerTitle = initialTitle || formatExamSlugTitle(examSlug);
  const [bannerTitle, setBannerTitle] = useState(defaultBannerTitle);
  const [bannerSub, setBannerSub] = useState('Paste your official answer key URL and add your exam details.');
  const [locations, setLocations] = useState<string[]>(isRRB ? DEFAULT_RRB_ZONES : DEFAULT_STATES);
  const [locationLabel, setLocationLabel] = useState(isRRB ? 'RRB Zones' : 'State / UT');
  const [locationLoading, setLocationLoading] = useState(false);
  const [languages, setLanguages] = useState<string[]>(DEFAULT_LANGUAGES);
  const [langLoading, setLangLoading] = useState(false);
  const [showHtmlPaste, setShowHtmlPaste] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [btnText, setBtnText] = useState('Calculate Marks & Rank');
  const [progressStep, setProgressStep] = useState(0); // 0=idle 1=fetching 2=parsing 3=ranking 4=saving
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState({
    ans_key_url: '',
    ans_key_html: '',
    category: '',
    horizontal_category: 'none',
    gender: '',
    paper_language: '',
    state: '',
    consent: false,
  });

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 4000);
  }

  // Apply exam object data to form state
  function applyExamData(examObj: Record<string, unknown>, slug: string) {
    const title = (examObj.title as string) || '';
    const subtitle = (examObj.subtitle as string) || `Paste your ${title || 'exam'} official answer key URL and add your exam details.`;
    const groupLabel = (examObj.location_type_id as string) || (isRRBSlug(slug) ? 'RRB Zones' : 'State / UT');
    
    if (title) {
      setBannerTitle(title.toLowerCase().includes('answer key') ? title : `${title} Answer Key Calculator`);
    } else {
      setBannerTitle(defaultBannerTitle);
    }
    setBannerSub(subtitle);
    setLocationLabel(groupLabel);

    // Save default exam marking scheme if provided
    if (examObj.marks_right !== undefined) {
      cbtSaveString(STORAGE_KEYS.MARKS_RIGHT, String(examObj.marks_right));
    }
    if (examObj.marks_wrong !== undefined) {
      cbtSaveString(STORAGE_KEYS.MARKS_WRONG, String(examObj.marks_wrong));
    }

    let locArray: string[] = [];
    if (Array.isArray(examObj.location_id)) {
      locArray = examObj.location_id as string[];
    } else if (typeof examObj.location_id === 'string' && (examObj.location_id as string).trim()) {
      const str = (examObj.location_id as string).trim();
      if (str.startsWith('[')) {
        try { const parsed = JSON.parse(str); if (Array.isArray(parsed)) locArray = parsed; } catch (e) {}
      }
      if (locArray.length === 0 && str.includes(',')) locArray = str.split(',').map((s: string) => s.trim()).filter(Boolean);
      else if (locArray.length === 0 && str) locArray = [str];
    }

    if (locArray.length > 0) {
      setLocations(locArray);
      setLocationLoading(false);
    } else {
      setLocations(isRRBSlug(slug) ? DEFAULT_RRB_ZONES : DEFAULT_STATES);
      setLocationLabel(isRRBSlug(slug) ? 'RRB Zones' : 'State / UT');
    }
  }

  useEffect(() => {
    if (!examSlug) {
      // Generic /answerkey page — clear old exam marking cache and load default locations
      cbtRemove(STORAGE_KEYS.MARKS_RIGHT);
      cbtRemove(STORAGE_KEYS.MARKS_WRONG);
      cbtRemove(STORAGE_KEYS.ACTIVE_EXAM);
      setLocations(DEFAULT_STATES);
      setLocationLabel('State / UT');
      return;
    }

    // Exam-specific page — try localStorage cache first (0ms)
    try {
      const cachedExam = cbtGet<any>(STORAGE_KEYS.ACTIVE_EXAM);
      if (cachedExam) {
        if (cachedExam.slug === examSlug) {
          applyExamData(cachedExam, examSlug);
          return;
        }
      }
    } catch (e) {}

    // Fallback: apply default zone or state according to slug
    setLocations(isRRBSlug(examSlug) ? DEFAULT_RRB_ZONES : DEFAULT_STATES);
    setLocationLabel(isRRBSlug(examSlug) ? 'RRB Zones' : 'State / UT');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let urlVal = formData.ans_key_url.trim().replace(/#.*$/, '');
    const { category, gender, state, consent } = formData;

    if (!urlVal || !category || !gender || !state || !consent) {
      showToast('Please fill all required fields (URL, Category, Gender, State / UT).');
      return;
    }

    if (!/^https?:\/\//i.test(urlVal)) urlVal = 'https://' + urlVal;
    try {
      const parsed = new URL(urlVal);
      parsed.pathname = parsed.pathname.replace(/\/+/g, '/');
      urlVal = parsed.toString();
    } catch (e) {}

    setSubmitting(true);
    setBtnText('Processing...');
    setProgressStep(1); // Step 1: Fetching answer key

    let parsedResult: ParseResult | null = null;
    let rawSmartData: any = null;

    try {
      const actionRes = await processAnswerKeyAction({
        url: urlVal,
        category,
        gender,
        state,
        examSlug
      });

      if (actionRes && actionRes.success && actionRes.data) {
        rawSmartData = actionRes.data;
        setProgressStep(2); // Step 2: Parsing data
        parsedResult = normalizeSmartApiResponse(actionRes.data, urlVal);
      } else {
        showToast((actionRes && actionRes.error) || 'Failed to fetch scorecard. Please check URL.');
        setSubmitting(false);
        setBtnText('Calculate Marks & Rank');
        setProgressStep(0);
        return;
      }
    } catch (err) {
      showToast('Network error while connecting to server. Please try again.');
      setSubmitting(false);
      setBtnText('Calculate Marks & Rank');
      setProgressStep(0);
      return;
    }

    if (!parsedResult) {
      showToast('No data found or Invalid Answer Key URL. Please check and retry.');
      setSubmitting(false);
      setBtnText('Calculate Marks & Rank');
      setProgressStep(0);
      return;
    }

    // Valid URL and User rank are securely processed server-side

    let domainHost = '';
    try { domainHost = new URL(urlVal).hostname; } catch (e) {}
    const userRoll = (rawSmartData?.exam_info?.user_id) || (parsedResult.rollNo) || (parsedResult.candidateName) || '';
    const examPaperCode = (rawSmartData?.exam_info?.exam_id) || '';
    const testExamDate = (rawSmartData?.exam_info?.exam_date) || (parsedResult.testDate) || '';
    const testExamTime = (rawSmartData?.exam_info?.exam_time) || (parsedResult.testTime) || '';
    const apiRight = rawSmartData?.exam_info?.marking_scheme_applied?.marks_right;
    const apiWrong = rawSmartData?.exam_info?.marking_scheme_applied?.marks_wrong;

    const savedRight = cbtGetString(STORAGE_KEYS.MARKS_RIGHT);
    const savedWrong = cbtGetString(STORAGE_KEYS.MARKS_WRONG);
    const marksRight = (savedRight !== null && savedRight !== undefined && savedRight !== '')
      ? parseFloat(savedRight)
      : (apiRight !== undefined && apiRight !== null ? Number(apiRight) : 1.0);
    let marksWrong = (savedWrong !== null && savedWrong !== undefined && savedWrong !== '')
      ? parseFloat(savedWrong)
      : (apiWrong !== undefined && apiWrong !== null ? Number(apiWrong) : (isRRBSlug(examSlug) ? (1 / 3) : 0.25));

    if (Math.abs(marksWrong - 0.33) <= 0.01 || Math.abs(marksWrong - (1 / 3)) <= 0.01) {
      marksWrong = 1 / 3;
    }

    const effectiveBonus = parsedResult.bonusCount || 0;
    const rawScoreVal = ((parsedResult.correctCount + effectiveBonus) * marksRight) - (parsedResult.wrongCount * marksWrong);

    // Safely log candidate ranking data into user_ranks table asynchronously
    try {
      logUserRankAction({
        user_id: userRoll,
        url: urlVal,
        exam_slug: examSlug || 'general',
        paper_language: formData.paper_language || 'English',
        url_hash: '',
        total_marks: rawScoreVal,
        exam_date: testExamDate,
        exam_time: testExamTime,
        exam_id: examPaperCode,
        location: state || '',
        gender: gender || '',
        category: category || '',
        domain: domainHost
      });
    } catch (e) {}

    setProgressStep(3); // Step 3: Fetching live rank
    let liveRankObj: any = null;
    try {
      const liveRes = await fetchLiveRankAction({
        examId: examPaperCode,
        examDate: testExamDate,
        examTime: testExamTime,
        category: category || 'UR',
        gender: gender || '',
        totalMarks: rawScoreVal,
        userId: userRoll,
        url: urlVal
      });
      if (liveRes && liveRes.success && liveRes.data) {
        liveRankObj = liveRes.data;
      }
    } catch (e) {}

    setProgressStep(4); // Step 4: Saving & redirecting
    const overallRank = liveRankObj ? liveRankObj.overallRank : 1;
    const shiftRank = liveRankObj ? liveRankObj.shiftRank : 1;
    const categoryRank = liveRankObj ? liveRankObj.categoryRank : 1;
    const genderRank = liveRankObj ? (liveRankObj.genderRank || 1) : 1;

    const isDigialm = isDigialmHost(urlVal);
    const isCbexams = isCbexamsHost(urlVal);
    const providerType = isDigialm ? 'Digialm' : (isCbexams ? 'CBExams' : 'Official Portal');

    try {
      cbtSave(STORAGE_KEYS.FORM_DATA, {
        ans_key_url: urlVal,
        category,
        horizontal_category: formData.horizontal_category,
        gender,
        state,
        location_label: locationLabel,
        paper_language: formData.paper_language,
        provider_type: providerType,
        marks_right: marksRight,
        marks_wrong: marksWrong,
        exam_slug: examSlug || 'general',
        exam_id: examPaperCode,
      });
      cbtSave(STORAGE_KEYS.RESULT_DATA, {
        ...parsedResult,
        examId: examPaperCode,
        gender: gender || '',
        category: category || '',
        overallRank, shiftRank, categoryRank, genderRank,
        liveRank: liveRankObj,
      });
      cbtSaveString(STORAGE_KEYS.SHOW_TG_POPUP, 'true');
    } catch (e) {}

    router.push('/result');
  }

  return (
    <main>
      <div className="answerkey-main">

        {/* Toast */}
        <div className={`toast-container${toastVisible ? ' show' : ''}`} id="toast-container">
          <div className="toast-box">
            <div className="toast-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p className="toast-title">Error</p>
              <p className="toast-msg">{toastMsg}</p>
            </div>
            <button className="toast-close" onClick={() => setToastVisible(false)}>&times;</button>
          </div>
        </div>

        {/* Calculator Card */}
        <div className="calculator-card">
          <div className="top-accent-bar"></div>

          <div className="banner-header">
            <div className="badge-pill">
              <span className="green-dot"></span>
              CBT RANK
            </div>
            <h1 className="banner-title" id="banner-exam-title">{bannerTitle}</h1>
            <p className="banner-sub" id="banner-exam-sub">{bannerSub}</p>
          </div>

          <div className="card-body">
            <form id="anskey-form" autoComplete="off" noValidate onSubmit={handleSubmit}>

              {/* Answer Key URL */}
              <div className="ak-form-group">
                <label htmlFor="ans_key_url">Answer Key URL <span className="star">*</span></label>
                <input
                  type="url" id="ans_key_url" className="ak-form-input font-mono"
                  placeholder="Paste your official Answerkey Link" required
                  value={formData.ans_key_url}
                  onChange={e => setFormData(prev => ({ ...prev, ans_key_url: e.target.value }))}
                />
                <p className="help-text">Use the official answer key link (the page where questions are visible).</p>
              </div>

              {/* HTML Paste (shown on demand) */}
              {showHtmlPaste && (
                <div className="ak-form-group" id="html-paste-group">
                  <label htmlFor="ans_key_html">
                    Paste Answer Key HTML Source{' '}
                    <span style={{ color: '#64748b', fontWeight: 500 }}>(Optional — if URL is blocked)</span>
                  </label>
                  <textarea id="ans_key_html" className="ak-form-textarea"
                    placeholder="Press Ctrl+U on answer key page → Ctrl+A → Ctrl+C → Paste here"
                    value={formData.ans_key_html}
                    onChange={e => setFormData(prev => ({ ...prev, ans_key_html: e.target.value }))}
                  />
                  <p className="help-text">Only needed if the direct URL fetch fails due to security restrictions.</p>
                </div>
              )}

              {/* Category & Horizontal Category */}
              <div className="form-grid">
                <div className="ak-form-group">
                  <label htmlFor="category">Category <span className="star">*</span></label>
                  <select id="category" className="ak-form-select" required
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="">Select Category</option>
                    <option value="UR">UR</option>
                    <option value="OBC">OBC</option>
                    <option value="EWS">EWS</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div className="ak-form-group">
                  <label htmlFor="horizontal_category">Horizontal Category</label>
                  <select id="horizontal_category" className="ak-form-select"
                    value={formData.horizontal_category}
                    onChange={e => setFormData(prev => ({ ...prev, horizontal_category: e.target.value }))}>
                    <option value="none">None</option>
                    <option value="exsm">EX SM (Ex-Serviceman)</option>
                    <option value="oh">OH (Orthopedically Handicapped)</option>
                    <option value="vh">VH (Visually Handicapped)</option>
                    <option value="hh">HH (Hearing Handicapped)</option>
                    <option value="other-pwd">Other PWD</option>
                  </select>
                </div>
              </div>

              {/* Gender & Paper Language */}
              <div className="form-grid">
                <div className="ak-form-group">
                  <label htmlFor="gender">Gender <span className="star">*</span></label>
                  <select id="gender" className="ak-form-select" required
                    value={formData.gender ? (formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).toLowerCase()) : ''}
                    onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="ak-form-group">
                  <label htmlFor="paper_language">Paper Language</label>
                  <select id="paper_language" className="ak-form-select"
                    value={formData.paper_language}
                    disabled={langLoading}
                    onChange={e => setFormData(prev => ({ ...prev, paper_language: e.target.value }))}>
                    {langLoading ? (
                      <option value="">Loading Languages...</option>
                    ) : (
                      <>
                        <option value="">Select Language (Optional)</option>
                        {languages.map(lang => (
                          <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* State / UT / Location */}
              <div className="ak-form-group">
                <label htmlFor="state">{locationLabel} <span className="star">*</span></label>
                <select id="state" className="ak-form-select" required
                  value={formData.state}
                  disabled={locationLoading}
                  onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}>
                  {locationLoading ? (
                    <option value="">Loading {locationLabel}...</option>
                  ) : (
                    <>
                      <option value="">Select {locationLabel}</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Consent */}
              <div className="consent-row">
                <label className="checkbox-container" htmlFor="consentCheck">
                  <input type="checkbox" id="consentCheck"
                    checked={formData.consent}
                    onChange={e => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                  />
                  <span className="consent-text">Your submitted data will only be used to calculate your marks &amp; rank.</span>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" id="submitBtn" className="btn-submit"
                disabled={submitting || !formData.consent}>
                <span id="btn-text">{btnText}</span>
              </button>

              {/* Real-time Calculation Progress Feedback */}
              {submitting && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                      {progressStep === 1 && '⏳ Connecting & Fetching Answer Key...'}
                      {progressStep === 2 && '🔍 Parsing Response Sheet & Extracting Answers...'}
                      {progressStep === 3 && '📊 Computing Negative Marking & Querying Live Ranks...'}
                      {progressStep === 4 && '🚀 Finalizing Scorecard & Redirecting...'}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb' }}>
                      {progressStep === 1 && '25%'}
                      {progressStep === 2 && '50%'}
                      {progressStep === 3 && '75%'}
                      {progressStep === 4 && '100%'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '999px',
                    background: '#e2e8f0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: progressStep === 1 ? '25%' : progressStep === 2 ? '50%' : progressStep === 3 ? '75%' : '100%',
                      background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease-in-out'
                    }} />
                  </div>

                  {/* Micro Steps Indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    <span style={{ color: progressStep >= 1 ? '#2563eb' : '#94a3b8' }}>1. Fetch</span>
                    <span style={{ color: progressStep >= 2 ? '#2563eb' : '#94a3b8' }}>2. Parse</span>
                    <span style={{ color: progressStep >= 3 ? '#2563eb' : '#94a3b8' }}>3. Calculate</span>
                    <span style={{ color: progressStep >= 4 ? '#2563eb' : '#94a3b8' }}>4. Ready</span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Rich SEO & Informational Content Cards */}
        <div className="details-wrapper" style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Card 1: Hero Welcome & Overview */}
          <div className="info-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '24px 22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }} />
              All-India Exam Evaluation Portal
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              Latest Government Exam Answer Keys &amp; Score Calculator 2025–2026
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>
              Welcome to <strong>CBTRank</strong> — your premier online platform to check the latest government recruitment answer keys, calculate accurate normalized &amp; raw scores, and evaluate your category and shift-wise performance. We support major competitive examinations conducted by <strong>SSC, RRB (Railways), Banking (IBPS &amp; SBI), State PSCs, Defence, and Teaching</strong> recruitment authorities.
            </p>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.65, margin: '10px 0 0 0', fontWeight: 500 }}>
              Candidates can easily paste their official response sheet links to get an instant section-wise breakdown, accurate negative marking deductions, and rank predictions before official merit lists are declared.
            </p>
          </div>

          {/* Card 2: Popular Exams Grid */}
          <div className="info-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '24px 22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              🏆 Popular Competitive Exams Supported on CBTRank
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Access automated score calculation and answer key analysis for top national and state examinations:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              
              {/* Railway Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0369a1', marginBottom: '6px' }}>
                  🚆 Railway Recruitment (RRB)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                  RRB NTPC (UG/Grad), RRB ALP, RRB Technician, RRB Group D, RRB JE, RPF SI &amp; Constable.
                </div>
              </div>

              {/* SSC Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '6px' }}>
                  🏛️ Staff Selection Commission (SSC)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                  SSC CGL, SSC CHSL, SSC MTS, SSC GD Constable, SSC CPO SI, SSC Stenographer, Selection Posts.
                </div>
              </div>

              {/* Banking Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #059669', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#047857', marginBottom: '6px' }}>
                  🏦 Banking &amp; Financial Boards
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                  IBPS PO &amp; Clerk, SBI PO &amp; Clerk, IBPS RRB Scale I &amp; Assistant, RBI Assistant, SEBI &amp; NABARD.
                </div>
              </div>

              {/* Teaching Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #7c3aed', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#6d28d9', marginBottom: '6px' }}>
                  🎓 Teaching &amp; Education Boards
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                  CTET, State TETs (UPTET, REET, BTET), DSSSB PRT/TGT/PGT, KVS, NVS, EMRS exams.
                </div>
              </div>

              {/* State PSC Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #d97706', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#b45309', marginBottom: '6px' }}>
                  📋 State PSC &amp; Subordinate Boards
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                  UPPSC, BPSC, MPPSC, RPSC, WBCS, APPSC, TSPSC, UPSSSC, OSSSC &amp; State Police Recruitments.
                </div>
              </div>

              {/* Defence Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#b91c1c', marginBottom: '6px' }}>
                  🛡️ Defence &amp; Police Services
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55 }}>
                  NDA, CDS, AFCAT, Indian Navy, Indian Army Agniveer, State Police Sub-Inspector &amp; Constables.
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: Step-by-Step Guide */}
          <div className="info-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '24px 22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h3 id="info-how-to-title" style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              📋 How to Check Answer Key &amp; Calculate Your Marks on CBTRank
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Follow these simple steps to calculate your exact marks, accuracy percentage, and shift rankings:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>1</span>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Copy Response Link</strong>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Open your official exam candidate portal and copy the response sheet / answer key URL from your browser address bar.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>2</span>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Paste URL Above</strong>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Paste the copied link into the <strong>&ldquo;Answer Key URL&rdquo;</strong> input field in our calculator above.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>3</span>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Select Details</strong>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Choose your applicable <strong>Category</strong> (UR/OBC/EWS/SC/ST), <strong>Gender</strong>, and <strong>State / UT</strong>.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>4</span>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>View Instant Report</strong>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Click <strong>&ldquo;Calculate Marks &amp; Rank&rdquo;</strong> to instantly view your verified score, negative marks, and rank analysis.
                </p>
              </div>

            </div>
          </div>

          {/* Card 4: Key Benefits & Features */}
          <div className="info-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '24px 22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              ⭐ Key Benefits of Using the CBTRank Answer Key Calculator
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Why thousands of government exam aspirants trust CBTRank for score evaluation:
            </p>

            <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div className="feature-box blue">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>⚡ Instant Automated Calculation</h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Eliminates manual error by applying exact exam marking schemes including negative marking rules (+1, -0.25, -0.33, etc.) automatically.
                </p>
              </div>

              <div className="feature-box green">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📊 Section-Wise Deep Breakdown</h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Get complete subject-by-subject insights with precise counts of Correct, Wrong, and Unattempted questions.
                </p>
              </div>

              <div className="feature-box purple">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🎯 Shift &amp; Category Ranking</h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Benchmark your performance across all candidates in your shift session and reservation category quota.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#d97706', marginBottom: '8px' }}>
                  📄 1-Click PDF / Image Scorecard
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Download a beautifully formatted, official-style scorecard PDF/image directly to your device for future records.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0284c7', marginBottom: '8px' }}>
                  🔒 100% Free &amp; Zero Sign-Up
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  No mandatory registration or personal credentials needed. Completely free public evaluation utility for all candidates.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ec4899', marginBottom: '8px' }}>
                  📱 Ultra-Fast &amp; Mobile Responsive
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Engineered for lightning-fast parsing on mobile phones, tablets, and desktop computers without delays.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Objection Process & Next Steps */}
          <div className="info-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '24px 22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              📝 Answer Key Objection &amp; Challenge Process
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: '0 0 12px 0' }}>
              Most recruitment authorities (such as SSC, RRB, and NTA) offer a provisional objection window (typically 3 to 7 days) allowing candidates to challenge disputed questions. If you find any discrepancies:
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.7 }}>
              <li><strong>Verify with Standard References:</strong> Double-check the disputed question against standard NCERT or recognized authoritative reference books.</li>
              <li><strong>Note Question &amp; Option IDs:</strong> Identify the unique Question ID and Option ID displayed in your official response sheet.</li>
              <li><strong>Submit on Official Board Portal:</strong> Log in to the official exam authority&apos;s objection management portal within the specified challenge dates.</li>
              <li><strong>Attach Documentary Proof:</strong> Upload clear scanned pages of your reference material and pay the prescribed fee per question (refundable if the challenge is accepted).</li>
              <li><strong>Final Answer Key Updates:</strong> The board reviews all challenges with subject matter experts before releasing the final normalized merit list.</li>
            </ul>
          </div>

          {/* Card 6: Why Evaluating Score Early Matters */}
          <div className="info-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '24px 22px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              💡 Why Checking Your Answer Key Early is Essential
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: '0 0 12px 0' }}>
              Evaluating your performance immediately after the official key release offers significant tactical advantages:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>🎯 Estimate Selection Cut-Offs</strong>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Compare your raw score with expected category cut-offs to understand your qualifying chances.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>📚 Plan Tier-II &amp; Skill Tests</strong>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Begin early targeted preparation for Mains, Typing, PET, or Interview rounds without losing crucial weeks.
                </p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>🔍 Identify Negative Mark Traps</strong>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Analyze weak chapters or recurring mistakes to optimize your question selection strategy for upcoming exams.
                </p>
              </div>
            </div>
          </div>

          {/* Card 7: Legal Disclaimer */}
          <div className="info-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '16px 18px' }}>
            <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
              <strong>⚖️ Disclaimer:</strong> CBTRank is an independent educational score estimation and rank analysis utility created to help candidates calculate indicative scores. CBTRank is not associated with, affiliated with, or endorsed by any government department, board, or examination authority. Official final results, normalized marks, cut-offs, and merit lists are published exclusively by the respective recruitment boards.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
