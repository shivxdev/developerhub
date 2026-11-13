
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  FolderKanban,
  Star,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Globe,
  Code2,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/projects`;

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectForm {
  title: string;
  description: string;
  techStack: string;
  githubUrl: string;
  liveUrl: string;
  isFeatured: boolean;
}

interface ProjectsProps {
  userId: string;
  onBack: () => void;
}

const emptyForm: ProjectForm = {
  title: "",
  description: "",
  techStack: "",
  githubUrl: "",
  liveUrl: "",
  isFeatured: false,
};

function Projects({ userId, onBack }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [error, setError] = useState("");

  // Fetch projects belonging to the authenticated user
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}?userId=${encodeURIComponent(userId)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch projects.");
      }

      setProjects(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  // Search projects
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter((project) => {
      const titleMatch = project.title.toLowerCase().includes(query);

      const descriptionMatch = (
        project.description || ""
      ).toLowerCase().includes(query);

      const techMatch = project.techStack.some((tech) =>
        tech.toLowerCase().includes(query)
      );

      return titleMatch || descriptionMatch || techMatch;
    });
  }, [projects, search]);

  const featuredCount = projects.filter(
    (project) => project.isFeatured
  ).length;

  // Open Add Project modal
  const handleAddProject = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  // Open Edit Project modal
  const handleEditProject = (project: Project) => {
    setEditingProject(project);

    setForm({
      title: project.title,
      description: project.description || "",
      techStack: project.techStack.join(", "),
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      isFeatured: project.isFeatured,
    });

    setError("");
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProject(null);
    setForm(emptyForm);
    setError("");
  };

  // Update form fields
  const handleChange = (
    field: keyof ProjectForm,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Create or update project
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Project title is required.");
      return;
    }

    const techStack = form.techStack
      .split(",")
      .map((tech) => tech.trim())
      .filter(Boolean);

    const payload = {
      userId,
      title: form.title.trim(),
      description: form.description.trim(),
      techStack,
      githubUrl: form.githubUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      isFeatured: form.isFeatured,
    };

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingProject);

      const url = isEditing
        ? `${API_URL}/${editingProject!.id}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Unable to ${isEditing ? "update" : "create"} project.`
        );
      }

      setShowModal(false);
      setEditingProject(null);
      setForm(emptyForm);

      await fetchProjects();
    } catch (err) {
      console.error("Save project error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete project
  const handleDeleteProject = async (project: Project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${project.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete project.");
      }

      setProjects((previous) =>
        previous.filter((item) => item.id !== project.id)
      );
    } catch (err) {
      console.error("Delete project error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to delete project."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#080d14] text-[#e6edf3]">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#080d14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-5 py-5 lg:px-10">

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="rounded-lg border border-gray-700 p-2 transition hover:border-emerald-400 hover:text-emerald-400"
              aria-label="Back to home"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="flex items-center gap-2 text-xl font-bold">
              <Code2 className="text-emerald-400" size={29} />
              Developer<span className="text-emerald-400">Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 sm:px-4 sm:text-sm">
            <FaGithub size={15} />
            Connected
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-[1450px] px-5 py-10 lg:px-10">

        {/* Page Heading */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-400">
              <FolderKanban size={17} />
              Developer Workspace
            </div>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              My Projects<span className="text-emerald-400">.</span>
            </h1>

            <p className="mt-3 text-sm text-gray-400 sm:text-base">
              Manage, organize and showcase your development work.
            </p>
          </div>

          <button
            onClick={handleAddProject}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-[#06120c] shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400"
          >
            <Plus size={19} />
            Add Project
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-[#273442] bg-[#101720] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Total Projects</p>
              <FolderKanban className="text-emerald-400" size={21} />
            </div>

            <p className="text-3xl font-bold">{projects.length}</p>

            <p className="mt-2 text-xs text-gray-500">
              Projects in your workspace
            </p>
          </div>

          <div className="rounded-2xl border border-[#273442] bg-[#101720] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Featured Projects</p>
              <Star className="text-yellow-400" size={21} />
            </div>

            <p className="text-3xl font-bold">{featuredCount}</p>

            <p className="mt-2 text-xs text-gray-500">
              Your highlighted work
            </p>
          </div>

          <div className="rounded-2xl border border-[#273442] bg-[#101720] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">Technologies</p>
              <Code2 className="text-blue-400" size={21} />
            </div>

            <p className="text-3xl font-bold">
              {new Set(projects.flatMap((project) => project.techStack)).size}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Unique technologies used
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-xl font-bold">Your Workspace</h2>
            <p className="mt-1 text-sm text-gray-500">
              All your projects in one place.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search projects or technologies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-[#293847] bg-[#101923] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Error */}
        {error && !showModal && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto"
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-gray-400">
            <Loader2 size={35} className="mb-4 animate-spin text-emerald-400" />
            <p>Loading your projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (

          /* Empty State */
          <div className="flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#354454] bg-[#101720]/50 px-5 text-center">

            <div className="mb-5 rounded-2xl bg-emerald-500/10 p-5 text-emerald-400">
              <FolderKanban size={38} />
            </div>

            <h3 className="text-xl font-bold">
              {search ? "No matching projects found" : "No projects yet"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
              {search
                ? "Try searching with another project name or technology."
                : "Start building your developer portfolio by adding your first project."}
            </p>

            {!search && (
              <button
                onClick={handleAddProject}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black transition hover:bg-emerald-400"
              >
                <Plus size={18} />
                Create Your First Project
              </button>
            )}
          </div>

        ) : (

          /* Project Cards */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col rounded-2xl border border-[#293847] bg-[#101923] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/20"
              >

                {/* Card Header */}
                <div className="mb-4 flex items-start justify-between gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <FolderKanban size={22} />
                  </div>

                  <div className="flex items-center gap-2">
                    {project.isFeatured && (
                      <span className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[11px] font-medium text-yellow-400">
                        <Star size={12} />
                        Featured
                      </span>
                    )}

                    <button
                      onClick={() => handleEditProject(project)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-emerald-500/10 hover:text-emerald-400"
                      aria-label="Edit project"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Delete project"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                {/* Project Details */}
                <h3 className="text-lg font-bold transition group-hover:text-emerald-400">
                  {project.title}
                </h3>

                <p className="mt-3 min-h-[60px] text-sm leading-6 text-gray-400">
                  {project.description || "No description added yet."}
                </p>

                {/* Tech Stack */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.techStack.map((tech, index) => (
                    <span
                      key={`${tech}-${index}`}
                      className="rounded-lg border border-[#354454] bg-[#172331] px-2.5 py-1 text-xs text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}

                  {project.techStack.length === 0 && (
                    <span className="text-xs text-gray-500">
                      No technologies added
                    </span>
                  )}
                </div>

                <div className="mt-auto border-t border-[#293847] pt-4">

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-3">

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-gray-300 transition hover:text-emerald-400"
                      >
                        <FaGithub size={15} />
                        Source Code
                        <ExternalLink size={12} />
                      </a>
                    )}

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-gray-300 transition hover:text-emerald-400"
                      >
                        <Globe size={15} />
                        Live Demo
                        <ExternalLink size={12} />
                      </a>
                    )}

                  </div>

                  <p className="mt-4 text-[11px] text-gray-500">
                    Added {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>

              </div>
            ))}

          </div>
        )}

        {/* Search result count */}
        {!loading && projects.length > 0 && (
          <p className="mt-6 text-xs text-gray-500">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="my-auto w-full max-w-xl rounded-2xl border border-[#354454] bg-[#101923] shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#293847] p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  {editingProject
                    ? "Update your project details."
                    : "Add a new project to your workspace."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close modal"
              >
                <X size={21} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Project Title <span className="text-red-400">*</span>
                </label>

                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. DeveloperHub"
                  value={form.title}
                  onChange={(event) =>
                    handleChange("title", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Description
                </label>

                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="Describe what your project does..."
                  value={form.description}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
                  }
                  className="w-full resize-none rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
                />
              </div>

              {/* Tech Stack */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Technologies
                </label>

                <input
                  type="text"
                  placeholder="React, Node.js, PostgreSQL"
                  value={form.techStack}
                  onChange={(event) =>
                    handleChange("techStack", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Separate technologies with commas.
                </p>
              </div>

              {/* GitHub URL */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  <FaGithub />
                  GitHub Repository URL
                </label>

                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={form.githubUrl}
                  onChange={(event) =>
                    handleChange("githubUrl", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
                />
              </div>

              {/* Live URL */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Globe size={16} />
                  Live Demo URL
                </label>

                <input
                  type="url"
                  placeholder="https://yourproject.com"
                  value={form.liveUrl}
                  onChange={(event) =>
                    handleChange("liveUrl", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#354454] bg-[#080d14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500"
                />
              </div>

              {/* Featured */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#354454] bg-[#080d14] p-4">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    handleChange("isFeatured", event.target.checked)
                  }
                  className="h-4 w-4 accent-emerald-500"
                />

                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Star size={15} className="text-yellow-400" />
                    Feature this project
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Highlight this project in your developer profile.
                  </p>
                </div>
              </label>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#354454] px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      {editingProject ? "Update Project" : "Create Project"}
                    </>
                  )}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Projects;
