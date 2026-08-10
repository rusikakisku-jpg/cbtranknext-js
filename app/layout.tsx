import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: {
    default: "CBT RANK - Latest Answer Keys & Rank Predictor",
    template: "%s | CBT RANK",
  },
  description: "Calculate your marks, shift rank, and category cutoffs instantly with CBTRank's Answer Key Calculator.",
  keywords: ["CBT Rank", "Answer Key Calculator", "RRB", "SSC", "CBT exam", "rank predictor"],
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
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cbtrank.rusikakisku.workers.dev" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="page-body">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
