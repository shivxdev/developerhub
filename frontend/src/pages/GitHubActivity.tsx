
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  GitCommit,
  GitPullRequest,
  CircleDot,
  Star,
  GitFork,
  ExternalLink,
  Loader2,
  AlertCircle,
  CalendarDays,
  Flame,
  Trophy,
} from "lucide-react";

interface Contribution {
  date: string;
  count: number;
  level: number;
}

interface ContributionResponse {
  total?: Record<string, number>;
  contributions?: Contribution[];
}

interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
  };
  payload: {
    action?: string;
    ref?: string;
    commits?: { message: string }[];
    issue?: {
      title?: string;
      html_url?: string;
    };
    pull_request?: {
      title?: string;
      html_url?: string;
    };
  };
}

interface Props {
  username: string;
}

const contributionColors = [
  "bg-[#202b3a]",
  "bg-[#0e4429]",
  "bg-[#006d32]",
  "bg-[#26a641]",
  "bg-[#39d353]",
];

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getEventDetails(event: GitHubEvent) {
  switch (event.type) {
    case "PushEvent":
      return {
        title: "Pushed commits",
        description:
          event.payload.commits?.[0]?.message || "Pushed code to repository",
        icon: GitCommit,
        color: "text-blue-400",
      };

    case "PullRequestEvent":
      return {
        title: `${event.payload.action || "Updated"} a pull request`,
        description:
          event.payload.pull_request?.title || "Pull request activity",
        icon: GitPullRequest,
        color: "text-purple-400",
      };

    case "IssuesEvent":
      return {
        title: `${event.payload.action || "Updated"} an issue`,
        description: event.payload.issue?.title || "Issue activity",
        icon: CircleDot,
        color: "text-emerald-400",
      };

    case "WatchEvent":
      return {
        title: "Starred a repository",
        description: event.repo.name,
        icon: Star,
        color: "text-yellow-400",
      };

    case "ForkEvent":
      return {
        title: "Forked a repository",
        description: event.repo.name,
        icon: GitFork,
        color: "text-orange-400",
      };

    case "CreateEvent":
      return {
        title: "Created a repository or branch",
        description: event.payload.ref || event.repo.name,
        icon: Activity,
        color: "text-cyan-400",
      };

    case "DeleteEvent":
      return {
        title: "Deleted a branch or tag",
        description: event.payload.ref || event.repo.name,
        icon: Activity,
        color: "text-red-400",
      };

    default:
      return {
        title: event.type.replace("Event", ""),
        description: event.repo.name,
        icon: Activity,
        color: "text-emerald-400",
      };
  }
}

