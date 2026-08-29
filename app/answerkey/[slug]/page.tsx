export const runtime = 'edge';

import type { Metadata } from 'next';
import AnswerkeyCalculator from '../../components/AnswerkeyCalculator';
import ExamFaqSection from '../../components/ExamFaqSection';

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
  const formattedTitle = formatExamTitle(slug);

  const faqs = [
    {
      q: `How to check ${formattedTitle} Answer Key and calculate marks?`,
      a: `To calculate your marks, copy your official response sheet link from the exam portal and paste it into the CBTRank Answer Key Calculator. The tool automatically counts correct answers, wrong answers, negative marking, and provides a section-wise score breakdown instantly.`
    },
    {
      q: `Does CBTRank calculate official negative marking for ${formattedTitle}?`,
      a: `Yes, CBTRank automatically applies exact official negative marking rules as per the exam notification while calculating your total raw and normalized scores.`
    },
    {
      q: `How is Shift Rank and Category Rank calculated for ${formattedTitle}?`,
      a: `Ranks are computed in real-time by comparing your raw score against all verified candidates who appeared in the same shift and overall category in the examination.`
    },
    {
      q: `How can I copy my official response sheet URL?`,
      a: `Open your response sheet on the official candidate portal, click your browser's address bar (the URL starts with digialm.com / cbexams / tcsion), copy the full link, and paste it directly into the calculator URL box.`
    }
  ];

  return (
    <>
      <AnswerkeyCalculator examSlug={slug} />
      <ExamFaqSection formattedTitle={formattedTitle} faqs={faqs} />
    </>
  );
}
