'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sora, space } from '@/app/fonts';
import Welcome from '@/components/Welcome';
import HomeComponent from '@/components/Home';
import { apiFetch } from '@/lib/api';

type CurrentUser = {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
};



export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await apiFetch('/auth/users/me/');

        if (!isMounted) return;

        if (response.ok) {
          const data = (await response.json()) as CurrentUser;
          const onboardingResponse = await apiFetch(
            '/profiles/profile/onboarding/'
          );

          if (!isMounted) return;

          if (onboardingResponse.ok) {
            const onboardingData = (await onboardingResponse.json()) as {
              needs_onboarding: boolean;
            };
            if (onboardingData.needs_onboarding) {
              router.replace('/onboarding');
              return;
            }
          }

          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
        <main className='relative overflow-hidden'>
          <div className='hero-grid absolute inset-0' />
          <div className='absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#102b2a] blur-3xl' />
          <div className='absolute right-10 top-20 h-72 w-72 rounded-full bg-[#18253b] blur-3xl' />
          <div className='relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-8 text-center'>
            <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Loading
            </p>
            <h1 className={`${space.className} mt-3 text-3xl`}>
              Preparing your workspace...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (user) {
    return <Welcome user={user} />;
  }

  return <HomeComponent />
}
