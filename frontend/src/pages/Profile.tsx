import { useEffect, useState } from "react";
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
} from "lucide-react";

import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
const API_URL = "http://localhost:5000";

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
  githubAccount: {
    username: string;
    profileUrl: string | null;
  } | null;
}

interface ProfileProps {
  onBack: () => void;
}

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

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
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

      setSuccess("Your developer profile has been updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#293847] bg-[#0b131d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-400";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-300";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d14] text-emerald-400">
        <Loader2 size={35} className="animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#080d14] px-5 text-white">
        <AlertCircle size={42} className="mb-4 text-red-400" />
        <h2 className="text-xl font-bold">Profile unavailable</h2>
        <p className="mt-2 text-sm text-gray-400">{error}</p>
        <button
          onClick={onBack}
          className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d14] px-5 py-8 text-[#e6edf3] sm:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-sm text-gray-400 transition hover:text-emerald-400"
            >
              <ArrowLeft size={17} />
              Back to Home
            </button>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Developer <span className="text-emerald-400">Profile</span>
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Customize your identity and showcase your developer journey.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-xs text-gray-400">Profile visibility</p>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
              {form.isPublic ? (
                <>
                  <Eye size={16} className="text-emerald-400" />
                  <span className="text-emerald-400">Public</span>
                </>
              ) : (
                <>
                  <EyeOff size={16} className="text-gray-400" />
                  <span className="text-gray-300">Private</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Preview */}
        <div className="mb-7 overflow-hidden rounded-2xl border border-[#293847] bg-[#101923]">
          <div className="h-28 bg-gradient-to-r from-emerald-900/60 via-[#143b31] to-[#102033]" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt="Profile"
                  className="h-24 w-24 rounded-2xl border-4 border-[#101923] bg-[#17212d] object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-[#101923] bg-[#1b2b35] text-3xl font-bold text-emerald-400">
                  {form.name.charAt(0).toUpperCase() || "D"}
                </div>
              )}

              {form.username && (
                <div className="pb-2 text-sm text-emerald-400">
                  @{form.username}
                </div>
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold">
              {form.name || "Your Name"}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {form.headline || "Your professional headline"}
            </p>

            {form.location && (
              <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={14} />
                {form.location}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-7">

          {/* Basic Information */}
          <section className="rounded-2xl border border-[#293847] bg-[#101923] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <User size={21} />
              </div>

              <div>
                <h2 className="font-bold">Basic Information</h2>
                <p className="text-xs text-gray-500">
                  Tell the world who you are.
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
                <input
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]{3,20}"
                  className={inputClass}
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="your_username"
                />
                <p className="mt-2 text-xs text-gray-500">
                  3-20 characters. Letters, numbers and underscores only.
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
                <label className={labelClass}>About / Bio</label>
                <textarea
                  rows={4}
                  maxLength={500}
                  className={inputClass}
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Tell something about yourself..."
                />
                <p className="mt-1 text-right text-xs text-gray-500">
                  {form.bio.length}/500
                </p>
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <input
                  maxLength={100}
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className={labelClass}>Profile Image URL</label>
                <input
                  type="url"
                  className={inputClass}
                  value={form.avatarUrl}
                  onChange={(e) => handleChange("avatarUrl", e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className="rounded-2xl border border-[#293847] bg-[#101923] p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <Globe size={21} />
              </div>

              <div>
                <h2 className="font-bold">Social & Professional Links</h2>
                <p className="text-xs text-gray-500">
                  Connect your online presence.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-2">
                    <Globe size={15} /> Personal Website
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
                    <FaGithub size={15} /> GitHub
                  </span>
                </label>
                <input
                  className={`${inputClass} opacity-70`}
                  value={
                    profile.githubAccount?.profileUrl ||
                    "GitHub account connected through login"
                  }
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your GitHub profile is automatically connected.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-2">
                    <FaLinkedin size={15} /> LinkedIn URL
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
                    <FaTwitter size={15} /> Twitter / X URL
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

          {/* Public Profile Settings */}
          <section className="rounded-2xl border border-[#293847] bg-[#101923] p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                <Eye size={21} />
              </div>

              <div>
                <h2 className="font-bold">Public Portfolio Settings</h2>
                <p className="text-xs text-gray-500">
                  Control who can see your developer profile.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[#293847] bg-[#0b131d] p-4">
              <div>
                <p className="font-semibold">
                  Make my profile public
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Allow recruiters and other developers to view your portfolio.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) =>
                  handleChange("isPublic", e.target.checked)
                }
                className="h-5 w-5 accent-emerald-500"
              />
            </label>

            {form.isPublic && form.username && (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-xs text-gray-400">
                  Your public profile URL
                </p>

                <p className="mt-2 break-all text-sm font-semibold text-emerald-400">
                  {window.location.origin}/u/{form.username}
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

          {/* Save */}
          <div className="flex flex-wrap items-center justify-between gap-4">
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3 font-bold text-[#06120c] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
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

        <p className="mt-8 text-center text-xs text-gray-600">
          DeveloperHub · Your work. Your growth. Your story.
        </p>
      </div>
    </main>
  );
}

export default Profile;
