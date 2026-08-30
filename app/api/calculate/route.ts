export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

function isCbexamsHost(raw: string): boolean {
  if (!raw) return false;
  try {
    const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
    const host = (parsed.hostname || '').toLowerCase();
    return host === 'cbexams.com' || host.endsWith('.cbexams.com');
  } catch (e) { return false; }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let urlVal = (body.url || '').trim();

    if (!urlVal) {
      return NextResponse.json({ success: false, error: 'Answer key URL is required' }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(urlVal)) urlVal = 'https://' + urlVal;

    const isCbexams = isCbexamsHost(urlVal);
    const scraperEndpoint = isCbexams
      ? `https://cbexams.quickgift.in/?url=${encodeURIComponent(urlVal)}`
      : `https://digialm.quickgift.in/?url=${encodeURIComponent(urlVal)}`;

    const res = await fetch(scraperEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data || { success: false, error: 'Failed to parse response sheet' }, { status: res.status || 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error during calculation' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let urlVal = (searchParams.get('url') || '').trim();

    if (!urlVal) {
      return NextResponse.json({ success: false, error: 'Answer key URL parameter (?url=) is required' }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(urlVal)) urlVal = 'https://' + urlVal;

    const isCbexams = isCbexamsHost(urlVal);
    const scraperEndpoint = isCbexams
      ? `https://cbexams.quickgift.in/?url=${encodeURIComponent(urlVal)}`
      : `https://digialm.quickgift.in/?url=${encodeURIComponent(urlVal)}`;

    const res = await fetch(scraperEndpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data || { success: false, error: 'Failed to parse response sheet' }, { status: res.status || 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error during calculation' }, { status: 500 });
  }
}
