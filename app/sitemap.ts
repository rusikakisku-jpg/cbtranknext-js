import type { MetadataRoute } from 'next';
import { fetchBlogsFromCloudflareD1 } from './data/blogs';

export const runtime = 'edge';

interface Exam {
  slug: string;
  is_visible?: number | boolean;
  is_latest?: number | string;
  set_on_top?: number | string;
  updated_at?: string;
}

function parseExamDate(exam: Exam, todayDate: Date): Date {
  if (exam.updated_at) {
    const parsed = Date.parse(exam.updated_at);
    if (!isNaN(parsed)) return new Date(parsed);
  }
  if (Number(exam.is_latest) === 1 || Number(exam.set_on_top) === 1) {
    return todayDate;
  }
  return new Date('2025-01-15T00:00:00.000Z');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cbtrank.com';
  const todayDate = new Date();
  todayDate.setUTCHours(0, 0, 0, 0);

  let examUrls: MetadataRoute.Sitemap = [];
  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch('https://api.cbtrank.com/exams', {
      headers: { 'User-Agent': 'CBTRank-Sitemap/1.0' },
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const exams = await res.json();
      if (Array.isArray(exams)) {
        examUrls = exams
          .filter((exam: Exam) => exam && exam.slug && exam.is_visible !== 0 && exam.is_visible !== false)
          .map((exam: Exam) => ({
            url: `${baseUrl}/${exam.slug}/answerkey`,
            lastModified: parseExamDate(exam, todayDate),
            changeFrequency: 'daily' as const,
            priority: 0.9,
          }));
      }
    }
  } catch (e) {
    // Graceful fallback to static d1_exams.json if offline
    try {
      const fallbackRes = await fetch(`${baseUrl}/d1_exams.json`);
      if (fallbackRes.ok) {
        const exams = await fallbackRes.json();
        if (Array.isArray(exams)) {
          examUrls = exams.map((exam: Exam) => ({
            url: `${baseUrl}/${exam.slug}/answerkey`,
            lastModified: parseExamDate(exam, todayDate),
            changeFrequency: 'daily' as const,
            priority: 0.9,
          }));
        }
      }
    } catch (err) {}
  }

  try {
    const blogs = await fetchBlogsFromCloudflareD1();
    if (Array.isArray(blogs) && blogs.length > 0) {
      blogUrls = blogs
        .filter((b) => b && b.slug)
        .map((b) => {
          let postDate = todayDate;
          if (b.date) {
            const parsed = Date.parse(b.date);
            if (!isNaN(parsed)) postDate = new Date(parsed);
          }
          return {
            url: `${baseUrl}/blog/${b.slug}`,
            lastModified: postDate,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          };
        });
    }
  } catch (err) {}

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: todayDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/answerkey`,
      lastModified: todayDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: todayDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date('2025-01-01T00:00:00.000Z'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date('2025-01-01T00:00:00.000Z'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date('2025-01-01T00:00:00.000Z'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date('2025-01-01T00:00:00.000Z'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date('2025-01-01T00:00:00.000Z'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  return [...staticPages, ...examUrls, ...blogUrls];
}
