'use client';

import { useState } from 'react';
import { sora, space } from '@/app/fonts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const templates = [
  {
    name: 'Modern',
    description: 'Clean, ATS-friendly layout with skill chips and crisp headings.',
    accent: 'from-[#6de5c1]/30',
  },
  {
    name: 'Classic',
    description: 'Traditional serif styling for conservative or academic roles.',
    accent: 'from-[#ffd27a]/30',
  },
  {
    name: 'Minimal',
    description: 'Ultra-compact spacing for experienced candidates.',
    accent: 'from-[#6bd0ff]/30',
  },
  {
    name: 'Creative',
    description: 'Bold section headers and modern rhythm for design-forward teams.',
    accent: 'from-[#ff7a6b]/30',
  },
];

const sampleResume = {
  headline: 'Full-Stack Software Engineer',
  summary:
    'Backend-focused engineer with experience shipping React, Next.js, and Django REST applications, optimizing data pipelines, and improving system reliability.',
  skills: ['Python', 'Django', 'PostgreSQL', 'React', 'Next.js', 'AWS'],
  experiences: [
    {
      title: 'Software Engineer',
      company: 'Atlas Labs',
      start_date: '2023-01-01',
      end_date: '2024-06-01',
      is_current: false,
      bullets: [
        'Built API services for data ingestion and analytics.',
        'Improved API response times by 32% through query tuning.',
      ],
    },
  ],
  education: [
    {
      degree: 'B.S. Computer Science',
      school: 'GITAM University',
    },
  ],
};

export default function TemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const closePreview = () => setActiveTemplate(null);

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
              Templates
            </p>
            <h1 className={`${space.className} mt-2 text-3xl`}>
              Pick a layout that matches the role
            </h1>
            <p className='mt-2 text-sm text-white/70'>
              Swap templates anytime after generating a resume. Each template is
              export-ready with ATS-safe formatting.
            </p>
          </section>

          <section className='mt-8 grid gap-5 md:grid-cols-2'>
            {templates.map((template) => (
              <article
                key={template.name}
                className='rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6'
              >
                <div
                  className={`h-36 rounded-2xl bg-gradient-to-br ${template.accent} to-transparent`}
                />
                <h3 className={`${space.className} mt-5 text-xl`}>
                  {template.name}
                </h3>
                <p className='mt-2 text-sm text-white/70'>
                  {template.description}
                </p>
                <button
                  className='mt-4 rounded-full border border-white/20 px-4 py-2 text-xs text-white/80 transition hover:border-white/60'
                  onClick={() => setActiveTemplate(template.name)}
                >
                  Preview template
                </button>
              </article>
            ))}
          </section>
        </div>
        <Footer />
      </main>
      {activeTemplate ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6'>
          <div className='flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f1720] shadow-2xl'>
            <div className='flex items-center justify-between border-b border-white/10 px-6 py-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                  {activeTemplate} template
                </p>
                <p className={`${space.className} text-lg text-white`}>
                  Resume preview
                </p>
              </div>
              <button
                className='rounded-full bg-white/10 px-3 py-2 text-xs text-white/70'
                onClick={closePreview}
              >
                Close
              </button>
            </div>
            <div className='flex-1 overflow-y-auto p-6'>
              <div
                className={`rounded-2xl p-8 ${
                  activeTemplate === 'Classic'
                    ? 'font-serif'
                    : activeTemplate === 'Minimal'
                    ? 'font-sans'
                    : 'font-sans'
                }`}
                style={{ backgroundColor: '#ffffff', color: '#0c1116' }}
              >
                <div className='space-y-6'>
                  <div>
                    <h2 className='text-2xl font-semibold'>
                      {sampleResume.headline}
                    </h2>
                    <p className='mt-3 text-sm' style={{ color: '#334155' }}>
                      {sampleResume.summary}
                    </p>
                  </div>
                  <div>
                    <h3
                      className='text-sm font-semibold uppercase tracking-wide'
                      style={{ color: '#64748b' }}
                    >
                      Skills
                    </h3>
                    <ul className='mt-2 flex flex-wrap gap-2 text-sm'>
                      {sampleResume.skills.map((skill) => (
                        <li
                          key={skill}
                          className='flex items-center rounded-full border px-3 py-1'
                          style={{ borderColor: '#e2e8f0' }}
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3
                      className='text-sm font-semibold uppercase tracking-wide'
                      style={{ color: '#64748b' }}
                    >
                      Experience
                    </h3>
                    <div className='mt-3 space-y-4'>
                      {sampleResume.experiences.map((exp) => (
                        <div key={exp.company} className='space-y-2'>
                          <div className='flex flex-wrap items-baseline justify-between gap-2'>
                            <div className='text-base font-semibold'>
                              <span>{exp.title}</span>
                              <span style={{ color: '#64748b' }}> · </span>
                              <span>{exp.company}</span>
                            </div>
                            <span className='text-xs' style={{ color: '#64748b' }}>
                              {exp.start_date} – {exp.end_date}
                            </span>
                          </div>
                          <ul
                            className='list-disc space-y-1 pl-5 text-sm'
                            style={{ color: '#334155' }}
                          >
                            {exp.bullets.map((bullet) => (
                              <li key={bullet}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3
                      className='text-sm font-semibold uppercase tracking-wide'
                      style={{ color: '#64748b' }}
                    >
                      Education
                    </h3>
                    <div className='mt-2 space-y-2 text-sm' style={{ color: '#334155' }}>
                      {sampleResume.education.map((edu) => (
                        <div key={edu.school}>
                          <span className='font-semibold'>{edu.degree}</span>
                          <span style={{ color: '#64748b' }}> · </span>
                          <span>{edu.school}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
