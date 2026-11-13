
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Code2,
  FolderGit2,
  Globe,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
  Zap,
  Terminal,
  Layers3,
  ChevronRight,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type PortfolioTheme = "emerald" | "midnight" | "purple" | "light";

interface PublicProfileData {
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  username: string;
  headline: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  portfolioTheme?: PortfolioTheme;
  createdAt: string;
  githubAccount: {
    username: string;
    profileUrl: string | null;
  } | null;
  projects: {
    id: string;
    title: string;
    description: string | null;
    techStack: string[] | string | null;
    githubUrl: string | null;
    liveUrl: string | null;
    isFeatured: boolean;
  }[];
  skills: {
    level: string;
    progress: number;
    status: string;
    skill: {
      name: string;
      category: string | null;
    };
  }[];
}

interface PublicPortfolioProps {
  username: string;
  onBack: () => void;
}

const themeConfig: Record<PortfolioTheme, {
  label: string;
  accent: string;
  accentStrong: string;
  soft: string;
  glow: string;
  background: string;
  card: string;
  text: string;
  muted: string;
}> = {
  emerald: {
    label: "Emerald",
    accent: "#34d399",
    accentStrong: "#10b981",
    soft: "rgba(52,211,153,.12)",
    glow: "rgba(16,185,129,.18)",
    background: "#070b12",
    card: "#101923",
    text: "#ffffff",
    muted: "#9ca3af",
  },
  midnight: {
    label: "Midnight",
    accent: "#60a5fa",
    accentStrong: "#3b82f6",
    soft: "rgba(96,165,250,.12)",
    glow: "rgba(59,130,246,.2)",
    background: "#080d19",
    card: "#111c30",
    text: "#f8fafc",
    muted: "#a1acc0",
  },
  purple: {
    label: "Purple Neon",
    accent: "#c084fc",
    accentStrong: "#a855f7",
    soft: "rgba(192,132,252,.12)",
    glow: "rgba(168,85,247,.2)",
    background: "#10091b",
    card: "#1b1229",
    text: "#ffffff",
    muted: "#b5a6c7",
  },
  light: {
    label: "Light",
    accent: "#059669",
    accentStrong: "#047857",
    soft: "rgba(5,150,105,.1)",
    glow: "rgba(5,150,105,.12)",
    background: "#f4f7fb",
    card: "#ffffff",
    text: "#172033",
    muted: "#64748b",
  },
};

function getTechStack(value: string[] | string | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fall back to comma-separated values.
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function safeUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol)
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

