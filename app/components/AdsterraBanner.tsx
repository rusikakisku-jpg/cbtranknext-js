'use client';

import { useEffect, useState } from 'react';
import { ADSTERRA_CONFIG } from '../config/adsterra';

interface AdsterraBannerProps {
  size: '300x250' | '320x50';
  className?: string;
}

export default function AdsterraBanner({ size, className = '' }: AdsterraBannerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const is300x250 = size === '300x250';
  const isEnabled = is300x250
    ? ADSTERRA_CONFIG.BANNER_300x250_ENABLED
    : ADSTERRA_CONFIG.BANNER_320x50_ENABLED;

  const adKey = is300x250
    ? ADSTERRA_CONFIG.BANNER_300x250_KEY
    : ADSTERRA_CONFIG.BANNER_320x50_KEY;

  const width = is300x250 ? 300 : 320;
  const height = is300x250 ? 250 : 50;

  if (!isEnabled || !adKey) {
    return null;
  }

  // Placeholder while mounting to avoid SSR hydration mismatch
  if (!mounted) {
    return (
      <div
        className={`adsterra-banner-placeholder my-3 ${className}`.trim()}
        style={{
          width: '100%',
          minHeight: `${height}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    );
  }

  const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base target="_blank">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    </script>
    <script type="text/javascript" src="https://bauval.org/22/${adKey}"></script>
  </body>
</html>`;

  return (
    <div
      className={`adsterra-banner-wrapper my-3 ${className}`.trim()}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <iframe
        title={`adsterra-${size}`}
        srcDoc={htmlContent}
        width={width}
        height={height}
        style={{
          border: 'none',
          overflow: 'hidden',
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          display: 'block',
        }}
        scrolling="no"
      />
    </div>
  );
}
