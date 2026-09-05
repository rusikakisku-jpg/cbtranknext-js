export const runtime = 'edge';

import type { Metadata } from 'next';
import AnswerkeyCalculator from '../components/AnswerkeyCalculator';
import ExamFaqSection from '../components/ExamFaqSection';
import RelatedExamsSection from '../components/RelatedExamsSection';

export const metadata: Metadata = {
  title: 'Universal Answer Key Calculator & Rank Predictor',
  description: 'Calculate your marks, shift rank, and category rank instantly with CBTRank\'s official Answer Key Calculator. Works with all DigiALM and TCS iON response sheets.',
  keywords: [
    'Answer Key Calculator',
    'CBT marks calculator',
    'DigiALM answer key score',
    'SSC answer key calculator',
    'RRB answer key calculator',
    'rank predictor'
  ],
  alternates: {
    canonical: 'https://cbtrank.com/answerkey',
  },
  openGraph: {
    title: 'Universal Answer Key Calculator | CBT RANK',
    description: 'Calculate your marks, shift rank, and category rank instantly. Supports all major CBT exams.',
    url: 'https://cbtrank.com/answerkey',
    siteName: 'CBT RANK',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Universal Answer Key Calculator | CBT RANK',
    description: 'Calculate your marks, shift rank, and category rank instantly.',
  },
};

const UNIVERSAL_FAQS = [
  {
    q: 'How does the Universal Answer Key Calculator work?',
    a: 'Simply paste your official response sheet URL (DigiALM / TCS iON) into the calculator input. Our system parses each question, matches your marked response with official answer keys, and calculates your total positive marks, negative marks, and net score.'
  },
  {
    q: 'Which exam links can be checked here?',
    a: 'You can check answer keys from SSC (CGL, CHSL, MTS, GD, JE, CPO), Railway RRB (NTPC, Group D, ALP, Technician), and any state government recruitment exams hosted on TCS iON or DigiALM platforms.'
  },
  {
    q: 'How do I copy my response sheet link on mobile?',
    a: 'Open your candidate login page in Chrome or your mobile browser. Once the response sheet with questions and marked options appears, tap your browser’s top address bar and click the Copy icon to get the complete URL.'
  },
  {
    q: 'Are my scores and personal details saved publicly?',
    a: 'No. Your marks are processed securely. CBT RANK never asks for or stores candidate passwords, roll numbers, or personal sensitive data.'
  }
];

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'CBT RANK Universal Answer Key Calculator',
  'url': 'https://cbtrank.com/answerkey',
  'applicationCategory': 'EducationalApplication',
  'operatingSystem': 'All',
  'description': 'Calculate your exam marks, shift rank, and category cut off instantly using your official response sheet on CBTRank.',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'INR',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': UNIVERSAL_FAQS.map((faq) => ({
    '@type': 'Question',
    'name': faq.q,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.a,
    },
  })),
};

export default function AnswerkeyPage() {
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

      <AnswerkeyCalculator />
      <ExamFaqSection formattedTitle="CBT Exams" faqs={UNIVERSAL_FAQS} />
      <RelatedExamsSection currentSlug="" />
    </>
  );
}
