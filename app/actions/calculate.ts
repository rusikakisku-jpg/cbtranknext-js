'use server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'cbtrank_admin_secret_key_2026';

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
  let urlVal = (params.url || '').trim();
  if (!urlVal) return { success: false, error: 'Answer key URL is required' };
  if (!/^https?:\/\//i.test(urlVal)) urlVal = 'https://' + urlVal;

  const isCbexams = isCbexamsHost(urlVal);
  const scraperEndpoint = isCbexams
    ? `https://cbexams.quickgift.in/?url=${encodeURIComponent(urlVal)}`
    : `https://digialm.quickgift.in/?url=${encodeURIComponent(urlVal)}`;

  try {
    const res = await fetch(scraperEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const smartData = await res.json().catch(() => null);

    if (res.ok && smartData && (smartData.success === true || smartData.score_summary || smartData.candidate_info || smartData.candidateName)) {
      // Async background logging to D1 with secret admin key
      fetch(`${BACKEND_BASE}/valid_answerkey_urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ url: urlVal })
      }).catch(() => {});

      return { success: true, data: smartData };
    } else {
      // Log invalid URL
      fetch(`${BACKEND_BASE}/invalid_answerkey_urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_KEY },
        body: JSON.stringify({ url: urlVal })
      }).catch(() => {});

      return { 
        success: false, 
        error: (smartData && (smartData.error || smartData.message)) || 'Failed to fetch scorecard. Please check URL.' 
      };
    }
  } catch (err: any) {
    return { success: false, error: 'Network connection error while parsing answer key.' };
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
