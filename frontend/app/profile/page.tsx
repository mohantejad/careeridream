"use client";

import { useEffect, useMemo, useState } from "react";

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

type UserProfile = {
  id: number;
  headline: string;
  summary: string;
  location: string;
  phone: string;
  profile_completeness: number;
  resume_file: string | null;
  updated_at: string;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  achievements: Achievement[];
};

type Skill = {
  id: number;
  name: string;
  proficiency: string;
  order: number;
};

type Experience = {
  id: number;
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
  id: number;
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
  order: number;
};

type Certification = {
  id: number;
  name: string;
  issuer: string;
  issue_date: string | null;
  expiration_date: string | null;
  credential_url: string;
  order: number;
};

type Achievement = {
  id: number;
  title: string;
  description: string;
  date: string | null;
  order: number;
};

const emptySkill: Skill = {
  id: 0,
  name: "",
  proficiency: "",
  order: 0,
};

const emptyExperience: Experience = {
  id: 0,
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
  id: 0,
  school: "",
  degree: "",
  field_of_study: "",
  start_date: null,
  end_date: null,
  description: "",
  order: 0,
};

const emptyCertification: Certification = {
  id: 0,
  name: "",
  issuer: "",
  issue_date: null,
  expiration_date: null,
  credential_url: "",
  order: 0,
};

const emptyAchievement: Achievement = {
  id: 0,
  title: "",
  description: "",
  date: null,
  order: 0,
};

