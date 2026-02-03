import Link from 'next/link';
import Footer from './Footer';
import { sora, space } from '@/app/fonts';
import Header from './Header';


const HomeComponent = () => {
  const highlightStats = [
    { value: '18x', label: 'Faster drafting' },
    { value: '92%', label: 'JD match score' },
    { value: '24h', label: 'Turnaround' },
  ];

  const productFeatures = [
    {
      title: 'Smart intake',
      desc: 'Upload a resume, LinkedIn, or fill a quick profile. We structure everything into skill clusters.',
    },
    {
      title: 'JD blending',
      desc: 'Paste any job description and the model highlights key skills, signals, and priorities.',
    },
    {
      title: 'Review board',
      desc: 'Edit with inline suggestions, gap analysis, and instant ATS checks before you export.',
    },
  ];

  return (
    <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
      <main className='relative overflow-hidden'>
        <div className='hero-grid absolute inset-0' />
        <div className='absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#102b2a] blur-3xl' />
        <div className='absolute right-10 top-20 h-72 w-72 rounded-full bg-[#18253b] blur-3xl' />
        <div className='relative mx-auto max-w-6xl px-6 pb-16 pt-8'>
          <Header />
          <section className='grid gap-10 pt-16 md:grid-cols-[1.1fr_0.9fr] md:items-center'>
            <div className='space-y-6'>
              <div className='reveal delay-1 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70'>
                Built for job hunters
              </div>
              <h1
                className={`${space.className} reveal delay-2 text-4xl font-semibold leading-tight md:text-6xl`}
              >
                Your AI co-pilot for resumes and cover letters that
                <span className='text-[#6de5c1]'> land interviews</span>
              </h1>
              <p className='reveal delay-3 text-base text-white/70 md:text-lg'>
                careerIDream blends your profile with any job description to
                craft a tailored resume, cover letter, and talking points in
                minutes. No blank pages. No guessing.
              </p>
              <div className='reveal delay-3 flex flex-wrap items-center gap-4'>
                <Link
                  className='rounded-full bg-[#6de5c1] px-6 py-3 text-sm font-semibold text-[#0c1116] shadow-lg shadow-[#6de5c1]/30 transition hover:-translate-y-0.5'
                  href='/signup'
                >
                  Start free
                </Link>
                <button className='cursor-pointer rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white'>
                  Watch demo
                </button>
                <div className='text-xs text-white/50'>
                  Trusted by 8,200+ candidates in 42 countries
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4 pt-4 text-left text-xs text-white/60'>
                {highlightStats.map((stat) => (
                  <div
                    key={stat.label}
                    className='rounded-2xl border border-white/10 bg-white/5 p-4'
                  >
                    <p className='text-lg font-semibold text-white'>
                      {stat.value}
                    </p>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='reveal delay-2 relative'>
              <div className='float absolute -left-8 -top-6 rounded-2xl border border-white/15 bg-[#0f1720]/90 p-4 text-xs text-white/70 shadow-xl shadow-black/40'>
                <p className='text-white'>JD Score</p>
                <p className='text-2xl font-semibold text-[#46c2ff]'>87%</p>
                <p className='text-white/50'>+12% improvement</p>
              </div>
              <div className='rounded-3xl border border-white/15 bg-[#0f1720]/90 p-6 shadow-2xl shadow-black/40'>
                <div className='flex items-center justify-center text-xs text-white/50'>
                  <span>Change Template</span>
                </div>
                <div className='mt-6 space-y-4'>
                  <div className='h-3 w-32 rounded-full bg-white/10' />
                  <div className='space-y-2'>
                    <div className='h-2 w-full rounded-full bg-white/10' />
                    <div className='h-2 w-5/6 rounded-full bg-white/10' />
                    <div className='h-2 w-4/6 rounded-full bg-white/10' />
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/60'>
                      <p className='text-white'>Skills woven</p>
                      <p className='text-white/50'>Python, React, NLP</p>
                    </div>
                    <div className='rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/60'>
                      <p className='text-white'>Tone match</p>
                      <p className='text-white/50'>Modern, confident</p>
                    </div>
                  </div>
                  <Link
                    className='block w-full rounded-2xl bg-white/10 px-4 py-3 text-center text-sm text-white/80'
                    href='/generate?type=cover-letter'
                  >
                    Generate cover letter draft
                  </Link>
                </div>
              </div>
              <div className='float absolute -bottom-6 right-4 rounded-2xl border border-white/15 bg-[#141d2a]/90 p-4 text-xs text-white/70 shadow-xl shadow-black/40'>
                <p className='text-white'>Interview Kit</p>
                <p className='text-2xl font-semibold text-[#ff7a6b]'>12 Qs</p>
                <p className='text-white/50'>Role-specific prep</p>
              </div>
            </div>
          </section>

          <section
            id='product'
            className='reveal delay-1 mt-20 grid gap-6 md:grid-cols-3'
          >
            {productFeatures.map((item) => (
              <div
                key={item.title}
                className='rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70'
              >
                <h3 className={`${space.className} text-xl text-white`}>
                  {item.title}
                </h3>
                <p className='mt-3'>{item.desc}</p>
              </div>
            ))}
          </section>

          <section
            id='workflow'
            className='mt-24 grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center'
          >
            <div className='space-y-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                Workflow
              </p>
              <h2 className={`${space.className} text-3xl md:text-4xl`}>
                From profile to polished in 4 moves
              </h2>
              <p className='text-sm text-white/70'>
                Each step keeps you in control, with AI doing the heavy lifting.
                Swap templates, adjust tone, and export in ATS-safe formats.
              </p>
              <button className='cursor-pointer rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 transition hover:border-white/60'>
                See the flow
              </button>
            </div>
            <div className='grid gap-4'>
              {[
                'Import your profile',
                'Select the target job description',
                'Generate tailored resume and cover letter',
                'Refine with AI feedback and export',
              ].map((step, index) => (
                <div
                  key={step}
                  className='flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4'
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm text-white/80'>
                    {index + 1}
                  </div>
                  <p className='text-sm text-white/70'>{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section id='templates' className='mt-24'>
            <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                  Templates
                </p>
                <h2 className={`${space.className} text-3xl md:text-4xl`}>
                  Every role, every tone
                </h2>
                <p className='mt-3 text-sm text-white/70'>
                  Choose from clean, modern, or creative layouts. Swap fonts and
                  emphasis to match the company culture.
                </p>
              </div>
              <button className='cursor-pointer rounded-full bg-white/10 px-5 py-2 text-sm text-white/80 transition hover:bg-white/20'>
                Browse all templates
              </button>
            </div>
            <div className='mt-8 grid gap-5 md:grid-cols-3'>
              {[
                { name: 'Modern Minimal', tone: 'ATS-first' },
                { name: 'Bold Impact', tone: 'Leadership' },
                { name: 'Creative Flux', tone: 'Portfolio-friendly' },
              ].map((card) => (
                <div
                  key={card.name}
                  className='group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-white/40'
                >
                  <div className='h-36 rounded-2xl bg-linear-to-br from-white/10 via-white/5 to-transparent' />
                  <h3 className='mt-4 text-lg text-white'>{card.name}</h3>
                  <p className='text-sm text-white/60'>{card.tone}</p>
                </div>
              ))}
            </div>
          </section>

          <section id='pricing' className='mt-24'>
            <div className='rounded-3xl border border-white/10 bg-linear-to-r from-[#102028] via-[#111b25] to-[#0f1720] p-8 md:p-10'>
              <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
                <div>
                  <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                    Pricing
                  </p>
                  <h2 className={`${space.className} text-3xl md:text-4xl`}>
                    Start free, upgrade when you are ready
                  </h2>
                  <p className='mt-3 text-sm text-white/70'>
                    Generate 3 tailored drafts for free. Pro unlocks unlimited
                    versions, interview prep, and analytics.
                  </p>
                </div>
                <div className='rounded-3xl border border-white/15 bg-white/5 p-6 text-sm text-white/70'>
                  <p className='text-white'>Pro plan</p>
                  <p className='mt-2 text-3xl font-semibold text-white ml-2'>
                    $5
                  </p>
                  <p className='text-xs text-white/50'>per month</p>
                  <button className='cursor-pointer mt-4 w-full rounded-full bg-[#f7d469] px-4 py-2 text-sm font-semibold text-[#0c1116]'>
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className='mt-24 rounded-3xl border border-white/10 bg-[#0f1720]/80 p-10 text-center'>
            <h2 className={`${space.className} text-3xl md:text-4xl`}>
              Ready to build your next offer story?
            </h2>
            <p className='mx-auto mt-4 max-w-2xl text-sm text-white/70'>
              Upload your resume, pick a target role, and let careerIDream craft
              the documents that get noticed.
            </p>
            <div className='mt-6 flex flex-wrap items-center justify-center gap-4'>
              <button className='cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0c1116]'>
                Create my first draft
              </button>
              <button className='cursor-pointer rounded-full border border-white/20 px-6 py-3 text-sm text-white/80'>
                Talk to us
              </button>
            </div>
          </section>
        </div>
        <Footer variant='full' />
      </main>
    </div>
  );
}

export default HomeComponent
