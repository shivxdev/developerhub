
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  Code2,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Loader2,
  Plus,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

const API_URL = "http://localhost:5000";

type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

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

interface Project {
  id: string;
  title: string;
  description: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
}

interface Skill {
  skillId: string;
  level: string;
  progress: number;
  status: GoalStatus;
  skill: {
    name: string;
    category: string | null;
  };
}

interface LearningGoal {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: GoalStatus;
  createdAt: string;
}

interface DashboardProps {
  user: AuthUser;
  onNavigate: (
    page: "home" | "projects" | "github" | "skills" | "learning"
  ) => void;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#263747] bg-[#101923] p-5 transition hover:border-emerald-500/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>

        <div className={`rounded-xl bg-white/5 p-3 ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
      >
        {action}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

function getStatusLabel(status: GoalStatus) {
  if (status === "COMPLETED") return "Completed";
  if (status === "IN_PROGRESS") return "In Progress";
  return "Not Started";
}

function getStatusColor(status: GoalStatus) {
  if (status === "COMPLETED") {
    return "border-green-500/20 bg-green-500/10 text-green-400";
  }

  if (status === "IN_PROGRESS") {
    return "border-blue-500/20 bg-blue-500/10 text-blue-400";
  }

  return "border-gray-500/20 bg-gray-500/10 text-gray-400";
}

function formatDate(date: string | null) {
  if (!date) return "No deadline";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "No deadline";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Dashboard({ user, onNavigate }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsResponse, skillsResponse, goalsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/projects`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/skills`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/learning-goals`, {
            credentials: "include",
          }),
        ]);

      if (
        projectsResponse.status === 401 ||
        skillsResponse.status === 401 ||
        goalsResponse.status === 401
      ) {
        throw new Error("Your session has expired. Please login again.");
      }

      if (
        !projectsResponse.ok ||
        !skillsResponse.ok ||
        !goalsResponse.ok
      ) {
        throw new Error("Unable to load dashboard data.");
      }

      const [projectsResult, skillsResult, goalsResult] =
        await Promise.all([
          projectsResponse.json(),
          skillsResponse.json(),
          goalsResponse.json(),
        ]);

      if (
        !projectsResult.success ||
        !skillsResult.success ||
        !goalsResult.success
      ) {
        throw new Error("Something went wrong while loading your data.");
      }

      setProjects(
        Array.isArray(projectsResult.data) ? projectsResult.data : []
      );

      setSkills(
        Array.isArray(skillsResult.data) ? skillsResult.data : []
      );

      setGoals(
        Array.isArray(goalsResult.data) ? goalsResult.data : []
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const completedGoals = goals.filter(
    (goal) => goal.status === "COMPLETED"
  ).length;

  const activeGoals = goals.filter(
    (goal) => goal.status === "IN_PROGRESS"
  ).length;

  const completedSkills = skills.filter(
    (skill) => skill.status === "COMPLETED"
  ).length;

  const averageSkillProgress =
    skills.length > 0
      ? Math.round(
          skills.reduce((total, skill) => total + skill.progress, 0) /
            skills.length
        )
      : 0;

  const completionPercentage =
    goals.length > 0
      ? Math.round((completedGoals / goals.length) * 100)
      : 0;

  const upcomingGoals = [...goals]
    .filter(
      (goal) =>
        goal.targetDate &&
        goal.status !== "COMPLETED" &&
        new Date(goal.targetDate).getTime() >=
          new Date(new Date().toDateString()).getTime()
    )
    .sort(
      (a, b) =>
        new Date(a.targetDate!).getTime() -
        new Date(b.targetDate!).getTime()
    )
    .slice(0, 4);

  const recentProjects = projects.slice(0, 4);
  const recentSkills = skills.slice(0, 5);
  const recentGoals = goals.slice(0, 4);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d14] text-white">
        <div className="text-center">
          <Loader2
            size={38}
            className="mx-auto mb-4 animate-spin text-emerald-400"
          />
          <p className="text-sm text-gray-400">
            Loading your developer dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d14] px-4 py-8 text-[#e6edf3] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1450px]">

        {/* Header */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Activity size={17} />
              DEVELOPER WORKSPACE
            </div>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h1>

            <p className="mt-2 text-sm text-gray-400 sm:text-base">
              Here's an overview of your developer journey.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("projects")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-400"
            >
              <Plus size={17} />
              New Project
            </button>

            <button
              onClick={fetchDashboardData}
              className="rounded-xl border border-[#344454] px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-emerald-400 hover:text-emerald-400"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Profile Banner */}
        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-[#10251d] to-[#101923] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full border-2 border-emerald-400/50"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Code2 size={30} />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="mt-1 text-sm text-gray-400">
                @{user.githubAccount?.username ?? "developer"}
              </p>
              <p className="mt-1 text-xs text-emerald-400">
                <CheckCircle2 size={13} className="mr-1 inline" />
                GitHub account connected
              </p>
            </div>
          </div>

          {user.githubAccount?.profileUrl && (
            <a
              href={user.githubAccount.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/10 sm:self-center"
            >
              <FaGithub size={17} />
              View GitHub Profile
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-7 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-sm font-semibold text-white underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Projects"
            value={projects.length}
            subtitle="Your saved projects"
            icon={FolderKanban}
            color="text-emerald-400"
          />

          <StatCard
            title="Skills Tracked"
            value={skills.length}
            subtitle={`${completedSkills} completed`}
            icon={GraduationCap}
            color="text-blue-400"
          />

          <StatCard
            title="Learning Goals"
            value={goals.length}
            subtitle={`${activeGoals} currently active`}
            icon={Target}
            color="text-purple-400"
          />

          <StatCard
            title="Goals Completed"
            value={`${completionPercentage}%`}
            subtitle={`${completedGoals} of ${goals.length} goals`}
            icon={Trophy}
            color="text-yellow-400"
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-7 xl:grid-cols-[1.5fr_1fr]">

          {/* Projects */}
          <section className="rounded-2xl border border-[#263747] bg-[#101923] p-5 sm:p-6">
            <SectionHeader
              title="Recent Projects"
              subtitle="Your latest development work"
              action="View all"
              onAction={() => onNavigate("projects")}
            />

            {recentProjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#344454] px-4 py-10 text-center">
                <FolderKanban
                  size={32}
                  className="mx-auto mb-3 text-gray-500"
                />
                <p className="font-semibold">No projects yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Add your first project to get started.
                </p>
                <button
                  onClick={() => onNavigate("projects")}
                  className="mt-4 text-sm font-semibold text-emerald-400"
                >
                  Explore Projects <ArrowRight size={14} className="inline" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl border border-[#283847] bg-[#0c141e] p-4 transition hover:border-emerald-500/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {project.title}
                          </h3>

                          {project.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] text-yellow-400">
                              <Star size={11} />
                              Featured
                            </span>
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {project.description || "No description added."}
                        </p>
                      </div>

                      <FolderKanban
                        size={19}
                        className="shrink-0 text-emerald-400"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(project.techStack || []).slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-[#1c2a37] px-2 py-1 text-[11px] text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex gap-4">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400"
                        >
                          <FaGithub size={13} />
                          GitHub
                        </a>
                      )}

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400"
                        >
                          <ExternalLink size={13} />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Skills Overview */}
          <section className="rounded-2xl border border-[#263747] bg-[#101923] p-5 sm:p-6">
            <SectionHeader
              title="Skills Overview"
              subtitle="Your learning progress"
              action="Manage skills"
              onAction={() => onNavigate("skills")}
            />

            {recentSkills.length === 0 ? (
              <div className="py-10 text-center">
                <GraduationCap
                  size={32}
                  className="mx-auto mb-3 text-gray-500"
                />
                <p className="font-semibold">No skills added</p>
                <p className="mt-1 text-sm text-gray-500">
                  Start tracking your skills.
                </p>
                <button
                  onClick={() => onNavigate("skills")}
                  className="mt-4 text-sm font-semibold text-emerald-400"
                >
                  Add a Skill <ArrowRight size={14} className="inline" />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 rounded-xl bg-[#0c141e] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        Average Progress
                      </p>
                      <p className="mt-1 text-3xl font-bold text-white">
                        {averageSkillProgress}%
                      </p>
                    </div>
                    <TrendingUp size={27} className="text-emerald-400" />
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${averageSkillProgress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  {recentSkills.map((item) => (
                    <div key={item.skillId}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {item.skill?.name || "Unnamed skill"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.skill?.category || item.level}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-emerald-400">
                          {item.progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, item.progress)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Learning Goals */}
          <section className="rounded-2xl border border-[#263747] bg-[#101923] p-5 sm:p-6">
            <SectionHeader
              title="Learning Goals"
              subtitle="Keep moving towards your targets"
              action="View goals"
              onAction={() => onNavigate("learning")}
            />

            {recentGoals.length === 0 ? (
              <div className="py-10 text-center">
                <Target
                  size={32}
                  className="mx-auto mb-3 text-gray-500"
                />
                <p className="font-semibold">No learning goals yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Set a goal and start learning.
                </p>
                <button
                  onClick={() => onNavigate("learning")}
                  className="mt-4 text-sm font-semibold text-emerald-400"
                >
                  Create a Goal <ArrowRight size={14} className="inline" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-xl border border-[#283847] bg-[#0c141e] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-white">
                        {goal.title}
                      </h3>

                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] ${getStatusColor(
                          goal.status
                        )}`}
                      >
                        {getStatusLabel(goal.status)}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {goal.description || "No description added."}
                    </p>

                    <p className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <CalendarDays size={14} />
                      Target: {formatDate(goal.targetDate)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Deadlines */}
          <section className="rounded-2xl border border-[#263747] bg-[#101923] p-5 sm:p-6">
            <SectionHeader
              title="Upcoming Deadlines"
              subtitle="Goals that need your attention"
              action="All goals"
              onAction={() => onNavigate("learning")}
            />

            {upcomingGoals.length === 0 ? (
              <div className="rounded-xl bg-[#0c141e] px-4 py-9 text-center">
                <CheckCircle2
                  size={29}
                  className="mx-auto mb-3 text-emerald-400"
                />
                <p className="font-semibold">You're all caught up!</p>
                <p className="mt-1 text-sm text-gray-500">
                  No upcoming learning deadlines.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 rounded-xl bg-[#0c141e] p-4"
                  >
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                      <CalendarDays size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {goal.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(goal.targetDate)}
                      </p>
                    </div>

                    <Circle
                      size={10}
                      className="shrink-0 fill-blue-400 text-blue-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Quick Actions */}
        <section className="mt-8 rounded-2xl border border-[#263747] bg-[#101923] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
            <p className="mt-1 text-sm text-gray-500">
              Jump straight into your workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "My Projects",
                desc: "Manage your work",
                icon: FolderKanban,
                page: "projects" as const,
              },
              {
                title: "My Skills",
                desc: "Track your growth",
                icon: GraduationCap,
                page: "skills" as const,
              },
              {
                title: "Learning Goals",
                desc: "Plan your learning",
                icon: BookOpen,
                page: "learning" as const,
              },
              {
                title: "GitHub Analytics",
                desc: "Explore your activity",
                icon: Zap,
                page: "github" as const,
              },
            ].map((action) => (
              <button
                key={action.title}
                onClick={() => onNavigate(action.page)}
                className="group flex items-center gap-3 rounded-xl border border-[#2a3948] bg-[#0c141e] p-4 text-left transition hover:border-emerald-500/50 hover:bg-[#14221e]"
              >
                <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-400 transition group-hover:bg-emerald-500 group-hover:text-black">
                  <action.icon size={21} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {action.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {action.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-500">
          <p>Keep building. Keep learning. Keep growing. 🚀</p>
          <p>
            <CheckCircle2 size={13} className="mr-1 inline text-emerald-400" />
            Dashboard connected to your account
          </p>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
