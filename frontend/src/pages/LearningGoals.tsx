
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Edit3,
  Flag,
  Loader2,
  Plus,
  Search,
  Target,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000";

type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

interface LearningGoal {
  id: string;
  title: string;
  description?: string | null;
  targetDate?: string | null;
  status: GoalStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface GoalForm {
  title: string;
  description: string;
  targetDate: string;
  status: GoalStatus;
}

interface LearningGoalsProps {
  onBack: () => void;
}

const emptyForm: GoalForm = {
  title: "",
  description: "",
  targetDate: "",
  status: "NOT_STARTED",
};

const statusLabels: Record<GoalStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

function formatDate(date?: string | null) {
  if (!date) return "No deadline";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Invalid date";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDateOnly(date?: string | null) {
  if (!date) return "";
  return date.slice(0, 10);
}

function isOverdue(goal: LearningGoal) {
  if (!goal.targetDate || goal.status === "COMPLETED") return false;

  const deadline = new Date(`${getDateOnly(goal.targetDate)}T23:59:59`);
  return deadline.getTime() < Date.now();
}

function getDaysLeft(date?: string | null) {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(`${getDateOnly(date)}T00:00:00`);
  if (Number.isNaN(deadline.getTime())) return null;

  return Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function LearningGoals({ onBack }: LearningGoalsProps) {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);
  const [form, setForm] = useState<GoalForm>(emptyForm);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/learning-goals`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load learning goals.");
      }

      setGoals(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(
      (goal) => goal.status === "COMPLETED"
    ).length;
    const inProgress = goals.filter(
      (goal) => goal.status === "IN_PROGRESS"
    ).length;
    const overdue = goals.filter(isOverdue).length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate:
        total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        goal.title.toLowerCase().includes(search.toLowerCase()) ||
        (goal.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || goal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [goals, search, statusFilter]);

  const openAddForm = () => {
    setEditingGoal(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (goal: LearningGoal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description || "",
      targetDate: getDateOnly(goal.targetDate),
      status: goal.status,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGoal(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a goal title.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const url = editingGoal
        ? `${API_URL}/api/learning-goals/${editingGoal.id}`
        : `${API_URL}/api/learning-goals`;

      const response = await fetch(url, {
        method: editingGoal ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          targetDate: form.targetDate || null,
          status: form.status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save learning goal.");
      }

      closeForm();
      await fetchGoals();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save learning goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (goal: LearningGoal) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${goal.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/learning-goals/${goal.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete goal.");
      }

      setGoals((current) =>
        current.filter((item) => item.id !== goal.id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete goal."
      );
    }
  };

  const updateStatus = async (
    goal: LearningGoal,
    status: GoalStatus
  ) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/learning-goals/${goal.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update status.");
      }

      setGoals((current) =>
        current.map((item) =>
          item.id === goal.id ? { ...item, status } : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update status."
      );
    }
  };

  const getStatusStyle = (status: GoalStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getDeadlineLabel = (goal: LearningGoal) => {
    if (!goal.targetDate) return "No deadline";
    if (isOverdue(goal)) return "Overdue";

    const days = getDaysLeft(goal.targetDate);

    if (days === null) return "No deadline";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    if (days < 0) return "Overdue";

    return `${days} days left`;
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-400"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <Target className="text-emerald-400" size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Learning Goals
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Set targets, stay consistent, and track your growth.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06120d] transition hover:bg-emerald-400"
          >
            <Plus size={18} />
            Add New Goal
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.07] bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Goals</span>
              <Target className="text-emerald-400" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold">{stats.total}</p>
            <p className="mt-1 text-xs text-slate-500">All your learning targets</p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">In Progress</span>
              <Clock3 className="text-blue-400" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold">{stats.inProgress}</p>
            <p className="mt-1 text-xs text-slate-500">Goals you're working on</p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Completed</span>
              <CheckCircle2 className="text-emerald-400" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold">{stats.completed}</p>
            <p className="mt-1 text-xs text-slate-500">Goals you've achieved</p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#111827] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Overdue</span>
              <Flag className="text-rose-400" size={20} />
            </div>
            <p className="mt-4 text-3xl font-bold">{stats.overdue}</p>
            <p className="mt-1 text-xs text-slate-500">Goals past their deadline</p>
          </div>
        </div>

        {/* Completion overview */}
        <div className="mb-8 rounded-2xl border border-white/[0.07] bg-[#111827] p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Overall Progress</h2>
              <p className="mt-1 text-xs text-slate-400">
                Your completed goals compared to all goals
              </p>
            </div>
            <span className="text-2xl font-bold text-emerald-400">
              {stats.completionRate}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {stats.completed} of {stats.total} goals completed
          </p>
        </div>

        {/* Goals section */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111827] p-5 sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-semibold">Your Goals</h2>
              <p className="mt-1 text-sm text-slate-400">
                Manage your learning roadmap.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search goals..."
                  className="w-full rounded-xl border border-white/10 bg-[#0b1220] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500/50 sm:w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0b1220] px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-emerald-500/50"
              >
                <option value="ALL">All Status</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={28} className="animate-spin text-emerald-400" />
              <p className="text-sm">Loading your learning goals...</p>
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl border border-white/10 bg-[#0b1220] p-5">
                <Target size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold">
                {goals.length === 0 ? "No goals yet" : "No matching goals"}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                {goals.length === 0
                  ? "Start building your learning roadmap by adding your first goal."
                  : "Try changing your search or status filter."}
              </p>
              {goals.length === 0 && (
                <button
                  onClick={openAddForm}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#06120d] hover:bg-emerald-400"
                >
                  <Plus size={17} />
                  Create Your First Goal
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredGoals.map((goal) => {
                const overdue = isOverdue(goal);
                const deadlineLabel = getDeadlineLabel(goal);

                return (
                  <div
                    key={goal.id}
                    className="rounded-xl border border-white/[0.07] bg-[#0b1220] p-5 transition hover:border-emerald-500/25"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-emerald-500/10 p-2">
                          {goal.status === "COMPLETED" ? (
                            <CheckCircle2
                              size={19}
                              className="text-emerald-400"
                            />
                          ) : goal.status === "IN_PROGRESS" ? (
                            <Clock3 size={19} className="text-blue-400" />
                          ) : (
                            <Circle size={19} className="text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-semibold text-white">
                            {goal.title}
                          </h3>
                          <span
                            className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusStyle(
                              goal.status
                            )}`}
                          >
                            {statusLabels[goal.status]}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => openEditForm(goal)}
                          title="Edit goal"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(goal)}
                          title="Delete goal"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                        {goal.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays size={15} />
                        <span>{formatDate(goal.targetDate)}</span>
                        {goal.targetDate && (
                          <span
                            className={
                              overdue
                                ? "font-medium text-rose-400"
                                : goal.status === "COMPLETED"
                                  ? "text-emerald-400"
                                  : "text-slate-500"
                            }
                          >
                            · {goal.status === "COMPLETED" ? "Achieved" : deadlineLabel}
                          </span>
                        )}
                      </div>

                      <select
                        aria-label={`Update status for ${goal.title}`}
                        value={goal.status}
                        onChange={(e) =>
                          updateStatus(goal, e.target.value as GoalStatus)
                        }
                        className="max-w-36 rounded-lg border border-white/10 bg-[#111827] px-2.5 py-2 text-xs text-slate-300 outline-none focus:border-emerald-500/50"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingGoal ? "Edit Learning Goal" : "Create Learning Goal"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Define what you want to learn next.
                </p>
              </div>
              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Goal Title <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Master React and TypeScript"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Add some details about this learning goal..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) =>
                      setForm({ ...form, targetDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as GoalStatus,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06120d] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : editingGoal ? (
                    <Check size={17} />
                  ) : (
                    <Plus size={17} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingGoal
                      ? "Save Changes"
                      : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
