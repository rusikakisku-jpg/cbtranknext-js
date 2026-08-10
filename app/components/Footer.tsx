import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <footer>
        <div className="footer-inner">
          <nav aria-label="Footer Navigation">
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/contact-us">Contact Us</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions">Terms and Conditions</Link></li>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
            </ul>
          </nav>
          <div className="footer-copy">
            &copy; {year} CBTRANK.COM | All Rights Reserved
          </div>
        </div>
      </footer>

      {/* Floating Telegram Button */}
      <a
        href="https://t.me/cbtrank"
        className="float-telegram"
        target="_blank"
        rel="noopener noreferrer"
        title="Join Telegram Channel"
        aria-label="Join CBT RANK Telegram Channel"
      >
        <Image
          src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png"
          alt="Telegram"
          width={55}
          height={55}
          unoptimized
        />
      </a>
    </>
  );
}
