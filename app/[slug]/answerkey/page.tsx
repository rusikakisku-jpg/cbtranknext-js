export const runtime = 'edge';

import type { Metadata } from 'next';
import AnswerkeyCalculator from '../../components/AnswerkeyCalculator';
import ExamFaqSection from '../../components/ExamFaqSection';
import RelatedExamsSection from '../../components/RelatedExamsSection';

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

  // Format title to fit within Google's snippet width (55-60 chars max before '| CBT RANK')
  let displayTitle = formattedTitle;
  if (displayTitle.length > 32) {
    displayTitle = displayTitle.slice(0, 30).trim() + '...';
  }
  const metaTitle = `${displayTitle} Answer Key & Rank Calculator`;

  return {
    title: metaTitle,
    description: `Calculate your ${displayTitle} marks, shift rank, and category rank instantly with official negative marking on CBTRank's Answer Key Calculator.`,
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
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a,
      },
    })),
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

      <AnswerkeyCalculator examSlug={slug} initialTitle={`${formattedTitle} Answer Key Calculator`} />
      <ExamFaqSection formattedTitle={formattedTitle} faqs={faqs} />
      <RelatedExamsSection currentSlug={slug} />
    </>
  );
}
