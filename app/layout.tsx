import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GoogleAnalytics from "./components/GoogleAnalytics";
import GoogleAdSense from "./components/GoogleAdSense";
import CookieConsent from "./components/CookieConsent";
import AdsterraSocialBar from "./components/AdsterraSocialBar";
import AdsterraBanner from "./components/AdsterraBanner";
import { getAdSenseClientId } from "./config/adsense";
import { MONETAG_CONFIG } from "./config/monetag";
import MonetagVignette from "./components/MonetagVignette";

export const metadata: Metadata = {
  metadataBase: new URL('https://cbtrank.com'),
  title: {
    default: "CBT RANK - Latest Answer Keys Calculator & Rank Predictor",
    template: "%s | CBT RANK",
  },
  description: "Calculate your marks, shift rank, and category cutoffs instantly with CBTRank's Answer Key Calculator.",
  keywords: ["CBT Rank", "Answer Key Calculator", "RRB", "SSC", "CBT exam", "rank predictor"],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: 'https://upload.cbtrank.com/logo.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    siteName: "CBT RANK",
    type: "website",
    url: "https://cbtrank.com",
    title: "CBT RANK - Answer Key Calculator & Rank Predictor",
    description: "Calculate your marks, shift rank, and category cutoffs instantly. Free tool for SSC, RRB, Railway & State exams.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CBT RANK - Answer Key Calculator & Rank Predictor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CBT RANK - Answer Key Calculator & Rank Predictor",
    description: "Calculate your marks, shift rank, and category cutoffs instantly. Free tool for SSC, RRB, Railway & State exams.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />
        <link rel="preconnect" href="https://api.cbtrank.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        {getAdSenseClientId() && (
          <>
            <meta name="google-adsense-account" content={getAdSenseClientId()} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${getAdSenseClientId()}`}
              crossOrigin="anonymous"
            />
          </>
        )}
        {MONETAG_CONFIG.VERIFICATION_CODE && (
          <meta name="monetag" content={MONETAG_CONFIG.VERIFICATION_CODE} />
        )}
        {MONETAG_CONFIG.ENABLED && MONETAG_CONFIG.VIGNETTE_ENABLED && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(s){s.dataset.zone='${MONETAG_CONFIG.VIGNETTE_ZONE_ID}',s.src='${MONETAG_CONFIG.VIGNETTE_SCRIPT_URL}'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
            }}
          />
        )}
        {MONETAG_CONFIG.ENABLED && MONETAG_CONFIG.IN_PAGE_PUSH_ENABLED && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(s){s.dataset.zone='${MONETAG_CONFIG.IN_PAGE_PUSH_ZONE_ID}',s.src='${MONETAG_CONFIG.IN_PAGE_PUSH_SCRIPT_URL}'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
            }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'CBT RANK',
              url: 'https://cbtrank.com',
              description: 'Calculate your marks, shift rank, and category cutoffs instantly with CBTRank Answer Key Calculator.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://cbtrank.com/blog?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'CBT RANK',
              url: 'https://cbtrank.com',
              logo: 'https://upload.cbtrank.com/logo.png',
              sameAs: [
                'https://t.me/cbtrank',
              ],
            }),
          }}
        />
      </head>
      <body>
        <GoogleAnalytics />
        <GoogleAdSense />
        <MonetagVignette />
        <AdsterraSocialBar />
        <div className="page-body">
          <Navbar />
          {children}
          <AdsterraBanner size="320x50" />
          <Footer />
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}
