
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Plus,
  Code2,
  Layers,
  TrendingUp,
  Search,
  X,
  Loader2,
  BookOpen,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
} from "lucide-react";

const API_URL = "http://localhost:5000";

interface Skill {
  skillId: string;
  id?: string;
  name?: string;
  category?: string | null;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  progress?: number;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  notes?: string | null;
}

interface SkillsProps {
  onBack: () => void;
}

interface SkillForm {
  name: string;
  category: string;
  level: string;
  progress: number;
  status: string;
  notes: string;
}

const emptyForm: SkillForm = {
  name: "",
  category: "Frontend",
  level: "BEGINNER",
  progress: 0,
  status: "NOT_STARTED",
  notes: "",
};

const levelColors: Record<string, string> = {
  BEGINNER: "text-blue-400 bg-blue-400/10",
  INTERMEDIATE: "text-yellow-400 bg-yellow-400/10",
  ADVANCED: "text-purple-400 bg-purple-400/10",
  EXPERT: "text-emerald-400 bg-emerald-400/10",
};

function Skills({ onBack }: SkillsProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [error, setError] = useState("");
  const [form, setForm] = useState<SkillForm>(emptyForm);

  // FETCH SKILLS
  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/skills`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch skills");
      }

      const receivedSkills = Array.isArray(result.data)
        ? result.data
        : [];

      const formattedSkills: Skill[] = receivedSkills.map(
        (item: any) => ({
          skillId: item.skillId ?? item.skill?.id ?? item.id,
          id: item.id,
          name: item.skill?.name ?? item.name ?? "Unnamed Skill",
          category: item.skill?.category ?? item.category ?? "Other",
          level: item.level ?? "BEGINNER",
          progress: Number(item.progress) || 0,
          status: item.status ?? "NOT_STARTED",
          notes: item.notes ?? null,
        })
      );

      setSkills(formattedSkills);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // RESET FORM
  const closeForm = () => {
    setShowForm(false);
    setEditingSkill(null);
    setForm(emptyForm);
    setError("");
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    setEditingSkill(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);

    setForm({
      name: skill.name || "",
      category: skill.category || "Other",
      level: skill.level || "BEGINNER",
      progress: Number(skill.progress) || 0,
      status: skill.status || "NOT_STARTED",
      notes: skill.notes || "",
    });

    setError("");
    setShowForm(true);
  };

  // ADD OR UPDATE SKILL
  const handleSaveSkill = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter a skill name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingSkill);

      const url = isEditing
        ? `${API_URL}/api/skills/${editingSkill?.skillId}`
        : `${API_URL}/api/skills`;

      const body = isEditing
        ? {
            level: form.level,
            progress: Number(form.progress),
            status: form.status,
            notes: form.notes,
          }
        : {
            ...form,
            name: form.name.trim(),
            progress: Number(form.progress),
          };

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save skill"
        );
      }

      closeForm();
      await fetchSkills();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE SKILL
  const handleDeleteSkill = async (skill: Skill) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(skill.skillId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/skills/${skill.skillId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete skill"
        );
      }

      await fetchSkills();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // CATEGORY FILTER OPTIONS
  const categories = [
    "All",
    ...new Set(
      skills.map((skill) => skill.category || "Other")
    ),
  ];

  // SEARCH AND FILTER
  const filteredSkills = skills.filter((skill) => {
    const skillName = (skill.name ?? "").toLowerCase();
    const skillCategory = (skill.category ?? "Other").toLowerCase();
    const searchValue = search.toLowerCase();

    const matchesSearch =
      skillName.includes(searchValue) ||
      skillCategory.includes(searchValue);

    const matchesCategory =
      categoryFilter === "All" ||
      (skill.category || "Other") === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // STATISTICS
  const completedSkills = skills.filter(
    (skill) => skill.status === "COMPLETED"
  ).length;

  const inProgressSkills = skills.filter(
    (skill) => skill.status === "IN_PROGRESS"
  ).length;

  const averageProgress = skills.length
    ? Math.round(
        skills.reduce(
          (total, skill) =>
            total + (Number(skill.progress) || 0),
          0
        ) / skills.length
      )
    : 0;

  return (
    <main className="min-h-screen bg-[#080d14] px-5 py-8 text-[#e6edf3] lg:px-10">
      <div className="mx-auto max-w-[1400px]">

        {/* HEADER */}
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="mb-5 flex items-center gap-2 text-sm text-gray-400 transition hover:text-emerald-400"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              My <span className="text-emerald-400">Skills</span>
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Track your technical skills and monitor your learning progress.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black transition hover:bg-emerald-400"
          >
            <Plus size={19} />
            Add New Skill
          </button>
        </header>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Skills",
              value: skills.length,
              icon: Code2,
              color: "text-emerald-400",
            },
            {
              label: "In Progress",
              value: inProgressSkills,
              icon: TrendingUp,
              color: "text-blue-400",
            },
            {
              label: "Completed",
              value: completedSkills,
              icon: CheckCircle2,
              color: "text-purple-400",
            },
            {
              label: "Average Progress",
              value: `${averageProgress}%`,
              icon: Layers,
              color: "text-yellow-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#273442] bg-[#101923] p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {stat.label}
                </p>

                <stat.icon size={21} className={stat.color} />
              </div>

              <p className="text-3xl font-extrabold">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* SEARCH AND CATEGORY FILTER */}
        <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#273442] bg-[#101923] p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your skills..."
              className="w-full rounded-xl border border-[#354454] bg-[#080d14] py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 text-sm outline-none focus:border-emerald-400"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </section>

        {/* SKILL LIST */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Your Learning Journey
            </h2>

            <span className="text-sm text-gray-500">
              {filteredSkills.length} skills
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2
                className="animate-spin text-emerald-400"
                size={32}
              />
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#354454] bg-[#101923] px-5 py-16 text-center">
              <BookOpen
                size={42}
                className="mx-auto mb-4 text-emerald-400"
              />

              <h3 className="text-xl font-bold">
                {skills.length
                  ? "No skills found"
                  : "Start building your skill set"}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                {skills.length
                  ? "Try changing your search or category filter."
                  : "Add your first skill and start tracking your progress."}
              </p>

              {!skills.length && (
                <button
                  onClick={openAddForm}
                  className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black"
                >
                  <Plus size={17} className="mr-2 inline" />
                  Add Your First Skill
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSkills.map((skill, index) => (
                <article
                  key={skill.skillId || skill.id || index}
                  className="rounded-2xl border border-[#273442] bg-[#101923] p-5 transition hover:border-emerald-500/50"
                >
                  {/* CARD HEADER AND ACTIONS */}
                  <div className="mb-5 flex items-start justify-between gap-2">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Code2 size={24} />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          levelColors[skill.level || "BEGINNER"] ||
                          levelColors.BEGINNER
                        }`}
                      >
                        {(skill.level || "BEGINNER").replace("_", " ")}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleEditSkill(skill)}
                        title="Edit Skill"
                        className="rounded-lg border border-blue-400/20 bg-blue-400/10 p-2 text-blue-400 transition hover:bg-blue-400/20"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill)}
                        disabled={deletingId === skill.skillId}
                        title="Delete Skill"
                        className="rounded-lg border border-red-400/20 bg-red-400/10 p-2 text-red-400 transition hover:bg-red-400/20 disabled:opacity-50"
                      >
                        {deletingId === skill.skillId ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SKILL DETAILS */}
                  <h3 className="text-xl font-bold">
                    {skill.name || "Unnamed Skill"}
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    {skill.category || "Other"}
                  </p>

                  {/* PROGRESS */}
                  <div className="mt-6 flex justify-between text-sm">
                    <span className="text-gray-400">
                      Learning progress
                    </span>

                    <span className="font-bold text-emerald-400">
                      {Number(skill.progress) || 0}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#263442]">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(skill.progress) || 0)
                        )}%`,
                      }}
                    />
                  </div>

                  {/* STATUS */}
                  <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
                    {skill.status === "COMPLETED" ? (
                      <CheckCircle2
                        size={15}
                        className="text-emerald-400"
                      />
                    ) : skill.status === "IN_PROGRESS" ? (
                      <TrendingUp
                        size={15}
                        className="text-blue-400"
                      />
                    ) : (
                      <Circle size={15} />
                    )}

                    {(skill.status || "NOT_STARTED").replaceAll("_", " ")}
                  </div>

                  {/* NOTES */}
                  {skill.notes && (
                    <p className="mt-4 border-t border-[#273442] pt-4 text-sm leading-6 text-gray-400">
                      {skill.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveSkill}
            className="my-auto w-full max-w-xl rounded-2xl border border-[#354454] bg-[#101923] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingSkill ? "Edit Skill" : "Add New Skill"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {editingSkill
                    ? "Update your learning progress and details."
                    : "Add a skill to your developer profile."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-4">

              {/* SKILL NAME */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Skill Name
                </label>

                <input
                  required
                  disabled={Boolean(editingSkill)}
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. React, Python, Java"
                  className="w-full rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {editingSkill && (
                  <p className="mt-1 text-xs text-gray-500">
                    Skill name cannot be changed here.
                  </p>
                )}
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Category
                </label>

                <select
                  disabled={Boolean(editingSkill)}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {[
                    "Frontend",
                    "Backend",
                    "Programming",
                    "Database",
                    "DevOps",
                    "Tools",
                    "Other",
                  ].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                {editingSkill && (
                  <p className="mt-1 text-xs text-gray-500">
                    Category cannot be changed here.
                  </p>
                )}
              </div>

              {/* LEVEL */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Proficiency Level
                </label>

                <select
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 outline-none focus:border-emerald-400"
                >
                  {[
                    "BEGINNER",
                    "INTERMEDIATE",
                    "ADVANCED",
                    "EXPERT",
                  ].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* PROGRESS */}
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <label className="text-gray-300">
                    Learning Progress
                  </label>

                  <span className="font-bold text-emerald-400">
                    {form.progress}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      progress: Number(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Learning Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 outline-none focus:border-emerald-400"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* NOTES */}
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Notes (Optional)
                </label>

                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="What are you learning?"
                  className="w-full resize-none rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 rounded-xl border border-[#354454] px-4 py-3 font-semibold text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="mr-2 inline animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingSkill ? (
                      <CheckCircle2
                        size={17}
                        className="mr-2 inline"
                      />
                    ) : (
                      <Plus size={17} className="mr-2 inline" />
                    )}

                    {editingSkill ? "Update Skill" : "Save Skill"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

export default Skills;
