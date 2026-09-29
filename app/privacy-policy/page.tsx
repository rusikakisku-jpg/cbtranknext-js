import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'CBT RANK Privacy Policy - How we collect, use, and protect your data, including Google AdSense and cookie disclosures.',
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
          <p className="last-updated">Last updated: 29 Sep 2026</p>

          <p className="lead-text">
            Welcome to <strong>CBT RANK</strong> (accessible at <Link href="/" style={{ color: '#0044cc', textDecoration: 'underline' }}>cbtrank.com</Link>). We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, our use of cookies and third-party advertising partners such as Google AdSense, and the choices you have regarding your data.
          </p>

          <div>
            <h2 className="section-title-sm">1. Information We Collect</h2>
            <p className="lead-text" style={{ marginBottom: '8px' }}>We collect information you provide directly and data collected automatically when you use our site:</p>
            <ul className="feature-list">
              <li><strong>Information you provide:</strong> Name, email address and any message or details you submit through contact forms or support requests.</li>
              <li><strong>Usage information:</strong> Pages visited, time spent on pages, IP address, device and browser information, referral source, and other analytics data.</li>
              <li><strong>Cookies &amp; similar technologies:</strong> Small files stored on your device to improve site functionality, remember preferences, and serve relevant advertisements.</li>
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
              <li>To deliver non-intrusive, relevant advertisements to support the free educational tools offered on CBT RANK.</li>
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
            <h2 className="section-title-sm">4. Cookies, Web Beacons &amp; Consent Management</h2>
            <p className="lead-text">
              Like any other modern web application, CBT RANK uses cookies. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
            </p>
            <ul className="feature-list">
              <li><strong>Essential Cookies:</strong> Strictly necessary for the website to function (such as remembering your exam score calculation parameters and session states).</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics cookies help us understand aggregate traffic patterns and improve usability.</li>
              <li><strong>Advertising Cookies:</strong> Used by Google and certified third-party ad networks to serve relevant ads and measure ad performance.</li>
            </ul>
            <p className="lead-text">
              You can choose to disable or customize cookies through your individual browser options or via our on-site <strong>Cookie Consent Banner</strong>.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">5. Google AdSense &amp; Third-Party Advertising Partners</h2>
            <p className="lead-text">
              Google is one of the third-party vendors on our site. Google uses cookies, including the DoubleClick DART cookie and advertising identifiers, to serve ads to our site visitors based upon their visit to <strong>cbtrank.com</strong> and other sites on the Internet.
            </p>
            <ul className="feature-list">
              <li>
                <strong>Personalized Advertising:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites.
              </li>
              <li>
                <strong>Google Advertising Cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to CBT RANK and/or other sites across the web.
              </li>
              <li>
                <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising at any time by visiting Google&apos;s Ads Settings page:{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0044cc', fontWeight: 600, textDecoration: 'underline' }}
                >
                  https://adssettings.google.com
                </a>.
              </li>
              <li>
                <strong>Universal Ad Network Opt-Out:</strong> Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting the Network Advertising Initiative (NAI) opt-out page at{' '}
                <a
                  href="https://optout.networkadvertising.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0044cc', fontWeight: 600, textDecoration: 'underline' }}
                >
                  https://optout.networkadvertising.org
                </a>{' '}
                or the Digital Advertising Alliance (DAA) opt-out portal at{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0044cc', fontWeight: 600, textDecoration: 'underline' }}
                >
                  https://www.aboutads.info/choices/
                </a>.
              </li>
            </ul>
            <p className="lead-text">
              Note that CBT RANK has no access to or control over these cookies that are used by third-party advertisers. We encourage you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">6. Data Sharing &amp; Security</h2>
            <p className="lead-text">
              We prioritize your privacy and data security. <strong>We do not sell, rent, trade, or share your personal information or submitted answer keys with any third parties under any circumstances.</strong> All data is kept strictly secure and used solely for the automated calculations on our website.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">7. GDPR, CCPA/CPRA &amp; DPDP Rights</h2>
            <p className="lead-text">
              Under applicable data protection laws (including the EU GDPR, California Consumer Privacy Act CCPA/CPRA, and India&apos;s Digital Personal Data Protection Act 2023), you are entitled to the following rights:
            </p>
            <ul className="feature-list">
              <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
              <li><strong>Do Not Sell My Personal Information:</strong> We do not sell or share any user personal data for monetary or other consideration.</li>
            </ul>
          </div>

          <div>
            <h2 className="section-title-sm">8. Children&apos;s Privacy (COPPA)</h2>
            <p className="lead-text">
              Another part of our priority is adding protection for children while using the internet. CBT RANK does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
            </p>
          </div>

          <div>
            <h2 className="section-title-sm">9. Contact Us</h2>
            <p className="lead-text">
              If you have questions, requests, or concerns about this Privacy Policy or your data, please contact us at:<br />
              <strong>Email:</strong> contact.cbtrank@gmail.com<br />
              <strong>Website:</strong> <Link href="/contact-us" style={{ color: '#0044cc', textDecoration: 'underline' }}>cbtrank.com/contact-us</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
