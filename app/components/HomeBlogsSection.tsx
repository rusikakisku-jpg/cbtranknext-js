import Link from 'next/link';
import type { BlogPost } from '../data/blogs';

interface HomeBlogsSectionProps {
  blogs: BlogPost[];
}

function cleanExcerpt(text?: string): string {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 150) return clean;
  return clean.slice(0, 147).trim() + '...';
}

function getCoverUrl(coverImage?: string | null): string {
  if (!coverImage) return 'https://upload.cbtrank.com/logo.png';
  if (coverImage.startsWith('http')) return coverImage;
  return `https://upload.cbtrank.com/${coverImage.replace(/^\/+/, '')}`;
}

export default function HomeBlogsSection({ blogs }: HomeBlogsSectionProps) {
  if (!blogs || blogs.length === 0) return null;

  // Display top 5 latest blog posts:
  // Post 0: Top Featured Spotlight Post
  // Posts 1 to 4: 2x2 Grid of remaining 4 latest posts
  const featuredPost = blogs[0];
  const gridPosts = blogs.slice(1, 5);

  return (
    <section className="home-blogs-section" aria-label="Latest Articles and Updates">
      <style>{`
        .home-blogs-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 22px;
        }
        .home-blogs-header-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .home-blogs-header-sub {
          font-size: 0.92rem;
          color: #64748b;
          margin: 0;
        }
        .home-blogs-section .featured-blog-card {
          grid-template-columns: 1fr;
          margin-bottom: 20px;
        }
        .home-blogs-section .featured-img-wrap,
        .home-blogs-section .card-thumbnail-box {
          width: 100%;
          height: auto;
          min-height: unset;
          aspect-ratio: 16 / 9;
          background: #0f172a;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .home-blogs-section .featured-img-wrap a,
        .home-blogs-section .card-thumbnail-box a {
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .home-blogs-section .featured-img-wrap img,
        .home-blogs-section .card-thumbnail-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }
        .home-blogs-section .blog-cards-grid {
          display: grid;
          grid-template-columns: 1fr !important;
          gap: 20px;
        }
        .home-blog-viewall-wrap {
          display: block;
          margin-top: 24px;
          text-align: center;
        }
        .home-blog-viewall-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px 20px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          color: #0066ff;
          font-size: 0.94rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          transition: all 0.2s ease;
        }
        .home-blog-viewall-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.1);
        }
        .home-blog-viewall-btn:active {
          background: #dbeafe;
        }
        @media only screen and (max-width: 640px) {
          .home-blogs-header-title {
            font-size: 1.25rem;
          }
        }
      `}</style>

      {/* Section Header */}
      <div className="home-blogs-header">
        <div>
          <h2 className="home-blogs-header-title">Latest Articles &amp; Updates</h2>
          <p className="home-blogs-header-sub">Official notifications, answer key guides and rank analysis</p>
        </div>
      </div>

      {/* Featured / Top #1 Article Card */}
      {featuredPost && (
        <article className="featured-blog-card">
          <div className="featured-img-wrap">
            <Link href={`/blog/${featuredPost.slug}`} tabIndex={-1} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCoverUrl(featuredPost.coverImage)}
                alt={featuredPost.title || 'Featured Article'}
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>
          <div className="featured-content-wrap">
            <div>
              <div className="featured-spotlight-pill">
                <span>⚡ {featuredPost.category || 'Latest Update'}</span>
              </div>
              <h3 className="featured-title">
                <Link href={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h3>
              {featuredPost.excerpt && (
                <p className="featured-excerpt">
                  {cleanExcerpt(featuredPost.excerpt)}
                </p>
              )}
            </div>
            <div className="card-bottom-footer">
              <div className="card-author-chip">
                <div className="card-avatar-mini" aria-hidden="true">C</div>
                <span>{featuredPost.date ? featuredPost.date.split(' ')[0] : 'Recent'} &bull; {featuredPost.readTime || '4 min read'}</span>
              </div>
              <Link href={`/blog/${featuredPost.slug}`} className="card-read-arrow" aria-label={`Read article: ${featuredPost.title}`}>
                <span>Read Article</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </article>
      )}

      {/* Remaining 4 Articles Grid */}
      {gridPosts.length > 0 && (
        <div className="blog-cards-grid">
          {gridPosts.map((post) => (
            <article key={post.slug} className="premium-blog-card">
              <div className="card-thumbnail-box">
                <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCoverUrl(post.coverImage)}
                    alt={post.title || 'Blog Post'}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
                {post.category && (
                  <span className="card-cat-badge-float">
                    {post.category}
                  </span>
                )}
              </div>
              <div className="card-main-body">
                <div>
                  <h3 className="card-post-title">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt && (
                    <p className="card-post-excerpt">
                      {cleanExcerpt(post.excerpt)}
                    </p>
                  )}
                </div>
                <div className="card-bottom-footer">
                  <div className="card-author-chip">
                    <span>{post.date ? post.date.split(' ')[0] : 'Recent'}</span>
                  </div>
                  <Link href={`/blog/${post.slug}`} className="card-read-arrow" aria-label={`Read article: ${post.title}`}>
                    <span>Read Article</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* View All Articles Button - Positioned at the very end / bottom */}
      <div className="home-blog-viewall-wrap">
        <Link href="/blog" className="home-blog-viewall-btn">
          <span>View All Articles &amp; Updates</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
