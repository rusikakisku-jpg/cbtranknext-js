export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchBlogsFromCloudflareD1, BlogPost, FALLBACK_BLOG_POSTS } from '../data/blogs';

interface BlogPageProps {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const query = String(resolvedParams?.q || '').trim();
  const page = Math.max(1, parseInt(String(resolvedParams?.page || '1'), 10));

  let title = 'Latest Exam Updates & Rank Analysis Articles | CBT RANK Blog';
  let canonicalUrl = 'https://cbtrank.com/blog';

  if (query) {
    title = `Articles matching "${query}" | CBT RANK Blog`;
    canonicalUrl = `https://cbtrank.com/blog?q=${encodeURIComponent(query)}`;
  } else if (page > 1) {
    title = `Latest Exam Updates & Rank Analysis - Page ${page} | CBT RANK Blog`;
    canonicalUrl = `https://cbtrank.com/blog?page=${page}`;
  }

  return {
    title,
    description: 'Read detailed guides, normalization formulas, answer key verification steps, and category cut-off analysis for SSC, RRB, and State Exams.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: 'Read detailed guides, normalization formulas, answer key verification steps, and category cut-off analysis.',
      url: canonicalUrl,
      type: 'website',
      siteName: 'CBT RANK',
      images: [{ url: 'https://upload.cbtrank.com/logo.png', width: 1200, height: 630, alt: 'CBT RANK Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Read detailed guides, normalization formulas, answer key verification steps, and category cut-off analysis.',
      images: ['https://upload.cbtrank.com/logo.png'],
    },
  };
}

const POSTS_PER_PAGE = 5;

function cleanExcerpt(text?: string): string {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 160) return clean;
  return clean.slice(0, 157).trim() + '...';
}

function getCoverUrl(coverImage?: string | null): string {
  if (!coverImage) return 'https://upload.cbtrank.com/logo.png';
  if (coverImage.startsWith('http')) return coverImage;
  return `https://upload.cbtrank.com/${coverImage.replace(/^\/+/, '')}`;
}

export default async function BlogIndexPage({ searchParams }: BlogPageProps) {
  let query = '';
  let currentPage = 1;

  try {
    const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
    query = String(resolvedParams?.q || '').trim();
    currentPage = Math.max(1, parseInt(String(resolvedParams?.page || '1'), 10));
  } catch (e) {
    query = '';
    currentPage = 1;
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

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const recentPosts = allPosts.slice(0, 5);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const categories = Array.from(new Set(allPosts.map(p => p.category || 'Exam Analysis'))).map(cat => ({
    category: cat,
    count: allPosts.filter(p => (p.category || 'Exam Analysis') === cat).length,
  }));

  const getPaginationUrl = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : '/blog';
  };

  return (
    <main style={{ minHeight: '80vh', padding: '12px 0 36px' }}>
      <div className="blog-main-container">
        <div className="blog-layout">
          
          {/* Main Content Area */}
          <div className="content-area">
            <div className="section-head">
              <h1 className="section-title">
                {query
                  ? `Search Results for "${query}"`
                  : currentPage > 1
                  ? `Latest Posts (Page ${currentPage})`
                  : 'Latest Exam Updates & Rank Analysis'}
              </h1>
            </div>

            <div id="blog-entries">
              {currentPosts.length === 0 ? (
                <p style={{ padding: '24px 0', color: '#666', fontSize: '0.9rem' }}>
                  No published posts found.
                </p>
              ) : (
                currentPosts.map((post) => (
                  <article key={post.slug} className="hm-entry">
                    {/* Thumbnail */}
                    {post.coverImage && (
                      <div className="post-thumbnail">
                        <Link href={`/blog/${post.slug}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getCoverUrl(post.coverImage)}
                            alt={post.title || 'Blog Post'}
                            loading="lazy"
                            decoding="async"
                          />
                        </Link>
                      </div>
                    )}

                    {/* Entry Body */}
                    <div className="entry-body">
                      {/* Category */}
                      <div className="post-categories">
                        <Link href={`/blog?q=${encodeURIComponent(post.category || '')}`}>
                          {post.category || 'Exam Analysis'}
                        </Link>
                      </div>

                      {/* Title */}
                      <h2 className="entry-title">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>

                      {/* Meta info */}
                      <div className="entry-meta">
                        <span className="byline">by {post.author_name || 'Team CBTRANK'}</span>
                        <span className="posted-on">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: '-1px' }}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>{' '}
                          {post.date ? post.date.split(' ')[0] : 'Recent'}
                        </span>
                      </div>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="entry-excerpt">
                          {cleanExcerpt(post.excerpt)}
                        </p>
                      )}

                      {/* Read More Link */}
                      <div style={{ marginTop: '12px' }}>
                        <Link href={`/blog/${post.slug}`} className="read-more-link">
                          Read More &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <nav className="pagination-wrap" aria-label="Page navigation" style={{ marginTop: '32px', marginBottom: '16px' }}>
                <ul className="pagination-list" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                  {/* Previous Button */}
                  {currentPage > 1 && (
                    <li>
                      <Link href={getPaginationUrl(currentPage - 1)} className="pagination-btn">
                        &larr; Prev
                      </Link>
                    </li>
                  )}

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isActive = p === currentPage;
                    return (
                      <li key={p}>
                        <Link
                          href={getPaginationUrl(p)}
                          className={`pagination-num ${isActive ? 'active' : ''}`}
                        >
                          {p}
                        </Link>
                      </li>
                    );
                  })}

                  {/* Next Button */}
                  {currentPage < totalPages && (
                    <li>
                      <Link href={getPaginationUrl(currentPage + 1)} className="pagination-btn">
                        Next &rarr;
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
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
                  background: 'linear-gradient(135deg, #0066ff 0%, #0044cc 100%)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)',
                  transition: 'all 0.2s ease',
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
            {recentPosts.length > 0 && (
              <div className="widget widget-popular">
                <h3 className="widget-title">Recent Posts</h3>
                <ul className="popular-posts-list">
                  {recentPosts.map((post) => (
                    <li key={post.slug} className="popular-item">
                      <Link href={`/blog/${post.slug}`} style={{ flexShrink: 0, display: 'block' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getCoverUrl(post.coverImage)}
                          alt={post.title || 'Recent Post'}
                          className="popular-thumb"
                          loading="lazy"
                        />
                      </Link>
                      <div className="popular-info">
                        <Link href={`/blog/${post.slug}`} className="popular-title-link">
                          {post.title}
                        </Link>
                        <span className="popular-date">{post.date ? post.date.split(' ')[0] : 'Recent'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Popular Posts Widget */}
            {popularPosts.length > 0 && (
              <div className="widget widget-popular">
                <h3 className="widget-title">Popular Posts</h3>
                <ul className="popular-posts-list">
                  {popularPosts.map((post) => (
                    <li key={post.slug} className="popular-item">
                      <Link href={`/blog/${post.slug}`} style={{ flexShrink: 0, display: 'block' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getCoverUrl(post.coverImage)}
                          alt={post.title || 'Popular Post'}
                          className="popular-thumb"
                          loading="lazy"
                        />
                      </Link>
                      <div className="popular-info">
                        <Link href={`/blog/${post.slug}`} className="popular-title-link">
                          {post.title}
                        </Link>
                        <span className="popular-date">{post.date ? post.date.split(' ')[0] : 'Recent'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </aside>

        </div>
      </div>
    </main>
  );
}
