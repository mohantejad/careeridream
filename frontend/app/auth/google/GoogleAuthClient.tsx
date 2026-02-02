'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { sora, space } from '@/app/fonts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const GoogleAuthClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');
  const codeParam = searchParams.get('code');
  const missingParams = !stateParam || !codeParam;
  const [status, setStatus] = useState<{
    type: 'loading' | 'error' | 'success';
    message: string;
  }>({ type: 'loading', message: 'Finalizing Google sign-in...' });

  useEffect(() => {
    if (missingParams) {
      return;
    }

    const finalize = async () => {
      try {
        const url = `${API_BASE_URL}/auth/o/google-oauth2/?state=${encodeURIComponent(
          stateParam ?? ''
        )}&code=${encodeURIComponent(codeParam ?? '')}`;

        const tryRequest = async (method: 'POST' | 'GET') => {
          const res = await fetch(url, {
            method,
            headers: {
              Accept: 'application/json',
            },
            credentials: 'include',
          });

          return res;
        };

        let response = await tryRequest('POST');

        if (!response.ok && (response.status === 404 || response.status === 405)) {
          response = await tryRequest('GET');
        }

        if (!response.ok) {
          const errorText = await response.text();
          setStatus({
            type: 'error',
            message:
              `Unable to complete Google sign-in (HTTP ${response.status}). ` +
              (errorText ? `Server response: ${errorText}` : 'Please try again.'),
          });
          return;
        }

        let data: Record<string, unknown> = {};
        try {
          data = (await response.json()) as Record<string, unknown>;
        } catch {
          data = {};
        }
        const isNewUser =
          data.is_new === true ||
          data.new_user === true ||
          data.first_time === true;

        setStatus({
          type: 'success',
          message: 'Success! Redirecting you now...',
        });

        router.replace(isNewUser ? '/onboarding' : '/');
      } catch {
        setStatus({
          type: 'error',
          message: 'Network error. Please try again.',
        });
      }
    };

    void finalize();
  }, [codeParam, missingParams, router, stateParam]);

  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className='relative overflow-hidden'>
        <div className='hero-grid absolute inset-0' />
        <div className='absolute -left-24 top-6 h-64 w-64 rounded-full bg-[#102b2a] blur-3xl' />
        <div className='absolute right-8 top-16 h-72 w-72 rounded-full bg-[#18253b] blur-3xl' />
        <div className='relative mx-auto flex min-h-[70vh] max-w-6xl flex-col px-6 pb-16 pt-8'>
          <Header showNavLinks={false} />
          <section className='mx-auto mt-16 w-full max-w-lg'>
            <div className='rounded-3xl border border-white/10 bg-[#0f1720]/85 p-8 text-center shadow-2xl shadow-black/40'>
              <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
                Google sign-in
              </p>
              <h1 className={`${space.className} mt-2 text-3xl`}>
                {status.type === 'error'
                  ? 'Something went wrong'
                  : 'Signing you in'}
              </h1>
              <p className='mt-4 text-sm text-white/70'>
                {missingParams
                  ? 'Missing Google authorization data. Please try again.'
                  : status.message}
              </p>
              {missingParams || status.type === 'error' ? (
                <button
                  className='mt-6 rounded-full border border-white/20 px-6 py-2 text-sm text-white/80 transition hover:border-white/60'
                  onClick={() => router.replace('/signup')}
                >
                  Back to signup
                </button>
              ) : null}
            </div>
          </section>
        </div>
        <Footer variant='minimal' />
      </main>
    </div>
  );
};

export default GoogleAuthClient;

