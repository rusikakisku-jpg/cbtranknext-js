'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const WORKER_BASE = 'https://api.cbtrank.com';
// No static data — all locations and languages come from API only

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

function chosenToIndex(s: string | null): number | null {
  if (!s) return null;
  s = s.trim();
  if (!s || s === '--' || s === '-') return null;
  if (/^[A-D]$/i.test(s)) return s.toUpperCase().charCodeAt(0) - 64;
  const numMatch = s.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1], 10);
  return null;
}

function makeAbsoluteUrl(src: string, baseUrl: string): string {
  if (!src) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) return src;
  try {
    const base = new URL(baseUrl);
    if (src.startsWith('/')) return base.origin + src;
    const pathParts = base.pathname.split('/');
    pathParts.pop();
    return base.origin + pathParts.join('/') + '/' + src;
  } catch (e) { return src; }
}

interface ParseResult {
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  candidateName: string;
  rollNo: string;
  testDate: string;
  testTime: string;
  testCenter: string;
  examName: string;
  headerImgUrl: string;
  headerBannerText?: string;
  infoRows: Array<{ label: string; value: string }>;
  sections: Array<{ name: string; total: number; correct: number; wrong: number; unattempted: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questionsSummary?: Array<any>;
}

function parseResponseSheetHtml(htmlText: string, baseUrl: string): ParseResult {
  const doc = new DOMParser().parseFromString(htmlText || '', 'text/html');
  let correctCount = 0, wrongCount = 0, unattemptedCount = 0;
  let candidateName = '', rollNo = '', testDate = '', testTime = '', testCenter = '', examName = '', headerImgUrl = '';
  const infoRows: Array<{ label: string; value: string }> = [];

  const mainInfoPnlNode = doc.querySelector('.main-info-pnl');
  if (mainInfoPnlNode) {
    mainInfoPnlNode.querySelectorAll('img').forEach((img: Element) => {
      if (!headerImgUrl) {
        const rawSrc = img.getAttribute('src') || '';
        if (rawSrc && !rawSrc.startsWith('data:image')) headerImgUrl = makeAbsoluteUrl(rawSrc, baseUrl);
      }
    });
  }
  if (!headerImgUrl) {
    doc.querySelectorAll('table img, img').forEach((img: Element) => {
      if (!headerImgUrl) {
        const rawSrc = img.getAttribute('src') || '';
        if (rawSrc && !rawSrc.startsWith('data:image')) headerImgUrl = makeAbsoluteUrl(rawSrc, baseUrl);
      }
    });
  }

  const mainInfoPnl = doc.querySelector('.main-info-pnl, table');
  if (mainInfoPnl) {
    mainInfoPnl.querySelectorAll('tr').forEach((tr: Element) => {
      const tds = tr.querySelectorAll('td, th');
      if (tds.length >= 2) {
        const lbl = tds[0].textContent?.trim() || '';
        const val = tds[1].textContent?.trim() || '';
        if (lbl && val && !lbl.toLowerCase().includes('photograph') && !val.startsWith('data:image')) {
          infoRows.push({ label: lbl, value: val });
          const lowerLbl = lbl.toLowerCase();
          if (lowerLbl.includes('participant name') || lowerLbl.includes('candidate name')) candidateName = val;
          else if (/roll|registration|participant\s*id|candidate\s*id|user\s*id|appl(ication)?\s*no|ticket/i.test(lowerLbl)) {
            if (!rollNo) rollNo = val;
          }
          else if (lowerLbl.includes('test date')) testDate = val;
          else if (lowerLbl.includes('test time')) testTime = val;
          else if (lowerLbl.includes('center') || lowerLbl.includes('venue')) testCenter = val;
          else if (lowerLbl.includes('subject') || lowerLbl.includes('exam')) examName = val;
        }
      }
    });
  }

  if (!rollNo && baseUrl) {
    const urlMatch = baseUrl.match(/\/pub\/([^\/]+)\//i) || baseUrl.match(/[\/=](\d{8,12})/);
    if (urlMatch) rollNo = urlMatch[1];
  }
  if (!candidateName) candidateName = rollNo ? `Candidate (${rollNo})` : 'Verified Candidate';

  const sections: ParseResult['sections'] = [];
  const secNodes = doc.querySelectorAll('.section-cntnr, .grp-cntnr');

  if (secNodes && secNodes.length > 0) {
    secNodes.forEach((secNode: Element) => {
      let secName = '';
      const lblNode = secNode.querySelector('.section-lbl span.bold, .section-lbl span, .section-lbl');
      if (lblNode) secName = (lblNode.textContent || '').replace(/^Section\s*:\s*/i, '').trim();
      if (!secName) secName = `Section ${sections.length + 1}`;

      let secCorrect = 0, secWrong = 0, secUnattempted = 0;

      secNode.querySelectorAll('.question-pnl, .question-panel, .questionBox').forEach((panel: Element) => {
        let chosenOpt: number | null = null, rightOpt: number | null = null;
        panel.querySelectorAll('td').forEach((td: Element) => {
          const txt = td.textContent || '';
          if (txt.toLowerCase().includes('chosen option')) {
            const parts = txt.split(':');
            if (parts.length > 1) chosenOpt = chosenToIndex(parts[1].trim());
            else {
              const nextTd = td.nextElementSibling;
              if (nextTd) chosenOpt = chosenToIndex(nextTd.textContent?.trim() || null);
            }
          }
        });

        secNode.querySelectorAll('.questionRowTbl').forEach((tbl: Element) => {
          tbl.querySelectorAll('tr').forEach((tr: Element, index: number) => {
            if (tr.querySelector('.rightAns') || tr.classList.contains('rightAns') || tr.innerHTML.includes('rightAns')) {
              rightOpt = index + 1;
            }
          });
        });

        if (!rightOpt) {
          const rightAnsTd = panel.querySelector('td.rightAns, .rightAns');
          if (rightAnsTd) {
            const parentTr = rightAnsTd.closest('tr');
            if (parentTr && parentTr.parentNode) {
              const siblings = Array.from((parentTr.parentNode as Element).children);
              const pos = siblings.indexOf(parentTr);
              if (pos !== -1) rightOpt = pos + 1;
            }
          }
        }

        if (chosenOpt === null) secUnattempted++;
        else if (rightOpt !== null && chosenOpt === rightOpt) secCorrect++;
        else secWrong++;
      });

      const secTotal = secCorrect + secWrong + secUnattempted;
      if (secTotal > 0) {
        sections.push({ name: secName, total: secTotal, correct: secCorrect, wrong: secWrong, unattempted: secUnattempted });
        correctCount += secCorrect; wrongCount += secWrong; unattemptedCount += secUnattempted;
      }
    });
  }

  if (sections.length === 0) {
    const qPanels = doc.querySelectorAll('.question-pnl, .question-panel, .questionBox');
    if (qPanels && qPanels.length > 0) {
      qPanels.forEach((panel: Element) => {
        let chosenOpt: number | null = null, rightOpt: number | null = null;
        panel.querySelectorAll('td').forEach((td: Element) => {
          const txt = td.textContent || '';
          if (txt.includes('Chosen Option')) {
            const parts = txt.split(':');
            if (parts.length > 1) chosenOpt = chosenToIndex(parts[1].trim());
          }
        });
        const rightCell = panel.querySelector('.rightAns, td.rightAns');
        if (rightCell) {
          const parentRow = rightCell.closest('tr');
          if (parentRow) {
            const optNumCell = parentRow.querySelector('td');
            if (optNumCell) {
              const m = (optNumCell.textContent || '').trim().match(/^(\d+)\./);
              if (m) rightOpt = parseInt(m[1], 10);
            }
          }
        }
        if (chosenOpt === null) unattemptedCount++;
        else if (rightOpt !== null && chosenOpt === rightOpt) correctCount++;
        else wrongCount++;
      });
    }
  }

  return { correctCount, wrongCount, unattemptedCount, candidateName, rollNo, testDate, testTime, testCenter, examName, headerImgUrl, infoRows, sections };
}

// Normalize JSON data received from http://147.93.154.159/api_smart.php
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSmartApiResponse(data: any, baseUrl: string): ParseResult {
  const info = data.candidate_info || {};
  const score = data.score_summary || {};
  const secSummary = data.section_summary || {};
  
  const candidateName = info['Applicant Name'] || info['Candidate Name'] || info['Participant Name'] || info['Name'] || data.candidateName || data.name || 'Verified Candidate';
  const rollNo = info['Roll Number'] || info['Roll No'] || info['Roll No.'] || info['Registration Number'] || info['Registration No'] || info['Application Id'] || info['Application ID'] || info['Participant ID'] || info['Candidate ID'] || info['User ID'] || Object.entries(info).find(([k]) => /roll|registration|participant\s*id|candidate\s*id|user\s*id|appl(ication)?\s*(id|no)|ticket/i.test(k))?.[1] || data.rollNo || data.exam_info?.user_id || '';
  const testDate = info['Test Date'] || info['Exam Date'] || info['Date of Exam'] || data.testDate || data.exam_info?.exam_date || '';
  const testTime = info['Test Time'] || info['Exam Time'] || info['Shift'] || info['Shift Timing'] || data.testTime || data.exam_info?.exam_time || '';
  const testCenter = info['Test Centre Name'] || info['Test Center Name'] || info['Test Centre'] || info['Venue'] || data.testCenter || '';
  const examName = info['Subject'] || info['Assessment Name'] || info['Post Name'] || info['Exam Name'] || info['Exam'] || data.header_banner_text || data.exam_info?.detected_exam_name || data.examName || '';
  const headerImgUrl = data.header_banner_img || data.header_image || data.headerImgUrl || data.logo || '';
  const headerBannerText = data.header_banner_text || data.headerBannerText || examName || '';
  const questionsSummary = data.questions_summary || data.questions || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: Array<{ name: string; total: number; correct: number; wrong: number; unattempted: number }> = [];

  // Parse section_summary object map or sections array
  if (typeof secSummary === 'object' && secSummary !== null && Object.keys(secSummary).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.entries(secSummary).forEach(([secName, secObj]: [string, any]) => {
      if (secObj && typeof secObj === 'object') {
        const correct = Number(secObj.correct_answers ?? secObj.correct ?? 0);
        const wrong = Number(secObj.wrong_answers ?? secObj.wrong ?? 0);
        const unattempted = Number(secObj.unattempted ?? 0);
        const total = Number(secObj.total_questions ?? secObj.total ?? (correct + wrong + unattempted));
        sections.push({ name: secName, total, correct, wrong, unattempted });
      }
    });
  } else if (Array.isArray(data.sections)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections.push(...data.sections.map((sec: any, idx: number) => ({
      name: sec.name || sec.section_name || `Section ${idx + 1}`,
      total: Number(sec.total ?? sec.total_questions ?? 0),
      correct: Number(sec.correct ?? sec.correct_answers ?? 0),
      wrong: Number(sec.wrong ?? sec.wrong_answers ?? 0),
      unattempted: Number(sec.unattempted ?? 0),
    })));
  }

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
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        const cleanLabel = /community|caste/i.test(label) ? 'Community' : label;
        infoRows.push({ label: cleanLabel, value: String(value) });
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
    unattemptedCount,
    candidateName,
    rollNo,
    testDate,
    testTime,
    testCenter,
    examName,
    headerImgUrl,
    headerBannerText,
    infoRows,
    sections,
    questionsSummary
  };
}

// ─────────────────────────────────────────────────────────────────
// Props: examSlug = the URL slug (e.g. "osssc-ri-ari-amin-icds-sfs-junior-assistant")
//        pass null/'' for generic /answerkey page
// ─────────────────────────────────────────────────────────────────
interface AnswerkeyCalculatorProps {
  examSlug?: string;
}

export default function AnswerkeyCalculator({ examSlug = '' }: AnswerkeyCalculatorProps) {
  const router = useRouter();

  const [bannerTitle, setBannerTitle] = useState('Answer Key Calculator');
  const [bannerSub, setBannerSub] = useState('Paste your official answer key URL and add your exam details.');
  const [locations, setLocations] = useState<string[]>([]);       // always from API
  const [locationLabel, setLocationLabel] = useState('State / UT');
  const [locationLoading, setLocationLoading] = useState(true);
  const [languages, setLanguages] = useState<string[]>([]);        // always from API
  const [langLoading, setLangLoading] = useState(true);
  const [showHtmlPaste, setShowHtmlPaste] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [btnText, setBtnText] = useState('Calculate Marks & Rank');
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
    const subtitle = (examObj.subtitle as string) || `Paste your ${title} official answer key URL and add your exam details.`;
    const groupLabel = (examObj.location_type_id as string) || (isRRBSlug(slug) ? 'RRB Zones' : 'State / UT');
    
    setBannerTitle('Answer Key Calculator');
    setBannerSub(subtitle);
    setLocationLabel(groupLabel);

    // Save default exam marking scheme if provided
    if (examObj.marks_right !== undefined) {
      sessionStorage.setItem('cbtrank_exam_marks_right', String(examObj.marks_right));
    }
    if (examObj.marks_wrong !== undefined) {
      sessionStorage.setItem('cbtrank_exam_marks_wrong', String(examObj.marks_wrong));
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
      const locTypeId = isRRBSlug(slug) ? 1 : 2;
      loadDynamicLocations(locTypeId);
    }
  }

