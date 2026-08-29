export const runtime = 'edge';

import type { Metadata } from 'next';
import AnswerkeyCalculator from '../../components/AnswerkeyCalculator';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatExamTitle(slug: string): string {
  if (!slug) return 'Exam';
  return slug
    .split('-')
    .map((w: string) => {
      const upper = w.toUpperCase();
      if (['RRB', 'SSC', 'NTPC', 'CBT', 'UG', 'JE', 'CHSL', 'CGL', 'MTS', 'GD', 'OSSSC', 'OSSC', 'RI', 'ARI', 'AMIN', 'SFS', 'ICDS', 'AWO', 'TPO', 'ASI', 'SI'].includes(upper)) {
        return upper;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = formatExamTitle(slug);
  const canonicalUrl = `https://cbtrank.com/${slug}/answerkey`;

  return {
    title: `${formattedTitle} Answer Key Calculator & Rank Predictor`,
    description: `Calculate your ${formattedTitle} marks, shift rank, and category rank instantly with official negative marking on CBTRank's Answer Key Calculator.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${formattedTitle} Answer Key Calculator | CBT RANK`,
      description: `Calculate your ${formattedTitle} marks, shift rank, and category rank instantly.`,
      url: canonicalUrl,
    },
  };
}

export default async function AltExamAnswerkeyPage({ params }: PageProps) {
  const { slug } = await params;
  return <AnswerkeyCalculator examSlug={slug} />;
}
