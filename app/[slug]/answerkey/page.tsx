import type { Metadata } from 'next';
import AnswerkeyCalculator from '../../components/AnswerkeyCalculator';

// Next.js 15: params is a Promise
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // Convert slug to readable title e.g. "osssc-ri-ari-amin" → "Osssc Ri Ari Amin"
  const title = slug
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${title} Answer Key Calculator`,
    description: `Calculate your ${title} marks, shift rank, and category rank instantly with CBTRank's Answer Key Calculator.`,
    openGraph: {
      title: `${title} Answer Key Calculator | CBT RANK`,
      description: `Calculate your ${title} marks, shift rank, and category rank instantly.`,
    },
  };
}

export default async function ExamAnswerkeyPage({ params }: PageProps) {
  const { slug } = await params;
  return <AnswerkeyCalculator examSlug={slug} />;
}