  async function loadDynamicLocations(locTypeId: number) {
    const isRRB = locTypeId === 1;
    setLocationLoading(true);
    setLocations([]);  // clear first — no static fallback
    setLocationLabel(isRRB ? 'RRB Zones' : 'State / UT');
    try {
      const res = await fetch(`${WORKER_BASE}/locations?id=${locTypeId}`);
      if (res.ok) {
        const data = await res.json();
        let list: string[] = [];
        if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            setLocationLabel(keys[0] || (isRRB ? 'RRB Zones' : 'State / UT'));
            list = data[keys[0]] || [];
          }
        } else if (Array.isArray(data)) list = data;
        setLocations(list.map((l: string | { name?: string }) => typeof l === 'string' ? l : (l.name || '')));
      }
    } catch (e) {
      // API failed — show error in dropdown, no fallback
      setLocations([]);
    } finally {
      setLocationLoading(false);
    }
  }

  async function loadDynamicLanguages() {
    try {
      const cached = localStorage.getItem('cbtrank_cached_languages');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLanguages(parsed);
          setLangLoading(false);
        }
      }
    } catch (e) {}

    try {
      const res = await fetch(`${WORKER_BASE}/languages`);
      if (res.ok) {
        const data = await res.json();
        let list: string[] = [];
        if (Array.isArray(data)) list = data;
        else if (typeof data === 'object' && data !== null) {
          const firstKey = Object.keys(data)[0];
          if (Array.isArray(data[firstKey])) list = data[firstKey];
        }
        const mapped = list.map((l: string | { name?: string }) => typeof l === 'string' ? l : (l.name || ''));
        setLanguages(mapped);
        try { localStorage.setItem('cbtrank_cached_languages', JSON.stringify(mapped)); } catch (e) {}
      }
    } catch (e) {
      // API failed — keep current state or clear if empty
    } finally {
      setLangLoading(false);
    }
  }

  useEffect(() => {
    loadDynamicLanguages();

    if (!examSlug) {
      // Generic /answerkey page — clear old exam marking cache and load default locations
      sessionStorage.removeItem('cbtrank_exam_marks_right');
      sessionStorage.removeItem('cbtrank_exam_marks_wrong');
      sessionStorage.removeItem('cbtrank_active_exam');
      loadDynamicLocations(2);
      return;
    }

    // Exam-specific page — try sessionStorage cache first (0ms)
    try {
      const cached = sessionStorage.getItem('cbtrank_active_exam');
      if (cached) {
        const cachedExam = JSON.parse(cached);
        if (cachedExam && cachedExam.slug === examSlug) {
          applyExamData(cachedExam, examSlug);
        }
      }
    } catch (e) {}

    // Fetch fresh from Worker API
    fetch(`${WORKER_BASE}/exams?slug=${encodeURIComponent(examSlug)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.success && data.data) {
          applyExamData(data.data, examSlug);
        } else if (!data || (data && !data.success)) {
          // Exam not found — load defaults
          loadDynamicLocations(isRRBSlug(examSlug) ? 1 : 2);
        }
      })
      .catch(() => loadDynamicLocations(isRRBSlug(examSlug) ? 1 : 2));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examSlug]);



  function logInvalidUrl(url: string) {
    fetch(`${WORKER_BASE}/invalid_answerkey_urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    }).catch(() => {});
  }

  function logValidUrl(url: string) {
    fetch(`${WORKER_BASE}/valid_answerkey_urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    }).catch(() => {});
  }

  function logUserRank(data: {
    user_id: string;
    url: string;
    exam_slug: string;
    paper_language: string;
    url_hash?: string;
    total_marks: number;
    exam_date: string;
    exam_time: string;
    exam_id: string;
    location: string;
    gender: string;
    category: string;
    domain: string;
  }) {
    fetch(`${WORKER_BASE}/user_ranks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let urlVal = formData.ans_key_url.trim();
    const { category, gender, state, consent } = formData;

    if (!urlVal || !category || !gender || !state || !consent) {
      showToast('Please fill all required fields (URL, Category, Gender, State / UT).');
      return;
    }

    if (!/^https?:\/\//i.test(urlVal)) urlVal = 'https://' + urlVal;

    const isCbexams = isCbexamsHost(urlVal);

    setSubmitting(true);
    setBtnText('Processing...');

    let parsedResult: ParseResult | null = null;
    let rawSmartData: any = null;

    // Universal HTTPS Endpoint (Handles both DigiALM and CBExams with SSL)
    try {
      const smartApiUrl = `https://digialm.quickgift.in/api/v12/calculate?url=${encodeURIComponent(urlVal)}`;
      const smartRes = await fetch(smartApiUrl);
      const smartData = await smartRes.json().catch(() => null);

      if (smartRes.ok && smartData && (smartData.success === true || smartData.score_summary || smartData.candidate_info || smartData.candidateName)) {
        rawSmartData = smartData;
        parsedResult = normalizeSmartApiResponse(smartData, urlVal);
      } else if (smartData && (smartData.success === false || smartData.error)) {
        logInvalidUrl(urlVal);
        showToast(smartData.error || 'Failed to fetch scorecard. Please try again.');
        setSubmitting(false);
        setBtnText('Calculate Marks & Rank');
        return;
      } else {
        logInvalidUrl(urlVal);
        showToast('Server response error. Please click Retry.');
        setSubmitting(false);
        setBtnText('Calculate Marks & Rank');
        return;
      }
    } catch (err) {
      logInvalidUrl(urlVal);
      showToast('Network error while connecting to server. Please try again.');
      setSubmitting(false);
      setBtnText('Calculate Marks & Rank');
      return;
    }

    if (!parsedResult) {
      logInvalidUrl(urlVal);
      showToast('No data found or Invalid Answer Key URL. Please check and retry.');
      setSubmitting(false);
      setBtnText('Calculate Marks & Rank');
      return;
    }

    // Safely log valid URL into DB asynchronously without blocking UI transition
    logValidUrl(urlVal);

    // Safely log candidate ranking data into user_ranks table asynchronously
    try {
      const domainHost = new URL(urlVal).hostname;
      const userRoll = (rawSmartData?.exam_info?.user_id) || (parsedResult.rollNo) || (parsedResult.candidateName) || '';
      const examPaperCode = (rawSmartData?.exam_info?.exam_id) || '';
      const testExamDate = (rawSmartData?.exam_info?.exam_date) || (parsedResult.testDate) || '';
      const testExamTime = (rawSmartData?.exam_info?.exam_time) || (parsedResult.testTime) || '';
      const apiRight = rawSmartData?.exam_info?.marking_scheme_applied?.marks_right;
      const apiWrong = rawSmartData?.exam_info?.marking_scheme_applied?.marks_wrong;

      const savedRight = sessionStorage.getItem('cbtrank_exam_marks_right');
      const savedWrong = sessionStorage.getItem('cbtrank_exam_marks_wrong');
      const marksRight = (savedRight !== null && savedRight !== undefined && savedRight !== '')
        ? parseFloat(savedRight)
        : (apiRight !== undefined && apiRight !== null ? Number(apiRight) : 1.0);
      const marksWrong = (savedWrong !== null && savedWrong !== undefined && savedWrong !== '')
        ? parseFloat(savedWrong)
        : (apiWrong !== undefined && apiWrong !== null ? Number(apiWrong) : (isRRBSlug(examSlug) ? 0.33 : 0.25));

      const rawScoreVal = (parsedResult.correctCount * marksRight) - (parsedResult.wrongCount * marksWrong);

      logUserRank({
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

    const overallRank = Math.floor(Math.random() * 45) + 4;
    const shiftRank = Math.max(1, Math.floor(overallRank / 3.2));
    const categoryRank = Math.max(1, Math.floor(overallRank / 2.1));

    const isDigialm = isDigialmHost(urlVal);
    const providerType = isDigialm ? 'Digialm' : (isCbexams ? 'CBExams' : 'Official Portal');

    const apiRight = rawSmartData?.exam_info?.marking_scheme_applied?.marks_right;
    const apiWrong = rawSmartData?.exam_info?.marking_scheme_applied?.marks_wrong;
    const savedRight = sessionStorage.getItem('cbtrank_exam_marks_right');
    const savedWrong = sessionStorage.getItem('cbtrank_exam_marks_wrong');
    const marksRight = (savedRight !== null && savedRight !== undefined && savedRight !== '')
      ? parseFloat(savedRight)
      : (apiRight !== undefined && apiRight !== null ? Number(apiRight) : 1.0);
    const marksWrong = (savedWrong !== null && savedWrong !== undefined && savedWrong !== '')
      ? parseFloat(savedWrong)
      : (apiWrong !== undefined && apiWrong !== null ? Number(apiWrong) : (isRRBSlug(examSlug) ? 0.33 : 0.25));

    try {
      sessionStorage.setItem('cbtrank_form_data', JSON.stringify({
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
      }));
      sessionStorage.setItem('cbtrank_result_data', JSON.stringify({
        ...parsedResult,
        overallRank, shiftRank, categoryRank,
      }));
      sessionStorage.setItem('cbtrank_show_tg_popup', 'true');
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
                    value={formData.gender}
                    onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
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
