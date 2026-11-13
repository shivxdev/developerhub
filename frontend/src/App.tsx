
import { useState, useEffect } from "react";
import Projects from "./pages/Projects";
import GitHubDashboard from "./pages/GitHub";

import {
  Code2,
  ArrowRight,
  Play,
  BarChart3,
  Folder,
  Palette,
  FileText,
  Flame,
  GitBranch,
  Star,
  Trophy,
  CheckCircle2,
  Menu,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

const API_URL = "http://localhost:5000";

interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  githubAccount: {
    username: string;
    profileUrl: string | null;
  } | null;
}

const features = [
  {
    icon: FaGithub,
    title: "GitHub Integration",
    desc: "Sync your coding activity seamlessly.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Track commits, languages and growth.",
  },
  {
    icon: Folder,
    title: "Project Management",
    desc: "Organize and showcase your projects.",
  },
  {
    icon: Palette,
    title: "Portfolio Generator",
    desc: "Create a stunning developer portfolio.",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    desc: "Build a professional resume effortlessly.",
  },
];

const languages = [
  { name: "JavaScript", percent: 68, color: "bg-yellow-400" },
  { name: "TypeScript", percent: 14, color: "bg-blue-500" },
  { name: "Python", percent: 10, color: "bg-green-500" },
  { name: "Others", percent: 8, color: "bg-purple-500" },
];

