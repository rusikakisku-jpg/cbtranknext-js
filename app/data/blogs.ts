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

function formatCoverImageUrl(rawImage?: string | null): string | undefined {
  if (!rawImage || typeof rawImage !== 'string') return undefined;
  const trimmed = rawImage.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanPath = trimmed.replace(/^\/+/, '');
  return `https://upload.cbtrank.com/${cleanPath}`;
}

export async function fetchBlogsFromCloudflareD1(): Promise<BlogPost[]> {
  // 1. Primary: Fetch live blogs from Cloudflare Worker API (https://api.cbtrank.com/blogs)
  try {
    const workerRes = await fetch("https://api.cbtrank.com/blogs", {
      next: { revalidate: 60 }
    });
    if (workerRes.ok) {
      const json = await workerRes.json();
      const rawBlogs = json?.data || json?.blogs || (Array.isArray(json) ? json : []);
      if (Array.isArray(rawBlogs) && rawBlogs.length > 0) {
        const publishedBlogs = rawBlogs.filter((b: any) => {
          if (!b.status) return true;
          const st = String(b.status).toLowerCase();
          return st === 'publish' || st === 'published';
        });

        const blogsList: BlogPost[] = publishedBlogs.map((b: any) => ({
          slug: String(b.slug),
          title: String(b.title),
          excerpt: String(b.excerpt || b.description || b.title),
          category: String(b.category || 'Exam Analysis'),
          date: String(b.created_at || 'August 2026').split(' ')[0],
          readTime: '4 min read',
          author_name: String(b.author_name || b.author || 'Team CBTRANK'),
          views: Number(b.views || 0),
          coverImage: formatCoverImageUrl(b.cover_image || b.image),
          content: String(b.content || b.description || b.title)
        }));
        if (blogsList.length > 0) {
          return blogsList;
        }
      }
    }
  } catch (e) {
    // Fallback to direct D1 REST API query
  }

  // 2. Secondary Fallback: Direct Cloudflare D1 REST API query
  const account_id = process.env.CF_ACCOUNT_ID || "";
  const token = process.env.CF_D1_TOKEN || "";
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  async function queryD1(db_uuid: string, sql: string) {
    if (!token || !account_id || !db_uuid) return [];
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${account_id}/d1/database/${db_uuid}/query`;
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ sql })
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data?.result?.[0]?.results)) {
        return data.result[0].results;
      }
    } catch (e) {
      // Silent error fallback
    }
    return [];
  }

  try {
    // Strictly fetch ONLY published posts from cbtrank_db D1 database (`blogs` table)
    const cbtrank_uuid = process.env.CF_D1_DATABASE_ID || "";
    let cbt_blogs = await queryD1(cbtrank_uuid, "SELECT * FROM blogs WHERE status = 'publish' OR status = 'published' ORDER BY id DESC;");
    
    // Fallback if status column variation occurs
    if (!cbt_blogs || cbt_blogs.length === 0) {
      cbt_blogs = await queryD1(cbtrank_uuid, "SELECT * FROM blogs ORDER BY id DESC;");
    }

    const blogsList: BlogPost[] = [];

    for (const b of cbt_blogs) {
      if (!b.slug || !b.title) continue;

      // Filter out draft posts safely
      if (b.status) {
        const st = String(b.status).toLowerCase();
        if (st === 'draft') continue;
        if (st !== 'publish' && st !== 'published') continue;
      }

      blogsList.push({
        slug: String(b.slug),
        title: String(b.title),
        excerpt: String(b.description || b.title),
        category: String(b.category || 'Exam Analysis'),
        date: String(b.created_at || 'August 2026').split(' ')[0],
        readTime: '4 min read',
        author_name: String(b.author || 'Team CBTRANK'),
        views: Number(b.views || 0),
        coverImage: formatCoverImageUrl(b.image || b.cover_image),
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
