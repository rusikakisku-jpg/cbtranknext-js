export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const res = await fetch(`${BACKEND_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
