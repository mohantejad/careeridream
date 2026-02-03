'use client';

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { sora, space } from '@/app/fonts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';

const templateOptions = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'creative', label: 'Creative' },
];

type ResumeDraft = {
  headline?: string;
  summary?: string;
  skills?: string[];
  fit_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  experiences?: Array<{
    company?: string;
    title?: string;
    location?: string;
    start_date?: string;
    end_date?: string | null;
    is_current?: boolean;
    bullets?: string[];
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string | null;
    end_date?: string | null;
  }>;
  certifications?: string[];
  achievements?: string[];
};

type CoverLetterDraft = {
  subject?: string;
  greeting?: string;
  body_paragraphs?: string[];
  closing?: string;
  signature?: string;
};

const GeneratePage = () => {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type');
  const initialFocus = searchParams.get('focus');
  const [mode, setMode] = useState<'resume' | 'cover-letter'>(
    initialType === 'cover-letter' ? 'cover-letter' : 'resume'
  );
  const [templateStyle, setTemplateStyle] = useState('modern');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [resumeDraft, setResumeDraft] = useState<ResumeDraft | null>(null);
  const [coverLetterDraft, setCoverLetterDraft] = useState<CoverLetterDraft | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement | null>(null);

  const endpoint = useMemo(() => {
    return mode === 'resume'
      ? '/profiles/profile/generate_resume/'
      : '/profiles/profile/generate_cover_letter/';
  }, [mode]);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setStatusMessage('Please paste a job description.');
      return;
    }

    setIsGenerating(true);
    setStatusMessage('');

    try {
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobDescription,
          template_style: templateStyle,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setStatusMessage(errorText || 'Generation failed. Try again.');
        return;
      }

      const data = await response.json();
      if (mode === 'resume') {
        setResumeDraft(data as ResumeDraft);
        setIsResumeModalOpen(true);
      } else {
        setCoverLetterDraft(data as CoverLetterDraft);
      }
      setStatusMessage('Draft generated. Review and edit below.');
    } catch {
      setStatusMessage('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!resumeDraft) return;
    setSaveMessage('');
    try {
      const response = await apiFetch('/drafts/drafts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_type: 'resume',
          job_title: jobTitle,
          company,
          job_description: jobDescription,
          template_style: templateStyle,
          content: resumeDraft,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        setSaveMessage(errorText || 'Unable to save draft.');
        return;
      }
      setSaveMessage('Draft saved.');
    } catch {
      setSaveMessage('Unable to save draft.');
    }
  };

  const updateResumeField = (key: keyof ResumeDraft, value: string) => {
    setResumeDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateSkill = (index: number, value: string) => {
    setResumeDraft((prev) => {
      if (!prev?.skills) return prev;
      const updated = [...prev.skills];
      updated[index] = value;
      return { ...prev, skills: updated };
    });
  };

  const updateExperienceField = (
    index: number,
    key: keyof NonNullable<ResumeDraft['experiences']>[number],
    value: string
  ) => {
    setResumeDraft((prev) => {
      if (!prev?.experiences) return prev;
      const updated = prev.experiences.map((exp, idx) =>
        idx === index ? { ...exp, [key]: value } : exp
      );
      return { ...prev, experiences: updated };
    });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, value: string) => {
    setResumeDraft((prev) => {
      if (!prev?.experiences) return prev;
      const updated = prev.experiences.map((exp, idx) => {
        if (idx !== expIndex) return exp;
        const bullets = exp.bullets ? [...exp.bullets] : [];
        bullets[bulletIndex] = value;
        return { ...exp, bullets };
      });
      return { ...prev, experiences: updated };
    });
  };

  const updateEducationField = (
    index: number,
    key: keyof NonNullable<ResumeDraft['education']>[number],
    value: string
  ) => {
    setResumeDraft((prev) => {
      if (!prev?.education) return prev;
      const updated = prev.education.map((edu, idx) =>
        idx === index ? { ...edu, [key]: value } : edu
      );
      return { ...prev, education: updated };
    });
  };

  const handleDownloadPdf = async () => {
    if (!resumePreviewRef.current) return;
    const element = resumePreviewRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let offsetY = 0;
    while (offsetY < imgHeight) {
      const pageCanvas = document.createElement('canvas');
      const pageContext = pageCanvas.getContext('2d');
      if (!pageContext) break;
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(
        canvas.width * (pageHeight / pageWidth),
        canvas.height - (offsetY * canvas.width) / imgWidth
      );
      pageContext.drawImage(
        canvas,
        0,
        (offsetY * canvas.width) / imgWidth,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height
      );

      const pageData = pageCanvas.toDataURL('image/png');
      if (offsetY === 0) {
        pdf.addImage(pageData, 'PNG', 0, 0, imgWidth, (pageCanvas.height * imgWidth) / canvas.width);
      } else {
        pdf.addPage();
        pdf.addImage(pageData, 'PNG', 0, 0, imgWidth, (pageCanvas.height * imgWidth) / canvas.width);
      }
      offsetY += (pageHeight * imgWidth) / pageWidth;
    }

    pdf.save('careeridream-resume.pdf');
  };

  const handleDownloadDocx = async () => {
    if (!resumeDraft) return;
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Calibri',
              size: 22,
            },
            paragraph: {
              spacing: { line: 276, after: 120 },
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                bottom: 720,
                left: 720,
                right: 720,
              },
            },
          },
          children: [
            new Paragraph({
              spacing: { after: 160 },
              children: [
                new TextRun({
                  text: resumeDraft.headline ?? '',
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: resumeDraft.summary ?? '' }),
              ],
            }),
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({ text: 'SKILLS', bold: true, size: 20 }),
              ],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: resumeDraft.skills?.join(', ') ?? '' }),
              ],
            }),
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({ text: 'EXPERIENCE', bold: true, size: 20 }),
              ],
            }),
            ...(resumeDraft.experiences ?? []).flatMap((exp) => [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: exp.title ?? '', bold: true }),
                  new TextRun({ text: exp.company ? ` · ${exp.company}` : '' }),
                ],
              }),
              ...(exp.bullets ?? []).map((bullet) =>
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                  spacing: { after: 40 },
                })
              ),
            ]),
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({ text: 'EDUCATION', bold: true, size: 20 }),
              ],
            }),
            ...(resumeDraft.education ?? []).map((edu) =>
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: edu.degree ?? '', bold: true }),
                  new TextRun({ text: edu.school ? ` · ${edu.school}` : '' }),
                ],
              })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'careeridream-resume.docx');
  };

  return (
    <ProtectedRoute>
      <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
        <main className='relative overflow-hidden'>
          <div className='hero-grid absolute inset-0' />
          <div className='absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#102b2a] blur-3xl' />
          <div className='absolute right-10 top-20 h-72 w-72 rounded-full bg-[#18253b] blur-3xl' />
          <div className='relative mx-auto max-w-5xl px-6 pb-16 pt-8'>
            <Header showAuthButtons={false} showProfileMenu navVariant='app' />
            <section className='mt-20 rounded-3xl border border-white/10 bg-white/5 p-6'>
              <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
                Generate
              </p>
              <h1 className={`${space.className} mt-2 text-3xl`}>
                {mode === 'resume' ? 'Resume draft' : 'Cover letter draft'}
              </h1>
              <p className='mt-2 text-sm text-white/70'>
                Paste a job description, choose a template style, and generate a tailored draft.
              </p>
            </section>

            <section className='mt-8 rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6'>
              <div className='flex flex-wrap gap-3'>
                <button
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    mode === 'resume'
                      ? 'bg-[#6de5c1] text-[#0c1116]'
                      : 'border border-white/20 text-white/70'
                  }`}
                  onClick={() => setMode('resume')}
                >
                  Resume
                </button>
                <button
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    mode === 'cover-letter'
                      ? 'bg-[#6de5c1] text-[#0c1116]'
                      : 'border border-white/20 text-white/70'
                  }`}
                  onClick={() => setMode('cover-letter')}
                >
                  Cover letter
                </button>
              </div>

              <div className='mt-6 grid gap-4 md:grid-cols-[1fr_220px]'>
                <div className='space-y-4'>
                  <div className='grid gap-3 md:grid-cols-2'>
                    <input
                      className='rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm'
                      placeholder='Job title'
                      value={jobTitle}
                      onChange={(event) => setJobTitle(event.target.value)}
                    />
                    <input
                      className='rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm'
                      placeholder='Company'
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                    />
                  </div>
                  <textarea
                    className='min-h-55 w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm'
                    placeholder='Paste the job description here...'
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    autoFocus={initialFocus === 'jd'}
                  />
                </div>
                <div className='space-y-4'>
                  <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                    <p className='text-xs uppercase tracking-[0.2em] text-white/40'>
                      Template
                    </p>
                    <select
                      className='mt-3 w-full rounded-xl border border-white/10 bg-[#0c1218] px-3 py-2 text-sm'
                      value={templateStyle}
                      onChange={(event) => setTemplateStyle(event.target.value)}
                    >
                      {templateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className='w-full rounded-full bg-[#6de5c1] px-4 py-3 text-sm font-semibold text-[#0c1116] disabled:opacity-60'
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate draft'}
                  </button>
                  {statusMessage ? (
                    <p className='text-xs text-white/60'>{statusMessage}</p>
                  ) : null}
                </div>
              </div>
            </section>

            {mode === 'resume' && resumeDraft ? (
              <section className='mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70'>
                <h2 className={`${space.className} text-2xl text-white`}>
                  Resume draft
                </h2>
                <div className='mt-4 space-y-4'>
                  <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-white/40'>Headline</p>
                    <p className='text-white'>{resumeDraft.headline}</p>
                  </div>
                  <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-white/40'>Summary</p>
                    <p>{resumeDraft.summary}</p>
                  </div>
                  <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-white/40'>Skills</p>
                    <p>{resumeDraft.skills?.join(', ')}</p>
                  </div>
                  <div>
                    <p className='text-xs uppercase tracking-[0.2em] text-white/40'>Experience</p>
                    <div className='space-y-3'>
                      {resumeDraft.experiences?.map((exp, idx) => (
                        <div key={`${exp.company}-${idx}`}>
                          <p className='text-white'>
                            {exp.title} · {exp.company}
                          </p>
                          <p className='text-xs text-white/50'>
                            {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                          </p>
                          <ul className='mt-2 list-disc space-y-1 pl-4'>
                            {exp.bullets?.map((bullet, bidx) => (
                              <li key={`${idx}-${bidx}`}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {mode === 'cover-letter' && coverLetterDraft ? (
              <section className='mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70'>
                <h2 className={`${space.className} text-2xl text-white`}>
                  Cover letter draft
                </h2>
                <div className='mt-4 space-y-3'>
                  <p className='text-white'>{coverLetterDraft.subject}</p>
                  <p>{coverLetterDraft.greeting}</p>
                  {coverLetterDraft.body_paragraphs?.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                  <p>{coverLetterDraft.closing}</p>
                  <p className='text-white'>{coverLetterDraft.signature}</p>
                </div>
              </section>
            ) : null}
          </div>
          <Footer variant='full' />
        </main>
        {mode === 'resume' && resumeDraft && isResumeModalOpen ? (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6'>
            <div className='flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f1720] shadow-2xl'>
              <div className='flex items-center justify-between border-b border-white/10 px-6 py-4'>
                <div>
                  <p className='text-xs uppercase tracking-[0.3em] text-white/40'>
                    Resume editor
                  </p>
                  <p className={`${space.className} text-lg text-white`}>
                    Edit and export your resume
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <select
                    className='rounded-full border border-white/10 bg-[#0c1218] px-3 py-2 text-xs text-white/70'
                    value={templateStyle}
                    onChange={(event) => setTemplateStyle(event.target.value)}
                  >
                    {templateOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className='rounded-full border border-white/10 bg-[#0c1218] px-3 py-2 text-xs text-white/70'
                    defaultValue=''
                    onChange={(event) => {
                      if (event.target.value === 'docx') handleDownloadDocx();
                      if (event.target.value === 'pdf') handleDownloadPdf();
                      event.target.value = '';
                    }}
                  >
                    <option value='' disabled>
                      Download
                    </option>
                    <option value='docx'>DOCX</option>
                    <option value='pdf'>PDF</option>
                  </select>
                  <button
                    className='rounded-full border border-white/20 px-3 py-2 text-xs text-white/70'
                    onClick={handleSaveDraft}
                  >
                    Save draft
                  </button>
                  <button
                    className='rounded-full bg-white/10 px-3 py-2 text-xs text-white/70'
                    onClick={() => setIsResumeModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className='flex-1 overflow-y-auto p-6'>
                {saveMessage ? (
                  <p className='mb-3 text-xs text-white/60'>{saveMessage}</p>
                ) : null}
                <div
                  ref={resumePreviewRef}
                  className={`rounded-2xl p-8 ${
                    templateStyle === 'classic'
                      ? 'font-serif'
                      : templateStyle === 'minimal'
                      ? 'font-sans'
                      : 'font-sans'
                  }`}
                  style={{ backgroundColor: '#ffffff', color: '#0c1116' }}
                >
                  <div className='space-y-6'>
                    <div>
                      <h2
                        className='text-2xl font-semibold'
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(event) =>
                          updateResumeField('headline', event.currentTarget.textContent || '')
                        }
                      >
                        {resumeDraft.headline}
                      </h2>
                      <p
                        className='mt-3 text-sm'
                        style={{ color: '#334155' }}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(event) =>
                          updateResumeField('summary', event.currentTarget.textContent || '')
                        }
                      >
                        {resumeDraft.summary}
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
                        {resumeDraft.skills?.map((skill, idx) => (
                          <li
                            key={`${skill}-${idx}`}
                            className='flex items-center rounded-full border px-3 py-1'
                            style={{ borderColor: '#e2e8f0' }}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(event) =>
                              updateSkill(idx, event.currentTarget.textContent || '')
                            }
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
                        {resumeDraft.experiences?.map((exp, idx) => (
                          <div key={`${exp.company}-${idx}`} className='space-y-2'>
                            <div className='flex flex-wrap items-baseline justify-between gap-2'>
                              <div className='text-base font-semibold'>
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  onInput={(event) =>
                                    updateExperienceField(idx, 'title', event.currentTarget.textContent || '')
                                  }
                                >
                                  {exp.title}
                                </span>
                                <span style={{ color: '#64748b' }}> · </span>
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  onInput={(event) =>
                                    updateExperienceField(idx, 'company', event.currentTarget.textContent || '')
                                  }
                                >
                                  {exp.company}
                                </span>
                              </div>
                              <span className='text-xs' style={{ color: '#64748b' }}>
                                {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                              </span>
                            </div>
                            <ul className='list-disc space-y-1 pl-5 text-sm' style={{ color: '#334155' }}>
                              {exp.bullets?.map((bullet, bidx) => (
                                <li
                                  key={`${idx}-${bidx}`}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onInput={(event) =>
                                    updateExperienceBullet(idx, bidx, event.currentTarget.textContent || '')
                                  }
                                >
                                  {bullet}
                                </li>
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
                        {resumeDraft.education?.map((edu, idx) => (
                          <div key={`${edu.school}-${idx}`}>
                            <span
                              className='font-semibold'
                              contentEditable
                              suppressContentEditableWarning
                              onInput={(event) =>
                                updateEducationField(idx, 'degree', event.currentTarget.textContent || '')
                              }
                            >
                              {edu.degree}
                            </span>
                            <span style={{ color: '#64748b' }}> · </span>
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onInput={(event) =>
                                updateEducationField(idx, 'school', event.currentTarget.textContent || '')
                              }
                            >
                              {edu.school}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {(typeof resumeDraft.fit_score === 'number' ||
                (resumeDraft.strengths && resumeDraft.strengths.length > 0) ||
                (resumeDraft.weaknesses && resumeDraft.weaknesses.length > 0)) && (
                <div className='mt-6 border-t border-white/10 pt-4 text-sm text-white/70'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <div className='rounded-full border border-white/20 px-3 py-1 text-xs text-white/70'>
                      Fit score: {Math.round(resumeDraft.fit_score ?? 0)}%
                    </div>
                  </div>
                  <div className='mt-3 grid gap-3 md:grid-cols-2'>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-white/40'>
                        Strengths
                      </p>
                      <ul className='mt-2 list-disc space-y-1 pl-4 text-sm text-white/70'>
                        {(resumeDraft.strengths ?? []).slice(0, 2).map((item, idx) => (
                          <li key={`strength-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-white/40'>
                        Weak points
                      </p>
                      <ul className='mt-2 list-disc space-y-1 pl-4 text-sm text-white/70'>
                        {(resumeDraft.weaknesses ?? []).slice(0, 2).map((item, idx) => (
                          <li key={`weak-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
};

export default GeneratePage;
