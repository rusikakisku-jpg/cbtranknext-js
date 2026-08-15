export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '../data/blogs';

export const metadata: Metadata = {
  title: 'Latest Exam Updates & Rank Analysis Articles | CBT RANK Blog',
  description: 'Read detailed guides, normalization formulas, answer key verification steps, and category cut-off analysis for SSC, RRB, and State Exams.',
  openGraph: {
    title: 'CBT RANK Blog | Exam Updates & Cut-Off Analysis',
    description: 'Read detailed guides, normalization formulas, answer key verification steps, and category cut-off analysis.',
  },
};

export default function BlogIndexPage() {
  return (
    <main>
      <div className="result-main" style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 16px 48px' }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Latest Exam Updates &amp; Analysis
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
            Stay updated with normalized mark calculations, shift trends, and category cut-offs
          </p>
        </div>

        {/* Blog Grid */}
        <div className="blog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="blog-card" style={{ height: '100%', justifyContent: 'space-between' }}>
              <div className="blog-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                    {post.readTime}
                  </span>
                </div>

                <h2 className="blog-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px', lineHeight: 1.4 }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h2>

                <p className="blog-desc" style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.55, flexGrow: 1, marginBottom: '16px' }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <span className="blog-date" style={{ margin: 0, padding: 0, border: 'none' }}>
                    {post.date}
                  </span>

                  <Link href={`/blog/${post.slug}`} style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#2563eb',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    Read Article &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </main>
  );
}
