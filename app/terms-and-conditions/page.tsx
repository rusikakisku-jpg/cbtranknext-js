import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'CBT RANK Terms and Conditions - Rules and guidelines for using our automated exam rank calculator.',
  alternates: {
    canonical: 'https://cbtrank.com/terms-and-conditions',
  },
};

export default function TermsPage() {
  return (
    <main>
      <div className="static-main">
        <div className="content-card">
          <h1 className="page-title">Terms &amp; Conditions</h1>
          <p className="last-updated">Last updated: 01 Aug 2026</p>

          <p className="lead-text" style={{ textAlign: 'center' }}>
            Welcome to <strong>CBT RANK</strong>. By accessing or using our services, you agree to follow the Terms &amp; Conditions listed below.
          </p>

          <div>
            <h2 className="section-title-sm">1. Service Description &amp; Use</h2>
            <p className="lead-text">
              CBT RANK provides an automated rank and score calculation tool for candidates of online government examinations. By submitting your official answer key link or responses, you grant the platform permission to automatically process and analyze the data to compute your scores and place you in our user-based ranking database.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">2. Automated Calculations Disclaimer</h2>
            <p className="lead-text">
              All calculations, including subject-wise marks, count of attempted/unattempted questions, right/wrong question matching, and rank estimation, are completely program-driven and performed automatically by our software algorithms.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">3. Accuracy &amp; Indicative Nature of Ranks</h2>
            <p className="lead-text">
              The ranks and scores calculated by CBT RANK are strictly indicative and based entirely on the pool of users who have voluntarily submitted their answer keys on our website for a given exam.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">4. Contact Us</h2>
            <p className="lead-text">
              For any queries regarding these Terms &amp; Conditions, feel free to contact us:<br />
              <strong>Email:</strong> contact.cbtrank@gmail.com
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