function DashboardPreview() {
  const activity = Array.from({ length: 84 }, (_, i) =>
    (i * 7 + i * i) % 5
  );

  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      <div className="absolute -inset-8 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative rotate-1 rounded-2xl border border-[#354454] bg-[#0d1520] p-3 shadow-2xl shadow-emerald-950/40 sm:p-4">
        <div className="grid grid-cols-[105px_1fr] gap-3 sm:grid-cols-[145px_1fr]">
          <aside className="flex flex-col justify-between rounded-xl border border-[#263445] bg-[#101b29] p-2 sm:p-3">
            <div>
              <div className="mb-5 flex items-center gap-1 text-xs font-bold">
                <Code2 size={17} className="text-emerald-400" />
                <span>DeveloperHub</span>
              </div>

              {[
                "Dashboard",
                "Projects",
                "Skills",
                "Portfolio",
                "Resume",
                "Analytics",
              ].map((item, i) => (
                <div
                  key={item}
                  className={`mb-2 flex items-center gap-2 rounded-lg px-2 py-2 text-[9px] sm:text-[11px] ${
                    i === 0
                      ? "bg-[#203247] text-white"
                      : "text-gray-400"
                  }`}
                >
                  {i === 0 ? (
                    <BarChart3 size={13} />
                  ) : i === 1 ? (
                    <Folder size={13} />
                  ) : i === 2 ? (
                    <Star size={13} />
                  ) : i === 3 ? (
                    <Palette size={13} />
                  ) : i === 4 ? (
                    <FileText size={13} />
                  ) : (
                    <GitBranch size={13} />
                  )}
                  {item}
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-[#1d2a39] p-2">
              <div className="text-[10px] font-semibold">Developer</div>
              <div className="text-[8px] text-gray-400">@developer</div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold sm:text-sm">
                  Welcome back, Developer! 👋
                </p>
                <p className="mt-1 text-[8px] text-gray-400 sm:text-[10px]">
                  Your developer journey looks amazing.
                </p>
              </div>

              <div className="rounded-lg bg-[#1c2a32] p-2 text-[9px] text-emerald-400">
                <Flame size={14} className="inline" /> 14 Day Streak
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Repositories", value: "28", icon: FaGithub },
                { label: "Contributions", value: "156", icon: GitBranch },
                { label: "Languages", value: "12", icon: Code2 },
                { label: "Total Stars", value: "1.2k", icon: Star },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-[#283747] bg-[#121f2d] p-2"
                >
                  <stat.icon size={14} className="mb-2 text-emerald-400" />
                  <p className="text-sm font-bold sm:text-lg">{stat.value}</p>
                  <p className="text-[8px] text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mb-3 rounded-lg border border-[#283747] bg-[#121f2d] p-3">
              <p className="mb-3 text-[10px] font-semibold">
                Contribution Activity
              </p>

              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {activity.map((level, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-[2px] ${
                      [
                        "bg-[#172b25]",
                        "bg-[#0e4429]",
                        "bg-[#006d32]",
                        "bg-[#26a641]",
                        "bg-[#39d353]",
                      ][level]
                    }`}
                  />
                ))}
              </div>

              <div className="mt-2 flex justify-between text-[8px] text-gray-500">
                <span>Less activity</span>
                <span>More activity</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[#283747] bg-[#121f2d] p-2 sm:p-3">
                <p className="mb-3 text-[9px] font-semibold">Top Languages</p>

                {languages.map((lang) => (
                  <div key={lang.name} className="mb-2">
                    <div className="mb-1 flex justify-between text-[8px]">
                      <span>{lang.name}</span>
                      <span>{lang.percent}%</span>
                    </div>

                    <div className="h-1 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className={`h-full ${lang.color}`}
                        style={{ width: `${lang.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[#283747] bg-[#121f2d] p-2 sm:p-3">
                <p className="mb-3 text-[9px] font-semibold">
                  Developer Score
                </p>
                <Trophy size={23} className="mx-auto mb-2 text-yellow-400" />
                <p className="text-center text-lg font-bold">92.5</p>
                <p className="text-center text-[8px] text-emerald-400">
                  Excellent progress!
                </p>

                <div className="mt-3 h-1 rounded-full bg-gray-700">
                  <div className="h-full w-[92%] rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<
    "home" | "projects" | "github"
  >("home");

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setUser(result.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // GitHub Login
  const handleGitHubLogin = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  // Navigate to page
  const navigateTo = (
    page: "home" | "projects" | "github"
  ) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(null);
        setCurrentPage("home");
        setMobileMenuOpen(false);
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d14] text-emerald-400">
        <div className="text-center">
          <Code2 size={42} className="mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-gray-400">
            Loading DeveloperHub...
          </p>
        </div>
      </div>
    );
  }

  // Protect Projects page
  if (currentPage === "projects") {
    if (!user) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#080d14] px-5 text-center text-white">
          <FaGithub size={48} className="mb-5 text-emerald-400" />
          <h2 className="text-2xl font-bold">Login Required</h2>
          <p className="mt-3 text-gray-400">
            Please login with GitHub to access your projects.
          </p>
          <button
            onClick={handleGitHubLogin}
            className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-bold text-black hover:bg-emerald-400"
          >
            Login with GitHub
          </button>
          <button
            onClick={() => navigateTo("home")}
            className="mt-4 text-sm text-gray-400 hover:text-white"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return (
      <Projects
        userId={user.id}
        onBack={() => navigateTo("home")}
      />
    );
  }

  // Protect GitHub Analytics page
  if (currentPage === "github") {
    if (!user) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#080d14] px-5 text-center text-white">
          <FaGithub size={48} className="mb-5 text-emerald-400" />
          <h2 className="text-2xl font-bold">Login Required</h2>
          <p className="mt-3 text-gray-400">
            Please login with GitHub to access your analytics.
          </p>
          <button
            onClick={handleGitHubLogin}
            className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-bold text-black hover:bg-emerald-400"
          >
            Login with GitHub
          </button>
          <button
            onClick={() => navigateTo("home")}
            className="mt-4 text-sm text-gray-400 hover:text-white"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return (
      <GitHubDashboard
        onBack={() => navigateTo("home")}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080d14] text-[#e6edf3]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080d14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4 px-5 py-5 lg:px-10">

          <button
            onClick={() => navigateTo("home")}
            className="flex items-center gap-2 text-xl font-bold"
          >
            <Code2 className="text-emerald-400" size={34} />
            Developer<span className="text-emerald-400">Hub</span>
          </button>

          <div className="hidden items-center gap-9 text-sm text-gray-300 md:flex">
            <button
              onClick={() => navigateTo("home")}
              className="border-b-2 border-emerald-400 pb-2 text-white"
            >
              Home
            </button>

            <a href="#features" className="transition hover:text-emerald-400">
              Features
            </a>

            <a href="#about" className="transition hover:text-emerald-400">
              About
            </a>

            <a href="#pricing" className="transition hover:text-emerald-400">
              Pricing
            </a>

            <a href="#faq" className="transition hover:text-emerald-400">
              FAQ
            </a>
          </div>

          {/* Authentication Navbar */}
          {user ? (
            <div className="flex items-center gap-3">

              <div className="hidden items-center gap-2 sm:flex">
                <button
                  onClick={() => navigateTo("projects")}
                  className="rounded-full border border-gray-700 px-4 py-2 text-sm font-semibold transition hover:border-emerald-400 hover:text-emerald-400"
                >
                  Projects
                </button>

                <button
                  onClick={() => navigateTo("github")}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500 hover:text-black"
                >
                  GitHub Analytics
                </button>
              </div>

              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt="GitHub avatar"
                  className="h-9 w-9 rounded-full border border-emerald-500/40"
                />
              )}

              <div className="hidden sm:block">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-400">
                  @{user.githubAccount?.username ?? "developer"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full border border-gray-600 px-3 py-2 text-xs transition hover:border-red-400 hover:text-red-400 disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGitHubLogin}
              className="hidden items-center gap-2 rounded-full border border-gray-600 px-5 py-2.5 text-sm font-semibold transition hover:border-emerald-400 hover:text-emerald-400 sm:flex"
            >
              <FaGithub size={17} />
              Login with GitHub
              <ArrowRight size={15} />
            </button>
          )}

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-gray-700 p-2 md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu size={21} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#101923] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm text-gray-300">
              <button
                onClick={() => navigateTo("home")}
                className="py-2 text-left hover:text-emerald-400"
              >
                Home
              </button>

              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-emerald-400"
              >
                Features
              </a>

              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-emerald-400"
              >
                About
              </a>

              {user ? (
                <>
                  <button
                    onClick={() => navigateTo("projects")}
                    className="py-2 text-left hover:text-emerald-400"
                  >
                    My Projects
                  </button>

                  <button
                    onClick={() => navigateTo("github")}
                    className="py-2 text-left text-emerald-400"
                  >
                    GitHub Analytics
                  </button>
                </>
              ) : (
                <button
                  onClick={handleGitHubLogin}
                  className="py-2 text-left text-emerald-400"
                >
                  Login with GitHub
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-[1450px] items-center gap-12 px-5 py-12 lg:grid-cols-[1fr_1.08fr] lg:px-10 lg:py-16">

        <div className="absolute left-0 top-20 -z-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-[110px]" />

        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Track · Build · Grow
          </div>

          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">
            Your Personal
            <span className="block">
              <span className="text-emerald-400">Developer</span>{" "}
              Ecosystem
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-gray-400">
            Connect your GitHub, track your coding journey, manage projects,
            build a stunning portfolio and generate your resume — all in one place.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <button
              onClick={
                user
                  ? () => navigateTo("projects")
                  : handleGitHubLogin
              }
              className="inline-flex items-center gap-3 rounded-full bg-emerald-500 px-7 py-4 font-bold text-[#06120c] shadow-lg shadow-emerald-500/20 transition hover:-translate-y-1 hover:bg-emerald-400"
            >
              <FaGithub size={20} />
              {user ? "Open DeveloperHub" : "Get Started Free"}
              <ArrowRight size={18} />
            </button>

            <a
              href="#features"
              className="inline-flex items-center gap-3 rounded-full border border-gray-500 px-7 py-4 font-semibold transition hover:border-emerald-400 hover:text-emerald-400"
            >
              <Play size={17} />
              Explore Features
            </a>
          </div>

          {user ? (
            <div className="mt-9 flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-11 w-11 rounded-full border border-emerald-400"
                />
              )}
              <div>
                <p className="text-sm font-semibold">
                  Welcome, {user.name}!
                </p>
                <p className="text-xs text-emerald-400">
                  GitHub account connected successfully
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-9 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["S", "A", "R", "D", "K"].map((letter) => (
                  <div
                    key={letter}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#080d14] bg-gradient-to-br from-emerald-400 to-blue-600 text-xs font-bold"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-400">
                Built for developers who want to grow.
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 py-5">
          <DashboardPreview />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1450px] px-5 py-12 lg:px-10">
        <div className="mb-9 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Everything in one place
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Tools to level up your journey
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[#273442] bg-[#101720] p-6 transition duration-300 hover:-translate-y-2 hover:border-emerald-500/50 hover:bg-[#14221e]"
            >
              <div className="mb-5 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-400 transition group-hover:bg-emerald-500 group-hover:text-black">
                <feature.icon size={27} />
              </div>

              <h3 className="mb-2 font-bold">{feature.title}</h3>
              <p className="text-sm leading-6 text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / Journey */}
      <section id="about" className="mx-auto grid max-w-[1450px] items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-10">
        <div className="rounded-3xl border border-[#293847] bg-[#101923] p-7 sm:p-10">
          <div className="mb-6 flex gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>

          <p className="mb-6 font-mono text-sm text-gray-400">
            // Your Developer Journey, Simplified
          </p>

          {[
            "Track your coding streak",
            "Showcase your skills",
            "Manage your best projects",
            "Get internship ready",
          ].map((item) => (
            <div key={item} className="mb-5 flex items-center gap-3">
              <CheckCircle2 className="shrink-0 text-emerald-400" />
              <span className="text-gray-200">{item}</span>
            </div>
          ))}

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-[#293847] bg-[#080d14] p-4">
            <FaGithub size={36} />
            <div>
              <p className="font-bold">One developer profile</p>
              <p className="text-xs text-gray-400">
                Your work. Your growth. Your story.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-widest text-emerald-400">
            Your next level starts here
          </p>

          <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Level Up Your{" "}
            <span className="text-emerald-400">Developer</span> Profile
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-400">
            From GitHub stats to a professional portfolio —
            DeveloperHub helps you showcase your work, understand
            your progress and prepare for internship opportunities.
          </p>

          <button
            onClick={
              user
                ? () => navigateTo("projects")
                : handleGitHubLogin
            }
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 font-bold text-[#06120c] transition hover:bg-emerald-400"
          >
            Start Your Journey <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section
        id="get-started"
        className="mx-5 mb-20 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#10251d] to-[#101923] px-6 py-16 text-center sm:mx-10"
      >
        <Sparkles className="mx-auto mb-5 text-emerald-400" size={36} />

        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Ready to build your developer story?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          Bring your projects, skills and coding journey together in one place.
        </p>

        <button
          onClick={
            user
              ? () => navigateTo("projects")
              : handleGitHubLogin
          }
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-4 font-bold text-black hover:bg-emerald-400"
        >
          {user ? "Open DeveloperHub" : "Get Started Free"}
          <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1450px] flex-col items-center justify-between gap-5 sm:flex-row">

          <div className="flex items-center gap-2 text-xl font-bold">
            <Code2 className="text-emerald-400" size={27} />
            Developer<span className="text-emerald-400">Hub</span>
          </div>

          <p className="text-sm text-gray-500">
            Build. Track. Grow. © 2026 DeveloperHub
          </p>

          <div className="flex gap-5 text-gray-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hover:text-emerald-400"
            >
              <FaGithub size={22} />
            </a>

            <a
              href="#features"
              aria-label="Features"
              className="hover:text-emerald-400"
            >
              <ExternalLink size={22} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
