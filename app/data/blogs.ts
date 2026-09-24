export interface BlogPost {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  created_at?: string;
  published_at?: string;
  publish_date?: string;
  updated_at?: string;
  readTime: string;
  coverImage?: string;
  author_name?: string;
  views?: number;
  content: string | Array<{
    heading?: string;
    paragraph: string;
  }>;
}

/**
 * Safely parse any date/time string or number into a reliable Unix millisecond timestamp.
 * Supports ISO strings, YYYY-MM-DD, YYYY-MM-DD HH:MM:SS, "Month Day, Year", etc.
 */
export function parsePostTimestamp(post: BlogPost | any): number {
  if (!post) return 0;

  // Candidates in priority order: published_at, publish_date, created_at, date, updated_at
  const candidates = [
    post.published_at,
    post.publish_date,
    post.created_at,
    post.date,
    post.updated_at,
  ];

  for (const raw of candidates) {
    if (raw === undefined || raw === null) continue;
    if (typeof raw === 'number' && !isNaN(raw)) {
      return raw > 1e11 ? raw : raw * 1000;
    }
    const str = String(raw).trim();
    if (!str) continue;

    // 1. Direct standard Date.parse (handles ISO 8601, 'August 14, 2026', '2026-09-24', etc.)
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) return parsed;

    // 2. Fallback regex match for YYYY-MM-DD [HH:MM:SS]
    const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (m) {
      const y = parseInt(m[1], 10);
      const mo = parseInt(m[2], 10) - 1;
      const d = parseInt(m[3], 10);
      const h = m[4] ? parseInt(m[4], 10) : 0;
      const mi = m[5] ? parseInt(m[5], 10) : 0;
      const s = m[6] ? parseInt(m[6], 10) : 0;
      const dt = new Date(Date.UTC(y, mo, d, h, mi, s));
      if (!isNaN(dt.getTime())) return dt.getTime();
    }
  }

  return 0;
}

/**
 * Sorts blog posts chronologically descending:
 * 1. Latest date & time first
 * 2. If dates/times are identical, tie-break by ID DESC (newest ID first)
 */
export function sortBlogsByLatest(blogs: BlogPost[]): BlogPost[] {
  if (!Array.isArray(blogs)) return [];
  return [...blogs].sort((a, b) => {
    const timeA = parsePostTimestamp(a);
    const timeB = parsePostTimestamp(b);
    if (timeB !== timeA) {
      return timeB - timeA; // Descending: latest date/time first
    }
    // Tie breaker: ID DESC
    const idA = typeof a.id === 'number' ? a.id : (parseInt(String((a as any).id || '0'), 10) || 0);
    const idB = typeof b.id === 'number' ? b.id : (parseInt(String((b as any).id || '0'), 10) || 0);
    return idB - idA;
  });
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

function formatCleanExcerpt(rawExcerpt?: string | null, rawDescription?: string | null, title?: string): string {
  const text = (rawExcerpt && rawExcerpt.trim()) ? rawExcerpt : (rawDescription || title || '');
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 160) return clean;
  return clean.slice(0, 157).trim() + '...';
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
          id: b.id !== undefined && b.id !== null ? Number(b.id) : undefined,
          slug: String(b.slug),
          title: String(b.title),
          excerpt: formatCleanExcerpt(b.excerpt, b.description, b.title),
          category: String(b.category || 'Exam Analysis'),
          date: String(b.published_at || b.publish_date || b.created_at || b.date || 'August 2026').trim().split(' ')[0],
          created_at: b.created_at ? String(b.created_at).trim() : undefined,
          published_at: b.published_at ? String(b.published_at).trim() : undefined,
          publish_date: b.publish_date ? String(b.publish_date).trim() : undefined,
          updated_at: b.updated_at ? String(b.updated_at).trim() : undefined,
          readTime: '4 min read',
          author_name: String(b.author_name || b.author || 'Team CBTRANK'),
          views: Number(b.views || 0),
          coverImage: formatCoverImageUrl(b.cover_image || b.image),
          content: String(b.content || b.description || b.title)
        }));
        if (blogsList.length > 0) {
          return sortBlogsByLatest(blogsList);
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
        id: b.id !== undefined && b.id !== null ? Number(b.id) : undefined,
        slug: String(b.slug),
        title: String(b.title),
        excerpt: formatCleanExcerpt(null, b.description, b.title),
        category: String(b.category || 'Exam Analysis'),
        date: String(b.published_at || b.publish_date || b.created_at || b.date || 'August 2026').trim().split(' ')[0],
        created_at: b.created_at ? String(b.created_at).trim() : undefined,
        published_at: b.published_at ? String(b.published_at).trim() : undefined,
        publish_date: b.publish_date ? String(b.publish_date).trim() : undefined,
        updated_at: b.updated_at ? String(b.updated_at).trim() : undefined,
        readTime: '4 min read',
        author_name: String(b.author || 'Team CBTRANK'),
        views: Number(b.views || 0),
        coverImage: formatCoverImageUrl(b.image || b.cover_image),
        content: String(b.description || b.title)
      });
    }

    if (blogsList.length > 0) {
      return sortBlogsByLatest(blogsList);
    }
  } catch (err) {
    // Silent error fallback to static CBTRANK posts
  }

  return sortBlogsByLatest(FALLBACK_BLOG_POSTS);
}

/**
 * Safely increment view count for a specific blog post by slug or ID.
 * Communicates with Cloudflare Worker API with seamless D1 fallback.
 */
export async function incrementBlogView(
  slug: string,
  id?: number
): Promise<{ success: boolean; views?: number; error?: string }> {
  if (!slug && !id) {
    return { success: false, error: 'Missing slug or id' };
  }

  // 1. Primary: Forward to Cloudflare Worker view increment endpoint
  try {
    const res = await fetch('https://api.cbtrank.com/api/blogs/increment-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, id }),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, views: data?.views };
    }
  } catch (e) {
    // Fallback to direct D1 REST API query below
  }

  // 2. Secondary Fallback: Direct Cloudflare D1 REST API query
  const account_id = process.env.CF_ACCOUNT_ID || '38c7d789225e89652dd6bb111403db5d';
  const token = process.env.CF_D1_TOKEN || 'cfut_umhNZGH5mokB88O6AHQVSURuP6AW48AIry4wVFaW74f7f9b6';
  const db_uuid = process.env.CF_D1_DATABASE_ID || 'fd29c541-3fd2-4fa8-8dc1-19809ab907c3';

  if (account_id && token && db_uuid) {
    try {
      const cleanSlug = slug ? String(slug).replace(/'/g, "''").trim() : '';
      const numId = id !== undefined && !isNaN(Number(id)) ? Number(id) : null;
      const whereClause = cleanSlug ? `slug = '${cleanSlug}'` : `id = ${numId}`;

      const updateSql = `UPDATE blogs SET views = COALESCE(views, 0) + 1 WHERE ${whereClause}; SELECT id, slug, views FROM blogs WHERE ${whereClause} LIMIT 1;`;
      const url = `https://api.cloudflare.com/client/v4/accounts/${account_id}/d1/database/${db_uuid}/query`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: updateSql }),
      });
      if (res.ok) {
        const data = await res.json();
        const results = data?.result?.[1]?.results || data?.result?.[0]?.results;
        const updatedViews = results?.[0]?.views;
        return { success: true, views: updatedViews !== undefined ? Number(updatedViews) : undefined };
      }
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to update view' };
    }
  }

  return { success: false, error: 'Database credentials unavailable' };
}