function formatDate(date: string): string {
  if (!date) return "DeveloperHub member";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function PublicPortfolio({
  username,
  onBack,
}: PublicPortfolioProps) {
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/profile/${encodeURIComponent(username)}`,
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "This profile is unavailable.",
          );
        }

        if (active) setData(result.data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong.",
          );
          setData(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
            <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
          </div>
          <h2 className="text-xl font-bold">Building your experience</h2>
          <p className="text-gray-500 text-sm mt-2">
            Loading @{username}'s portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center px-6 text-white">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Code2 size={34} className="text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">
            Developer not found
          </h1>
          <p className="text-gray-400 text-sm mb-7">
            {error || "This profile is private or does not exist."}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-emerald-400 text-[#06110e] font-bold hover:bg-emerald-300 transition"
          >
            <ArrowLeft size={16} className="inline mr-2" />
            Back to DeveloperHub
          </button>
        </div>
      </div>
    );
  }

  const profile = data;
  const projects = data.projects || [];
  const skills = data.skills || [];

  const selectedTheme: PortfolioTheme =
    profile.portfolioTheme &&
    Object.prototype.hasOwnProperty.call(themeConfig, profile.portfolioTheme)
      ? profile.portfolioTheme
      : "emerald";

  const theme = themeConfig[selectedTheme];

  const featuredProjects = projects.filter((p) => p.isFeatured);
  const otherProjects = projects.filter((p) => !p.isFeatured);

  const completedSkills = skills.filter(
    (s) => s.status === "COMPLETED",
  ).length;

  const skillGroups = skills.reduce<Record<string, typeof skills>>(
    (groups, item) => {
      const category = item.skill.category || "Other Skills";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
      return groups;
    },
    {},
  );

  const socialLinks = [
    {
      label: "GitHub",
      url: safeUrl(profile.githubAccount?.profileUrl ?? null),
      icon: <FaGithub size={19} />,
    },
    {
      label: "LinkedIn",
      url: safeUrl(profile.linkedinUrl),
      icon: <FaLinkedin size={19} />,
    },
    {
      label: "Twitter",
      url: safeUrl(profile.twitterUrl),
      icon: <FaTwitter size={19} />,
    },
    {
      label: "Website",
      url: safeUrl(profile.websiteUrl),
      icon: <Globe size={19} />,
    },
  ].filter((link) => link.url);

  const renderProject = (
    project: PublicProfileData["projects"][number],
    index: number,
  ) => {
    const stack = getTechStack(project.techStack);

    return (
      <article
        key={project.id}
        className="group relative overflow-hidden rounded-3xl bg-[#101923] border border-white/[0.07] hover:border-emerald-400/30 transition-all duration-500 hover:-translate-y-2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-blue-500/[0.04] opacity-0 group-hover:opacity-100 transition duration-500" />

        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/[0.06] blur-3xl rounded-full group-hover:bg-emerald-400/[0.12] transition" />

        <div className="relative p-7">
          <div className="flex justify-between items-start mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/5 border border-emerald-400/20 flex items-center justify-center">
              <FolderGit2 className="text-emerald-300" size={25} />
            </div>

            <span className="text-xs font-mono text-gray-600">
              PROJECT_{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {project.isFeatured && (
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full mb-4">
              <Star size={12} />
              Featured Project
            </div>
          )}

          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition">
            {project.title}
          </h3>

          <p className="text-sm text-gray-400 leading-7 min-h-[70px]">
            {project.description || "An exciting project built with passion."}
          </p>

          <div className="flex flex-wrap gap-2 mt-6 mb-7">
            {stack.map((tech, i) => (
              <span
                key={`${tech}-${i}`}
                className="text-xs font-medium text-emerald-200/90 bg-emerald-400/[0.07] border border-emerald-400/10 px-3 py-2 rounded-lg"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 pt-5 border-t border-white/[0.07]">
            {safeUrl(project.githubUrl) && (
              <a
                href={safeUrl(project.githubUrl)!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-emerald-300 transition"
              >
                <FaGithub size={17} />
                Code
                <ArrowUpRight size={14} />
              </a>
            )}

            {safeUrl(project.liveUrl) && (
              <a
                href={safeUrl(project.liveUrl)!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-emerald-300 transition"
              >
                <Globe size={16} />
                Live Preview
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div
      data-theme={selectedTheme}
      className="portfolio-root min-h-screen overflow-hidden"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        ["--accent" as string]: theme.accent,
        ["--accent-strong" as string]: theme.accentStrong,
        ["--accent-soft" as string]: theme.soft,
        ["--theme-glow" as string]: theme.glow,
        ["--page-bg" as string]: theme.background,
        ["--card-bg" as string]: theme.card,
        ["--main-text" as string]: theme.text,
        ["--muted-text" as string]: theme.muted,
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .portfolio-root {
          color: var(--main-text);
          transition: background-color .35s ease, color .35s ease;
        }

        .portfolio-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 45px 45px;
        }

        .float-animation { animation: float 6s ease-in-out infinite; }
        .reveal-animation { animation: reveal .7s ease-out both; }

        .glass-card {
          background: color-mix(in srgb, var(--card-bg) 82%, transparent);
          backdrop-filter: blur(18px);
          border: 1px solid color-mix(in srgb, var(--main-text) 9%, transparent);
        }

        .section-label {
          color: var(--accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        /* Dynamic accent colors */
        .portfolio-root [class*="text-emerald-"] {
          color: var(--accent) !important;
        }

        .portfolio-root [class*="border-emerald-"] {
          border-color: color-mix(in srgb, var(--accent) 35%, transparent) !important;
        }

        .portfolio-root [class*="bg-emerald-"] {
          background-color: var(--accent-soft) !important;
        }

        .portfolio-root [class*="from-emerald-"] {
          --tw-gradient-from: var(--accent) var(--tw-gradient-from-position) !important;
          --tw-gradient-to: transparent var(--tw-gradient-to-position) !important;
        }

        .portfolio-root [class*="via-teal-"] {
          --tw-gradient-via: var(--accent) var(--tw-gradient-via-position) !important;
        }

        .portfolio-root [class*="to-cyan-"] {
          --tw-gradient-to: var(--accent) var(--tw-gradient-to-position) !important;
        }

        .portfolio-root [class*="hover\\:text-emerald-"]:hover {
          color: var(--accent) !important;
        }

        .portfolio-root [class*="hover\\:border-emerald-"]:hover {
          border-color: var(--accent) !important;
        }

        .portfolio-root [class*="hover\\:bg-emerald-"]:hover {
          background-color: var(--accent) !important;
        }

        /* Theme-specific backgrounds */
        .portfolio-root nav {
          background-color: color-mix(in srgb, var(--page-bg) 88%, transparent);
          border-color: color-mix(in srgb, var(--main-text) 9%, transparent);
        }

        .portfolio-root article {
          background-color: var(--card-bg);
        }

        .portfolio-root .glass-card {
          background-color: color-mix(in srgb, var(--card-bg) 88%, transparent);
        }

        /* Midnight */
        .portfolio-root[data-theme="midnight"] .portfolio-grid {
          background-image:
            linear-gradient(rgba(96,165,250,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96,165,250,.035) 1px, transparent 1px);
        }

        /* Purple Neon */
        .portfolio-root[data-theme="purple"] .portfolio-grid {
          background-image:
            linear-gradient(rgba(192,132,252,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,132,252,.04) 1px, transparent 1px);
        }

        /* Light theme readability */
        .portfolio-root[data-theme="light"] {
          color: #172033;
        }

        .portfolio-root[data-theme="light"] [class*="text-white"] {
          color: #172033 !important;
        }

        .portfolio-root[data-theme="light"] [class*="text-gray-"] {
          color: #64748b !important;
        }

        .portfolio-root[data-theme="light"] [class*="bg-white/"] {
          background-color: rgba(15,23,42,.045) !important;
        }

        .portfolio-root[data-theme="light"] [class*="border-white/"] {
          border-color: rgba(15,23,42,.1) !important;
        }

        .portfolio-root[data-theme="light"] [class*="bg-[#070b12]"],
        .portfolio-root[data-theme="light"] [class*="bg-[#111c29]"],
        .portfolio-root[data-theme="light"] [class*="bg-[#14202d]"] {
          background-color: #ffffff !important;
        }

        .portfolio-root[data-theme="light"] .portfolio-grid {
          background-image:
            linear-gradient(rgba(15,23,42,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,.035) 1px, transparent 1px);
        }

        .portfolio-root[data-theme="light"] .glass-card {
          background: rgba(255,255,255,.88);
          border-color: #e2e8f0;
          box-shadow: 0 12px 35px rgba(15,23,42,.045);
        }

        .portfolio-root[data-theme="light"] article {
          background: #ffffff;
          border-color: #e2e8f0;
          box-shadow: 0 12px 35px rgba(15,23,42,.04);
        }

        .portfolio-root[data-theme="light"] nav {
          background: rgba(255,255,255,.9);
          border-color: #e2e8f0;
        }

        .portfolio-root[data-theme="light"] .portfolio-grid {
          opacity: .7;
        }

        .portfolio-root[data-theme="light"] .section-label {
          color: var(--accent);
        }

        .portfolio-root[data-theme="light"] [class*="from-[#102b27]"] {
          --tw-gradient-from: #e5f5ef var(--tw-gradient-from-position) !important;
          --tw-gradient-to: #e5f5ef var(--tw-gradient-to-position) !important;
        }

        .portfolio-root[data-theme="light"] [class*="via-[#10231f]"] {
          --tw-gradient-via: #f0faf6 var(--tw-gradient-via-position) !important;
        }

        .portfolio-root[data-theme="light"] [class*="to-[#0d1720]"] {
          --tw-gradient-to: #eaf2f8 var(--tw-gradient-to-position) !important;
        }

        .portfolio-root[data-theme="light"] [class*="hover\\:text-white"]:hover {
          color: #172033 !important;
        }

        .portfolio-root[data-theme="light"] [class*="text-[#06110e]"] {
          color: #ffffff !important;
        }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-64 -left-48 w-[600px] h-[600px] rounded-full blur-[130px]"
          style={{ backgroundColor: "var(--theme-glow)" }}
        />
        <div
          className="absolute top-[45%] -right-64 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ backgroundColor: "var(--theme-glow)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[500px] h-[400px] rounded-full blur-[120px]"
          style={{ backgroundColor: "var(--accent-soft)" }}
        />
        <div className="absolute inset-0 portfolio-grid opacity-60" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[76px] flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentStrong})`,
              }}
            >
              <Code2 size={21} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">
              Developer<span style={{ color: theme.accent }}>Hub</span>
            </span>
          </div>

          <div
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-full"
            style={{
              color: theme.accent,
              border: `1px solid ${theme.accent}40`,
              backgroundColor: theme.soft,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme.accent }}
            />
            <span className="hidden sm:inline">Public Portfolio</span>
            <span className="sm:hidden">Live</span>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-5 sm:px-8">
        {/* Hero */}
        <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div
            className="absolute top-20 right-10 w-72 h-72 blur-[100px] rounded-full pointer-events-none"
            style={{ backgroundColor: theme.soft }}
          />

          <div className="relative grid lg:grid-cols-[1.4fr_.6fr] gap-12 items-center">
            <div className="reveal-animation">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold mb-8"
                style={{
                  borderColor: `${theme.accent}40`,
                  backgroundColor: theme.soft,
                  color: theme.accent,
                }}
              >
                <Sparkles size={14} />
                DEVELOPER PORTFOLIO
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.accent }} />
                OPEN TO OPPORTUNITIES
              </div>

              <p className="text-gray-500 font-mono text-sm mb-3">
                Hello, I'm
              </p>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] break-words">
                {profile.name.split(" ").map((part, index) => (
                  <span
                    key={`${part}-${index}`}
                    className="block"
                    style={{
                      color: index === profile.name.split(" ").length - 1
                        ? theme.accent
                        : "var(--main-text)",
                    }}
                  >
                    {part}
                  </span>
                ))}
              </h1>

              <div className="flex items-center gap-3 mt-6">
                <span className="w-10 h-[2px]" style={{ backgroundColor: theme.accent }} />
                <span className="font-mono text-sm" style={{ color: theme.accent }}>
                  @{profile.username}
                </span>
              </div>

              <p className="text-gray-300 text-lg sm:text-xl leading-8 max-w-2xl mt-7">
                {profile.headline ||
                  "Building digital experiences, exploring technologies and turning ideas into reality."}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-8 text-sm text-gray-500">
                {profile.location && (
                  <span className="flex items-center gap-2">
                    <MapPin size={16} style={{ color: theme.accent }} />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} style={{ color: theme.accent }} />
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-9">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url!}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-gray-300 hover:-translate-y-1 transition-all"
                    style={{ ["--hover-accent" as string]: theme.accent }}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>

              <a
                href="#projects"
                className="inline-flex items-center gap-3 mt-10 px-6 py-4 rounded-xl font-bold text-sm transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: theme.accent,
                  color: selectedTheme === "light" ? "#ffffff" : "#07110d",
                }}
              >
                Explore My Work
                <ArrowDown size={17} />
              </a>
            </div>

            {/* Profile visual */}
            <div className="relative flex justify-center lg:justify-end reveal-animation">
              <div className="relative w-[280px] h-[320px] sm:w-[350px] sm:h-[390px] float-animation">
                <div
                  className="absolute inset-0 rounded-[42px] border rotate-6"
                  style={{
                    borderColor: `${theme.accent}50`,
                    backgroundColor: theme.soft,
                  }}
                />

                <div
                  className="absolute inset-0 rounded-[42px] border -rotate-3 backdrop-blur-xl overflow-hidden"
                  style={{
                    borderColor: "var(--muted-text)",
                    backgroundColor: theme.card,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-32"
                    style={{
                      background: `linear-gradient(to bottom, ${theme.soft}, transparent)`,
                    }}
                  />

                  <div className="relative h-full flex flex-col items-center justify-center p-8">
                    <div className="relative mb-7">
                      <div
                        className="absolute -inset-3 rounded-full blur-xl"
                        style={{ backgroundColor: theme.glow }}
                      />
                      <div
                        className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1"
                        style={{
                          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentStrong})`,
                        }}
                      >
                        <div
                          className="w-full h-full rounded-full overflow-hidden flex items-center justify-center border-4"
                          style={{
                            backgroundColor: theme.card,
                            borderColor: theme.card,
                          }}
                        >
                          {profile.avatarUrl ? (
                            <img
                              src={profile.avatarUrl}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className="text-5xl font-black"
                              style={{ color: theme.accent }}
                            >
                              {getInitials(profile.name || profile.username)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="absolute bottom-2 right-1 w-8 h-8 rounded-full border-4 flex items-center justify-center"
                        style={{
                          backgroundColor: theme.accent,
                          borderColor: theme.card,
                        }}
                      >
                        <CheckCircle2 size={15} className="text-white" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-center">
                      {profile.name}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: theme.accent }}>
                      @{profile.username}
                    </p>

                    <div className="flex items-center gap-2 mt-5 text-xs text-gray-400 border rounded-full px-4 py-2"
                      style={{
                        backgroundColor: theme.soft,
                        borderColor: `${theme.accent}25`,
                      }}
                    >
                      <Sparkles size={13} style={{ color: theme.accent }} />
                      DeveloperHub Member
                    </div>
                  </div>
                </div>

                <div className="absolute -left-8 top-14 glass-card rounded-2xl p-4 shadow-2xl">
                  <Code2 style={{ color: theme.accent }} size={24} />
                </div>

                <div className="absolute -right-7 bottom-16 glass-card rounded-2xl p-4 shadow-2xl">
                  <Zap className="text-yellow-400" size={23} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 flex items-center gap-4 text-gray-500">
            <span className="w-10 h-px bg-gray-500" />
            <span className="text-[10px] font-mono tracking-[.3em] uppercase">
              Scroll to explore
            </span>
            <ArrowDown size={13} />
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-28">
          {[
            {
              value: projects.length,
              label: "Projects Built",
              icon: <FolderGit2 size={23} />,
              color: "text-cyan-400",
              glow: "rgba(34,211,238,.1)",
            },
            {
              value: skills.length,
              label: "Technical Skills",
              icon: <Code2 size={23} />,
              color: "",
              glow: theme.soft,
            },
            {
              value: completedSkills,
              label: "Skills Completed",
              icon: <Trophy size={23} />,
              color: "text-amber-400",
              glow: "rgba(251,191,36,.1)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden glass-card rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="absolute -right-8 -top-8 w-32 h-32 blur-3xl rounded-full"
                style={{ backgroundColor: stat.glow }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-4xl font-black tracking-tight">
                    {stat.value.toString().padStart(2, "0")}
                    <span style={{ color: theme.accent }}>+</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stat.label}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center ${stat.color}`}
                  style={{ color: stat.color ? undefined : theme.accent }}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* About */}
        <section id="about" className="mb-28 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="section-label mb-3">01 / Introduction</p>
              <h2 className="text-3xl sm:text-4xl font-black">
                A little about <span style={{ color: theme.accent }}>me.</span>
              </h2>
            </div>
            <span className="font-mono text-xs text-gray-500">WHO I AM</span>
          </div>

          <div className="relative overflow-hidden glass-card rounded-3xl p-8 sm:p-12">
            <div
              className="absolute -right-10 -top-10 opacity-[0.05]"
              style={{ color: theme.accent }}
            >
              <Terminal size={230} strokeWidth={1} />
            </div>

            <div className="relative max-w-4xl">
              <div
                className="text-5xl font-serif mb-4"
                style={{ color: theme.accent }}
              >
                “
              </div>
              <p className="text-gray-300 text-lg sm:text-xl leading-9 whitespace-pre-wrap">
                {profile.bio ||
                  "Curious mind. Passionate builder. Always learning, experimenting and creating something meaningful."}
              </p>

              <div className="flex items-center gap-3 mt-9">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: theme.soft }}
                >
                  <Sparkles size={18} style={{ color: theme.accent }} />
                </div>
                <span className="text-sm text-gray-400">
                  Always learning. Always building.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="mb-28 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="section-label mb-3">02 / Expertise</p>
              <h2 className="text-3xl sm:text-4xl font-black">
                My technical <span style={{ color: theme.accent }}>arsenal.</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3">
                Technologies I use to bring ideas to life.
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-full"
              style={{
                color: theme.accent,
                backgroundColor: theme.soft,
                border: `1px solid ${theme.accent}30`,
              }}
            >
              <Layers3 size={15} />
              {skills.length} Skills
            </div>
          </div>

          {skills.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-gray-500">
              No skills have been added yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {Object.entries(skillGroups).map(([category, items]) => (
                <div
                  key={category}
                  className="glass-card rounded-2xl p-6 sm:p-7 transition"
                >
                  <div className="flex items-center gap-3 mb-7">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: theme.soft }}
                    >
                      <Code2 size={19} style={{ color: theme.accent }} />
                    </div>
                    <div>
                      <h3 className="font-bold">{category}</h3>
                      <p className="text-xs text-gray-500">
                        {items.length} {items.length === 1 ? "skill" : "skills"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {items.map((item, index) => {
                      const progress = Math.min(
                        100,
                        Math.max(0, item.progress),
                      );

                      return (
                        <div key={`${item.skill.name}-${index}`}>
                          <div className="flex items-center justify-between gap-3 mb-2.5">
                            <span className="text-sm font-semibold text-gray-700">
                              {item.skill.name}
                            </span>
                            <span
                              className="text-xs font-mono"
                              style={{ color: theme.accent }}
                            >
                              {progress}%
                            </span>
                          </div>

                          <div className="h-2 rounded-full bg-gray-500/10 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${progress}%`,
                                background: `linear-gradient(to right, ${theme.accentStrong}, ${theme.accent})`,
                                boxShadow: `0 0 12px ${theme.glow}`,
                              }}
                            />
                          </div>

                          <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider text-gray-500">
                            <span>{item.level.replaceAll("_", " ")}</span>
                            <span>{item.status.replaceAll("_", " ")}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Projects */}
        <section id="projects" className="mb-28 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
            <div>
              <p className="section-label mb-3">03 / Selected Work</p>
              <h2 className="text-3xl sm:text-4xl font-black">
                Things I've <span style={{ color: theme.accent }}>built.</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3">
                A collection of ideas transformed into real projects.
              </p>
            </div>

            <div className="text-xs text-gray-500 font-mono">
              {projects.length.toString().padStart(2, "0")} TOTAL PROJECTS
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <FolderGit2 size={36} className="mx-auto text-gray-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Nothing here yet</h3>
              <p className="text-sm text-gray-500">
                Projects will appear here when added to the portfolio.
              </p>
            </div>
          ) : (
            <>
              {featuredProjects.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-5">
                    <Star size={16} className="text-amber-400" />
                    <span className="text-sm font-semibold text-gray-600">
                      Featured work
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 mb-12">
                    {featuredProjects.map((project, index) =>
                      renderProject(project, index),
                    )}
                  </div>
                </>
              )}

              {otherProjects.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mb-5">
                    <FolderGit2 size={16} className="text-cyan-400" />
                    <span className="text-sm font-semibold text-gray-600">
                      More projects
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    {otherProjects.map((project, index) =>
                      renderProject(project, index + featuredProjects.length),
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </section>

        {/* Closing CTA */}
        <section
          className="relative overflow-hidden rounded-3xl border p-9 sm:p-14 mb-20"
          style={{
            borderColor: `${theme.accent}45`,
            background: selectedTheme === "light"
              ? `linear-gradient(135deg, ${theme.soft}, #ffffff, ${theme.soft})`
              : `linear-gradient(135deg, ${theme.background}, ${theme.card})`,
          }}
        >
          <div
            className="absolute -right-24 -top-32 w-96 h-96 rounded-full blur-[100px]"
            style={{ backgroundColor: theme.soft }}
          />
          <div
            className="absolute -left-20 -bottom-32 w-80 h-80 rounded-full blur-[100px]"
            style={{ backgroundColor: theme.glow }}
          />

          <div className="relative max-w-3xl">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-5"
              style={{ color: theme.accent }}
            >
              <Zap size={15} />
              Let's Connect
            </div>

            <h2 className="text-3xl sm:text-5xl font-black leading-tight">
              Have an interesting idea?
              <span
                className="block mt-2"
                style={{ color: theme.accent }}
              >
                Let's build something.
              </span>
            </h2>

            <p className="text-gray-500 leading-7 mt-5 max-w-xl">
              Explore my work, connect through my social profiles and let's
              create something meaningful together.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition"
                  style={{
                    backgroundColor: theme.soft,
                    borderColor: `${theme.accent}30`,
                  }}
                >
                  {link.icon}
                  {link.label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-500/20 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.soft }}
            >
              <Code2 size={19} style={{ color: theme.accent }} />
            </div>
            <div>
              <p className="font-bold text-sm">
                Developer<span style={{ color: theme.accent }}>Hub</span>
              </p>
              <p className="text-[10px] text-gray-500">
                Built for developers, by developers.
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 transition"
            style={{ ["--footer-accent" as string]: theme.accent }}
          >
            Explore DeveloperHub
            <ChevronRight size={16} />
          </button>

          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} DeveloperHub
          </p>
        </footer>
      </main>
    </div>
  );
}
