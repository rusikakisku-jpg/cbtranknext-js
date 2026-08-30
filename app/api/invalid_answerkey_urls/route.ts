export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_API_URL || 'https://api.cbtrank.com';
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'cbtrank_admin_secret_key_2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const res = await fetch(`${BACKEND_BASE}/invalid_answerkey_urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
