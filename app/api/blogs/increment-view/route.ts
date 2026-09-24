export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { incrementBlogView } from '../../../data/blogs';

export async function POST(request: NextRequest) {
  try {
    let slug = '';
    let id: number | undefined = undefined;

    try {
      const body = await request.json();
      if (body) {
        if (body.slug) slug = String(body.slug).trim();
        if (body.id !== undefined && !isNaN(Number(body.id))) id = Number(body.id);
      }
    } catch (e) {}

    // Fallback to URL search parameters if body was empty
    if (!slug && id === undefined) {
      const url = new URL(request.url);
      slug = url.searchParams.get('slug')?.trim() || '';
      const idParam = url.searchParams.get('id');
      if (idParam && !isNaN(Number(idParam))) {
        id = Number(idParam);
      }
    }

    if (!slug && id === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing blog slug or id' },
        { status: 400 }
      );
    }

    const result = await incrementBlogView(slug, id);

    return NextResponse.json(
      {
        success: result.success,
        slug: slug || undefined,
        id: id,
        views: result.views,
        message: result.success ? 'View recorded successfully' : result.error,
      },
      {
        status: result.success ? 200 : 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug')?.trim() || '';
  const idParam = url.searchParams.get('id');
  const id = idParam && !isNaN(Number(idParam)) ? Number(idParam) : undefined;

  if (!slug && id === undefined) {
    return NextResponse.json(
      { success: false, error: 'Missing slug or id' },
      { status: 400 }
    );
  }

  const result = await incrementBlogView(slug, id);
  return NextResponse.json(result, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
