import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about CBT RANK, an automated educational utility platform designed to help government exam aspirants evaluate performance and rank standing.',
  alternates: {
    canonical: 'https://cbtrank.com/about-us',
  },
};

export default function AboutPage() {
  return (
    <main>
      <div className="static-main">
        <div className="content-card">
          <h1 className="page-title">About Us</h1>

          <p className="lead-text">
            Welcome to <strong>CBT RANK</strong> (accessible at <Link href="/" style={{ color: '#0044cc', textDecoration: 'underline' }}>cbtrank.com</Link>). We are an independent, transparent educational utility platform engineered to empower competitive examination aspirants across India by providing instant, reliable, and mathematically accurate exam performance analytics.
          </p>

          <p className="lead-text">
            Our platform provides a state-of-the-art automated <strong>Computer-Based Test (CBT) score and rank calculator</strong>. By submitting their official response sheet links, candidates can instantly retrieve a comprehensive analysis of their exam performance before official merit lists and results are announced.
          </p>

          <div>
            <h2 className="section-title-sm">1. What Our Platform Does</h2>
            <p className="lead-text" style={{ marginBottom: '8px' }}>
              Our system automatically analyzes candidate response sheets to generate:
            </p>
            <ul className="feature-list">
              <li><strong>Subject-Wise Analysis:</strong> Get detailed breakdowns of marks secured in each specific subject or exam section.</li>
              <li><strong>Detailed Performance Metrics:</strong> View the exact count of attempted, unattempted, correct, and incorrect answers.</li>
              <li><strong>Automated Score Calculation:</strong> Compute net raw scores adhering strictly to official notification marking schemes (+marks for right, -marks for wrong, and bonus marks for cancelled questions).</li>
              <li><strong>Indicative Ranking &amp; Shift Percentiles:</strong> Compare scores against fellow candidates who appeared in the same exam shift to estimate category, shift, and overall all-India standing.</li>
              <li><strong>Question-by-Question Review:</strong> Examine individual responses, official right answers, and question IDs to identify potential discrepancies for official challenge windows.</li>
            </ul>
          </div>

          <div>
            <h2 className="section-title-sm">2. Our Mission &amp; Vision</h2>
            <p className="lead-text">
              Every year, tens of millions of aspirants in India dedicate months of relentless effort preparing for central and state government recruitment examinations. After giving a computer-based exam, waiting weeks or months for normalized results creates unnecessary anxiety. Our mission is to democratize performance transparency by offering candidate-friendly, accurate, and completely free evaluation tools that help students make informed decisions regarding their next preparation stage.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">3. Calculation Methodology &amp; Mathematical Rigor</h2>
            <p className="lead-text">
              Transparency and mathematical precision are the foundations of CBT RANK:
            </p>
            <ul className="feature-list">
              <li><strong>100% Program-Driven Processing:</strong> Every calculation is executed automatically by deterministic algorithms without human bias or manual interference.</li>
              <li><strong>Commission Marking Scheme Conformance:</strong> Each exam on CBT RANK is configured with the official marking criteria notified by the respective exam commission (e.g., SSC, RRB, IBPS, State PSCs).</li>
              <li><strong>Anonymized Data Aggregation:</strong> Individual response data is aggregated and anonymized to calculate reliable shift averages, standard deviations, and percentile estimates.</li>
            </ul>
          </div>

          <div>
            <h2 className="section-title-sm">4. Who We Are (Team &amp; Expertise)</h2>
            <p className="lead-text">
              CBT RANK is maintained by a passionate team of educational researchers, competitive examination mentors, and software engineers based in India. With years of combined domain experience tracking CBT recruitment trends, exam commission notifications, and normalization patterns, our editorial and technical teams work around the clock to keep calculators up-to-date as soon as new answer keys are released.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">5. Academic Integrity &amp; Official Disclaimer</h2>
            <p className="lead-text">
              All calculations and analyses are <strong>100% program-driven and performed automatically</strong> by our system without any manual intervention. We do not represent, affiliate with, or operate as an official government body. Our platform is an independent student utility designed solely to provide performance estimates and educational guidance. Official results, final merit lists, and cut-offs are published exclusively by the respective recruitment authorities.
            </p>
          </div>

          <p className="lead-text" style={{ marginTop: '16px' }}>
            Thank you for choosing CBT RANK to track and navigate your competitive examination journey.
          </p>
        </div>
      </div>
    </main>
  );
}
