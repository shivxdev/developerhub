
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Save,
  User,
  Globe,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Link2,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Code2,
  AtSign,
  Palette,
  Check,
} from "lucide-react";

import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const API_URL = "http://localhost:5000";

type PortfolioTheme = "emerald" | "midnight" | "purple" | "light";

interface ProfileData {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  username: string | null;
  headline: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  isPublic: boolean;
  portfolioTheme: PortfolioTheme;
  githubAccount: {
    username: string;
    profileUrl: string | null;
  } | null;
}

interface ProfileProps {
  onBack: () => void;
}

const themes: {
  id: PortfolioTheme;
  name: string;
  description: string;
  background: string;
  accent: string;
  accentText: string;
  border: string;
  preview: string;
}[] = [
  {
    id: "emerald",
    name: "Emerald",
    description: "Modern green developer aesthetic",
    background: "#080d14",
    accent: "#10b981",
    accentText: "#34d399",
    border: "#10b981",
    preview: "from-emerald-950 via-[#174536] to-[#102033]",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue futuristic experience",
    background: "#080c18",
    accent: "#3b82f6",
    accentText: "#60a5fa",
    border: "#3b82f6",
    preview: "from-blue-950 via-[#172c55] to-[#101a35]",
  },
  {
    id: "purple",
    name: "Purple Neon",
    description: "Bold purple neon atmosphere",
    background: "#10091a",
    accent: "#a855f7",
    accentText: "#c084fc",
    border: "#a855f7",
    preview: "from-purple-950 via-[#43205e] to-[#211035]",
  },
  {
    id: "light",
    name: "Light",
    description: "Clean and minimal professional look",
    background: "#f4f6fb",
    accent: "#2563eb",
    accentText: "#3b82f6",
    border: "#2563eb",
    preview: "from-slate-200 via-blue-100 to-white",
  },
];

