export const runtime = 'edge';

import { NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_BASE}/languages`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch languages' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
