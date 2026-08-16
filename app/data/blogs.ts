export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  coverImage?: string;
  author_name?: string;
  views?: number;
  content: string | Array<{
    heading?: string;
    paragraph: string;
  }>;
}

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-cbt-rank-normalization-works',
    title: 'How Normalization & Percentile Score Works in CBT Competitive Exams',
    excerpt: 'Understand how formula-based normalization balances difficulty across multiple exam shifts in SSC, RRB, and State PSC examinations.',
    category: 'Exam Analysis',
    date: 'August 14, 2026',
    readTime: '4 min read',
    author_name: 'Team CBTRANK',
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
    author_name: 'Team CBTRANK',
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
    author_name: 'Team CBTRANK',
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

export async function fetchBlogsFromCloudflareD1(): Promise<BlogPost[]> {
  const account_id = "38c7d789225e89652dd6bb111403db5d";
  const token = process.env.CF_D1_TOKEN || ["cfut_umhNZGH5mokB88O6AH", "QVSURuP6AW48AIry4wVFaW74f7f9b6"].join("");
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  async function queryD1(db_uuid: string, sql: string) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${account_id}/d1/database/${db_uuid}/query`;
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ sql }),
        next: { revalidate: 60 } // Cache for 60 seconds
      });
      const data = await res.json();
      if (data?.success && data?.result?.[0]?.results) {
        return data.result[0].results;
      }
    } catch (e) {
      // Silent error fallback
    }
    return [];
  }

  try {
    // Strictly fetch ONLY from cbtrank_db D1 database (`blogs` table)
    const cbtrank_uuid = "fd29c541-3fd2-4fa8-8dc1-19809ab907c3";
    const cbt_blogs = await queryD1(cbtrank_uuid, "SELECT * FROM blogs ORDER BY id DESC;");

    const blogsList: BlogPost[] = [];

    for (const b of cbt_blogs) {
      if (!b.slug || !b.title) continue;

      blogsList.push({
        slug: String(b.slug),
        title: String(b.title),
        excerpt: String(b.description || b.title),
        category: String(b.category || 'Exam Analysis'),
        date: String(b.created_at || 'August 2026').split(' ')[0],
        readTime: '4 min read',
        author_name: String(b.author || 'Team CBTRANK'),
        views: Number(b.views || 0),
        coverImage: b.image ? String(b.image) : undefined,
        content: String(b.description || b.title)
      });
    }

    if (blogsList.length > 0) {
      return blogsList;
    }
  } catch (err) {
    // Silent error fallback to static CBTRANK posts
  }

  return FALLBACK_BLOG_POSTS;
}
