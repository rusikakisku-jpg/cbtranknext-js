export const runtime = 'edge';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AnswerkeyCalculator from '../../components/AnswerkeyCalculator';
import ExamFaqSection from '../../components/ExamFaqSection';
import RelatedExamsSection from '../../components/RelatedExamsSection';
import { getExamBySlug, Exam } from '../../data/exams';

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
  const exam = await getExamBySlug(slug);

  if (!exam) {
    return {
      title: 'Exam Not Found',
      robots: { index: false, follow: false },
    };
  }

  const rawTitle = exam.title || formatExamTitle(slug);
  const examTitle = rawTitle.replace(/\s+Answer\s+Key$/i, '');
  const canonicalUrl = `https://cbtrank.com/${slug}/answerkey`;
  const metaTitle = `${examTitle} Answer Key & Rank Calculator`;

  return {
    title: metaTitle,
    description: `Calculate your ${examTitle} marks, shift rank, and category rank instantly with official negative marking on CBTRank's Answer Key Calculator.`,
    keywords: [
      `${examTitle} answer key`,
      `${examTitle} rank predictor`,
      `${examTitle} score calculator`,
      `${examTitle} response sheet`,
      'cbt rank calculator'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${metaTitle} | CBT RANK`,
      description: `Calculate your ${examTitle} marks, shift rank, and category rank instantly.`,
      url: canonicalUrl,
      siteName: 'CBT RANK',
      type: 'website',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${examTitle} Answer Key Calculator & Rank Predictor`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${metaTitle} | CBT RANK`,
      description: `Calculate your ${examTitle} marks, shift rank, and category rank instantly.`,
      images: ['/opengraph-image'],
    },
  };
}

export default async function ExamAnswerkeyPage({ params }: PageProps) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);

  if (!exam) {
    notFound();
  }

  const rawTitle = exam.title || formatExamTitle(slug);
  const examTitle = rawTitle.replace(/\s+Answer\s+Key$/i, '');
  const marksRight = exam.marks_right ?? 1;
  const marksWrong = exam.marks_wrong ?? 0.25;
  const locationText = Array.isArray(exam.location_id)
    ? exam.location_id.join(', ')
    : (exam.location_id || 'All India');

  const faqs = [
    {
      q: `How to check ${examTitle} Answer Key and calculate marks?`,
      a: `To calculate your marks, copy your official response sheet link from the exam portal and paste it into the CBTRank Answer Key Calculator. The tool automatically counts correct answers, wrong answers, applies official negative marking (-${marksWrong} per wrong response), and provides a section-wise score breakdown instantly.`
    },
    {
      q: `Does CBTRank calculate official negative marking for ${examTitle}?`,
      a: `Yes, CBTRank automatically applies exact official negative marking rules (+${marksRight} for correct, -${marksWrong} for incorrect) as per the official notification while calculating your total raw score.`
    },
    {
      q: `How is Shift Rank and Category Rank calculated for ${examTitle}?`,
      a: `Ranks are computed in real-time by comparing your raw score against all verified candidates who appeared in the same shift and overall category in the ${examTitle} examination.`
    },
    {
      q: `How can I copy my official response sheet URL?`,
      a: `Open your response sheet on the official candidate portal (DigiALM / TCS iON), tap your browser's address bar, copy the full URL, and paste it directly into the calculator URL box above.`
    }
  ];

  // 1. WebApplication Schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': `${examTitle} Answer Key & Rank Calculator`,
    'url': `https://cbtrank.com/${slug}/answerkey`,
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'All',
    'description': `Calculate your ${examTitle} exam marks, shift rank, and category cut off instantly using your official response sheet on CBTRank.`,
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
        'name': examTitle,
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

      <AnswerkeyCalculator
        examSlug={slug}
        initialTitle={`${examTitle} Answer Key Calculator`}
        sidebar={
          <RelatedExamsSection
            currentSlug={slug}
            isSidebar={true}
            showUniversalCta={false}
          />
        }
      />

      {/* Dynamic Exam Overview & Marking Scheme Details */}
      <div style={{ maxWidth: '860px', margin: '24px auto 0', padding: '0 16px' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>📋</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {examTitle} - Marking Scheme &amp; Details
            </h2>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0' }}>
            Use this automated rank predictor tool to evaluate your performance in the {examTitle}. The score evaluation strictly adheres to official recruitment notification guidelines.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>Correct Mark</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>+{marksRight} Mark</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>Negative Marking</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>-{marksWrong} Mark</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>Conducting Scope</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{locationText}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>Response Format</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>TCS iON / DigiALM</p>
            </div>
          </div>
        </div>
      </div>

      <ExamFaqSection formattedTitle={examTitle} faqs={faqs} />
    </>
  );
}
