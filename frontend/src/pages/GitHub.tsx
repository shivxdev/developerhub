import GitHubActivity from "./GitHubActivity";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Star,
  GitFork,
  FolderGit2,
  Code2,
  Users,
  BookOpen,
  ExternalLink,
  MapPin,
  Globe,
  Loader2,
  AlertCircle,
  CalendarDays,
  X,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/github`;

interface GitHubProfile {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  profileUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
}

interface GitHubStats {
  totalRepositories: number;
  totalStars: number;
  totalForks: number;
  totalLanguages: number;
}

interface Language {
  name: string;
  count: number;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  isPrivate: boolean;
  updatedAt: string;
}

interface GitHubData {
  profile: GitHubProfile;
  stats: GitHubStats;
  languages: Language[];
  repositories: Repository[];
}

interface GitHubProps {
  onBack: () => void;
}

const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  C: "#555555",
  "C++": "#f34b7d",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#263244] bg-[#101925] p-5 transition hover:border-emerald-500/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#8b9bb0]">{label}</p>
        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
          {icon}
        </div>
      </div>

      <h3 className="mt-4 text-3xl font-bold tracking-tight text-[#e6edf3]">
        {value.toLocaleString()}
      </h3>

      <p className="mt-1 text-xs text-[#718096]">{description}</p>
    </div>
  );
}

export default function GitHubDashboard({ onBack }: GitHubProps) {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");

  const fetchOverview = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_URL}/overview`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to fetch GitHub information."
        );
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching GitHub data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const filteredRepositories = useMemo(() => {
    if (!data) return [];

    return data.repositories.filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        (repo.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesLanguage =
        languageFilter === "All" ||
        repo.language === languageFilter;

      return matchesSearch && matchesLanguage;
    });
  }, [data, search, languageFilter]);

  const languageOptions = useMemo(() => {
    if (!data) return ["All"];

    return [
      "All",
      ...data.languages.map((language) => language.name),
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-400" />
          <p className="mt-4 text-sm text-[#9aa9bb]">
            Fetching your GitHub analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#080d14] px-5 py-12 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-[#263244] bg-[#101925] p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />

          <h2 className="mt-4 text-xl font-bold text-white">
            Unable to load GitHub data
          </h2>

          <p className="mt-2 text-sm text-[#9aa9bb]">{error}</p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => fetchOverview()}
              className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-[#06110c] hover:bg-emerald-400"
            >
              Try Again
            </button>

            <button
              onClick={onBack}
              className="rounded-xl border border-[#344256] px-5 py-3 text-sm text-[#c9d1d9] hover:bg-[#182435]"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, stats, languages } = data;

  const maxLanguageCount = Math.max(
    ...languages.map((language) => language.count),
    1
  );

  return (
    <div className="min-h-screen bg-[#080d14] text-[#e6edf3]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">

        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="mb-4 inline-flex items-center gap-2 text-sm text-[#8b9bb0] transition hover:text-emerald-400"
            >
              <ArrowLeft size={17} />
              Back to Home
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#263244] bg-[#101925] p-3">
                <FaGithub size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  GitHub Analytics
                </h1>
                <p className="mt-1 text-sm text-[#8b9bb0]">
                  Your coding activity and repository insights
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchOverview(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#344256] bg-[#101925] px-4 py-3 text-sm font-semibold text-[#c9d1d9] transition hover:border-emerald-500/50 hover:text-emerald-400 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {/* PROFILE */}
        <div className="mb-8 rounded-2xl border border-[#263244] bg-gradient-to-br from-[#101925] to-[#0d1722] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="h-20 w-20 rounded-2xl border-2 border-emerald-500/30 object-cover sm:h-24 sm:w-24"
              />

              <div>
                <h2 className="text-2xl font-bold">
                  {profile.name || profile.username}
                </h2>

                <a
                  href={profile.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  @{profile.username}
                  <ExternalLink size={13} />
                </a>

                {profile.bio && (
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#a6b4c5]">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#8b9bb0]">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {profile.location}
                    </span>
                  )}

                  <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    {profile.followers.toLocaleString()} followers
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    {profile.following.toLocaleString()} following
                  </span>
                </div>
              </div>
            </div>

            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#06110c] transition hover:bg-emerald-400"
            >
              <FaGithub size={17} />
              View GitHub Profile
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Repositories"
            value={stats.totalRepositories}
            description="Public repositories owned"
            icon={<FolderGit2 size={21} />}
          />

          <StatCard
            label="Total Stars"
            value={stats.totalStars}
            description="Stars received across repositories"
            icon={<Star size={21} />}
          />

          <StatCard
            label="Total Forks"
            value={stats.totalForks}
            description="Total repository forks"
            icon={<GitFork size={21} />}
          />

          <StatCard
            label="Languages"
            value={stats.totalLanguages}
            description="Different primary languages"
            icon={<Code2 size={21} />}
          />
        </div>

        {/* SECONDARY STATS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-[#263244] bg-[#101925] p-5">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-xs text-[#8b9bb0]">Public Repositories</p>
              <p className="mt-1 text-xl font-bold">{profile.publicRepos}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#263244] bg-[#101925] p-5">
            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
              <Globe size={22} />
            </div>
            <div>
              <p className="text-xs text-[#8b9bb0]">Public Gists</p>
              <p className="mt-1 text-xl font-bold">{profile.publicGists}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#263244] bg-[#101925] p-5">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs text-[#8b9bb0]">Followers</p>
              <p className="mt-1 text-xl font-bold">
                {profile.followers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* CONTRIBUTION GRAPH + CODING ACTIVITY */}
        <GitHubActivity username={profile.username} />

        {/* LANGUAGES + REPOSITORIES */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* LANGUAGE DISTRIBUTION */}
          <div className="rounded-2xl border border-[#263244] bg-[#101925] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Top Languages</h3>
              <Code2 size={19} className="text-emerald-400" />
            </div>

            {languages.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#718096]">
                No language data available yet.
              </p>
            ) : (
              <>
                <div className="mb-6 flex h-3 overflow-hidden rounded-full bg-[#263244]">
                  {languages.map((language) => (
                    <div
                      key={language.name}
                      title={`${language.name}: ${language.count} repositories`}
                      style={{
                        width: `${(language.count / maxLanguageCount) * 100 / (languages.reduce((sum, item) => sum + item.count, 0) / maxLanguageCount)}%`,
                        backgroundColor:
                          languageColors[language.name] || "#34d399",
                      }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  {languages.slice(0, 8).map((language) => (
                    <div key={language.name}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-[#c9d1d9]">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                languageColors[language.name] || "#34d399",
                            }}
                          />
                          {language.name}
                        </span>
                        <span className="text-[#8b9bb0]">
                          {language.count} repos
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-[#263244]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(language.count / maxLanguageCount) * 100}%`,
                            backgroundColor:
                              languageColors[language.name] || "#34d399",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* REPOSITORY SECTION */}
          <div className="lg:col-span-2 rounded-2xl border border-[#263244] bg-[#101925] p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Your Repositories</h3>
                <p className="mt-1 text-xs text-[#8b9bb0]">
                  Explore your GitHub projects
                </p>
              </div>

              <span className="rounded-lg bg-[#1b2a3a] px-3 py-1.5 text-xs font-semibold text-[#a6b4c5]">
                {filteredRepositories.length} repositories
              </span>
            </div>

            {/* SEARCH */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search repositories..."
                  className="w-full rounded-xl border border-[#344256] bg-[#080d14] py-3 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-[#718096] focus:border-emerald-500"
                />

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="rounded-xl border border-[#344256] bg-[#080d14] px-4 py-3 text-sm text-[#c9d1d9] outline-none focus:border-emerald-500"
              >
                {languageOptions.map((language) => (
                  <option key={language} value={language}>
                    {language === "All" ? "All Languages" : language}
                  </option>
                ))}
              </select>
            </div>

            {/* REPOSITORIES */}
            {filteredRepositories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#344256] py-12 text-center">
                <FolderGit2
                  size={32}
                  className="mx-auto text-[#718096]"
                />
                <p className="mt-3 text-sm font-medium text-[#c9d1d9]">
                  No repositories found
                </p>
                <p className="mt-1 text-xs text-[#718096]">
                  Try changing your search or language filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="rounded-xl border border-[#263244] bg-[#0c141f] p-4 transition hover:border-emerald-500/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-sm font-bold text-emerald-400 hover:text-emerald-300"
                        >
                          {repo.name}
                          <ExternalLink
                            size={12}
                            className="ml-1 inline"
                          />
                        </a>

                        {repo.description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8b9bb0]">
                            {repo.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#8b9bb0]">
                          {repo.language && (
                            <span className="flex items-center gap-1.5">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    languageColors[repo.language] || "#34d399",
                                }}
                              />
                              {repo.language}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Star size={13} />
                            {repo.stars}
                          </span>

                          <span className="flex items-center gap-1">
                            <GitFork size={13} />
                            {repo.forks}
                          </span>

                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} />
                            Updated {formatDate(repo.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noreferrer"
                          title="Open live project"
                          className="rounded-lg border border-[#344256] p-2 text-[#8b9bb0] transition hover:border-emerald-500 hover:text-emerald-400"
                        >
                          <Globe size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#263244] py-6 text-xs text-[#718096] sm:flex-row">
          <p>
            DeveloperHub GitHub Analytics
          </p>

          <a
            href={profile.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition hover:text-emerald-400"
          >
            <FaGithub size={15} />
            @{profile.username}
            <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );
}
