import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GoogleAnalytics from "./components/GoogleAnalytics";

export const metadata: Metadata = {
  title: {
    default: "CBT RANK - Latest Answer Keys & Rank Predictor",
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
        <link rel="preconnect" href="https://api.cbtrank.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
      </head>
      <body>
        <GoogleAnalytics />
        <div className="page-body">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
