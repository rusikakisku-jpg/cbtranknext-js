export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage?: string;
  content: Array<{
    heading?: string;
    paragraph: string;
  }>;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-cbt-rank-normalization-works',
    title: 'How Normalization & Percentile Score Works in CBT Competitive Exams',
    excerpt: 'Understand how formula-based normalization balances difficulty across multiple exam shifts in SSC, RRB, and State PSC examinations.',
    category: 'Exam Analysis',
    date: 'August 14, 2026',
    readTime: '4 min read',
    content: [
      {
        heading: 'What is Score Normalization?',
        paragraph: 'Computer Based Tests (CBT) for large national exams like SSC CGL, RRB NTPC, and Railway Group D are conducted across multiple shifts over several days. Since question paper difficulty levels vary naturally between shifts, normalization adjusts candidates raw marks to ensure fair evaluation.'
      },
      {
        heading: 'Key Factors Influencing Normalized Marks',
        paragraph: 'Normalization algorithms consider the mean and standard deviation of marks obtained by candidates in a specific shift compared to all other shifts. Shifts with higher average scores are designated as easier, while shifts with lower average scores are adjusted upward.'
      },
      {
        heading: 'How to Check Your Expected Shift Rank',
        paragraph: 'By pasting your official response sheet URL into CBTRank Answer Key Calculator, your shift average and expected category rank are evaluated instantly based on authentic candidate submissions.'
      }
    ]
  },
  {
    slug: 'ssc-cgl-answer-key-step-by-step-rank-checking-guide',
    title: 'Step-by-Step Guide to Check SSC & Railway Answer Key Marks and Rank',
    excerpt: 'Learn how to retrieve your official Digialm response sheet URL and calculate exact correct, wrong, and net marks in seconds.',
    category: 'Guides',
    date: 'August 12, 2026',
    readTime: '3 min read',
    content: [
      {
        heading: 'Finding Your Digialm Response Sheet URL',
        paragraph: 'Log in to the official examination portal using your Roll Number and Password. Open the Candidate Response Sheet / Answer Key link and copy the full URL from your browser address bar (e.g. digialm.com or cbexams.com link).'
      },
      {
        heading: 'Pasting into CBTRank Calculator',
        paragraph: 'Navigate to CBTRank Answer Key Calculator, select your exam category and paper language, then paste the response sheet URL into the input field and click Calculate.'
      },
      {
        heading: 'Analyzing Your Detailed Scorecard',
        paragraph: 'Your total attempted, correct, wrong, net raw score, accuracy percentage, and section-by-section breakdown will be generated instantly.'
      }
    ]
  },
  {
    slug: 'understanding-category-and-shift-wise-cut-off-trends',
    title: 'Understanding Category & Shift-Wise Cut-Off Trends for 2026 Exams',
    excerpt: 'An in-depth analysis of UR, OBC, EWS, SC, and ST category rank thresholds for Tier-1 and Mains competitive examinations.',
    category: 'Cut-Off Analysis',
    date: 'August 10, 2026',
    readTime: '5 min read',
    content: [
      {
        heading: 'Why Category Ranks Matter More Than Raw Scores',
        paragraph: 'In competitive exams with reservation rules, your rank within your specific category (UR, OBC, EWS, SC, ST, PwD) determines your final selection probability much more accurately than raw scores alone.'
      },
      {
        heading: 'Comparing Shift Averages Across Dates',
        paragraph: 'Harder shift candidates often see raw score additions post-normalization, whereas candidates in easier shifts need higher raw scores to clear the same cut-off percentile.'
      }
    ]
  }
];
