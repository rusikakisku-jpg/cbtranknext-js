import type { MetadataRoute } from 'next';

export const runtime = 'edge';

interface Exam {
  slug: string;
  is_visible?: number | boolean;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cbtrank.com';
  let examUrls: MetadataRoute.Sitemap = [];

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
            lastModified: new Date(),
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
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
          }));
        }
      }
    } catch (err) {}
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/answerkey`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  return [...staticPages, ...examUrls];
}
