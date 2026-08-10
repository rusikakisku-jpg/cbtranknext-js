import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'CBT RANK Disclaimer - Independent educational utility platform. Not affiliated with any government body.',
};

export default function DisclaimerPage() {
  return (
    <main>
      <div className="static-main">
        <div className="content-card">
          <h1 className="page-title">Disclaimer</h1>
          <p className="last-updated">Last updated: 01 Aug 2026</p>

          <p className="lead-text" style={{ textAlign: 'center' }}>
            The information provided on <strong>CBT RANK</strong> is published in good faith and is intended purely for educational and informational purposes. While we strive to maintain accuracy, reliability, and clarity, we make no guarantees regarding the completeness or accuracy of any information displayed on this website.
          </p>

          <div>
            <h2 className="section-title-sm">1. No Official Affiliation</h2>
            <p className="lead-text">
              CBT RANK is a completely independent utility platform and is not officially linked to, affiliated with, or endorsed by any government department, exam authority, board, or ministry. All calculations, ranks, and estimations are generated automatically by our platform using user-submitted data.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">2. Automated Calculations Disclaimer</h2>
            <p className="lead-text">
              The calculators and tools available on CBT RANK are 100% program-driven and performed automatically by software algorithms. Subject-wise marks, count of attempted, unattempted, correct, and wrong answers, and overall marks are processed without any manual intervention.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">3. Accuracy &amp; Indicative Ranks</h2>
            <p className="lead-text">
              Any scorecards, rankings, averages, or normalization estimates shown on CBT RANK are indicative and meant strictly for educational and guidance purposes. They do not constitute official results.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">4. External Links Disclaimer</h2>
            <p className="lead-text">
              This website may include links to third-party portals or external websites for references. These sites are not operated or controlled by CBT RANK. We do not guarantee the security or accuracy of external sites.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">5. Limitation of Liability</h2>
            <p className="lead-text">
              CBT RANK shall not be held liable for any direct, indirect, or consequential loss arising from reliance on automated calculations or server downtime.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">6. Consent &amp; Contact</h2>
            <p className="lead-text">
              By using our website, you agree to our Disclaimer and fully accept its terms. If you have any questions regarding this Disclaimer, feel free to contact us:<br />
              <strong>Email:</strong> contact.cbtrank@gmail.com
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
