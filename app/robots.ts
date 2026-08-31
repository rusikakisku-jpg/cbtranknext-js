import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/result', '/rank', '/review-answerkey'],
    },
    sitemap: 'https://cbtrank.com/sitemap.xml',
  };
}
