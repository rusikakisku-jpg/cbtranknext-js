export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || searchParams.get('type_id') || '';
    const flat = searchParams.get('flat') || '';
    
    let targetUrl = `${BACKEND_BASE}/locations`;
    const params = new URLSearchParams();
    if (id) params.set('id', id);
    if (flat) params.set('flat', flat);
    if (params.toString()) targetUrl += `?${params.toString()}`;

    const res = await fetch(targetUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch locations' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