const ProfilePage = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    headline: "",
    summary: "",
    location: "",
    phone: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [skillDraft, setSkillDraft] = useState<Skill>(emptySkill);
  const [showSkillForm, setShowSkillForm] = useState(false);

  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(
    null
  );
  const [experienceDraft, setExperienceDraft] =
    useState<Experience>(emptyExperience);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  const [editingEducationId, setEditingEducationId] = useState<number | null>(
    null
  );
  const [educationDraft, setEducationDraft] =
    useState<Education>(emptyEducation);
  const [showEducationForm, setShowEducationForm] = useState(false);

  const [editingCertificationId, setEditingCertificationId] = useState<
    number | null
  >(null);
  const [certificationDraft, setCertificationDraft] =
    useState<Certification>(emptyCertification);
  const [showCertificationForm, setShowCertificationForm] = useState(false);

  const [editingAchievementId, setEditingAchievementId] = useState<
    number | null
  >(null);
  const [achievementDraft, setAchievementDraft] =
    useState<Achievement>(emptyAchievement);
  const [showAchievementForm, setShowAchievementForm] = useState(false);

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

  const resumeUrl = useMemo(() => {
    if (!profile?.resume_file) return null;
    const baseUrl = profile.resume_file.startsWith("http")
      ? profile.resume_file
      : `${getApiBaseUrl()}${profile.resume_file}`;
    const cacheBuster = profile.updated_at
      ? `?v=${encodeURIComponent(profile.updated_at)}`
      : "";
    return `${baseUrl}${cacheBuster}`;
  }, [profile]);

  const loadProfile = async () => {
    const [userRes, profileRes] = await Promise.all([
      apiFetch("/auth/users/me/"),
      apiFetch("/profiles/profile/me/"),
    ]);

    if (userRes.ok) {
      const userData = (await userRes.json()) as CurrentUser;
      setUser(userData);
    }

    if (profileRes.ok) {
      const profileData = (await profileRes.json()) as UserProfile;
      setProfile(profileData);
      setProfileDraft({
        headline: profileData.headline ?? "",
        summary: profileData.summary ?? "",
        location: profileData.location ?? "",
        phone: profileData.phone ?? "",
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setIsLoading(true);
      try {
        await loadProfile();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateProfile = async () => {
    if (!profile) return;
    const response = await apiFetch("/profiles/profile/update_me/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileDraft),
    });

    if (response.ok) {
      setStatusMessage("Profile updated.");
      await loadProfile();
      setIsProfileEditing(false);
    } else {
      setStatusMessage("Unable to update profile.");
    }
  };

  const updateResume = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append("resume_file", resumeFile);
    const response = await apiFetch("/profiles/profile/update_me/", {
      method: "PATCH",
      body: formData,
    });

    if (response.ok) {
      setStatusMessage("Resume updated.");
      setResumeFile(null);
      await loadProfile();
    } else {
      setStatusMessage("Unable to upload resume.");
    }
  };

  const saveSkill = async () => {
    const payload = {
      name: skillDraft.name,
      proficiency: skillDraft.proficiency,
      order: Number(skillDraft.order) || 0,
    };
    const url =
      editingSkillId && editingSkillId > 0
        ? `/profiles/skills/${editingSkillId}/`
        : "/profiles/skills/";
    const method = editingSkillId ? "PATCH" : "POST";
    const response = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await loadProfile();
      setSkillDraft(emptySkill);
      setEditingSkillId(null);
      setShowSkillForm(false);
    }
  };

  const deleteSkill = async (id: number) => {
    await apiFetch(`/profiles/skills/${id}/`, {
      method: "DELETE",
    });
    await loadProfile();
  };

  const saveExperience = async () => {
    const payload = {
      company: experienceDraft.company,
      title: experienceDraft.title,
      location: experienceDraft.location,
      start_date: experienceDraft.start_date,
      end_date: experienceDraft.is_current ? null : experienceDraft.end_date,
      is_current: experienceDraft.is_current,
      description: experienceDraft.description,
      order: Number(experienceDraft.order) || 0,
    };
    const url =
      editingExperienceId && editingExperienceId > 0
        ? `/profiles/experiences/${editingExperienceId}/`
        : "/profiles/experiences/";
    const method = editingExperienceId ? "PATCH" : "POST";
    const response = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await loadProfile();
      setExperienceDraft(emptyExperience);
      setEditingExperienceId(null);
      setShowExperienceForm(false);
    }
  };

  const deleteExperience = async (id: number) => {
    await apiFetch(`/profiles/experiences/${id}/`, {
      method: "DELETE",
    });
    await loadProfile();
  };

  const saveEducation = async () => {
    const payload = {
      school: educationDraft.school,
      degree: educationDraft.degree,
      field_of_study: educationDraft.field_of_study,
      start_date: educationDraft.start_date,
      end_date: educationDraft.end_date,
      description: educationDraft.description,
      order: Number(educationDraft.order) || 0,
    };
    const url =
      editingEducationId && editingEducationId > 0
        ? `/profiles/educations/${editingEducationId}/`
        : "/profiles/educations/";
    const method = editingEducationId ? "PATCH" : "POST";
    const response = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await loadProfile();
      setEducationDraft(emptyEducation);
      setEditingEducationId(null);
      setShowEducationForm(false);
    }
  };

  const deleteEducation = async (id: number) => {
    await apiFetch(`/profiles/educations/${id}/`, {
      method: "DELETE",
    });
    await loadProfile();
  };

  const saveCertification = async () => {
    const payload = {
      name: certificationDraft.name,
      issuer: certificationDraft.issuer,
      issue_date: certificationDraft.issue_date,
      expiration_date: certificationDraft.expiration_date,
      credential_url: certificationDraft.credential_url,
      order: Number(certificationDraft.order) || 0,
    };
    const url =
      editingCertificationId && editingCertificationId > 0
        ? `/profiles/certifications/${editingCertificationId}/`
        : "/profiles/certifications/";
    const method = editingCertificationId ? "PATCH" : "POST";
    const response = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await loadProfile();
      setCertificationDraft(emptyCertification);
      setEditingCertificationId(null);
      setShowCertificationForm(false);
    }
  };

  const deleteCertification = async (id: number) => {
    await apiFetch(`/profiles/certifications/${id}/`, {
      method: "DELETE",
    });
    await loadProfile();
  };

  const saveAchievement = async () => {
    const payload = {
      title: achievementDraft.title,
      description: achievementDraft.description,
      date: achievementDraft.date,
      order: Number(achievementDraft.order) || 0,
    };
    const url =
      editingAchievementId && editingAchievementId > 0
        ? `/profiles/achievements/${editingAchievementId}/`
        : "/profiles/achievements/";
    const method = editingAchievementId ? "PATCH" : "POST";
    const response = await apiFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await loadProfile();
      setAchievementDraft(emptyAchievement);
      setEditingAchievementId(null);
      setShowAchievementForm(false);
    }
  };

  const deleteAchievement = async (id: number) => {
    await apiFetch(`/profiles/achievements/${id}/`, {
      method: "DELETE",
    });
    await loadProfile();
  };

  if (isLoading || !profile) {
    return (
      <div className={`${sora.className} min-h-screen bg-[#212223] text-white`}>
        <main className="relative overflow-hidden">
          <div className="hero-grid absolute inset-0" />
          <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Loading
            </p>
            <h1 className={`${space.className} mt-3 text-3xl`}>
              Preparing your profile...
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
          <section className="mt-12 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`${space.className} text-3xl`}>
                    {profile.headline || "Your profile"}
                  </h1>
                  <p className="text-sm text-white/60">{user?.email}</p>
                </div>
                <button
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
                  onClick={() => setIsProfileEditing((prev) => !prev)}
                >
                  {isProfileEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              {isProfileEditing ? (
                <div className="mt-6 space-y-4">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm"
                    placeholder="Headline"
                    value={profileDraft.headline}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        headline: event.target.value,
                      }))
                    }
                  />
                  <textarea
                    className="min-h-30 w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm"
                    placeholder="Summary"
                    value={profileDraft.summary}
                    onChange={(event) =>
                      setProfileDraft((prev) => ({
                        ...prev,
                        summary: event.target.value,
                      }))
                    }
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm"
                      placeholder="Location"
                      value={profileDraft.location}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({
                          ...prev,
                          location: event.target.value,
                        }))
                      }
                    />
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-3 text-sm"
                      placeholder="Phone"
                      value={profileDraft.phone}
                      onChange={(event) =>
                        setProfileDraft((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <button
                    className="rounded-full bg-[#6de5c1] px-5 py-2 text-sm font-semibold text-[#0c1116]"
                    onClick={updateProfile}
                  >
                    Save profile
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-4 text-sm text-white/70">
                  <p>{profile.summary || "Add a summary about yourself."}</p>
                  <div className="flex flex-col gap-2 text-xs text-white/50">
                    <span>{profile.phone || "Phone not set"}</span>
                    <span>{profile.location || "Location not set"}</span>
                    {/* <span>{profile.updated_at ? "Updated recently" : ""}</span> */}
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0f1720]/85 p-6 text-sm text-white/70">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Profile status
              </p>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span>Completeness</span>
                <span className="text-[#6de5c1]">
                  {profile.profile_completeness}%
                </span>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-xs text-white/50">Resume</p>
                {resumeUrl ? (
                  <a
                    className="text-xs text-[#6de5c1] hover:text-[#a8f0d8]"
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View current resume
                  </a>
                ) : (
                  <p className="text-xs text-white/50">No resume uploaded.</p>
                )}
                <input
                  className="mt-2 w-full text-xs text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:text-white/80"
                  type="file"
                  onChange={(event) =>
                    setResumeFile(event.target.files?.[0] ?? null)
                  }
                />
                <button
                  className="mt-3 rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
                  onClick={updateResume}
                  disabled={!resumeFile}
                >
                  Replace resume
                </button>
              </div>
              {statusMessage ? (
                <p className="mt-4 text-xs text-white/60">{statusMessage}</p>
              ) : null}
            </div>
          </section>

          <section className="mt-12 space-y-10">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className={`${space.className} text-2xl`}>Skills</h2>
                <button
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
                  onClick={() => {
                    const next = !showSkillForm;
                    setShowSkillForm(next);
                    if (next) {
                      setEditingSkillId(null);
                      setSkillDraft(emptySkill);
                    }
                  }}
                >
                  {showSkillForm ? "Close" : "Add skill"}
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {profile.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="text-white">{skill.name}</p>
                      <p className="text-xs text-white/50">
                        {skill.proficiency || "Unspecified"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-xs text-white/70"
                        onClick={() => {
                          setEditingSkillId(skill.id);
                          setSkillDraft(skill);
                          setShowSkillForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs text-[#ffb0a8]"
                        onClick={() => deleteSkill(skill.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showSkillForm ? (
                <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                <input
                  className="rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm"
                  placeholder="Skill name"
                  value={skillDraft.name}
                  onChange={(event) =>
                    setSkillDraft((prev) => ({ ...prev, name: event.target.value }))
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
                    {editingSkillId ? "Update" : "Save"}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className={`${space.className} text-2xl`}>Experience</h2>
                <button
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
                  onClick={() => {
                    const next = !showExperienceForm;
                    setShowExperienceForm(next);
                    if (next) {
                      setEditingExperienceId(null);
                      setExperienceDraft(emptyExperience);
                    }
                  }}
                >
                  {showExperienceForm ? "Close" : "Add experience"}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {profile.experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-start justify-between">
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
                          setEditingExperienceId(exp.id);
                          setExperienceDraft(exp);
                          setShowExperienceForm(true);
                        }}
                      >
                        Edit
                      </button>
                        <button
                          className="text-[#ffb0a8]"
                          onClick={() => deleteExperience(exp.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                      {exp.description || "No description provided."}
                    </p>
                  </div>
                ))}
              </div>
              {showExperienceForm ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
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
                  className="min-h-[90px] rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm md:col-span-2"
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
                    {editingExperienceId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className={`${space.className} text-2xl`}>Education</h2>
                <button
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
                  onClick={() => {
                    const next = !showEducationForm;
                    setShowEducationForm(next);
                    if (next) {
                      setEditingEducationId(null);
                      setEducationDraft(emptyEducation);
                    }
                  }}
                >
                  {showEducationForm ? "Close" : "Add education"}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {profile.educations.map((edu) => (
                  <div
                    key={edu.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="text-white">{edu.school}</p>
                      <p className="text-xs text-white/50">
                        {edu.degree || "Degree"} · {edu.field_of_study || "Field"}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button
                        className="text-white/70"
                        onClick={() => {
                          setEditingEducationId(edu.id);
                          setEducationDraft(edu);
                          setShowEducationForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-[#ffb0a8]"
                        onClick={() => deleteEducation(edu.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showEducationForm ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
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
                  className="min-h-[80px] rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm md:col-span-2"
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
                    {editingEducationId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className={`${space.className} text-2xl`}>Certifications</h2>
                <button
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
                  onClick={() => {
                    const next = !showCertificationForm;
                    setShowCertificationForm(next);
                    if (next) {
                      setEditingCertificationId(null);
                      setCertificationDraft(emptyCertification);
                    }
                  }}
                >
                  {showCertificationForm ? "Close" : "Add certification"}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {profile.certifications.map((cert) => (
                  <div
                    key={cert.id}
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
                          setEditingCertificationId(cert.id);
                          setCertificationDraft(cert);
                          setShowCertificationForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-[#ffb0a8]"
                        onClick={() => deleteCertification(cert.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showCertificationForm ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
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
                    {editingCertificationId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className={`${space.className} text-2xl`}>Achievements</h2>
                <button
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/80"
                  onClick={() => {
                    const next = !showAchievementForm;
                    setShowAchievementForm(next);
                    if (next) {
                      setEditingAchievementId(null);
                      setAchievementDraft(emptyAchievement);
                    }
                  }}
                >
                  {showAchievementForm ? "Close" : "Add achievement"}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {profile.achievements.map((ach) => (
                  <div
                    key={ach.id}
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
                          setEditingAchievementId(ach.id);
                          setAchievementDraft(ach);
                          setShowAchievementForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-[#ffb0a8]"
                        onClick={() => deleteAchievement(ach.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showAchievementForm ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
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
                  className="min-h-[80px] rounded-2xl border border-white/10 bg-[#0c1218] px-4 py-2 text-sm md:col-span-2"
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
                    {editingAchievementId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
              ) : null}
            </div>
          </section>
        </div>
          <Footer />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
