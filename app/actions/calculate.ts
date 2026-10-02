'use server';

const BACKEND_BASE = (process.env.BACKEND_API_URL || 'https://api.cbtrank.com').replace(/\/+$/, '');
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'cbtrank_admin_secret_key_2026';

// ⚡ Secure Worker API Proxy Parser Endpoints (Parsed through Cloudflare Worker API)
const DIGIALM_API_ENDPOINT = `${BACKEND_BASE}/digialm/?url=`;
const CBEXAMS_API_ENDPOINT = `${BACKEND_BASE}/cbexams/?url=`;

// Strictly use only the two dedicated Cloudflare Worker Proxy Parser Endpoints
const PARSER_CLUSTER = [
  process.env.PARSER_API_URL || DIGIALM_API_ENDPOINT
];

const CBEXAMS_PARSER_CLUSTER = [
  process.env.CBEXAMS_PARSER_URL || CBEXAMS_API_ENDPOINT
];

function cleanAndNormalizeUrl(raw: string): string {
  let url = (raw || '').trim();
  // Strip trailing hash/fragments
  url = url.replace(/#.*$/, '').trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  
  try {
    const parsed = new URL(url);
    // Replace multiple slashes in pathname like //per// -> /per/
    parsed.pathname = parsed.pathname.replace(/\/+/g, '/');
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

function isCbexamsHost(raw: string): boolean {
  if (!raw) return false;
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
    const host = (parsed.hostname || '').toLowerCase();
    return host === 'cbexams.com' || host.endsWith('.cbexams.com');
  } catch (e) { return false; }
}

function isValidSmartData(data: any): boolean {
  if (!data) return false;
  if (data.success === false) return false;
  const totalQ = Number(
    data.score_summary?.total_questions ??
    data.score_summary?.totalQuestions ??
    data.total_questions ??
    data.totalQuestions ??
    data.total ??
    data.questions_summary?.length ??
    data.questions?.length ??
    (Array.isArray(data.sections) ? data.sections.reduce((acc: number, s: any) => acc + Number(s.total ?? s.total_questions ?? 0), 0) : 0) ??
    0
  );
  const candName =
    data.candidateName ||
    data.candidate_name ||
    data.CandidateName ||
    data.candidate_info?.['Candidate Name'] ||
    data.candidate_info?.["Candidate's Name"] ||
    data.candidate_info?.['Participant Name'] ||
    data.candidate_info?.['Applicant Name'] ||
    data.candidate_info?.['Name'] ||
    data.name ||
    (data.candidate_info && typeof data.candidate_info === 'object' && Object.values(data.candidate_info).find((v: any) => typeof v === 'string' && v.trim().length > 0)) ||
    '';
  const hasQuestions = (Array.isArray(data.questions_summary) && data.questions_summary.length > 0) || (Array.isArray(data.questions) && data.questions.length > 0);
  const hasSections = Array.isArray(data.sections) && data.sections.length > 0;
  const hasSectionSummary = Boolean(data.section_summary && typeof data.section_summary === 'object' && Object.keys(data.section_summary).length > 0);
  const hasValidScore = (data.score_summary && Number(data.score_summary.total_questions || data.score_summary.totalQuestions || 0) > 0) ||
                        (data.score && Number(data.score.total_questions || data.score.total || 0) > 0) ||
                        (typeof data.correct_answers === 'number' && typeof data.wrong_answers === 'number' && (data.correct_answers + data.wrong_answers > 0));
  if (totalQ === 0 && !candName && !hasQuestions && !hasSections && !hasSectionSummary && !hasValidScore) return false;
  return true;
}

export async function processAnswerKeyAction(params: {
  url: string;
  category?: string;
  gender?: string;
  state?: string;
  examSlug?: string;
  marks_right?: number | string;
  marks_wrong?: number | string;
  marksRight?: number | string;
  marksWrong?: number | string;
  paper_language?: string;
  sub_type?: string;
  trade?: string;
  branch?: string;
  [key: string]: any;
}) {
  let urlVal = cleanAndNormalizeUrl(params.url);
  if (!urlVal || urlVal.length < 10) {
    if (urlVal) {
      try {
        await fetch(`${BACKEND_BASE}/invalid_answerkey_urls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
          body: JSON.stringify({ url: urlVal })
        });
      } catch (e) {}
    }
    return { success: false, error: 'Invalid or broken link. Please check your Answer Key URL and retry.' };
  }

  const mr = params.marks_right ?? params.marksRight;
  const mw = params.marks_wrong ?? params.marksWrong;
  let marksQuery = '';
  if (mr !== undefined && mr !== null && mr !== '') {
    marksQuery += `&marks_right=${encodeURIComponent(mr)}`;
  }
  if (mw !== undefined && mw !== null && mw !== '') {
    marksQuery += `&marks_wrong=${encodeURIComponent(mw)}`;
  }

  const isCbexams = isCbexamsHost(urlVal);
  const targetEndpoints = isCbexams
    ? CBEXAMS_PARSER_CLUSTER.map(base => `${base}${encodeURIComponent(urlVal)}${marksQuery}`)
    : PARSER_CLUSTER.map(base => `${base}${encodeURIComponent(urlVal)}${marksQuery}`);

  let smartData: any = null;
  let lastErrorMessage = '';

  // 1. ⚡ Fast Parallel Multi-Server Race (Extended timeout for CBExams)
  const fetchPromises = targetEndpoints.map(async (endpoint) => {
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'x-api-key': ADMIN_KEY,
      }
    };
    if (!isCbexams) {
      fetchOptions.signal = AbortSignal.timeout(15000);
    } else {
      fetchOptions.signal = AbortSignal.timeout(25000);
    }
    const res = await fetch(endpoint, fetchOptions);
    const data = await res.json().catch(() => null);
    if (data && isValidSmartData(data)) {
      return data;
    }
    if (data && (data.error || data.message)) {
      lastErrorMessage = data.error || data.message;
    }
    if (!res.ok) throw new Error(lastErrorMessage || `HTTP ${res.status}`);
    throw new Error(data?.error || 'Invalid response structure');
  });

  try {
    smartData = await Promise.any(fetchPromises);
  } catch (err) {
    // 2. Sequential Fallback
    for (const endpoint of targetEndpoints) {
      try {
        const fetchOptions: RequestInit = {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'x-api-key': ADMIN_KEY,
          }
        };
        if (!isCbexams) {
          fetchOptions.signal = AbortSignal.timeout(12000);
        } else {
          fetchOptions.signal = AbortSignal.timeout(20000);
        }
        const res = await fetch(endpoint, fetchOptions);
        const data = await res.json().catch(() => null);
        if (data && (data.error || data.message)) {
          lastErrorMessage = data.error || data.message;
        }
        if (res.ok && data && isValidSmartData(data)) {
          smartData = data;
          break;
        }
      } catch (e) {}
    }
  }

  // 3. Evaluate final data
  if (smartData && isValidSmartData(smartData)) {
    // Convert header banner image to Base64 to eliminate CORS blank canvas issues during scorecard image download
    const rawBannerImg = smartData.header_banner_img || smartData.header_image || smartData.headerImgUrl || smartData.logo;
    if (rawBannerImg && typeof rawBannerImg === 'string' && !rawBannerImg.startsWith('data:image')) {
      try {
        const b64 = await getBase64ImageAction(rawBannerImg);
        if (b64 && b64.startsWith('data:image')) {
          smartData.header_banner_img = b64;
          smartData.header_image = b64;
          smartData.headerImgUrl = b64;
          smartData.logo = b64;
        }
      } catch (e) {}
    }

    // 1. Await logging to valid_answerkey_urls with secret admin key
    try {
      await fetch(`${BACKEND_BASE}/valid_answerkey_urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ url: urlVal })
      });
    } catch (e) {}

    // 2. Direct Server-Side Logging to user_ranks table (Guaranteed persistence, zero client drops)
    try {
      const examPaperCode = smartData?.exam_info?.exam_id || '';
      const testExamDate = smartData?.exam_info?.exam_date || '';
      const testExamTime = smartData?.exam_info?.exam_time || '';
      const userRoll = smartData?.exam_info?.user_id || smartData?.candidate_info?.['Participant ID'] || smartData?.candidate_info?.['Roll No'] || '';
      const rawScoreVal = (smartData?.score_summary?.marks_obtained !== undefined && smartData?.score_summary?.marks_obtained !== null && !isNaN(Number(smartData?.score_summary?.marks_obtained)))
        ? Number(smartData.score_summary.marks_obtained)
        : 0;

      let domainHost = '';
      try { domainHost = new URL(urlVal).hostname; } catch (e) {}

      const serverRankPayload = {
        user_id: userRoll,
        url: urlVal,
        exam_slug: params.examSlug || 'general',
        paper_language: params.paper_language || 'English',
        url_hash: '',
        total_marks: rawScoreVal,
        exam_date: testExamDate,
        exam_time: testExamTime,
        exam_id: examPaperCode,
        location: params.state || '',
        gender: params.gender || '',
        category: params.category || '',
        domain: domainHost,
        sub_type: params.sub_type || params.trade || params.branch || '',
        marking_source: smartData?.exam_info?.marking_source || (domainHost.includes('cbexams') ? 'cbexams' : 'digialm'),
        section_summary: smartData?.section_summary ? (typeof smartData.section_summary === 'object' ? JSON.stringify(smartData.section_summary) : String(smartData.section_summary)) : '{}',
        questions_summary: smartData?.questions_summary ? (typeof smartData.questions_summary === 'object' ? JSON.stringify(smartData.questions_summary) : String(smartData.questions_summary)) : '[]',
        marking_scheme_applied: smartData?.exam_info?.marking_scheme_applied ? (typeof smartData.exam_info.marking_scheme_applied === 'object' ? JSON.stringify(smartData.exam_info.marking_scheme_applied) : String(smartData.exam_info.marking_scheme_applied)) : '{}',
        candidate_info: smartData?.candidate_info ? (typeof smartData.candidate_info === 'object' ? JSON.stringify(smartData.candidate_info) : String(smartData.candidate_info)) : '{}',
        header_banner_img: (rawBannerImg && typeof rawBannerImg === 'string' && !rawBannerImg.startsWith('data:image')) ? rawBannerImg : '',
        header_banner_text: smartData?.header_banner_text || ''
      };

      await fetch(`${BACKEND_BASE}/user_ranks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify(serverRankPayload)
      });
    } catch (e) {}

    return { success: true, data: smartData };
  } else {
    // Await logging invalid URL to D1 table
    try {
      await fetch(`${BACKEND_BASE}/invalid_answerkey_urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ url: urlVal })
      });
    } catch (e) {}

    return { 
      success: false, 
      error: 'Invalid or broken link. Please check your Answer Key URL and retry.' 
    };
  }
}

