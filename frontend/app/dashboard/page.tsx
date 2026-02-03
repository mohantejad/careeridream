"use client";

import { useEffect, useMemo, useState } from "react";

import { sora, space } from "@/app/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

type CurrentUser = {
  email: string;
  first_name?: string;
  last_name?: string;
};

type SavedDraft = {
  id: number;
  draft_type: "resume" | "cover_letter";
  job_title?: string;
  company?: string;
  summary_line?: string;
  job_description: string;
  template_style: string;
  content: {
    fit_score?: number;
  } & Record<string, unknown>;
  resume_filename?: string;
  updated_at: string;
};

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

const fitBadgeClass = (fitScore?: number) => {
  if (fitScore === undefined || Number.isNaN(fitScore)) {
    return "bg-white/10 text-white/70";
  }
  if (fitScore >= 75) return "bg-[#6de5c1]/20 text-[#6de5c1]";
  if (fitScore >= 50) return "bg-[#6bd0ff]/20 text-[#6bd0ff]";
  return "bg-[#ffd27a]/20 text-[#ffd27a]";
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const trimText = (value: string, limit = 110) => {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= limit) return cleaned;
  return `${cleaned.slice(0, limit)}...`;
};

const DashboardPage = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [selectedDraft, setSelectedDraft] = useState<SavedDraft | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [userResponse, draftResponse] = await Promise.all([
          apiFetch("/auth/users/me/"),
          apiFetch("/drafts/drafts/"),
        ]);
        if (!isMounted) return;
        if (userResponse.ok) {
          const data = (await userResponse.json()) as CurrentUser;
          setUser(data);
        }
        if (draftResponse.ok) {
          const data = (await draftResponse.json()) as SavedDraft[];
          setDrafts(data);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    if (!user) return "U";
    const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    if (!name) return user.email[0]?.toUpperCase() ?? "U";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user]);

  const handleDelete = async (draftId: number) => {
    setDeleteMessage('');
    setDeletingId(draftId);
    try {
      const response = await apiFetch(`/drafts/drafts/${draftId}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        setDeleteMessage(errorText || 'Unable to delete draft.');
        return;
      }
      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
    } catch {
      setDeleteMessage('Unable to delete draft.');
    } finally {
      setDeletingId(null);
    }
  };

  const openPreview = (draft: SavedDraft) => {
    setSelectedDraft(draft);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedDraft(null);
  };

  const resumePreview =
    selectedDraft?.draft_type === 'resume'
      ? (selectedDraft.content as ResumeDraft)
      : null;
  const coverLetterPreview =
    selectedDraft?.draft_type === 'cover_letter'
      ? (selectedDraft.content as CoverLetterDraft)
      : null;

  if (isLoading) {
    return (
      <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
        <main className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0" />
          <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Loading
            </p>
            <h1 className={`${space.className} mt-3 text-3xl`}>
              Preparing your dashboard...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
        <main className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0" />
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#102b2a] blur-3xl" />
          <div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-[#18253b] blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-8">
            <Header
              showAuthButtons={false}
              showProfileMenu
              userInitials={initials}
              navVariant="app"
            />

            <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Product dashboard
              </p>
              <h1 className={`${space.className} mt-2 text-3xl`}>
                Track every resume, cover letter, and JD
              </h1>
              <p className="mt-2 text-sm text-white/70">
                See where each application stands and jump back into edits when
                needed.
              </p>
            </section>

            <section className="mt-8 grid gap-4 md:grid-cols-3">
              {drafts.length === 0 ? (
                <article className="col-span-full rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6 text-sm text-white/70">
                  No saved drafts yet. Generate a resume or cover letter to see
                  it here.
                </article>
              ) : (
                drafts.map((item) => {
                  const role = item.job_title?.trim() || "Untitled role";
                  const company = item.company?.trim() || "Unknown company";
                  const jdPreview = item.summary_line?.trim()
                    ? item.summary_line.trim()
                    : trimText(item.job_description);
                  const fitScore = item.content?.fit_score;
                  const resumeLabel =
                    item.draft_type === "resume"
                      ? item.resume_filename?.trim() || "Generated resume"
                      : "—";
                  const coverLabel =
                    item.draft_type === "cover_letter"
                      ? "Generated cover letter"
                      : "—";
                  return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {company}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${fitBadgeClass(
                        fitScore
                      )}`}
                    >
                      {fitScore !== undefined ? `Fit ${fitScore}%` : "Fit —"}
                    </span>
                  </div>
                  <h3 className={`${space.className} mt-3 text-lg`}>
                    {role}
                  </h3>
                  <p className="mt-2 text-xs text-white/60">{jdPreview}</p>
                  <div className="mt-4 space-y-2 text-xs text-white/70">
                    <p>
                      Resume: <span className="text-white">{resumeLabel}</span>
                    </p>
                    <p>
                      Cover letter:{" "}
                      <span className="text-white">{coverLabel}</span>
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs text-white/50">
                    <span>Updated {formatDate(item.updated_at)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPreview(item)}
                        className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/80 transition hover:border-white/60"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/80 transition hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === item.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
                  );
                })
              )}
            </section>
            {deleteMessage ? (
              <p className="mt-4 text-xs text-[#ffd27a]">{deleteMessage}</p>
            ) : null}
          </div>
          <Footer />
        </main>
        {isPreviewOpen && selectedDraft ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0f1720] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    Saved draft
                  </p>
                  <p className={`${space.className} text-lg text-white`}>
                    {selectedDraft.job_title?.trim() || 'Untitled role'}
                  </p>
                </div>
                <button
                  className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/70"
                  onClick={closePreview}
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {resumePreview ? (
                  <div
                    className={`rounded-2xl p-8 ${
                      selectedDraft.template_style === 'classic'
                        ? 'font-serif'
                        : selectedDraft.template_style === 'minimal'
                        ? 'font-sans'
                        : 'font-sans'
                    }`}
                    style={{ backgroundColor: '#ffffff', color: '#0c1116' }}
                  >
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {resumePreview.headline}
                        </h2>
                        <p className="mt-3 text-sm" style={{ color: '#334155' }}>
                          {resumePreview.summary}
                        </p>
                      </div>
                      <div>
                        <h3
                          className="text-sm font-semibold uppercase tracking-wide"
                          style={{ color: '#64748b' }}
                        >
                          Skills
                        </h3>
                        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                          {resumePreview.skills?.map((skill, idx) => (
                            <li
                              key={`${skill}-${idx}`}
                              className="flex items-center rounded-full border px-3 py-1"
                              style={{ borderColor: '#e2e8f0' }}
                            >
                              {skill}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3
                          className="text-sm font-semibold uppercase tracking-wide"
                          style={{ color: '#64748b' }}
                        >
                          Experience
                        </h3>
                        <div className="mt-3 space-y-4">
                          {resumePreview.experiences?.map((exp, idx) => (
                            <div key={`${exp.company}-${idx}`} className="space-y-2">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <div className="text-base font-semibold">
                                  <span>{exp.title}</span>
                                  <span style={{ color: '#64748b' }}> · </span>
                                  <span>{exp.company}</span>
                                </div>
                                <span className="text-xs" style={{ color: '#64748b' }}>
                                  {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                                </span>
                              </div>
                              <ul
                                className="list-disc space-y-1 pl-5 text-sm"
                                style={{ color: '#334155' }}
                              >
                                {exp.bullets?.map((bullet, bidx) => (
                                  <li key={`${idx}-${bidx}`}>{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3
                          className="text-sm font-semibold uppercase tracking-wide"
                          style={{ color: '#64748b' }}
                        >
                          Education
                        </h3>
                        <div className="mt-2 space-y-2 text-sm" style={{ color: '#334155' }}>
                          {resumePreview.education?.map((edu, idx) => (
                            <div key={`${edu.school}-${idx}`}>
                              <span className="font-semibold">{edu.degree}</span>
                              <span style={{ color: '#64748b' }}> · </span>
                              <span>{edu.school}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {coverLetterPreview ? (
                  <div className="rounded-2xl bg-white p-8 text-sm text-[#0c1116]">
                    <h2 className="text-lg font-semibold">
                      {coverLetterPreview.subject}
                    </h2>
                    <div className="mt-4 space-y-3 text-sm text-[#334155]">
                      <p>{coverLetterPreview.greeting}</p>
                      {coverLetterPreview.body_paragraphs?.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                      <p>{coverLetterPreview.closing}</p>
                      <p className="text-[#0c1116]">{coverLetterPreview.signature}</p>
                    </div>
                  </div>
                ) : null}
              </div>
              {resumePreview ? (
                <div className="mt-6 border-t border-white/10 pt-4 text-sm text-white/70">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
                      Fit score: {Math.round(resumePreview.fit_score ?? 0)}%
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Strengths
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/70">
                        {(resumePreview.strengths ?? []).slice(0, 2).map((item, idx) => (
                          <li key={`strength-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Weak points
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/70">
                        {(resumePreview.weaknesses ?? []).slice(0, 2).map((item, idx) => (
                          <li key={`weak-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
