'use client';

import { useEffect, useRef } from 'react';

interface BlogViewTrackerProps {
  slug: string;
}

export default function BlogViewTracker({ slug }: BlogViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!slug || trackedRef.current) return;

    try {
      const storageKey = `cbtrank_viewed_${slug}`;

      // 🛡️ Anti-Spam: Do not increment again if already viewed in this browser session
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (sessionStorage.getItem(storageKey)) {
          return;
        }
      }

      trackedRef.current = true;

      // Send non-blocking background request to increment views
      fetch('/api/blogs/increment-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
        keepalive: true,
      })
        .then((res) => {
          if (res.ok) {
            try {
              sessionStorage.setItem(storageKey, '1');
            } catch (e) {}
          }
        })
        .catch(() => {});
    } catch (e) {}
  }, [slug]);

  return null;
}
