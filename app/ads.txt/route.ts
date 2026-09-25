import { NextResponse } from 'next/server';
import { getAdsTxtPubId } from '@/app/config/adsense';

export const runtime = 'edge';

export async function GET() {
  const pubId = getAdsTxtPubId();

  if (!pubId) {
    return new NextResponse(
      '# CBT RANK - ads.txt\n# Google AdSense is not configured yet.\n# Please add your Publisher ID in app/config/adsense.ts or set NEXT_PUBLIC_ADSENSE_CLIENT_ID.\n',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      }
    );
  }

  // Official Google AdSense Authorized Digital Sellers (ads.txt) record
  const content = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    },
  });
}
