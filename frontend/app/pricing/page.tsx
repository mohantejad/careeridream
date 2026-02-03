'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sora, space } from '@/app/fonts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiFetch } from '@/lib/api';

type CurrentUser = {
  email: string;
  first_name?: string;
  last_name?: string;
};

const PricingPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const response = await apiFetch('/auth/users/me/');
        if (!isMounted) return;
        setIsAuthenticated(response.ok);
        if (response.ok) {
          const data = (await response.json()) as CurrentUser;
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        if (isMounted) setIsAuthenticated(false);
        if (isMounted) setUser(null);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const isLoggedIn = isAuthenticated === true;
  const ctaLabel = isLoggedIn ? 'Upgrade' : 'Start free';
  const ctaHref = isLoggedIn ? '/upgrade' : '/signup';
  const title = isLoggedIn ? 'Upgrade your plan' : 'Simple pricing';
  const initialsSource = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    : '';
  const userInitials = user
    ? initialsSource
        ? initialsSource
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('')
        : user.email[0]?.toUpperCase() ?? 'U'
    : 'U';

  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className='relative overflow-hidden'>
        <div className='hero-grid absolute inset-0' />
        <div className='absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#102b2a] blur-3xl' />
        <div className='absolute right-10 top-20 h-72 w-72 rounded-full bg-[#18253b] blur-3xl' />
        <div className='relative mx-auto max-w-6xl px-6 pb-16 pt-8'>
          {isLoggedIn ? (
            <Header
              showAuthButtons={false}
              showProfileMenu
              userInitials={userInitials}
              navVariant='app'
            />
          ) : (
            <Header />
          )}
          <section className='mt-12 rounded-3xl border border-white/10 bg-white/5 p-6'>
            <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Pricing
            </p>
            <h1 className={`${space.className} mt-2 text-3xl`}>{title}</h1>
            <p className='mt-2 text-sm text-white/70'>
              Everything you need to generate, edit, and export tailored
              resumes and cover letters.
            </p>
          </section>

          <section className='mt-10 grid gap-6 md:grid-cols-2'>
            <div className='rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6 text-sm text-white/70'>
              <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                Free
              </p>
              <h2 className={`${space.className} mt-3 text-3xl text-white`}>
                $0
              </h2>
              <ul className='mt-4 space-y-2 text-sm text-white/70'>
                <li>Generate tailored resumes</li>
                <li>Generate cover letters</li>
                <li>Export to DOCX or PDF</li>
              </ul>
            </div>
            <div className='rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6 text-sm text-white/70'>
              <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                Pro
              </p>
              <h2 className={`${space.className} mt-3 text-3xl text-white`}>
                $5
              </h2>
              <ul className='mt-4 space-y-2 text-sm text-white/70'>
                <li>Everything in Free</li>
                <li>Saved drafts & history</li>
                <li>Higher match scoring</li>
              </ul>
              <Link
                className='mt-6 inline-flex rounded-full bg-[#6de5c1] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:-translate-y-0.5'
                href={ctaHref}
              >
                {ctaLabel}
              </Link>
            </div>
          </section>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default PricingPage;
