export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchBlogsFromCloudflareD1, BlogPost } from '../data/blogs';

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

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams?.q || '';

  const allPosts = await fetchBlogsFromCloudflareD1();

  const filteredPosts = query
    ? allPosts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : allPosts;

  const categories = Array.from(new Set(allPosts.map(p => p.category))).map(cat => ({
    category: cat,
    count: allPosts.filter(p => p.category === cat).length,
  }));

  return (
    <main style={{ minHeight: '80vh', padding: '12px 0 36px' }}>
      <div className="blog-main-container">
        <div className="blog-layout">
          
          {/* Main Content Area */}
          <div className="content-area">
            <div className="section-head">
              <h2 className="section-title">
                {query ? `Search Results for "${query}"` : 'All Posts'}
              </h2>
            </div>

            <div id="blog-entries">
              {filteredPosts.length === 0 ? (
                <p style={{ padding: '24px 0', color: '#64748b', fontSize: '0.9rem' }}>
                  No posts found matching your search.
                </p>
              ) : (
                filteredPosts.map((post) => (
                  <article key={post.slug} className="hm-entry">
                    {post.coverImage && (
                      <div className="post-thumbnail">
                        <Link href={`/blog/${post.slug}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.coverImage.startsWith('http') ? post.coverImage : `https://upload.cbtrank.com/${post.coverImage.replace(/^\/+/, '')}`}
                            alt={post.title}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </Link>
                      </div>
                    )}
                    <div className="entry-body" style={{ padding: '0 4px' }}>
                      <div className="post-categories">
                        <Link href="/blog">
                          {post.category}
                        </Link>
                      </div>

                      <h2 className="entry-title">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>

                      <div className="entry-meta">
                        <span className="byline">by {post.author_name || 'Team CBTRANK'}</span>
                        <span className="posted-on">
                          &bull; {post.date}
                        </span>
                        <span>
                          &bull; {post.readTime}
                        </span>
                      </div>

                      <p className="entry-excerpt">
                        {post.excerpt}
                      </p>

                      <div>
                        <Link href={`/blog/${post.slug}`} className="read-more-link">
                          Read More &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            
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
              <h3 className="widget-title">Search</h3>
              <form action="/blog" method="GET" className="search-form">
                <input
                  type="search"
                  name="q"
                  className="search-input"
                  placeholder="Search articles..."
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
                          alt={post.title}
                          className="popular-thumb"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </Link>
                    )}
                    <div className="popular-info">
                      <Link href={`/blog/${post.slug}`} className="popular-title-link">
                        {post.title}
                      </Link>
                      <span className="popular-date">{post.date}</span>
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
                    <Link href="/blog" className="cat-link">
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
