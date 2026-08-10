export const runtime = 'edge';

import type { Metadata } from 'next';
import AnswerkeyCalculator from '../components/AnswerkeyCalculator';

export const metadata: Metadata = {
  title: 'Answer Key Calculator',
  description: 'Calculate your marks, shift rank, and category rank instantly with CBTRank\'s Answer Key Calculator.',
};

// Generic /answerkey page — no specific exam, shows universal calculator
export default function AnswerkeyPage() {
  return <AnswerkeyCalculator />;
}
