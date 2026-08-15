export const runtime = 'edge';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS } from '../../data/blogs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);

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
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      <div className="result-main" style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 16px 48px' }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: '20px' }}>
          <Link href="/blog" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            &larr; Back to Blog Articles
          </Link>
        </div>

        {/* Article Container */}
        <article style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px 24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)' }}>
          
          {/* Article Header */}
          <div style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '3px 12px', borderRadius: '999px', textTransform: 'uppercase' }}>
                {post.category}
              </span>
              <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
                {post.date} &bull; {post.readTime}
              </span>
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.35, margin: 0, letterSpacing: '-0.02em' }}>
              {post.title}
            </h1>
          </div>

          {/* Article Content */}
          <div style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {post.content.map((sec, i) => (
              <section key={i}>
                {sec.heading && (
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px', marginTop: '12px' }}>
                    {sec.heading}
                  </h2>
                )}
                <p style={{ margin: 0 }}>
                  {sec.paragraph}
                </p>
              </section>
            ))}
          </div>

          {/* Bottom CTA Box */}
          <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '2px dashed #e2e8f0', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              Want to check your marks &amp; rank instantly?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Use our fast, accurate Answer Key Marks &amp; Shift Rank Calculator.
            </p>
            <Link href="/answerkey" className="btn-cta" style={{ display: 'inline-flex', padding: '10px 22px', fontSize: '0.88rem' }}>
              Calculate Marks &amp; Rank Now
            </Link>
          </div>

        </article>

      </div>
    </main>
  );
}
