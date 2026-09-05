import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | CBT RANK',
  description: 'Have queries, feedback, or need support with your CBT exam answer key calculation? Contact the CBT RANK support team.',
  alternates: {
    canonical: 'https://cbtrank.com/contact-us',
  },
  openGraph: {
    title: 'Contact Us | CBT RANK',
    description: 'Get in touch with the CBT RANK support team for questions, feedback, or exam additions.',
    url: 'https://cbtrank.com/contact-us',
    siteName: 'CBT RANK',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
