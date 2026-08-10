import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="footer-links">
          <Link href="/" className="footer-link">Home</Link>
          <Link href="/answerkey" className="footer-link">Answer Key Calculator</Link>
          <Link href="/about-us" className="footer-link">About Us</Link>
          <Link href="/contact-us" className="footer-link">Contact Us</Link>
          <Link href="/privacy-policy" className="footer-link">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="footer-link">Terms & Conditions</Link>
        </div>
        <p>© {new Date().getFullYear()} CBTRANK.COM | All Rights Reserved</p>
      </div>
    </footer>
  );
}
