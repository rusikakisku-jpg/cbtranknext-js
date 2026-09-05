import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'CBT RANK Privacy Policy - How we collect, use, and protect your data.',
  alternates: {
    canonical: 'https://cbtrank.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <div className="static-main">
        <div className="content-card">
          <h1 className="page-title">Privacy Policy</h1>
          <p className="last-updated">Last updated: 01 Aug 2026</p>

          <p className="lead-text">
            Welcome to <strong>CBT RANK</strong>. We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and the choices you have regarding your data.
          </p>

          <div>
            <h2 className="section-title-sm">1. Information We Collect</h2>
            <p className="lead-text" style={{ marginBottom: '8px' }}>We collect information you provide directly and data collected automatically when you use our site:</p>
            <ul className="feature-list">
              <li><strong>Information you provide:</strong> Name, email address and any message or details you submit through contact forms or support requests.</li>
              <li><strong>Usage information:</strong> Pages visited, time spent on pages, IP address, device and browser information, referral source, and other analytics data.</li>
              <li><strong>Cookies &amp; similar technologies:</strong> Small files stored on your device to improve site functionality and remember preferences.</li>
              <li><strong>Answer key &amp; exam inputs:</strong> When you paste or upload an answer key (your responses) for analysis, we collect the answer data you provide along with any optional metadata you submit.</li>
            </ul>
          </div>

          <div>
            <h2 className="section-title-sm">2. How We Use Your Information</h2>
            <p className="lead-text" style={{ marginBottom: '8px' }}>We use the collected information for the following purposes:</p>
            <ul className="feature-list">
              <li>To respond to your inquiries, support requests, and feedback.</li>
              <li>To provide, maintain and improve our services, content and user experience.</li>
              <li>To analyze site usage and performance for product development and optimization.</li>
              <li><strong>To generate automated exam analysis and scorecards:</strong> When you submit an answer key, we process that data to calculate scores, total rank, shift rank, and category rank.</li>
            </ul>
          </div>

          <div>
            <h2 className="section-title-sm">3. Answer Key Analysis &amp; Automated Scoring</h2>
            <ul className="feature-list">
              <li><strong>100% Automated Processing:</strong> All calculations, scoring, and rank estimations are 100% program-driven and performed automatically by software algorithms.</li>
              <li><strong>Aggregation &amp; Anonymization:</strong> Individual submissions are aggregated and anonymized to calculate overall averages and ranks.</li>
            </ul>
          </div>

          <div>
            <h2 className="section-title-sm">4. Data Sharing &amp; Security</h2>
            <p className="lead-text">
              We prioritize your privacy and data security. <strong>We do not sell, rent, trade, or share your personal information or submitted answer keys with any third parties under any circumstances.</strong> All data is kept strictly secure and used solely for the automated calculations on our website.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">5. Contact Us</h2>
            <p className="lead-text">
              If you have questions, requests, or concerns about this Privacy Policy, please contact us at:<br />
              <strong>Email:</strong> contact.cbtrank@gmail.com
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
