import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about CBT RANK, an automated educational utility platform designed to help government exam aspirants evaluate performance and rank standing.',
};

export default function AboutPage() {
  return (
    <main>
      <div className="static-main">
        <div className="content-card">
          <h1 className="page-title">About Us</h1>

          <p className="lead-text">
            Welcome to <strong>CBT RANK</strong>. We are a dedicated educational utility platform designed to help government exam aspirants evaluate their performance and understand their standing among peers.
          </p>

          <p className="lead-text">
            Our platform offers an automated <strong>Computer-Based Test (CBT) score and rank calculator</strong>. By simply submitting their official answer key link, candidates can instantly retrieve a comprehensive analysis of their exam performance.
          </p>

          <div>
            <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Our system automatically processes the data to calculate:
            </p>
            <ul className="feature-list">
              <li><strong>Subject-Wise Analysis:</strong> Get detailed breakdowns of marks secured in each specific subject or section.</li>
              <li><strong>Detailed Performance Metrics:</strong> View the exact count of attempted, unattempted, correct, and incorrect answers.</li>
              <li><strong>Automated Score Calculation:</strong> Automatically compute final marks secured based on official marking schemes.</li>
              <li><strong>Indicative Ranking:</strong> Compare scores with other users who submitted their answer keys to see estimated overall, category, and shift-wise rankings.</li>
            </ul>
          </div>

          <p className="lead-text">
            All calculations and analyses are <strong>100% program-driven and performed automatically</strong> by our system without any manual intervention. We do not represent any official government body; our tool is designed solely to provide student-friendly performance estimates and insights.
          </p>

          <p className="lead-text">
            Thank you for choosing CBT RANK to track your preparation journey.
          </p>
        </div>
      </div>
    </main>
  );
}