function Profile({ onBack }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    headline: "",
    bio: "",
    location: "",
    avatarUrl: "",
    websiteUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    isPublic: false,
    portfolioTheme: "emerald" as PortfolioTheme,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load profile.");
        }

        const data: ProfileData = result.data;

        setProfile(data);

        setForm({
          name: data.name || "",
          username: data.username || "",
          headline: data.headline || "",
          bio: data.bio || "",
          location: data.location || "",
          avatarUrl: data.avatarUrl || "",
          websiteUrl: data.websiteUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          twitterUrl: data.twitterUrl || "",
          isPublic: data.isPublic,
          portfolioTheme: data.portfolioTheme || "emerald",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          username: form.username.trim().toLowerCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update profile.");
      }

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              ...result.data,
            }
          : previous
      );

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#293847] bg-[#0b131d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 hover:border-[#405365] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-300";

  const sectionClass =
    "rounded-2xl border border-[#293847] bg-[#101923] p-5 sm:p-7";

  const selectedTheme = themes.find(
    (theme) => theme.id === form.portfolioTheme
  ) || themes[0];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d14] text-emerald-400">
        <div className="text-center">
          <Loader2 size={36} className="mx-auto animate-spin" />
          <p className="mt-4 text-sm text-gray-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080d14] px-5 text-white">
        <AlertCircle size={42} className="mb-4 text-red-400" />
        <h2 className="text-xl font-bold">Profile unavailable</h2>
        <p className="mt-2 text-center text-sm text-gray-400">{error}</p>
        <button
          onClick={onBack}
          className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:bg-emerald-400"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const initials = form.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "D";

  const publicUrl = `${window.location.origin}/u/${form.username}`;

  return (
    <main className="min-h-screen bg-[#080d14] text-[#e6edf3]">

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#080d14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="rounded-lg border border-[#354454] p-2 text-gray-300 transition hover:border-emerald-400 hover:text-emerald-400"
              aria-label="Back"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex items-center gap-2 text-xl font-bold">
              <Code2 size={27} className="text-emerald-400" />
              Developer<span className="text-emerald-400">Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 sm:px-4 sm:text-sm">
            <User size={15} />
            Profile Editor
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1450px] px-5 py-9 lg:px-10">

        {/* Page Heading */}
        <div className="mb-9">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
            <Sparkles size={16} />
            YOUR DEVELOPER IDENTITY
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Build Your <span className="text-emerald-400">Profile.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
            Create your developer identity, showcase your skills and let
            the world discover what you build.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid items-start gap-7 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[370px_minmax(0,1fr)]">

          {/* LEFT SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-24">

            {/* Profile Preview Card */}
            <div className="overflow-hidden rounded-2xl border border-[#293847] bg-[#101923] shadow-xl shadow-black/10">

              <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${selectedTheme.preview}`}>
                <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full border border-white/10" />
                <div className="absolute -right-2 -top-10 h-36 w-36 rounded-full border border-white/10" />
                <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  <Sparkles size={13} />
                  PROFILE PREVIEW
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="-mt-0 flex items-end justify-between">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="Profile avatar"
                      className="h-24 w-24 rounded-2xl border-4 border-[#101923] bg-[#172331] object-cover shadow-lg"
                    />
                  ) : (
                    <div
                      className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-[#101923] bg-[#1b3440] text-3xl font-bold shadow-lg"
                      style={{ color: selectedTheme.accentText }}
                    >
                      {initials}
                    </div>
                  )}

                  <span
                    className={`mb-2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                      form.isPublic
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-gray-600/30 bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {form.isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
                    {form.isPublic ? "Public" : "Private"}
                  </span>
                </div>

                <h2 className="mt-5 break-words text-xl font-bold">
                  {form.name || "Your Name"}
                </h2>

                <p className="mt-1 break-words text-sm leading-6 text-gray-400">
                  {form.headline || "Your professional headline"}
                </p>

                {form.username && (
                  <p
                    className="mt-3 flex items-center gap-2 text-sm"
                    style={{ color: selectedTheme.accentText }}
                  >
                    <AtSign size={15} />
                    {form.username}
                  </p>
                )}

                {form.location && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={14} />
                    {form.location}
                  </p>
                )}

                {form.bio && (
                  <div className="mt-5 border-t border-[#293847] pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      About
                    </p>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-400">
                      {form.bio}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3 border-t border-[#293847] pt-4">
                  {profile.githubAccount?.profileUrl && (
                    <a
                      href={profile.githubAccount.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[#354454] p-2.5 text-gray-400 transition hover:border-emerald-500/40 hover:text-emerald-400"
                      aria-label="GitHub profile"
                    >
                      <FaGithub size={17} />
                    </a>
                  )}

                  {form.linkedinUrl && (
                    <a
                      href={form.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[#354454] p-2.5 text-gray-400 transition hover:border-emerald-500/40 hover:text-emerald-400"
                      aria-label="LinkedIn profile"
                    >
                      <FaLinkedin size={17} />
                    </a>
                  )}

                  {form.twitterUrl && (
                    <a
                      href={form.twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[#354454] p-2.5 text-gray-400 transition hover:border-emerald-500/40 hover:text-emerald-400"
                      aria-label="Twitter profile"
                    >
                      <FaTwitter size={17} />
                    </a>
                  )}

                  {form.websiteUrl && (
                    <a
                      href={form.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[#354454] p-2.5 text-gray-400 transition hover:border-emerald-500/40 hover:text-emerald-400"
                      aria-label="Personal website"
                    >
                      <Globe size={17} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Public URL Card */}
            <div className="rounded-2xl border border-[#293847] bg-[#101923] p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                  <Globe size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Public Portfolio</h3>
                  <p className="text-xs text-gray-500">Your personal URL</p>
                </div>
              </div>

              {form.username ? (
                <>
                  <p className="break-all rounded-lg border border-[#293847] bg-[#0b131d] p-3 text-xs leading-5 text-emerald-400">
                    {publicUrl}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <ShieldCheck size={14} />
                    {form.isPublic
                      ? "Your profile is set to public."
                      : "Enable public visibility to share your profile."}
                  </p>
                </>
              ) : (
                <p className="text-xs leading-5 text-gray-500">
                  Choose a username to create your personal portfolio URL.
                </p>
              )}
            </div>

            {/* Helpful Tip */}
            <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles size={17} />
                <h3 className="text-sm font-bold">Pro Tip</h3>
              </div>
              <p className="mt-3 text-xs leading-6 text-gray-400">
                A strong headline, professional photo and detailed bio
                help recruiters understand your developer journey.
              </p>
            </div>
          </aside>

          {/* RIGHT EDITOR */}
          <form onSubmit={handleSave} className="min-w-0 space-y-6">

            {/* Basic Information */}
            <section className={sectionClass}>
              <div className="mb-7 flex items-center gap-3">
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-3 text-emerald-400">
                  <User size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Basic Information</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    The essentials of your developer identity.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    required
                    maxLength={100}
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className={labelClass}>Username *</label>
                  <div className="relative">
                    <AtSign
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      required
                      minLength={3}
                      maxLength={20}
                      pattern="[a-zA-Z0-9_]{3,20}"
                      className={`${inputClass} pl-10`}
                      value={form.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      placeholder="your_username"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    3–20 characters. Letters, numbers and underscores.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Professional Headline</label>
                  <input
                    maxLength={150}
                    className={inputClass}
                    value={form.headline}
                    onChange={(e) => handleChange("headline", e.target.value)}
                    placeholder="Full Stack Developer | React | Node.js"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      About Me
                    </label>
                    <span className="text-xs text-gray-500">
                      {form.bio.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    maxLength={500}
                    className={`${inputClass} resize-none leading-6`}
                    value={form.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Write a short introduction about yourself, your interests and what you love building..."
                  />
                </div>

                <div>
                  <label className={labelClass}>Location</label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      maxLength={100}
                      className={`${inputClass} pl-10`}
                      value={form.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Profile Image URL</label>
                  <div className="relative">
                    <Globe
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="url"
                      className={`${inputClass} pl-10`}
                      value={form.avatarUrl}
                      onChange={(e) => handleChange("avatarUrl", e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className={sectionClass}>
              <div className="mb-7 flex items-center gap-3">
                <div className="rounded-xl border border-blue-500/15 bg-blue-500/10 p-3 text-blue-400">
                  <Link2 size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Social & Professional Links</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Connect your work and online presence.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <Globe size={15} />
                      Personal Website
                    </span>
                  </label>
                  <input
                    type="url"
                    className={inputClass}
                    value={form.websiteUrl}
                    onChange={(e) => handleChange("websiteUrl", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <FaGithub size={15} />
                      GitHub
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      className={`${inputClass} pr-12 opacity-70`}
                      value={
                        profile.githubAccount?.profileUrl ||
                        "GitHub account connected through login"
                      }
                      readOnly
                    />
                    {profile.githubAccount?.profileUrl && (
                      <a
                        href={profile.githubAccount.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-emerald-400"
                        aria-label="Open GitHub"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Automatically connected through your GitHub login.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <FaLinkedin size={15} />
                      LinkedIn URL
                    </span>
                  </label>
                  <input
                    type="url"
                    className={inputClass}
                    value={form.linkedinUrl}
                    onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="inline-flex items-center gap-2">
                      <FaTwitter size={15} />
                      Twitter / X URL
                    </span>
                  </label>
                  <input
                    type="url"
                    className={inputClass}
                    value={form.twitterUrl}
                    onChange={(e) => handleChange("twitterUrl", e.target.value)}
                    placeholder="https://x.com/username"
                  />
                </div>
              </div>
            </section>

            {/* Portfolio Theme Studio */}
            <section className={sectionClass}>
              <div className="mb-7 flex items-center gap-3">
                <div className="rounded-xl border border-purple-500/15 bg-purple-500/10 p-3 text-purple-400">
                  <Palette size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Portfolio Theme Studio</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose a visual identity for your public portfolio.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {themes.map((theme) => {
                  const isSelected = form.portfolioTheme === theme.id;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() =>
                        handleChange("portfolioTheme", theme.id)
                      }
                      className={`group overflow-hidden rounded-2xl border text-left transition duration-200 ${
                        isSelected
                          ? "border-emerald-400 ring-2 ring-emerald-400/20"
                          : "border-[#354454] hover:border-gray-500"
                      }`}
                    >
                      {/* Theme Preview */}
                      <div
                        className={`relative h-32 overflow-hidden bg-gradient-to-br ${theme.preview}`}
                      >
                        <div className="absolute inset-0 p-4">
                          <div className="flex items-center justify-between">
                            <div className="h-2 w-16 rounded-full bg-white/50" />
                            <div className="h-5 w-5 rounded-full border border-white/40" />
                          </div>

                          <div className="mt-5 flex items-center gap-3">
                            <div
                              className="h-11 w-11 rounded-xl border border-white/30"
                              style={{
                                backgroundColor: `${theme.accent}55`,
                              }}
                            />
                            <div className="space-y-2">
                              <div className="h-2 w-20 rounded-full bg-white/80" />
                              <div className="h-1.5 w-28 rounded-full bg-white/40" />
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <div
                              className="h-1.5 w-12 rounded-full"
                              style={{ backgroundColor: theme.accent }}
                            />
                            <div className="h-1.5 w-10 rounded-full bg-white/30" />
                            <div className="h-1.5 w-14 rounded-full bg-white/30" />
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow-lg">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Theme Information */}
                      <div className="flex items-center justify-between gap-3 bg-[#0b131d] p-4">
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {theme.name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {theme.description}
                          </p>
                        </div>

                        <div
                          className="h-5 w-5 shrink-0 rounded-full border-2 border-white/20"
                          style={{ backgroundColor: theme.accent }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Theme Information */}
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#354454] bg-[#0b131d] p-4">
                <div
                  className="h-10 w-10 shrink-0 rounded-xl"
                  style={{
                    backgroundColor: selectedTheme.accent,
                    boxShadow: `0 0 20px ${selectedTheme.accent}55`,
                  }}
                />

                <div>
                  <p className="text-sm font-semibold text-white">
                    {selectedTheme.name} Theme Selected
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Your public portfolio will use this theme after saving.
                  </p>
                </div>
              </div>
            </section>

            {/* Visibility Settings */}
            <section className={sectionClass}>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl border border-purple-500/15 bg-purple-500/10 p-3 text-purple-400">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Portfolio Visibility</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose who can discover your developer profile.
                  </p>
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#354454] bg-[#0b131d] p-4 transition hover:border-emerald-500/40 sm:p-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-lg p-2 ${
                      form.isPublic
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {form.isPublic ? <Eye size={19} /> : <EyeOff size={19} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Make my profile public
                    </p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-gray-500">
                      Allow recruiters and other developers to view your
                      developer portfolio.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => handleChange("isPublic", e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-emerald-500"
                />
              </label>

              {form.isPublic && form.username && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                  <p className="text-xs font-semibold text-emerald-400">
                    YOUR PUBLIC PROFILE URL
                  </p>
                  <p className="mt-2 break-all text-sm text-gray-300">
                    {publicUrl}
                  </p>
                </div>
              )}
            </section>

            {/* Feedback */}
            {success && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                <CheckCircle2 size={19} />
                {success}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                <AlertCircle size={19} />
                {error}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[#293847] bg-[#101923] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-[#354454] px-6 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3 text-sm font-bold text-[#06120c] shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        <p className="mt-10 text-center text-xs text-gray-600">
          DeveloperHub · Your work. Your growth. Your story.
        </p>
      </div>
    </main>
  );
}

export default Profile;
