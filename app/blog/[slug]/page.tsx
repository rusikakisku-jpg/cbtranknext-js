export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogsFromCloudflareD1 } from '../../data/blogs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function toIsoDate(dateStr?: string): string {
  if (!dateStr) return new Date('2025-01-01').toISOString();
  const parsed = Date.parse(dateStr);
  return !isNaN(parsed) ? new Date(parsed).toISOString() : new Date('2025-01-01').toISOString();
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

  const canonicalUrl = `https://cbtrank.com/blog/${slug}`;
  const coverUrl = post.coverImage
    ? (post.coverImage.startsWith('http') ? post.coverImage : `https://upload.cbtrank.com/${post.coverImage.replace(/^\/+/, '')}`)
    : 'https://upload.cbtrank.com/logo.png';

  return {
    title: `${post.title} | CBT RANK Blog`,
    description: post.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      type: 'article',
      siteName: 'CBT RANK',
      publishedTime: toIsoDate(post.date),
      authors: [post.author_name || 'Team CBTRANK'],
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [coverUrl],
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

  const recentPosts = allPosts.slice(0, 5);
  const popularPosts = [...allPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  const categories = Array.from(new Set(allPosts.map(p => p.category || 'Exam Analysis'))).map(cat => ({
    category: cat,
    count: allPosts.filter(p => (p.category || 'Exam Analysis') === cat).length,
  }));

  const isHtmlString = typeof post.content === 'string';

  const coverUrl = post.coverImage
    ? (post.coverImage.startsWith('http') ? post.coverImage : `https://upload.cbtrank.com/${post.coverImage.replace(/^\/+/, '')}`)
    : 'https://upload.cbtrank.com/logo.png';

  const currentUrl = `https://cbtrank.com/blog/${post.slug}`;

  // 1. BlogPosting Schema (Google Rich Results / Google Discover)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt,
    'image': coverUrl,
    'datePublished': toIsoDate(post.date),
    'dateModified': toIsoDate(post.date),
    'author': {
      '@type': 'Person',
      'name': post.author_name || 'Team CBTRANK',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'CBT RANK',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://upload.cbtrank.com/logo.png',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
  };

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://cbtrank.com',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://cbtrank.com/blog',
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': post.title,
        'item': currentUrl,
      },
    ],
  };

  return (
    <main style={{ minHeight: '80vh', padding: '12px 0 36px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="blog-main-container">
        <div className="blog-layout">
          
          {/* Main Article Content Area */}
          <div className="content-area">
            <article className="article-wrap">
              
              {/* Header */}
              <header className="article-header">
                <div className="article-cats">
                  <Link
                    href={`/blog?q=${encodeURIComponent(post.category || '')}`}
                    className="article-cat-tag"
                  >
                    {post.category || 'Exam Analysis'}
                  </Link>
                </div>

                <h1 className="article-title">
                  {post.title}
                </h1>

                <div className="article-meta">
                  <span className="byline">by {post.author_name || 'Mangal'}</span>
                  <span className="posted-on" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>{' '}
                    {post.date ? post.date.split(' ')[0] : 'Recent'}
                  </span>
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt={post.title}
                    className="article-cover"
                    loading="lazy"
                  />
                )}
              </header>

              {/* Article Body */}
              <div className="article-body article-content">
                {isHtmlString ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content as string }} />
                ) : (
                  (post.content as Array<{ heading?: string; paragraph: string }>).map((sec, i) => (
                    <section key={i} style={{ marginBottom: '20px' }}>
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

              {/* Share Bar */}
              <div className="share-bar">
                <span className="share-label">Share:</span>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn share-wa"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn share-tg"
                >
                  Telegram
                </a>
              </div>

              {/* Answer Key CTA Box */}
              <div style={{ marginTop: '32px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111111', marginBottom: '6px' }}>
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
                  {recentPosts.map((p) => (
                    <li key={p.slug} className="popular-item">
                      <Link href={`/blog/${p.slug}`} style={{ flexShrink: 0, display: 'block' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.coverImage && p.coverImage.startsWith('http') ? p.coverImage : (p.coverImage ? `https://upload.cbtrank.com/${p.coverImage.replace(/^\/+/, '')}` : 'https://upload.cbtrank.com/logo.png')}
                          alt={p.title || 'Recent Post'}
                          className="popular-thumb"
                          loading="lazy"
                        />
                      </Link>
                      <div className="popular-info">
                        <Link href={`/blog/${p.slug}`} className="popular-title-link">
                          {p.title}
                        </Link>
                        <span className="popular-date">{p.date ? p.date.split(' ')[0] : 'Recent'}</span>
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
                  {popularPosts.map((p) => (
                    <li key={p.slug} className="popular-item">
                      <Link href={`/blog/${p.slug}`} style={{ flexShrink: 0, display: 'block' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.coverImage && p.coverImage.startsWith('http') ? p.coverImage : (p.coverImage ? `https://upload.cbtrank.com/${p.coverImage.replace(/^\/+/, '')}` : 'https://upload.cbtrank.com/logo.png')}
                          alt={p.title || 'Popular Post'}
                          className="popular-thumb"
                          loading="lazy"
                        />
                      </Link>
                      <div className="popular-info">
                        <Link href={`/blog/${p.slug}`} className="popular-title-link">
                          {p.title}
                        </Link>
                        <span className="popular-date">{p.date ? p.date.split(' ')[0] : 'Recent'}</span>
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
