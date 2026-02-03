import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sora, space } from '@/app/fonts';
import Header from './Header';
import Footer from './Footer';
import { apiFetch } from '@/lib/api';


type CurrentUser = {
  id?: number;
  email: string;
  first_name?: string;
  last_name?: string;
};

type SavedDraft = {
  id: number;
  content?: {
    fit_score?: number;
  };
};

const Welcome = ({ user }: { user: CurrentUser }) => {
  const router = useRouter();
  const [profileCompleteness, setProfileCompleteness] = useState<number | null>(
    null
  );
  const [activeDrafts, setActiveDrafts] = useState<number | null>(null);
  const [jdMatches, setJdMatches] = useState<number | null>(null);
  const firstName = user.first_name || user.email.split('@')[0];
  const initialsSource =
    `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  const initials = initialsSource
    ? initialsSource
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : user.email[0]?.toUpperCase() ?? 'U';
  const quickActions = [
    {
      title: 'Create a tailored resume',
      desc: 'Start from a JD and generate an ATS-ready resume.',
      cta: 'New resume',
      href: '/generate?type=resume',
    },
    {
      title: 'Draft a cover letter',
      desc: 'Match your tone to the role and ship it fast.',
      cta: 'New cover letter',
      href: '/generate?type=cover-letter',
    },
    {
      title: 'Polish your profile',
      desc: 'Keep skills, projects, and metrics up to date.',
      cta: 'Update profile',
      href: '/profile',
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [profileResponse, draftsResponse] = await Promise.all([
          apiFetch('/profiles/profile/me/'),
          apiFetch('/drafts/drafts/'),
        ]);
        if (!isMounted) return;
        if (profileResponse.ok) {
          const data = (await profileResponse.json()) as {
            profile_completeness?: number;
          };
          setProfileCompleteness(
            typeof data.profile_completeness === 'number'
              ? data.profile_completeness
              : null
          );
        }
        if (draftsResponse.ok) {
          const data = (await draftsResponse.json()) as SavedDraft[];
          const matches = data.filter(
            (draft) => (draft.content?.fit_score ?? 0) >= 90
          ).length;
          setActiveDrafts(data.length);
          setJdMatches(matches);
        }
      } catch {
        if (isMounted) setProfileCompleteness(null);
        if (isMounted) {
          setActiveDrafts(null);
          setJdMatches(null);
        }
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const completenessLabel =
    profileCompleteness === null ? '--' : `${profileCompleteness}%`;
  const activeDraftsLabel = activeDrafts === null ? '--' : `${activeDrafts}`;
  const jdMatchesLabel = jdMatches === null ? '--' : `${jdMatches}`;

  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className='relative overflow-hidden'>
        <div className='hero-grid absolute inset-0' />
        <div className='absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#102b2a] blur-3xl' />
        <div className='absolute right-10 top-20 h-72 w-72 rounded-full bg-[#18253b] blur-3xl' />
        <div className='relative mx-auto max-w-6xl px-6 pb-16 pt-8'>
          <Header
            showAuthButtons={false}
            showProfileMenu
            userInitials={initials}
            navVariant='app'
          />
          <section className='mt-16 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center'>
            <div className='space-y-5'>
              <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
                Welcome back
              </p>
              <h1 className={`${space.className} text-4xl md:text-5xl`}>
                Hi {firstName}, ready to land the next interview?
              </h1>
              <p className='text-sm text-white/70'>
                Your personalized resume studio is ready. Pick a job and we
                will do the matching, drafting, and polish in minutes.
              </p>
              <div className='flex flex-wrap gap-3'>
                <button
                  className='cursor-pointer rounded-full bg-[#6de5c1] px-6 py-3 text-sm font-semibold text-[#0c1116] transition hover:-translate-y-0.5'
                  onClick={() => router.push('/generate?type=resume')}
                >
                  Create resume
                </button>
                <button
                  className='cursor-pointer rounded-full border border-white/20 px-6 py-3 text-sm text-white/80 transition hover:border-white/60'
                  onClick={() => router.push('/generate?type=resume&focus=jd')}
                >
                  Upload a JD
                </button>
              </div>
            </div>
            <div className='rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6 text-sm text-white/70'>
              <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                Status
              </p>
              <div className='mt-4 space-y-3'>
                <div className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
                  <span>Profile completeness</span>
                  <span className='text-[#6de5c1]'>{completenessLabel}</span>
                </div>
                <div className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
                  <span>Active drafts</span>
                  <span className='text-white'>{activeDraftsLabel}</span>
                </div>
                <div className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
                  <span>JD matches</span>
                  <span className='text-white'>{jdMatchesLabel}</span>
                </div>
              </div>
            </div>
          </section>

          <section className='mt-14 grid gap-5 md:grid-cols-3'>
            {quickActions.map((action) => (
              <div
                key={action.title}
                className='rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70'
              >
                <h3 className={`${space.className} text-lg text-white`}>
                  {action.title}
                </h3>
                <p className='mt-3'>{action.desc}</p>
                <button
                  className='mt-5 cursor-pointer rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition hover:border-white/60'
                  onClick={() => router.push(action.href)}
                >
                  {action.cta}
                </button>
              </div>
            ))}
          </section>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default Welcome
