'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="navbar" id="navbar">
      <div className="navbar-inner">
        <Link href="/" className="nav-logo" aria-label="CBT RANK Home">
          <img src="https://upload.cbtrank.com/logo.png" alt="CBT RANK Logo" className="logo-img" />
          <span className="logo-text">CBT RANK</span>
        </Link>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <Link href="/" className={isActive('/') ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/answerkey" className={isActive('/answerkey') ? 'active' : ''}>
                Answer Key
              </Link>
            </li>
            <li>
              <Link href="/blog" className={isActive('/blog') ? 'active' : ''}>
                Blog
              </Link>
            </li>
          </ul>
        </nav>

        <button
          className={`hamburger${isOpen ? ' open' : ''}`}
          id="hamburger"
          aria-label="Toggle Navigation Menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        className={`mobile-drawer${isOpen ? ' open' : ''}`}
        id="mobile-drawer"
        role="navigation"
        aria-label="Mobile Navigation"
      >
        <Link
          href="/"
          className={isActive('/') ? 'active' : ''}
          onClick={() => setIsOpen(false)}
        >
          Home
        </Link>
        <Link
          href="/answerkey"
          className={isActive('/answerkey') ? 'active' : ''}
          onClick={() => setIsOpen(false)}
        >
          Answer Key
        </Link>
        <Link
          href="/blog"
          className={isActive('/blog') ? 'active' : ''}
          onClick={() => setIsOpen(false)}
        >
          Blog
        </Link>
      </div>
    </header>
  );
}
