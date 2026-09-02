'use server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';
const ADMIN_KEY = process.env.ADMIN_API_KEY || '';
const PARSER_CLUSTER = [
  'https://digialm1.cbtrank.online/api/v12/calculate?url=',
  'https://digialm2.cbtrank.online/api/v12/calculate?url='
];
const CBEXAMS_PARSER = 'https://cbexams.quickgift.in/?url=';

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
  const totalQ = Number(data.score_summary?.total_questions ?? data.questions_summary?.length ?? 0);
  const candName = data.candidateName || data.candidate_info?.['Candidate Name'] || data.candidate_info?.['Participant Name'] || data.candidate_info?.['Applicant Name'] || data.name;
  if (totalQ === 0 && !candName) return false;
  return true;
}

export async function processAnswerKeyAction(params: {
  url: string;
  category?: string;
  gender?: string;
  state?: string;
  examSlug?: string;
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
    return { success: false, error: 'Please enter a valid official Answer Key URL.' };
  }

  const isCbexams = isCbexamsHost(urlVal);
  const targetEndpoints = isCbexams
    ? [`${CBEXAMS_PARSER}${encodeURIComponent(urlVal)}`]
    : PARSER_CLUSTER.map(base => `${base}${encodeURIComponent(urlVal)}`);

  let smartData: any = null;

  // 1. ⚡ Fast Parallel Multi-Server Race (No timeout cancellation for CBExams)
  const fetchPromises = targetEndpoints.map(async (endpoint) => {
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    };
    if (!isCbexams) {
      fetchOptions.signal = AbortSignal.timeout(12000);
    }
    const res = await fetch(endpoint, fetchOptions);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => null);
    if (data && isValidSmartData(data)) {
      return data;
    }
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
            'Accept': 'application/json, text/plain, */*'
          }
        };
        if (!isCbexams) {
          fetchOptions.signal = AbortSignal.timeout(10000);
        }
        const res = await fetch(endpoint, fetchOptions);
        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data && isValidSmartData(data)) {
            smartData = data;
            break;
          }
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

    // 🧠 AI Marking Scheme Auto-Detection & Enhancement
    try {
      const curRight = smartData.exam_info?.marking_scheme_applied?.marks_right;
      const curWrong = smartData.exam_info?.marking_scheme_applied?.marks_wrong;
      if (curRight === undefined || curRight === null || (curRight === 1.0 && curWrong === 0.25)) {
        const fullText = ((smartData.header_banner_text || '') + ' ' + (smartData.candidate_info?.['Exam Name'] || '') + ' ' + (smartData.candidate_info?.['Subject'] || '') + ' ' + urlVal).toLowerCase();
        if (/jep2|je.*(paper\s*2|paper-2|tier\s*2|tier-2|mains)/i.test(fullText)) {
          if (!smartData.exam_info) smartData.exam_info = {};
          smartData.exam_info.marking_scheme_applied = {
            marks_right: 3.0,
            marks_wrong: 1.0
          };
          smartData.exam_info.detected_exam_name = smartData.exam_info.detected_exam_name || 'SSC JE Paper-II';
        }
      }
    } catch (e) {}

    // Await logging to D1 with secret admin key
    try {
      await fetch(`${BACKEND_BASE}/valid_answerkey_urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ url: urlVal })
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
      error: (smartData && (smartData.error || smartData.message)) || 'Failed to fetch scorecard. Please check if your response sheet link is active.' 
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

export async function fetchLiveRankAction(params: {
  examId?: string;
  examSlug?: string;
  examDate?: string;
  examTime?: string;
  category?: string;
  totalMarks: number;
  userId?: string;
  url?: string;
}) {
  const normMarks = Number(params.totalMarks) || 0;
  const cleanExamId = (params.examId || '').trim();
  const cleanSlug = (params.examSlug || '').trim();
  const cleanCategory = (params.category || '').trim().toLowerCase();
  const cleanDate = (params.examDate || '').trim();
  const cleanTime = (params.examTime || '').trim();

  // 1. ⚡ ULTRA-FAST DIRECT SQL COUNT (Reduces DB Row Reads by 99%)
  try {
    const liveQueryUrl = `${BACKEND_BASE}/live_rank?exam_id=${encodeURIComponent(cleanExamId)}&total_marks=${normMarks}&category=${encodeURIComponent(cleanCategory)}&exam_date=${encodeURIComponent(cleanDate)}&exam_time=${encodeURIComponent(cleanTime)}`;
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
        return { success: true, data: aggJson.data };
      }
    }
  } catch (err) {}

  // 2. Seamless Fallback (Full Dump)
  try {
    const res = await fetch(`${BACKEND_BASE}/user_ranks?limit=1000`, {
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
    const examCandidates = rows.filter((r: any) => {
      if (!cleanExamId) return false;
      const rowExamId = String(r.exam_id || '').trim().toLowerCase();
      const targetExamId = cleanExamId.toLowerCase();
      return rowExamId === targetExamId;
    });

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
          percentile: 100.0
        }
      };
    }

    // 1. Overall Rank (Strictly within the same exam_id)
    const higherOverall = examCandidates.filter((r: any) => (Number(r.total_marks) || 0) > normMarks).length;
    const overallRank = higherOverall + 1;
    const totalOverall = Math.max(overallRank, examCandidates.length);

    // 2. Shift Rank (Strictly within the same exam_date and exam_time)
    const shiftCandidates = examCandidates.filter((r: any) => {
      if (cleanDate && r.exam_date && r.exam_date === cleanDate) {
        if (cleanTime && r.exam_time) return r.exam_time === cleanTime;
        return true;
      }
      return false;
    });

    let shiftRank = 1;
    let totalShift = 1;
    let higherShift = 0;

    if (shiftCandidates.length > 0) {
      higherShift = shiftCandidates.filter((r: any) => (Number(r.total_marks) || 0) > normMarks).length;
      shiftRank = higherShift + 1;
      totalShift = Math.max(shiftRank, shiftCandidates.length);
    }

    // 3. Category Rank (Strictly within the same category)
    const catCandidates = examCandidates.filter((r: any) => (r.category || '').trim().toLowerCase() === cleanCategory);

    let categoryRank = 1;
    let totalCategory = 1;

    if (catCandidates.length > 0) {
      const higherCategory = catCandidates.filter((r: any) => (Number(r.total_marks) || 0) > normMarks).length;
      categoryRank = higherCategory + 1;
      totalCategory = Math.max(categoryRank, catCandidates.length);
    }

    // 4. Percentile Score
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
      signal: AbortSignal.timeout(5000)
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
