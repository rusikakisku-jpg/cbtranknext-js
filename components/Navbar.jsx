import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="brand-logo">
          <div className="brand-emblem">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V12C3 17.55 7 21.74 12 23C17 21.74 21 17.55 21 12V7L12 2Z" fill="#0044CC" />
              <path d="M12 6L16.5 8.5V13C16.5 16.5 13.5 19.5 12 20C10.5 19.5 7.5 16.5 7.5 13V8.5L12 6Z" fill="#FFFFFF" />
            </svg>
          </div>
          <span>CBT RANK</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/" className="nav-link">Home</Link></li>
          <li><Link href="/answerkey" className="nav-link">Answer Key Calculator</Link></li>
          <li><Link href="/result" className="nav-link">Scorecard Report</Link></li>
        </ul>
      </div>
    </nav>
  );
}
