'use server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'cbtrank_admin_secret_key_2026';
const FALLBACK_PARSER = 'http://147.93.154.159/api_smart.php';

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
  const primaryEndpoint = isCbexams
    ? `https://cbexams.quickgift.in/?url=${encodeURIComponent(urlVal)}`
    : `https://digialm.quickgift.in/?url=${encodeURIComponent(urlVal)}`;

  let smartData: any = null;

  // 1. Primary Scraper Attempt
  try {
    const res = await fetch(primaryEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (res.ok) {
      smartData = await res.json().catch(() => null);
    }
  } catch (err) {}

  // 2. Fallback Scraper Attempt (if primary threw 500 error or returned invalid)
  if (!smartData || (!smartData.success && !smartData.score_summary && !smartData.candidate_info && !smartData.candidateName)) {
    try {
      const fallbackUrl = `${FALLBACK_PARSER}?url=${encodeURIComponent(urlVal)}`;
      const fbRes = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      });
      if (fbRes.ok) {
        const fbData = await fbRes.json().catch(() => null);
        if (fbData && (fbData.success === true || fbData.score_summary || fbData.candidate_info)) {
          smartData = fbData;
        }
      }
    } catch (fbErr) {}
  }

  // 3. Evaluate final data
  if (smartData && (smartData.success === true || smartData.score_summary || smartData.candidate_info || smartData.candidateName)) {
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
