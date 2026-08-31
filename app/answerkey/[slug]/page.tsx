export const runtime = 'edge';

import { permanentRedirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AltExamAnswerkeyPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/${slug}/answerkey`);
}
