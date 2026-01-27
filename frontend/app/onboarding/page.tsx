"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { sora, space } from "@/app/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiFetch, getApiBaseUrl } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

type CurrentUser = {
  email: string;
  first_name?: string;
  last_name?: string;
};

type Skill = {
  name: string;
  proficiency: string;
  order: number;
};

type Experience = {
  company: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  order: number;
};

type Education = {
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
  order: number;
};

type Certification = {
  name: string;
  issuer: string;
  issue_date: string | null;
  expiration_date: string | null;
  credential_url: string;
  order: number;
};

type Achievement = {
  title: string;
  description: string;
  date: string | null;
  order: number;
};

const emptySkill: Skill = { name: "", proficiency: "", order: 0 };
const emptyExperience: Experience = {
  company: "",
  title: "",
  location: "",
  start_date: "",
  end_date: null,
  is_current: false,
  description: "",
  order: 0,
};
const emptyEducation: Education = {
  school: "",
  degree: "",
  field_of_study: "",
  start_date: null,
  end_date: null,
  description: "",
  order: 0,
};
const emptyCertification: Certification = {
  name: "",
  issuer: "",
  issue_date: null,
  expiration_date: null,
  credential_url: "",
  order: 0,
};
const emptyAchievement: Achievement = {
  title: "",
  description: "",
  date: null,
  order: 0,
};

const OnboardingPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [currentResumeUrl, setCurrentResumeUrl] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const [profileDraft, setProfileDraft] = useState({
    headline: "",
    summary: "",
    location: "",
    phone: "",
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillDraft, setSkillDraft] = useState<Skill>(emptySkill);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(
    null
  );

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [experienceDraft, setExperienceDraft] =
    useState<Experience>(emptyExperience);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<
    number | null
  >(null);

  const [educations, setEducations] = useState<Education[]>([]);
  const [educationDraft, setEducationDraft] =
    useState<Education>(emptyEducation);
  const [editingEducationIndex, setEditingEducationIndex] = useState<
    number | null
  >(null);

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certificationDraft, setCertificationDraft] =
    useState<Certification>(emptyCertification);
  const [editingCertificationIndex, setEditingCertificationIndex] = useState<
    number | null
  >(null);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementDraft, setAchievementDraft] =
    useState<Achievement>(emptyAchievement);
  const [editingAchievementIndex, setEditingAchievementIndex] = useState<
    number | null
  >(null);

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

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [userRes, profileRes] = await Promise.all([
          apiFetch("/auth/users/me/"),
          apiFetch("/profiles/profile/me/"),
        ]);

        if (!isMounted) return;

        if (userRes.ok) {
          const userData = (await userRes.json()) as CurrentUser;
          setUser(userData);
        }

        if (profileRes.ok) {
          const profileData = (await profileRes.json()) as {
            headline?: string;
            summary?: string;
            location?: string;
            phone?: string;
            resume_file?: string | null;
            skills?: Skill[];
            experiences?: Experience[];
            educations?: Education[];
            certifications?: Certification[];
            achievements?: Achievement[];
          };
          setProfileDraft({
            headline: profileData.headline ?? "",
            summary: profileData.summary ?? "",
            location: profileData.location ?? "",
            phone: profileData.phone ?? "",
          });
          setSkills(profileData.skills ?? []);
          setExperiences(profileData.experiences ?? []);
          setEducations(profileData.educations ?? []);
          setCertifications(profileData.certifications ?? []);
          setAchievements(profileData.achievements ?? []);
          if (profileData.resume_file) {
            const url = profileData.resume_file.startsWith("http")
              ? profileData.resume_file
              : `${getApiBaseUrl()}${profileData.resume_file}`;
            setCurrentResumeUrl(url);
          }
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

  const saveSkill = () => {
    if (!skillDraft.name.trim()) return;
    if (editingSkillIndex === null) {
      setSkills((prev) => [...prev, skillDraft]);
    } else {
      setSkills((prev) =>
        prev.map((item, index) =>
          index === editingSkillIndex ? skillDraft : item
        )
      );
    }
    setSkillDraft(emptySkill);
    setEditingSkillIndex(null);
  };

  const saveExperience = () => {
    if (!experienceDraft.company.trim() || !experienceDraft.title.trim()) return;
    if (editingExperienceIndex === null) {
      setExperiences((prev) => [...prev, experienceDraft]);
    } else {
      setExperiences((prev) =>
        prev.map((item, index) =>
          index === editingExperienceIndex ? experienceDraft : item
        )
      );
    }
    setExperienceDraft(emptyExperience);
    setEditingExperienceIndex(null);
  };

  const saveEducation = () => {
    if (!educationDraft.school.trim()) return;
    if (editingEducationIndex === null) {
      setEducations((prev) => [...prev, educationDraft]);
    } else {
      setEducations((prev) =>
        prev.map((item, index) =>
          index === editingEducationIndex ? educationDraft : item
        )
      );
    }
    setEducationDraft(emptyEducation);
    setEditingEducationIndex(null);
  };

  const saveCertification = () => {
    if (!certificationDraft.name.trim()) return;
    if (editingCertificationIndex === null) {
      setCertifications((prev) => [...prev, certificationDraft]);
    } else {
      setCertifications((prev) =>
        prev.map((item, index) =>
          index === editingCertificationIndex ? certificationDraft : item
        )
      );
    }
    setCertificationDraft(emptyCertification);
    setEditingCertificationIndex(null);
  };

  const saveAchievement = () => {
    if (!achievementDraft.title.trim()) return;
    if (editingAchievementIndex === null) {
      setAchievements((prev) => [...prev, achievementDraft]);
    } else {
      setAchievements((prev) =>
        prev.map((item, index) =>
          index === editingAchievementIndex ? achievementDraft : item
        )
      );
    }
    setAchievementDraft(emptyAchievement);
    setEditingAchievementIndex(null);
  };

  const applyParsedData = (data: {
    profile?: Partial<typeof profileDraft>;
    skills?: Skill[];
    experiences?: Experience[];
    educations?: Education[];
    certifications?: Certification[];
    achievements?: Achievement[];
  }) => {
    if (data.profile) {
      setProfileDraft((prev) => ({
        ...prev,
        ...data.profile,
      }));
    }
    if (Array.isArray(data.skills)) setSkills(data.skills);
    if (Array.isArray(data.experiences)) setExperiences(data.experiences);
    if (Array.isArray(data.educations)) setEducations(data.educations);
    if (Array.isArray(data.certifications)) setCertifications(data.certifications);
    if (Array.isArray(data.achievements)) setAchievements(data.achievements);
  };

  const parseResume = async () => {
    if (!resumeFile || isParsing) return;
    setIsParsing(true);
    setStatusMessage("");
    const formData = new FormData();
    formData.append("resume_file", resumeFile);

    try {
      const response = await apiFetch(
        "/profiles/profile/parse_resume/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        setStatusMessage(
          errorText || "Unable to parse resume. Please try again."
        );
        return;
      }

      const data = (await response.json()) as {
        profile?: Partial<typeof profileDraft>;
        skills?: Skill[];
        experiences?: Experience[];
        educations?: Education[];
        certifications?: Certification[];
        achievements?: Achievement[];
      };
      applyParsedData(data);
      setStatusMessage("Resume parsed. Review and edit the details below.");
    } catch {
      setStatusMessage("Unable to parse resume. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const submitOnboarding = async () => {
    setStatusMessage("");
    const formData = new FormData();
    formData.append("profile", JSON.stringify(profileDraft));
    formData.append("skills", JSON.stringify(skills));
    formData.append("experiences", JSON.stringify(experiences));
    formData.append("educations", JSON.stringify(educations));
    formData.append("certifications", JSON.stringify(certifications));
    formData.append("achievements", JSON.stringify(achievements));
    if (resumeFile) {
      formData.append("resume_file", resumeFile);
    }

    const response = await apiFetch(
      "/profiles/profile/onboarding_submit/",
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      setStatusMessage("Onboarding completed! Redirecting...");
      setTimeout(() => router.replace("/"), 1200);
    } else {
      setStatusMessage("Unable to complete onboarding. Please try again.");
    }
  };

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
              Preparing onboarding...
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
            <Header showNavLinks={false} showAuthButtons={false} showProfileMenu userInitials={initials} />
            <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Onboarding
              </p>
              <h1 className={`${space.className} mt-2 text-3xl`}>
                Complete your profile
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Upload your resume to auto-fill details, then review and edit.
              </p>
            </section>

            <section className="mt-10 space-y-10">
            <div className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6">
              <h2 className={`${space.className} text-2xl`}>Basics & Resume</h2>
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm"
                    placeholder="Headline"
                    value={profileDraft.headline}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        headline: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm"
                    placeholder="Location"
                    value={profileDraft.location}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                  />
                </div>
                <textarea
                  className="flex min-h-30 w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm"
                  placeholder="Summary"
                  value={profileDraft.summary}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      summary: event.target.value,
                    }))
                  }
                />
                <input
                  className="w-1/2 rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm"
                  placeholder="Phone"
                  value={profileDraft.phone}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                />
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/50">Resume</p>
                  {currentResumeUrl ? (
                    <a
                      className="text-xs text-[#6de5c1] hover:text-[#a8f0d8]"
                      href={currentResumeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View current resume
                    </a>
                  ) : (
                    <p className="text-xs text-white/50">No resume uploaded.</p>
                  )}
                  <input
                    className="mt-3 w-full text-xs text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:text-white/80"
                    type="file"
                    onChange={(event) =>
                      setResumeFile(event.target.files?.[0] ?? null)
                    }
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      className="rounded-full bg-[#6de5c1] px-5 py-2 text-xs font-semibold text-[#0c1116] disabled:opacity-60"
                      onClick={parseResume}
                      disabled={!resumeFile || isParsing}
                    >
                      {isParsing ? "Parsing..." : "Parse resume"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6">
              <h2 className={`${space.className} text-2xl`}>Skills</h2>
              <div className="mt-6 space-y-6">
                <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                    placeholder="Skill name"
                    value={skillDraft.name}
                    onChange={(event) =>
                      setSkillDraft((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                  <select
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                    value={skillDraft.proficiency}
                    onChange={(event) =>
                      setSkillDraft((prev) => ({
                        ...prev,
                        proficiency: event.target.value,
                      }))
                    }
                  >
                    <option value="">Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                    type="number"
                    placeholder="Order"
                    value={skillDraft.order}
                    onChange={(event) =>
                      setSkillDraft((prev) => ({
                        ...prev,
                        order: Number(event.target.value),
                      }))
                    }
                  />
                  <button
                    className="rounded-full bg-[#6de5c1] px-4 py-2 text-xs font-semibold text-[#0c1116]"
                    onClick={saveSkill}
                  >
                    {editingSkillIndex === null ? "Add" : "Update"}
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {skills.map((skill, index) => (
                    <div
                      key={`${skill.name}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="text-white">{skill.name}</p>
                        <p className="text-xs text-white/50">
                          {skill.proficiency || "Unspecified"}
                        </p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button
                          className="text-white/70"
                          onClick={() => {
                            setEditingSkillIndex(index);
                            setSkillDraft(skill);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-[#ffb0a8]"
                          onClick={() =>
                            setSkills((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6">
              <h2 className={`${space.className} text-2xl`}>Experience</h2>
              <div className="mt-6 space-y-6">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                    placeholder="Company"
                    value={experienceDraft.company}
                    onChange={(event) =>
                      setExperienceDraft((prev) => ({
                        ...prev,
                        company: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                    placeholder="Title"
                    value={experienceDraft.title}
                    onChange={(event) =>
                      setExperienceDraft((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                    placeholder="Location"
                    value={experienceDraft.location}
                    onChange={(event) =>
                      setExperienceDraft((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                    type="date"
                    value={experienceDraft.start_date}
                    onChange={(event) =>
                      setExperienceDraft((prev) => ({
                        ...prev,
                        start_date: event.target.value,
                      }))
                    }
                  />
                  <input
                    className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                    type="date"
                    value={experienceDraft.end_date ?? ""}
                    onChange={(event) =>
                      setExperienceDraft((prev) => ({
                        ...prev,
                        end_date: event.target.value,
                      }))
                    }
                    disabled={experienceDraft.is_current}
                  />
                  <label className="flex items-center gap-2 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={experienceDraft.is_current}
                      onChange={(event) =>
                        setExperienceDraft((prev) => ({
                          ...prev,
                          is_current: event.target.checked,
                        }))
                      }
                    />
                    Current role
                  </label>
                  <textarea
                    className="min-h-22.5 rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm md:col-span-2"
                    placeholder="Description"
                    value={experienceDraft.description}
                    onChange={(event) =>
                      setExperienceDraft((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                  />
                  <div className="flex items-center gap-3 md:col-span-2">
                    <input
                      className="w-24 rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      type="number"
                      placeholder="Order"
                      value={experienceDraft.order}
                      onChange={(event) =>
                        setExperienceDraft((prev) => ({
                          ...prev,
                          order: Number(event.target.value),
                        }))
                      }
                    />
                    <button
                      className="rounded-full bg-[#6de5c1] px-4 py-2 text-xs font-semibold text-[#0c1116]"
                      onClick={saveExperience}
                    >
                      {editingExperienceIndex === null ? "Add" : "Update"}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {experiences.map((exp, index) => (
                    <div
                      key={`${exp.company}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="text-white">{exp.title}</p>
                        <p className="text-xs text-white/50">
                          {exp.company} · {exp.location || "Remote"}
                        </p>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <button
                          className="text-white/70"
                          onClick={() => {
                            setEditingExperienceIndex(index);
                            setExperienceDraft(exp);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-[#ffb0a8]"
                          onClick={() =>
                            setExperiences((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6">
              <div className="space-y-8">
                <div>
                  <h3 className={`${space.className} text-xl`}>Education</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      placeholder="School"
                      value={educationDraft.school}
                      onChange={(event) =>
                        setEducationDraft((prev) => ({
                          ...prev,
                          school: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      placeholder="Degree"
                      value={educationDraft.degree}
                      onChange={(event) =>
                        setEducationDraft((prev) => ({
                          ...prev,
                          degree: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      placeholder="Field of study"
                      value={educationDraft.field_of_study}
                      onChange={(event) =>
                        setEducationDraft((prev) => ({
                          ...prev,
                          field_of_study: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      type="date"
                      value={educationDraft.start_date ?? ""}
                      onChange={(event) =>
                        setEducationDraft((prev) => ({
                          ...prev,
                          start_date: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      type="date"
                      value={educationDraft.end_date ?? ""}
                      onChange={(event) =>
                        setEducationDraft((prev) => ({
                          ...prev,
                          end_date: event.target.value,
                        }))
                      }
                    />
                    <textarea
                      className="min-h-20 rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm md:col-span-2"
                      placeholder="Description"
                      value={educationDraft.description}
                      onChange={(event) =>
                        setEducationDraft((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                    />
                    <div className="flex items-center gap-3 md:col-span-2">
                      <input
                        className="w-24 rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                        type="number"
                        placeholder="Order"
                        value={educationDraft.order}
                        onChange={(event) =>
                          setEducationDraft((prev) => ({
                            ...prev,
                            order: Number(event.target.value),
                          }))
                        }
                      />
                      <button
                        className="rounded-full bg-[#6de5c1] px-4 py-2 text-xs font-semibold text-[#0c1116]"
                        onClick={saveEducation}
                      >
                        {editingEducationIndex === null ? "Add" : "Update"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {educations.map((edu, index) => (
                      <div
                        key={`${edu.school}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="text-white">{edu.school}</p>
                          <p className="text-xs text-white/50">
                            {edu.degree || "Degree"} ·{" "}
                            {edu.field_of_study || "Field"}
                          </p>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <button
                            className="text-white/70"
                            onClick={() => {
                              setEditingEducationIndex(index);
                              setEducationDraft(edu);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-[#ffb0a8]"
                            onClick={() =>
                              setEducations((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`${space.className} text-xl`}>Certifications</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      placeholder="Certification"
                      value={certificationDraft.name}
                      onChange={(event) =>
                        setCertificationDraft((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      placeholder="Issuer"
                      value={certificationDraft.issuer}
                      onChange={(event) =>
                        setCertificationDraft((prev) => ({
                          ...prev,
                          issuer: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      type="date"
                      value={certificationDraft.issue_date ?? ""}
                      onChange={(event) =>
                        setCertificationDraft((prev) => ({
                          ...prev,
                          issue_date: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      type="date"
                      value={certificationDraft.expiration_date ?? ""}
                      onChange={(event) =>
                        setCertificationDraft((prev) => ({
                          ...prev,
                          expiration_date: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm md:col-span-2"
                      placeholder="Credential URL"
                      value={certificationDraft.credential_url}
                      onChange={(event) =>
                        setCertificationDraft((prev) => ({
                          ...prev,
                          credential_url: event.target.value,
                        }))
                      }
                    />
                    <div className="flex items-center gap-3 md:col-span-2">
                      <input
                        className="w-24 rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                        type="number"
                        placeholder="Order"
                        value={certificationDraft.order}
                        onChange={(event) =>
                          setCertificationDraft((prev) => ({
                            ...prev,
                            order: Number(event.target.value),
                          }))
                        }
                      />
                      <button
                        className="rounded-full bg-[#6de5c1] px-4 py-2 text-xs font-semibold text-[#0c1116]"
                        onClick={saveCertification}
                      >
                        {editingCertificationIndex === null ? "Add" : "Update"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {certifications.map((cert, index) => (
                      <div
                        key={`${cert.name}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="text-white">{cert.name}</p>
                          <p className="text-xs text-white/50">
                            {cert.issuer || "Issuer"}
                          </p>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <button
                            className="text-white/70"
                            onClick={() => {
                              setEditingCertificationIndex(index);
                              setCertificationDraft(cert);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-[#ffb0a8]"
                            onClick={() =>
                              setCertifications((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`${space.className} text-xl`}>Achievements</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      placeholder="Title"
                      value={achievementDraft.title}
                      onChange={(event) =>
                        setAchievementDraft((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                      type="date"
                      value={achievementDraft.date ?? ""}
                      onChange={(event) =>
                        setAchievementDraft((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }))
                      }
                    />
                    <textarea
                      className="min-h-20 rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm md:col-span-2"
                      placeholder="Description"
                      value={achievementDraft.description}
                      onChange={(event) =>
                        setAchievementDraft((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                    />
                    <div className="flex items-center gap-3 md:col-span-2">
                      <input
                        className="w-24 rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                        type="number"
                        placeholder="Order"
                        value={achievementDraft.order}
                        onChange={(event) =>
                          setAchievementDraft((prev) => ({
                            ...prev,
                            order: Number(event.target.value),
                          }))
                        }
                      />
                      <button
                        className="rounded-full bg-[#6de5c1] px-4 py-2 text-xs font-semibold text-[#0c1116]"
                        onClick={saveAchievement}
                      >
                        {editingAchievementIndex === null ? "Add" : "Update"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {achievements.map((ach, index) => (
                      <div
                        key={`${ach.title}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="text-white">{ach.title}</p>
                          <p className="text-xs text-white/50">
                            {ach.date || "Date"}
                          </p>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <button
                            className="text-white/70"
                            onClick={() => {
                              setEditingAchievementIndex(index);
                              setAchievementDraft(ach);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-[#ffb0a8]"
                            onClick={() =>
                              setAchievements((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3">
              <button
                className="rounded-full bg-[#6de5c1] px-6 py-2 text-sm font-semibold text-[#0c1116]"
                onClick={submitOnboarding}
              >
                Finish onboarding
              </button>
              {statusMessage ? (
                <p className="text-xs text-white/60">{statusMessage}</p>
              ) : null}
            </div>
            </section>
          </div>
          <Footer variant="minimal" />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default OnboardingPage;