export async function logUserRankAction(rankData: any) {
  try {
    await fetch(`${BACKEND_BASE}/user_ranks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
      body: JSON.stringify(rankData)
    });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function logValidUrlAction(urlVal: string) {
  try {
    await fetch(`${BACKEND_BASE}/valid_answerkey_urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
      body: JSON.stringify({ url: urlVal })
    });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function fetchLiveRankAction(params: {
  examId?: string;
  examSlug?: string;
  examDate?: string;
  examTime?: string;
  category?: string;
  gender?: string;
  totalMarks: number;
  userId?: string;
  url?: string;
}) {
  const normMarks = Number(params.totalMarks) || 0;
  let cleanExamId = (params.examId || '').trim();
  if (!cleanExamId && params.url) {
    const match = params.url.match(/AssessmentQPHTMLMode\d*\/([^\/]+)/i) || params.url.match(/\/([0-9]+[A-Za-z0-9]+)\/[0-9]+[A-Za-z0-9]+S\d+/i);
    if (match && match[1]) {
      cleanExamId = match[1].trim();
    }
  }
  const cleanSlug = (params.examSlug || '').trim();
  const cleanCategory = (params.category || '').trim().toLowerCase();
  const cleanGender = (params.gender || '').trim().toLowerCase();
  const cleanDate = (params.examDate || '').trim();
  const cleanTime = (params.examTime || '').trim();

  // 1. ⚡ ULTRA-FAST DIRECT SQL COUNT (Reduces DB Row Reads by 99%)
  try {
    const liveQueryUrl = `${BACKEND_BASE}/live_rank?exam_id=${encodeURIComponent(cleanExamId)}&exam_slug=${encodeURIComponent(cleanSlug)}&total_marks=${normMarks}&category=${encodeURIComponent(cleanCategory)}&gender=${encodeURIComponent(cleanGender)}&exam_date=${encodeURIComponent(cleanDate)}&exam_time=${encodeURIComponent(cleanTime)}&user_id=${encodeURIComponent(params.userId || '')}&url=${encodeURIComponent(params.url || '')}`;
    const aggRes = await fetch(liveQueryUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    });
    if (aggRes.ok) {
      const aggJson = await aggRes.json().catch(() => null);
      if (aggJson && aggJson.success && aggJson.data && aggJson.data.totalOverall > 0) {
        return {
          success: true,
          data: aggJson.data
        };
      }
    }
  } catch (err) {}

  // 2. Seamless Fallback (Full Dump)
  try {
    const filterQuery = cleanExamId ? `&exam_id=${encodeURIComponent(cleanExamId)}` : (cleanSlug && cleanSlug !== 'general' ? `&exam_slug=${encodeURIComponent(cleanSlug)}` : '');
    const res = await fetch(`${BACKEND_BASE}/user_ranks?limit=5000${filterQuery}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      return { success: false };
    }

    const json = await res.json().catch(() => null);
    const rows = (json && Array.isArray(json.data)) ? json.data : [];

    // Filter candidates strictly by EXACT exam_id match ONLY (e.g. '1234' !== '12345')
    let examCandidates = rows.filter((r: any) => {
      if (!cleanExamId) return false;
      const rowExamId = String(r.exam_id || '').trim().toLowerCase();
      const targetExamId = cleanExamId.toLowerCase();
      return rowExamId === targetExamId;
    });

    // If no exact match, check with letter 'o' / digit '0' interchange (e.g. 1258O26309 vs 1258026309)
    if (examCandidates.length === 0 && cleanExamId) {
      const normalizedTarget = cleanExamId.toLowerCase().replace(/o/g, '0');
      examCandidates = rows.filter((r: any) => {
        const normalizedRow = String(r.exam_id || '').trim().toLowerCase().replace(/o/g, '0');
        return normalizedRow === normalizedTarget;
      });
    }

    // Fallback by exam_slug if cleanExamId not found
    if (examCandidates.length === 0 && cleanSlug && cleanSlug !== 'general') {
      examCandidates = rows.filter((r: any) => {
        const rowSlug = String(r.exam_slug || '').trim().toLowerCase();
        return rowSlug === cleanSlug.toLowerCase();
      });
    }

    // If no candidate exists yet for this exam_id, this candidate is 1st (never mix with other exams)
    if (examCandidates.length === 0) {
      return {
        success: true,
        data: {
          overallRank: 1,
          totalOverall: 1,
          shiftRank: 1,
          totalShift: 1,
          categoryRank: 1,
          totalCategory: 1,
          genderRank: 1,
          totalGender: 1,
          percentile: 100.0
        }
      };
    }

    // Check if candidate already exists in the fetched database rows
    const isExistingInOverall = examCandidates.some((r: any) => {
      if (params.userId && r.user_id && String(r.user_id).trim().toLowerCase() === String(params.userId).trim().toLowerCase()) return true;
      if (params.url && r.url && String(r.url).trim().toLowerCase() === String(params.url).trim().toLowerCase()) return true;
      return false;
    });

    // 1. Overall Rank (Strictly within the same exam_id)
    const higherOverall = examCandidates.filter((r: any) => {
      if (params.userId && r.user_id && String(r.user_id).trim().toLowerCase() === String(params.userId).trim().toLowerCase()) return false;
      return (Number(r.total_marks) || 0) > (normMarks + 0.0001);
    }).length;
    const overallRank = higherOverall + 1;
    const totalOverall = Math.max(overallRank, isExistingInOverall ? examCandidates.length : (examCandidates.length + 1));

    // 2. Shift Rank (Strictly within the same exam_date and exam_time)
    const shiftCandidates = examCandidates.filter((r: any) => {
      if (cleanDate && r.exam_date && r.exam_date === cleanDate) {
        if (cleanTime && r.exam_time) return r.exam_time === cleanTime;
        return true;
      }
      return false;
    });

    const isExistingInShift = shiftCandidates.some((r: any) => {
      if (params.userId && r.user_id && String(r.user_id).trim().toLowerCase() === String(params.userId).trim().toLowerCase()) return true;
      if (params.url && r.url && String(r.url).trim().toLowerCase() === String(params.url).trim().toLowerCase()) return true;
      return false;
    });

    let shiftRank = 1;
    let totalShift = 1;
    let higherShift = 0;

    if (shiftCandidates.length > 0 || (cleanDate && cleanTime)) {
      higherShift = shiftCandidates.filter((r: any) => {
        if (params.userId && r.user_id && String(r.user_id).trim().toLowerCase() === String(params.userId).trim().toLowerCase()) return false;
        return (Number(r.total_marks) || 0) > (normMarks + 0.0001);
      }).length;
      shiftRank = higherShift + 1;
      totalShift = Math.max(shiftRank, isExistingInShift ? shiftCandidates.length : (shiftCandidates.length + 1));
    }

    // 3. Category Rank (Strictly within the same category)
    const catCandidates = examCandidates.filter((r: any) => (r.category || '').trim().toLowerCase() === cleanCategory);

    const isExistingInCat = catCandidates.some((r: any) => {
      if (params.userId && r.user_id && String(r.user_id).trim().toLowerCase() === String(params.userId).trim().toLowerCase()) return true;
      if (params.url && r.url && String(r.url).trim().toLowerCase() === String(params.url).trim().toLowerCase()) return true;
      return false;
    });

    let categoryRank = 1;
    let totalCategory = 1;

    if (catCandidates.length > 0 || cleanCategory) {
      const higherCategory = catCandidates.filter((r: any) => {
        if (params.userId && r.user_id && String(r.user_id).trim().toLowerCase() === String(params.userId).trim().toLowerCase()) return false;
        return (Number(r.total_marks) || 0) > (normMarks + 0.0001);
      }).length;
      categoryRank = higherCategory + 1;
      totalCategory = Math.max(categoryRank, isExistingInCat ? catCandidates.length : (catCandidates.length + 1));
    }

    // 4. Gender Rank (Strictly within the same gender: Male / Female)
    const genderCandidates = cleanGender
      ? examCandidates.filter((r: any) => {
          const g = String(r.gender || '').trim().toLowerCase();
          if (!g) return false;
          return g === cleanGender || (cleanGender === 'male' && g === 'm') || (cleanGender === 'female' && g === 'f') || (cleanGender === 'm' && g === 'male') || (cleanGender === 'f' && g === 'female');
        })
      : [];

    const isExistingInGender = genderCandidates.some((r: any) => {
      if (params.userId && r.user_id && String(r.user_id).trim().toLowerCase() === String(params.userId).trim().toLowerCase()) return true;
      if (params.url && r.url && String(r.url).trim().toLowerCase() === String(params.url).trim().toLowerCase()) return true;
      return false;
    });

    let genderRank = 1;
    let totalGender = 1;

    if (genderCandidates.length > 0 || cleanGender) {
      const higherGender = genderCandidates.filter((r: any) => {
        if (params.userId && r.user_id && String(r.user_id).trim().toLowerCase() === String(params.userId).trim().toLowerCase()) return false;
        return (Number(r.total_marks) || 0) > (normMarks + 0.0001);
      }).length;
      genderRank = higherGender + 1;
      totalGender = Math.max(genderRank, isExistingInGender ? genderCandidates.length : (genderCandidates.length + 1));
    }

    // 5. Percentile Score
    let percentile = 100.0;
    if (totalShift > 1) {
      percentile = Math.min(99.9, Math.max(1.0, Number((((totalShift - higherShift) / totalShift) * 100).toFixed(2))));
    }

    return {
      success: true,
      data: {
        overallRank,
        totalOverall,
        shiftRank,
        totalShift,
        categoryRank,
        totalCategory,
        genderRank,
        totalGender,
        percentile
      }
    };
  } catch (e) {
    return { success: false };
  }
}

export async function submitContactMessageAction(msgData: { name: string; email: string; subject?: string; message: string }) {
  try {
    const res = await fetch(`${BACKEND_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData)
    });
    return { success: res.ok };
  } catch (e) {
    return { success: false };
  }
}

export async function getBase64ImageAction(imageUrl: string): Promise<string> {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.startsWith('data:image')) {
    return imageUrl || '';
  }
  try {
    let cleanUrl = imageUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = 'https://' + cleanUrl;
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      const contentType = res.headers.get('content-type') || 'image/png';
      const arrayBuffer = await res.arrayBuffer();
      
      let base64 = '';
      if (typeof Buffer !== 'undefined') {
        base64 = Buffer.from(arrayBuffer).toString('base64');
      } else {
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        base64 = btoa(binary);
      }

      return `data:${contentType};base64,${base64}`;
    }
  } catch (e) {}
  return imageUrl;
}
