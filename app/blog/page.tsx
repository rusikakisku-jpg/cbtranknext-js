export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchBlogsFromCloudflareD1, BlogPost, FALLBACK_BLOG_POSTS } from '../data/blogs';

export const metadata: Metadata = {
  title: 'Latest Exam Updates & Rank Analysis Articles | CBT RANK Blog',
  description: 'Read detailed guides, normalization formulas, answer key verification steps, and category cut-off analysis for SSC, RRB, and State Exams.',
  openGraph: {
    title: 'CBT RANK Blog | Exam Updates & Cut-Off Analysis',
    description: 'Read detailed guides, normalization formulas, answer key verification steps, and category cut-off analysis.',
  },
};

interface BlogPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

function cleanExcerpt(text?: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

function formatDate(rawDate?: string): string {
  if (!rawDate) return 'Recent';
  try {
    if (rawDate.includes('-')) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
  } catch (e) {}
  return rawDate.split(' ')[0] || 'Recent';
}

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  let query = '';
  try {
    const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
    query = String(resolvedParams?.q || '').trim();
  } catch (e) {
    query = '';
  }

  let allPosts: BlogPost[] = [];
  try {
    allPosts = await fetchBlogsFromCloudflareD1();
  } catch (e) {
    allPosts = FALLBACK_BLOG_POSTS;
  }
  if (!Array.isArray(allPosts) || allPosts.length === 0) {
    allPosts = FALLBACK_BLOG_POSTS;
  }

  const filteredPosts = query
    ? allPosts.filter(p =>
        (p.title || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.excerpt || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(query.toLowerCase())
      )
    : allPosts;

  const categories = Array.from(new Set(allPosts.map(p => p.category || 'Exam Analysis'))).map(cat => ({
    category: cat,
    count: allPosts.filter(p => (p.category || 'Exam Analysis') === cat).length,
  }));

  const featuredPost = !query && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = !query && filteredPosts.length > 1 ? filteredPosts.slice(1) : filteredPosts;

  return (
    <main style={{ minHeight: '80vh', padding: '16px 0 44px' }}>
      <div className="blog-main-container">
        
        {/* Top Hero Banner */}
        <div className="blog-hero-banner">
          <div className="blog-hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Exam Knowledge Hub &amp; Guides
          </div>
          <h1 className="blog-hero-title">
            CBT RANK Exam Articles &amp; Analysis
          </h1>
          <p className="blog-hero-desc">
            Explore authentic shift-wise difficulty analysis, normalisation calculation formulas, response sheet evaluation steps, and category cut-off trends.
          </p>
        </div>

        <div className="blog-layout">
          
          {/* Main Content Area */}
          <div className="content-area">
            
            {/* Section Heading / Filter Status */}
            <div className="section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '22px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                {query ? `Search Results for "${query}"` : 'All Articles & Updates'}
              </h2>
              {query && (
                <Link href="/blog" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                  &times; Clear Search Filter
                </Link>
              )}
            </div>

            {/* Empty Search State */}
            {filteredPosts.length === 0 ? (
              <div className="blog-empty-box">
                <div className="blog-empty-icon">🔍</div>
                <h3 className="blog-empty-title">No Articles Found</h3>
                <p className="blog-empty-desc">
                  We couldn&apos;t find any posts matching &quot;{query}&quot;. Try searching with other exam keywords.
                </p>
                <Link href="/blog" className="btn-cta" style={{ display: 'inline-flex', padding: '8px 18px', fontSize: '0.84rem' }}>
                  View All Articles
                </Link>
              </div>
            ) : (
              <div>
                {/* Spotlight / Featured Post (Only when not actively searching) */}
                {featuredPost && (
                  <div className="featured-blog-card">
                    <div className="featured-img-wrap">
                      <Link href={`/blog/${featuredPost.slug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={featuredPost.coverImage && featuredPost.coverImage.startsWith('http') ? featuredPost.coverImage : (featuredPost.coverImage ? `https://upload.cbtrank.com/${featuredPost.coverImage.replace(/^\/+/, '')}` : 'https://upload.cbtrank.com/logo.png')}
                          alt={featuredPost.title}
                          loading="lazy"
                        />
                      </Link>
                    </div>
                    <div className="featured-content-wrap">
                      <div>
                        <span className="featured-spotlight-pill">
                          ★ Featured Article
                        </span>
                        <h3 className="featured-title">
                          <Link href={`/blog/${featuredPost.slug}`}>
                            {featuredPost.title}
                          </Link>
                        </h3>
                        <p className="featured-excerpt">
                          {cleanExcerpt(featuredPost.excerpt)}
                        </p>
                      </div>

                      <div className="card-bottom-footer">
                        <div className="card-author-chip">
                          <div className="card-avatar-mini">
                            {(featuredPost.author_name || 'Team CBTRANK').charAt(0).toUpperCase()}
                          </div>
                          <span>{featuredPost.author_name || 'Team CBTRANK'} &bull; {formatDate(featuredPost.date)}</span>
                        </div>
                        <Link href={`/blog/${featuredPost.slug}`} className="card-read-arrow">
                          Read Full &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Articles Grid */}
                <div className="blog-cards-grid">
                  {(query ? filteredPosts : remainingPosts).map((post) => (
                    <article key={post.slug} className="premium-blog-card">
                      <div className="card-thumbnail-box">
                        <Link href={`/blog/${post.slug}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.coverImage && post.coverImage.startsWith('http') ? post.coverImage : (post.coverImage ? `https://upload.cbtrank.com/${post.coverImage.replace(/^\/+/, '')}` : 'https://upload.cbtrank.com/logo.png')}
                            alt={post.title}
                            loading="lazy"
                          />
                        </Link>
                        <span className="card-cat-badge-float">
                          {post.category || 'Exam Analysis'}
                        </span>
                      </div>

                      <div className="card-main-body">
                        <div>
                          <h3 className="card-post-title">
                            <Link href={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h3>
                          <p className="card-post-excerpt">
                            {cleanExcerpt(post.excerpt)}
                          </p>
                        </div>

                        <div className="card-bottom-footer">
                          <div className="card-author-chip">
                            <div className="card-avatar-mini">
                              {(post.author_name || 'Team CBTRANK').charAt(0).toUpperCase()}
                            </div>
                            <span>{formatDate(post.date)}</span>
                          </div>
                          <Link href={`/blog/${post.slug}`} className="card-read-arrow">
                            Read &rarr;
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <aside className="sidebar sidebar-sticky">
            
            {/* Answer Key Calculator Button Widget */}
            <div className="widget widget-calc">
              <Link
                href="/answerkey"
                className="calc-btn-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.01em'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <line x1="8" y1="6" x2="16" y2="6"/>
                  <line x1="16" y1="14" x2="16" y2="18"/>
                  <path d="M16 10h.01"/>
                  <path d="M12 10h.01"/>
                  <path d="M8 10h.01"/>
                  <path d="M12 14h.01"/>
                  <path d="M8 14h.01"/>
                  <path d="M12 18h.01"/>
                  <path d="M8 18h.01"/>
                </svg>
                Answer Key Calculator
              </Link>
            </div>

            {/* Search Widget */}
            <div className="widget widget-search">
              <h3 className="widget-title">Search Articles</h3>
              <form action="/blog" method="GET" className="search-form">
                <input
                  type="search"
                  name="q"
                  className="search-input"
                  placeholder="Search SSC, RRB, Cutoff..."
                  defaultValue={query}
                />
                <button type="submit" className="search-btn" aria-label="Submit Search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </form>
            </div>

            {/* Recent Posts Widget */}
            <div className="widget widget-popular">
              <h3 className="widget-title">Recent Posts</h3>
              <ul className="popular-posts-list">
                {allPosts.slice(0, 5).map((post) => (
                  <li key={post.slug} className="popular-item">
                    {post.coverImage && (
                      <Link href={`/blog/${post.slug}`} style={{ flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.coverImage.startsWith('http') ? post.coverImage : `https://upload.cbtrank.com/${post.coverImage.replace(/^\/+/, '')}`}
                          alt={post.title || 'Recent Post'}
                          className="popular-thumb"
                          loading="lazy"
                        />
                      </Link>
                    )}
                    <div className="popular-info">
                      <Link href={`/blog/${post.slug}`} className="popular-title-link">
                        {post.title}
                      </Link>
                      <span className="popular-date">{formatDate(post.date)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories Widget */}
            <div className="widget widget-categories">
              <h3 className="widget-title">Categories</h3>
              <ul className="cat-list">
                {categories.map((cat) => (
                  <li key={cat.category} className="cat-item">
                    <Link href={`/blog?q=${encodeURIComponent(cat.category)}`} className="cat-link">
                      <span>{cat.category}</span>
                    </Link>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px' }}>
                      {cat.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}
