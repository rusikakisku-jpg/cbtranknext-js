export const runtime = 'edge';

import type { Metadata } from 'next';
import AnswerkeyCalculator from '../../components/AnswerkeyCalculator';

// Next.js 15: params is a Promise
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
    keywords: [
      `${formattedTitle} answer key`,
      `${formattedTitle} rank predictor`,
      `${formattedTitle} score calculator`,
      `${formattedTitle} response sheet`,
      'cbt rank calculator'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${formattedTitle} Answer Key Calculator | CBT RANK`,
      description: `Calculate your ${formattedTitle} marks, shift rank, and category rank instantly.`,
      url: canonicalUrl,
      siteName: 'CBT RANK',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${formattedTitle} Answer Key Calculator | CBT RANK`,
      description: `Calculate your ${formattedTitle} marks, shift rank, and category rank instantly.`,
    },
  };
}

export default async function ExamAnswerkeyPage({ params }: PageProps) {
  const { slug } = await params;
  const formattedTitle = formatExamTitle(slug);

  // 1. WebApplication Schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': `${formattedTitle} Answer Key & Rank Calculator`,
    'url': `https://cbtrank.com/${slug}/answerkey`,
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'All',
    'description': `Calculate your ${formattedTitle} exam marks, shift rank, and category cut off instantly using your official response sheet on CBTRank.`,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'INR',
    },
  };

  // 2. FAQPage Schema for Google Rich Snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `How to check ${formattedTitle} Answer Key and calculate marks?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `To calculate marks, copy your official response sheet link from the exam portal and paste it into the CBTRank Answer Key Calculator. The tool automatically counts right answers, wrong answers, negative marking, and provides section-wise marks.`,
        },
      },
      {
        '@type': 'Question',
        'name': `Does CBTRank calculate official negative marking for ${formattedTitle}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Yes, CBTRank applies exact official negative marking as per the exam notification while calculating your total normalized and raw scores.`,
        },
      },
      {
        '@type': 'Question',
        'name': `How is Shift Rank and Category Rank calculated for ${formattedTitle}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Ranks are calculated by comparing your raw score against all candidates who participated in the same shift and overall category in the examination.`,
        },
      },
    ],
  };

  // 3. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://cbtrank.com',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Answer Key',
        'item': 'https://cbtrank.com/answerkey',
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': formattedTitle,
        'item': `https://cbtrank.com/${slug}/answerkey`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AnswerkeyCalculator examSlug={slug} />
    </>
  );
}
