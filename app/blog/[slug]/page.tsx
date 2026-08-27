export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogsFromCloudflareD1 } from '../../data/blogs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const allPosts = await fetchBlogsFromCloudflareD1();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    return {
      title: 'Article Not Found | CBT RANK',
    };
  }

  return {
    title: `${post.title} | CBT RANK Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const allPosts = await fetchBlogsFromCloudflareD1();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const categories = Array.from(new Set(allPosts.map(p => p.category))).map(cat => ({
    category: cat,
    count: allPosts.filter(p => p.category === cat).length,
  }));

  const isHtmlString = typeof post.content === 'string';

  return (
    <main style={{ minHeight: '80vh', padding: '12px 0 36px' }}>
      <div className="blog-main-container">
        <div className="blog-layout">
          
          {/* Article Main Area */}
          <div className="content-area">
            <article className="article-wrap" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px 20px' }}>
              
              {/* Header */}
              <div className="article-header" style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div className="article-cats" style={{ marginBottom: '8px' }}>
                  <span className="article-cat-tag" style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {post.category}
                  </span>
                </div>

                <h1 className="article-title" style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.35, margin: '0 0 12px 0' }}>
                  {post.title}
                </h1>

                <div className="article-meta" style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  <span>by {post.author_name || 'Team CBTRANK'}</span>
                  <span>&bull; {post.date}</span>
                  <span>&bull; {post.readTime}</span>
                </div>
              </div>

              {/* Cover Image if available */}
              {post.coverImage && (
                <div style={{ marginBottom: '20px', width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage.startsWith('http') ? post.coverImage : (post.coverImage.startsWith('/') ? `https://upload.cbtrank.com${post.coverImage}` : `https://upload.cbtrank.com/${post.coverImage}`)}
                    alt={post.title}
                    style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Body */}
              <div className="article-body article-content" style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.75 }}>
                {isHtmlString ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content as string }} />
                ) : (
                  (post.content as Array<{ heading?: string; paragraph: string }>).map((sec, i) => (
                    <section key={i} style={{ marginBottom: '20px' }}>
                      {sec.heading && (
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '20px', marginBottom: '10px' }}>
                          {sec.heading}
                        </h2>
                      )}
                      <p style={{ margin: 0 }}>
                        {sec.paragraph}
                      </p>
                    </section>
                  ))
                )}
              </div>

              {/* Share Bar */}
              <div className="share-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', flexWrap: 'wrap' }}>
                <span className="share-label" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Share Article:
                </span>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn share-wa"
                  style={{ background: '#25D366', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
                >
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn share-tg"
                  style={{ background: '#229ED9', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}
                >
                  Telegram
                </a>
              </div>

              {/* Bottom CTA Card */}
              <div style={{ marginTop: '32px', padding: '20px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
                  Check Your Answer Key Marks &amp; Rank
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '14px' }}>
                  Calculate your raw score, normalized rank, and shift statistics instantly.
                </p>
                <Link href="/answerkey" className="btn-cta" style={{ display: 'inline-flex', padding: '10px 22px', fontSize: '0.88rem' }}>
                  Open Calculator &rarr;
                </Link>
              </div>

            </article>
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
                  transition: 'all 0.2s ease'
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
                {allPosts.slice(0, 5).map((p) => (
                  <li key={p.slug} className="popular-item">
                    {p.coverImage && (
                      <Link href={`/blog/${p.slug}`} style={{ flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.coverImage.startsWith('http') ? p.coverImage : `https://upload.cbtrank.com/${p.coverImage.replace(/^\/+/, '')}`}
                          alt={p.title}
                          className="popular-thumb"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </Link>
                    )}
                    <div className="popular-info">
                      <Link href={`/blog/${p.slug}`} className="popular-title-link">
                        {p.title}
                      </Link>
                      <span className="popular-date">{p.date}</span>
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
