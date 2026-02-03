'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { space } from '@/app/fonts';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

// Public landing-page navigation anchors.
const publicNavLinks: NavLink[] = [
  { label: 'Product', href: '#product' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Templates', href: '#templates' },
  { label: 'Pricing', href: '#pricing' },
];

type HeaderProps = {
  showNavLinks?: boolean;
  showAuthButtons?: boolean;
  showProfileMenu?: boolean;
  userInitials?: string;
  navVariant?: 'public' | 'app';
};

const Header = ({
  showNavLinks = true,
  showAuthButtons = true,
  showProfileMenu = false,
  userInitials = 'U',
  navVariant = 'public',
}: HeaderProps) => {
  const router = useRouter();
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    // Close menu when clicking outside of the dropdown.
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Close menu on Escape key.
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      // Clear auth cookies on the backend.
      await apiFetch('/auth/logout/', { method: 'POST' });
      router.push('/')
    } finally {
      window.location.href = '/';
    }
  };

  // Authenticated app navigation.
  const appNavLinks: NavLink[] = [
    { label: 'Dashboard', href: '/dashboard' },
    {
      label: 'Workflow',
      href: 'https://www.youtube.com',
      external: true,
    },
    { label: 'Templates', href: '/templates' },
    { label: 'Upgrade', href: '/upgrade' },
  ];

  let resolvedNavVariant = navVariant;
  let resolvedShowAuthButtons = showAuthButtons;
  let resolvedShowProfileMenu = showProfileMenu;
  let resolvedInitials = userInitials;

  if (
    auth?.isAuthenticated &&
    navVariant === 'public' &&
    showAuthButtons &&
    !showProfileMenu
  ) {
    resolvedNavVariant = 'app';
    resolvedShowAuthButtons = false;
    resolvedShowProfileMenu = true;
    resolvedInitials = auth.initials;
  }

  const navLinks =
    resolvedNavVariant === 'app' ? appNavLinks : publicNavLinks;
  return (
    <header className='reveal flex items-center justify-between'>
      <div
        className='flex items-center gap-3'
        onClick={() => router.push('/')}
        style={{ cursor: 'pointer' }}
      >
        {/* Brand mark + name */}
        <div className='glow-ring flex h-10 w-10 items-center justify-center rounded-full bg-[#101821]'>
          <span className={`${space.className} text-sm font-bold`}>CID</span>
        </div>
        <div>
          <p className={`${space.className} text-lg font-semibold`}>
            careerIDream
          </p>
          <p className='text-xs text-white/60'>AI resume and cover letter</p>
        </div>
      </div>
      {showNavLinks ? (
        // Primary navigation links (hidden on mobile).
        <nav className='hidden items-center gap-7 text-sm text-white/70 md:flex lg:gap-8'>
          {navLinks.map((link) => (
            <a
              key={link.label}
              className='nav-underline transition hover:text-white'
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : (
        <div />
      )}
      <div className='flex items-center gap-3'>
        {resolvedShowAuthButtons ? (
          <>
            {/* Public auth CTAs */}
            <Link
              className='hidden rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white md:inline-flex'
              href='/login'
            >
              Login
            </Link>
            <Link
              className='rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0c1116] shadow-lg shadow-white/10 transition hover:-translate-y-0.5'
              href='/signup'
            >
              Sign up
            </Link>
          </>
        ) : null}
        {resolvedShowProfileMenu ? (
          <div className='relative' ref={menuRef}>
            <button
              className='cursor-pointer flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white transition hover:border-white/40'
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-haspopup='menu'
              aria-expanded={isMenuOpen}
            >
              {resolvedInitials}
            </button>
            {isMenuOpen ? (
              // Profile dropdown menu.
              <div className='absolute right-0 mt-3 w-44 rounded-2xl border border-white/10 bg-[#0f1720] p-2 text-xs text-white/80 shadow-xl shadow-black/40'>
                <Link
                  className='block rounded-xl px-3 py-2 transition hover:bg-white/10'
                  href='/profile'
                >
                  Profile
                </Link>
                <Link
                  className='block rounded-xl px-3 py-2 transition hover:bg-white/10'
                  href='/settings'
                >
                  Settings
                </Link>
                <button
                  className='cursor-pointer block w-full rounded-xl px-3 py-2 text-left transition hover:bg-white/10'
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
