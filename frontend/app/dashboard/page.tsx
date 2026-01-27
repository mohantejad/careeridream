"use client";

import { useEffect, useMemo, useState } from "react";

import { sora, space } from "@/app/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";

type CurrentUser = {
  email: string;
  first_name?: string;
  last_name?: string;
};

type ApplicationItem = {
  id: string;
  role: string;
  company: string;
  jd: string;
  resume: string;
  coverLetter: string;
  status: "Draft" | "Applied" | "Interview" | "Offer" | "Rejected";
  updatedAt: string;
};

const sampleApplications: ApplicationItem[] = [
  {
    id: "1",
    role: "Full Stack Engineer",
    company: "Atlas Labs",
    jd: "Senior full-stack role for product-led teams.",
    resume: "Resume v3",
    coverLetter: "Cover letter v2",
    status: "Applied",
    updatedAt: "2 days ago",
  },
  {
    id: "2",
    role: "Frontend Engineer",
    company: "Ardor AI",
    jd: "React + Tailwind with design systems.",
    resume: "Resume v1",
    coverLetter: "Cover letter v1",
    status: "Interview",
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    role: "Backend Engineer",
    company: "Clover Systems",
    jd: "Django + PostgreSQL, API heavy.",
    resume: "Resume v2",
    coverLetter: "Cover letter v3",
    status: "Draft",
    updatedAt: "Just now",
  },
];

const statusBadge: Record<ApplicationItem["status"], string> = {
  Draft: "bg-white/10 text-white/70",
  Applied: "bg-[#6de5c1]/20 text-[#6de5c1]",
  Interview: "bg-[#6bd0ff]/20 text-[#6bd0ff]",
  Offer: "bg-[#ffd27a]/20 text-[#ffd27a]",
  Rejected: "bg-[#ff9a9a]/20 text-[#ff9a9a]",
};

const DashboardPage = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await apiFetch("/auth/users/me/");
        if (!isMounted) return;
        if (response.ok) {
          const data = (await response.json()) as CurrentUser;
          setUser(data);
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
            {sampleApplications.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                    {item.company}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${statusBadge[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
                <h3 className={`${space.className} mt-3 text-lg`}>
                  {item.role}
                </h3>
                <p className="mt-2 text-xs text-white/60">{item.jd}</p>
                <div className="mt-4 space-y-2 text-xs text-white/70">
                  <p>
                    Resume: <span className="text-white">{item.resume}</span>
                  </p>
                  <p>
                    Cover letter:{" "}
                    <span className="text-white">{item.coverLetter}</span>
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs text-white/50">
                  <span>Updated {item.updatedAt}</span>
                  <button className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-white/80 transition hover:border-white/60">
                    View
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default DashboardPage;

