import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Answer Key | CBT RANK',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ReviewAnswerkeyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
