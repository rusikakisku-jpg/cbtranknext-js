export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { fetchBlogsFromCloudflareD1 } from '../../data/blogs';

export async function GET() {
  try {
    const blogs = await fetchBlogsFromCloudflareD1();
    return NextResponse.json({
      success: true,
      total: blogs.length,
      blogs: blogs
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch blog posts'
    }, { status: 500 });
  }
}