export default function GitHubActivity({ username }: Props) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;

    const controller = new AbortController();

    async function loadActivity() {
      setLoading(true);
      setError("");

      try {
        const [contributionResponse, eventsResponse] = await Promise.all([
          fetch(
            `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
            { signal: controller.signal }
          ),
          fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=100`,
            {
              signal: controller.signal,
              headers: { Accept: "application/vnd.github+json" },
            }
          ),
        ]);

        if (!contributionResponse.ok) {
          throw new Error("Unable to load contribution graph.");
        }

        if (!eventsResponse.ok) {
          throw new Error(
            eventsResponse.status === 403
              ? "GitHub API rate limit reached. Please try again later."
              : "Unable to load recent GitHub activity."
          );
        }

        const contributionData =
          (await contributionResponse.json()) as ContributionResponse;

        const eventData = (await eventsResponse.json()) as GitHubEvent[];

        const contributionList = contributionData.contributions || [];

        setContributions(contributionList);
        setTotalContributions(
          contributionData.total?.lastYear ??
            contributionList.reduce((sum, item) => sum + item.count, 0)
        );
        setEvents(eventData);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load GitHub activity."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadActivity();

    return () => controller.abort();
  }, [username]);

  const calendar = useMemo(() => {
    const map = new Map(
      contributions.map((item) => [item.date, item])
    );

    const today = new Date();
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const start = new Date(end);
    start.setDate(start.getDate() - 363);
    start.setDate(start.getDate() - start.getDay());

    const weeks: (Contribution | null)[][] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const week: (Contribution | null)[] = [];

      for (let day = 0; day < 7; day++) {
        if (cursor > end) {
          week.push(null);
        } else {
          const date = [
            cursor.getFullYear(),
            String(cursor.getMonth() + 1).padStart(2, "0"),
            String(cursor.getDate()).padStart(2, "0"),
          ].join("-");

          week.push(
            map.get(date) || { date, count: 0, level: 0 }
          );

          cursor.setDate(cursor.getDate() + 1);
        }
      }

      weeks.push(week);
    }

    return weeks;
  }, [contributions]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; column: number }[] = [];
    let previousMonth = -1;

    calendar.forEach((week, index) => {
      const firstDay = week.find((day) => day !== null);
      if (!firstDay) return;

      const month = new Date(`${firstDay.date}T00:00:00`).getMonth();

      if (month !== previousMonth) {
        labels.push({
          label: new Date(`${firstDay.date}T00:00:00`).toLocaleString(
            "en-US",
            { month: "short" }
          ),
          column: index,
        });
        previousMonth = month;
      }
    });

    return labels;
  }, [calendar]);

  // STREAK CALCULATIONS
  const streakStats = useMemo(() => {
    const activeDates = new Set(
      contributions
        .filter((item) => item.count > 0)
        .map((item) => item.date)
    );

    const getDateKey = (date: Date) => {
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = new Date(today);

    if (!activeDates.has(getDateKey(currentDate))) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    let currentStreak = 0;

    while (activeDates.has(getDateKey(currentDate))) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    const sortedDates = [...activeDates].sort();

    let longestStreak = 0;
    let runningStreak = 0;
    let previousDate: Date | null = null;

    for (const dateString of sortedDates) {
      const date = new Date(`${dateString}T00:00:00`);

      if (previousDate) {
        const difference = Math.round(
          (date.getTime() - previousDate.getTime()) / 86400000
        );

        runningStreak =
          difference === 1 ? runningStreak + 1 : 1;
      } else {
        runningStreak = 1;
      }

      longestStreak = Math.max(longestStreak, runningStreak);
      previousDate = date;
    }

    return {
      currentStreak,
      longestStreak,
      activeDays: activeDates.size,
    };
  }, [contributions]);

  const recentEvents = events.slice(0, 12);

  return (
    <div className="mb-8 space-y-6">

      {/* GITHUB STREAK CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-[#263244] bg-[#101925] p-5 transition hover:border-orange-500/40">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8b9bb0]">Current Streak</p>
            <Flame size={23} className="text-orange-400" />
          </div>

          <h3 className="mt-4 text-3xl font-bold text-orange-400">
            {streakStats.currentStreak}
            <span className="ml-2 text-sm font-medium text-[#8b9bb0]">
              days
            </span>
          </h3>

          <p className="mt-1 text-xs text-[#718096]">
            Consecutive contribution days
          </p>
        </div>

        <div className="rounded-2xl border border-[#263244] bg-[#101925] p-5 transition hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8b9bb0]">Longest Streak</p>
            <Trophy size={23} className="text-emerald-400" />
          </div>

          <h3 className="mt-4 text-3xl font-bold text-emerald-400">
            {streakStats.longestStreak}
            <span className="ml-2 text-sm font-medium text-[#8b9bb0]">
              days
            </span>
          </h3>

          <p className="mt-1 text-xs text-[#718096]">
            Your personal best in the available year
          </p>
        </div>

        <div className="rounded-2xl border border-[#263244] bg-[#101925] p-5 transition hover:border-blue-500/40">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8b9bb0]">Active Days</p>
            <CalendarDays size={23} className="text-blue-400" />
          </div>

          <h3 className="mt-4 text-3xl font-bold text-blue-400">
            {streakStats.activeDays}
            <span className="ml-2 text-sm font-medium text-[#8b9bb0]">
              days
            </span>
          </h3>

          <p className="mt-1 text-xs text-[#718096]">
            Days with contributions in the last year
          </p>
        </div>

      </div>

      {/* CONTRIBUTION GRAPH */}
      <section className="rounded-2xl border border-[#263244] bg-[#101925] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-emerald-400" />
              <h3 className="text-lg font-bold">
                GitHub Contributions
              </h3>
            </div>
            <p className="mt-1 text-xs text-[#8b9bb0]">
              Your coding activity over the last 12 months
            </p>
          </div>

          <div className="rounded-lg bg-[#1b2a3a] px-3 py-2">
            <p className="text-lg font-bold text-white">
              {totalContributions.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#8b9bb0]">
              Contributions
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#8b9bb0]">
            <Loader2 size={18} className="animate-spin text-emerald-400" />
            Loading contribution graph...
          </div>
        ) : contributions.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8b9bb0]">
            No contribution data available.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto pb-3">
              <div className="min-w-[720px]">
                <div
                  className="mb-2 grid gap-1 text-[10px] text-[#8b9bb0]"
                  style={{
                    gridTemplateColumns: `repeat(${calendar.length}, minmax(0, 1fr))`,
                  }}
                >
                  {calendar.map((_, index) => {
                    const month = monthLabels.find(
                      (item) => item.column === index
                    );

                    return (
                      <span key={index}>
                        {month?.label || ""}
                      </span>
                    );
                  })}
                </div>

                <div className="flex gap-1">
                  <div className="flex flex-col justify-between pr-2 text-[10px] text-[#8b9bb0]">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  <div
                    className="grid flex-1 gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${calendar.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {calendar.map((week, weekIndex) => (
                      <div
                        key={weekIndex}
                        className="grid grid-rows-7 gap-1"
                      >
                        {week.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            title={
                              day
                                ? `${day.count} contributions on ${formatDate(day.date)}`
                                : ""
                            }
                            className={`aspect-square w-full rounded-[3px] ${
                              day
                                ? contributionColors[
                                    Math.min(Math.max(day.level, 0), 4)
                                  ]
                                : "bg-transparent"
                            }`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#8b9bb0]">
              <span>Daily contribution activity</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                {contributionColors.map((color) => (
                  <span
                    key={color}
                    className={`h-3 w-3 rounded-[3px] ${color}`}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ACTIVITY TIMELINE */}
      <section className="rounded-2xl border border-[#263244] bg-[#101925] p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-2">
          <Activity size={19} className="text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold">
              Coding Activity Timeline
            </h3>
            <p className="mt-1 text-xs text-[#8b9bb0]">
              Your recent public GitHub events
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#8b9bb0]">
            <Loader2 size={18} className="animate-spin text-emerald-400" />
            Loading recent activity...
          </div>
        ) : recentEvents.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8b9bb0]">
            No recent public activity found.
          </p>
        ) : (
          <div className="relative ml-3 space-y-6 border-l border-[#344256] pl-6">
            {recentEvents.map((event) => {
              const details = getEventDetails(event);
              const Icon = details.icon;
              const repoUrl = `https://github.com/${event.repo.name}`;
              const activityUrl =
                event.payload.pull_request?.html_url ||
                event.payload.issue?.html_url ||
                repoUrl;

              return (
                <div key={event.id} className="relative">
                  <div className="absolute -left-[34px] top-1 flex h-7 w-7 items-center justify-center rounded-full border border-[#344256] bg-[#101925]">
                    <Icon size={14} className={details.color} />
                  </div>

                  <div className="rounded-xl border border-[#263244] bg-[#0c141f] p-4 transition hover:border-emerald-500/30">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#e6edf3]">
                          {details.title}
                        </p>
                        <p className="mt-1 break-words text-xs leading-5 text-[#8b9bb0]">
                          {details.description}
                        </p>
                      </div>

                      <a
                        href={activityUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open GitHub activity"
                        className="rounded-lg p-2 text-[#8b9bb0] transition hover:bg-[#1b2a3a] hover:text-emerald-400"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#718096]">
                      <a
                        href={repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        {event.repo.name}
                      </a>
                      <span>{formatTime(event.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <p className="mt-5 text-[11px] text-[#718096]">
          Activity is based on GitHub's public events API. GitHub may limit
          how many recent events are available.
        </p>
      </section>
    </div>
  );
}
