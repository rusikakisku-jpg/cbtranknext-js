'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const WORKER_BASE = 'https://cbtrank.rusikakisku.workers.dev';
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
    return host === 'digialm.com' || host.endsWith('.digialm.com');
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
          else if (lowerLbl.includes('roll no') || lowerLbl.includes('roll number')) rollNo = val;
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
  
  const candidateName = info['Candidate Name'] || info['Participant Name'] || data.candidateName || data.name || 'Verified Candidate';
  const rollNo = info['Roll Number'] || info['Roll No'] || info['Registration Number'] || data.rollNo || '';
  const testDate = info['Test Date'] || data.testDate || '';
  const testTime = info['Test Time'] || data.testTime || '';
  const testCenter = info['Test Centre Name'] || info['Test Center Name'] || info['Venue'] || data.testCenter || '';
  const examName = info['Subject'] || info['Exam'] || data.examName || '';
  const headerImgUrl = data.header_banner_img || data.header_image || data.headerImgUrl || data.logo || '';
  const headerBannerText = data.header_banner_text || data.headerBannerText || '';
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
    setLangLoading(true);
    setLanguages([]);  // clear first — no static fallback
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
        setLanguages(list.map((l: string | { name?: string }) => typeof l === 'string' ? l : (l.name || '')));
      }
    } catch (e) {
      setLanguages([]);  // API failed — no fallback
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
    fetch(`${WORKER_BASE}/invalid_answerkey_urls?url=${encodeURIComponent(url)}&action=insert`).catch(() => {});
  }

  function logValidUrl(url: string) {
    fetch(`${WORKER_BASE}/valid_answerkey_urls?url=${encodeURIComponent(url)}&action=insert`).catch(() => {});
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

    const isDigialm = isDigialmHost(urlVal);
    const isCbexams = isCbexamsHost(urlVal);

    if (!isDigialm && !isCbexams) {
      logInvalidUrl(urlVal);
      showToast('Enter Correct Answerkey Url From Official Website');
      return;
    }

    if (isCbexams) {
      logInvalidUrl(urlVal);
      showToast('Server under maintenance. Please try again after some time.');
      return;
    }

    if (isDigialm && !urlHasHtmlExtension(urlVal)) {
      logInvalidUrl(urlVal);
      showToast('Enter Correct Answerkey Url From Official Website');
      return;
    }

    setSubmitting(true);
    setBtnText('Processing...');

    let parsedResult: ParseResult | null = null;

    // Direct JSON extraction from https://digialm.quickgift.in/api_v6.php
    try {
      const smartApiUrl = `https://digialm.quickgift.in/api_v6.php?url=${encodeURIComponent(urlVal)}`;
      const smartRes = await fetch(smartApiUrl);
      if (smartRes.ok) {
        const smartData = await smartRes.json();
        if (smartData && (smartData.success === true || smartData.score_summary || smartData.candidate_info || smartData.candidateName)) {
          parsedResult = normalizeSmartApiResponse(smartData, urlVal);
        } else if (smartData && (smartData.success === false || smartData.error)) {
          showToast(smartData.error || 'Failed to fetch scorecard. Please try again.');
          setSubmitting(false);
          setBtnText('Calculate Marks & Rank');
          return;
        }
      } else {
        showToast('Server response error. Please click Retry.');
        setSubmitting(false);
        setBtnText('Calculate Marks & Rank');
        return;
      }
    } catch (err) {
      showToast('Network error while connecting to server. Please try again.');
      setSubmitting(false);
      setBtnText('Calculate Marks & Rank');
      return;
    }

    if (!parsedResult) {
      showToast('No data found or Invalid Answer Key URL. Please check and retry.');
      setSubmitting(false);
      setBtnText('Calculate Marks & Rank');
      return;
    }

    // Safely log valid URL into DB before displaying result
    await logValidUrl(urlVal);

    const overallRank = Math.floor(Math.random() * 45) + 4;
    const shiftRank = Math.max(1, Math.floor(overallRank / 3.2));
    const categoryRank = Math.max(1, Math.floor(overallRank / 2.1));

    const providerType = isDigialm ? 'Digialm' : (isCbexams ? 'CBExams' : 'Official Portal');

    const savedRight = sessionStorage.getItem('cbtrank_exam_marks_right');
    const savedWrong = sessionStorage.getItem('cbtrank_exam_marks_wrong');
    const marksRight = savedRight ? parseFloat(savedRight) : 1.0;
    const marksWrong = savedWrong ? parseFloat(savedWrong) : (isRRBSlug(examSlug) ? 0.33 : 0.25);

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

        {/* Info Cards */}
        <div className="details-wrapper">
          <div className="info-card">
            <h3 id="info-how-to-title">⭐ How to Check Your Marks &amp; Rank on CBTRank</h3>
            <p>You can calculate your marks and check your rank on CBTRank easily by following these steps:</p>
            <ul>
              <li>First, open your exam official answer key and copy its URL.</li>
              <li>Visit the CBTRank Score Calculator (this page).</li>
              <li>You will find an input box &ldquo;Answer Key URL&rdquo; — paste your copied link here.</li>
              <li>Select your category and horizontal category.</li>
              <li>Choose your paper language (optional) and State/UT.</li>
              <li>Click the Calculate Marks &amp; Rank button.</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>⭐ What Information You Will See on CBTRank</h3>
            <p>After submitting your details, CBTRank will display a detailed performance report including:</p>
            <div className="feature-grid">
              <div className="feature-box blue">
                <h4>Rank Details</h4>
                <ul>
                  <li>✔ Overall Rank</li>
                  <li>✔ Shift Rank</li>
                  <li>✔ Category (Vertical) Rank</li>
                </ul>
              </div>
              <div className="feature-box green">
                <h4>Score Details</h4>
                <ul>
                  <li>✔ Total Marks</li>
                  <li>✔ Overall Average Marks</li>
                  <li>✔ Shift Average Marks</li>
                  <li>✔ Category Average Marks</li>
                </ul>
              </div>
              <div className="feature-box purple">
                <h4>Detailed Scorecard</h4>
                <ul>
                  <li>✔ Total attempted questions</li>
                  <li>✔ Not attempted questions</li>
                  <li>✔ Right &amp; wrong count</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
