'use server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'cbtrank_admin_secret_key_2026';
const PARSER_CLUSTER = [
  'https://digialm.quickgift.in/?url=',
  'http://147.93.154.159/api_smart.php?url=',
  'http://15.207.33.39/api/v12/calculate?url=',
  'http://3.108.145.65/api/v12/calculate?url='
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

  // Seamless Multi-Server Cluster Fetch
  for (const endpoint of targetEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && (data.success === true || data.score_summary || data.candidate_info || data.candidateName)) {
          smartData = data;
          break; // Stop loop immediately once valid data is received
        }
      }
    } catch (err) {}
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
