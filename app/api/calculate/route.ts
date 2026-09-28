export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { processAnswerKeyAction } from '../../actions/calculate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await processAnswerKeyAction(body);
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or broken link. Please check your Answer Key URL and retry.',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
