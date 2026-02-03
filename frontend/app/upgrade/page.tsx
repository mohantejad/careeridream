'use client';

import Link from 'next/link';
import { sora, space } from '@/app/fonts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const UpgradePage = () => {
  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className='relative overflow-hidden'>
        <div className='hero-grid absolute inset-0' />
        <div className='absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#102b2a] blur-3xl' />
        <div className='absolute right-10 top-20 h-72 w-72 rounded-full bg-[#18253b] blur-3xl' />
        <div className='relative mx-auto max-w-6xl px-6 pb-16 pt-8'>
          <Header />
          <section className='mt-12 rounded-3xl border border-white/10 bg-white/5 p-6'>
            <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Upgrade
            </p>
            <h1 className={`${space.className} mt-2 text-3xl`}>
              Go Pro for $5
            </h1>
            <p className='mt-2 text-sm text-white/70'>
              Unlock saved drafts, richer analytics, and higher match scoring.
            </p>
          </section>

          <section className='mt-10 max-w-3xl rounded-3xl border border-white/10 bg-[#0f1720]/85 p-8 text-sm text-white/70'>
            <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                  Pro Plan
                </p>
                <h2 className={`${space.className} mt-2 text-3xl text-white`}>
                  $5 / month
                </h2>
                <ul className='mt-4 space-y-2 text-sm text-white/70'>
                  <li>Save unlimited drafts</li>
                  <li>Premium match insights</li>
                  <li>Priority template access</li>
                </ul>
              </div>
              <button className='rounded-full bg-[#6de5c1] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:-translate-y-0.5'>
                Upgrade now
              </button>
            </div>
            <p className='mt-6 text-xs text-white/50'>
              You can cancel anytime. Payment flow coming soon.
            </p>
            <Link
              href='/pricing'
              className='mt-4 inline-flex text-xs uppercase tracking-[0.3em] text-white/40'
            >
              Back to pricing
            </Link>
          </section>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default UpgradePage;
