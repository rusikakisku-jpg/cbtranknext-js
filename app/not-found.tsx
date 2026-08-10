import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <div className="not-found-main">
        <div className="not-found-card">
          <div className="not-found-emoji">🔍</div>
          <h1 className="not-found-title">404 - Page Not Found</h1>
          <p className="not-found-desc">
            The page you are looking for does not exist or has been removed.
          </p>
          <Link href="/" className="btn-home">
            &larr; Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
