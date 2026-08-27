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
  let resolvedParams = { slug: '' };
  try {
    resolvedParams = await Promise.resolve(params);
  } catch (e) {}

  const slug = resolvedParams.slug;
  const allPosts = await fetchBlogsFromCloudflareD1();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const categories = Array.from(new Set(allPosts.map(p => p.category || 'Exam Analysis'))).map(cat => ({
    category: cat,
    count: allPosts.filter(p => (p.category || 'Exam Analysis') === cat).length,
  }));

  const isHtmlString = typeof post.content === 'string';
  const authorName = post.author_name || 'Team CBTRANK';
  const authorInitial = authorName.charAt(0).toUpperCase() || 'C';
  const currentUrl = `https://cbtrank.com/blog/${post.slug}`;

  // Helper for formatted date
  const displayDate = (() => {
    try {
      if (post.date && post.date.includes('-')) {
        const d = new Date(post.date);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
    } catch (e) {}
    return post.date || 'August 2026';
  })();

  return (
    <main style={{ minHeight: '80vh', padding: '16px 0 44px' }}>
      <div className="blog-main-container">
        <div className="blog-layout">
          
          {/* Main Article Content Area */}
          <div className="content-area">
            <article className="article-wrap-premium">
              
              {/* Breadcrumbs */}
              <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
                <Link href="/">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px', marginRight: '4px' }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Home
                </Link>
                <span>/</span>
                <Link href="/blog">Blog</Link>
                <span>/</span>
                <span className="current">{post.title}</span>
              </nav>

              {/* Header */}
              <header style={{ marginBottom: '22px' }}>
                <div className="post-category-pill">
                  {post.category || 'Exam Analysis'}
                </div>

                <h1 className="article-headline">
                  {post.title}
                </h1>

                {/* Author & Meta Bar */}
                <div className="article-meta-bar">
                  <div className="author-profile-group">
                    <div className="author-avatar-circle">
                      {authorInitial}
                    </div>
                    <div className="author-text-info">
                      <div className="author-name-row">
                        <span className="author-name-text">{authorName}</span>
                        <svg className="verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <span className="author-role-sub">Exam Research &amp; Analytics Desk</span>
                    </div>
                  </div>

                  <div className="meta-badges-group">
                    <div className="meta-badge-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{displayDate}</span>
                    </div>
                    <div className="meta-badge-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{post.readTime || '4 min read'}</span>
                    </div>
                    {typeof post.views === 'number' && post.views > 0 && (
                      <div className="meta-badge-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span>{post.views} views</span>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {/* Cover Image */}
              {post.coverImage && (
                <div className="hero-cover-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage.startsWith('http') ? post.coverImage : `https://upload.cbtrank.com/${post.coverImage.replace(/^\/+/, '')}`}
                    alt={post.title || 'Blog Cover'}
                    loading="lazy"
                  />
                </div>
              )}

              {/* Article Content Body */}
              <div className="article-content">
                {isHtmlString ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content as string }} />
                ) : (
                  (post.content as Array<{ heading?: string; paragraph: string }>).map((sec, i) => (
                    <section key={i} style={{ marginBottom: '24px' }}>
                      {sec.heading && (
                        <h2>
                          {sec.heading}
                        </h2>
                      )}
                      <p>
                        {sec.paragraph}
                      </p>
                    </section>
                  ))
                )}
              </div>

              {/* Social Share Bar */}
              <div className="share-section-box">
                <div className="share-label-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  <span>Share This Article:</span>
                </div>
                <div className="share-buttons-row">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - Read more: ${currentUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-pill-btn share-wa-btn"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.541 1.961.828 2.796.829 3.184 0 5.77-2.587 5.77-5.766.001-3.187-2.575-5.77-5.77-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.072-1.854-.436-1.558-.649-2.56-2.228-2.637-2.331-.077-.103-.629-.838-.629-1.603 0-.766.398-1.144.54-1.298.143-.155.312-.193.416-.193.104 0 .208.001.299.006.095.006.223-.036.349.266.13.312.443 1.077.482 1.156.039.078.065.17.013.273-.052.104-.078.169-.156.26-.078.091-.164.203-.234.273-.078.078-.16.163-.069.319.091.156.404.667.868 1.08.597.532 1.101.697 1.258.775.156.078.247.065.338-.039.091-.104.39-.455.494-.61.104-.156.208-.13.351-.078.143.052.909.429 1.065.507.156.078.26.117.299.182.039.065.039.377-.105.782z"/>
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-pill-btn share-tg-btn"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                    Telegram
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-pill-btn share-tw-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X (Twitter)
                  </a>
                </div>
              </div>

              {/* Author Bio Box */}
              <div className="author-bio-card">
                <div className="author-avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  {authorInitial}
                </div>
                <div className="author-bio-details">
                  <h4>Published by {authorName}</h4>
                  <p>Dedicated to providing authentic exam insights, shift-wise difficulty analysis, normalization predictions, and real-time candidate score verification.</p>
                </div>
              </div>

              {/* High-Converting Bottom Calculator Promo Banner */}
              <div className="calculator-promo-banner">
                <h3>Check Your Exam Marks &amp; Normalized Rank</h3>
                <p>Paste your official response sheet link in CBT RANK Answer Key Calculator to evaluate your raw score, shift rank, and category cut-off marks in seconds.</p>
                <Link href="/answerkey" className="calculator-promo-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2"/>
                    <line x1="8" y1="6" x2="16" y2="6"/>
                    <line x1="16" y1="14" x2="16" y2="18"/>
                    <path d="M16 10h.01"/>
                    <path d="M12 10h.01"/>
                    <path d="M8 10h.01"/>
                  </svg>
                  Open Answer Key Calculator &rarr;
                </Link>
              </div>

            </article>
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
                          alt={p.title || 'Recent Post'}
                          className="popular-thumb"
                          loading="lazy"
                        />
                      </Link>
                    )}
                    <div className="popular-info">
                      <Link href={`/blog/${p.slug}`} className="popular-title-link">
                        {p.title}
                      </Link>
                      <span className="popular-date">{p.date || 'Recent'}</span>
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
