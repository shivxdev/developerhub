
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Download,
  Pencil,
  Loader2,
  Sparkles,
  CalendarDays,
  AlertCircle,
  Save,
  Eye,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  User,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
};

type Education = {
  degree: string;
  institution: string;
  year: string;
  details: string;
};

type Experience = {
  role: string;
  company: string;
  duration: string;
  description: string;
};

type Project = {
  name: string;
  techStack: string;
  link: string;
  description: string;
};

type Certification = {
  name: string;
  issuer: string;
  year: string;
};

type ResumeData = {
  title: string;
  template: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  certifications: Certification[];
};

type Resume = ResumeData & {
  id: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  onBack: () => void;
};

const templates = [
  { id: "modern", name: "Modern", description: "Clean and contemporary" },
  { id: "professional", name: "Professional", description: "Classic professional look" },
  { id: "minimal", name: "Minimal", description: "Simple and elegant" },
  { id: "creative", name: "Creative", description: "Stand out with style" },
];

const emptyPersonalInfo: PersonalInfo = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
};

const emptyResume: ResumeData = {
  title: "My Resume",
  template: "modern",
  personalInfo: { ...emptyPersonalInfo },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
};

const inputClass =
  "w-full bg-[#0b1120] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500 transition placeholder:text-gray-600";

const sectionHeading =
  "flex items-center gap-2 text-lg font-semibold text-white mb-4";

export default function ResumeBuilder({ onBack }: Props) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResume);
  const [showPreview, setShowPreview] = useState(true);

  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/resumes`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load resumes.");
      }

      setResumes(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const createResume = async () => {
    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/api/resumes`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emptyResume,
          personalInfo: {},
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not create resume.");
      }

      setMessage("Resume created successfully!");
      await fetchResumes();
      await openEditor(result.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  const openEditor = async (id: string) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/api/resumes/${id}`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not open resume.");
      }

      const data = result.data;

      setResumeData({
        title: data.title || "My Resume",
        template: data.template || "modern",
        personalInfo: {
          ...emptyPersonalInfo,
          ...(data.personalInfo || {}),
        },
        summary: data.summary || "",
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
        certifications: Array.isArray(data.certifications)
          ? data.certifications
          : [],
      });

      setEditingId(id);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open resume.");
    }
  };

  const saveResume = async () => {
    if (!editingId) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/api/resumes/${editingId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not save resume.");
      }

      setMessage("Resume saved successfully!");
      await fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save resume.");
    } finally {
      setSaving(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API_URL}/api/resumes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not delete resume.");
      }

      setResumes((previous) => previous.filter((resume) => resume.id !== id));
      setMessage("Resume deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete resume.");
    }
  };

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setResumeData((previous) => ({
      ...previous,
      personalInfo: {
        ...previous.personalInfo,
        [field]: value,
      },
    }));
  };

  const updateArrayItem = <
    K extends "education" | "experience" | "projects" | "certifications"
  >(
    key: K,
    index: number,
    field: keyof ResumeData[K][number],
    value: string
  ) => {
    setResumeData((previous) => {
      const items = [...previous[key]] as Array<Record<string, string>>;
      items[index] = { ...items[index], [field]: value };

      return {
        ...previous,
        [key]: items,
      };
    });
  };

  const addArrayItem = (
    key: "education" | "experience" | "projects" | "certifications"
  ) => {
    const defaults = {
      education: {
        degree: "",
        institution: "",
        year: "",
        details: "",
      },
      experience: {
        role: "",
        company: "",
        duration: "",
        description: "",
      },
      projects: {
        name: "",
        techStack: "",
        link: "",
        description: "",
      },
      certifications: {
        name: "",
        issuer: "",
        year: "",
      },
    };

    setResumeData((previous) => ({
      ...previous,
      [key]: [...previous[key], defaults[key]],
    }));
  };

  const removeArrayItem = (
    key: "education" | "experience" | "projects" | "certifications",
    index: number
  ) => {
    setResumeData((previous) => ({
      ...previous,
      [key]: previous[key].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setResumeData((previous) => {
      const skills = [...previous.skills];
      skills[index] = value;
      return { ...previous, skills };
    });
  };

  const addSkill = () => {
    setResumeData((previous) => ({
      ...previous,
      skills: [...previous.skills, ""],
    }));
  };

  const removeSkill = (index: number) => {
    setResumeData((previous) => ({
      ...previous,
      skills: previous.skills.filter((_, i) => i !== index),
    }));
  };

  const exportPDF = () => {
    window.print();
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const info = resumeData.personalInfo;

  const previewTheme = {
    modern: "border-t-4 border-emerald-500",
    professional: "border-t-4 border-slate-700",
    minimal: "border-t-2 border-gray-400",
    creative: "border-t-4 border-purple-500",
  }[resumeData.template] || "border-t-4 border-emerald-500";

  const previewAccent = {
    modern: "text-emerald-700",
    professional: "text-slate-800",
    minimal: "text-gray-700",
    creative: "text-purple-700",
  }[resumeData.template] || "text-emerald-700";

  const renderPreview = () => (
    <div
      className={`print-area bg-white text-gray-800 rounded-xl shadow-2xl p-7 md:p-10 min-h-[800px] ${previewTheme}`}
    >
      <div className="border-b border-gray-200 pb-5 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 break-words">
          {info.fullName || "Your Name"}
        </h1>

        <p className={`text-sm mt-2 ${previewAccent}`}>
          {[info.email, info.phone, info.location]
            .filter(Boolean)
            .join("  •  ") || "Email • Phone • Location"}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
          {[info.website, info.linkedin, info.github]
            .filter(Boolean)
            .map((item) => (
              <span key={item}>{item}</span>
            ))}
        </div>
      </div>

      {resumeData.summary && (
        <section className="mb-6">
          <h2 className={`font-bold uppercase tracking-wider text-sm mb-2 ${previewAccent}`}>
            Professional Summary
          </h2>
          <p className="text-sm leading-6 whitespace-pre-wrap">
            {resumeData.summary}
          </p>
        </section>
      )}

      {resumeData.experience.length > 0 && (
        <section className="mb-6">
          <h2 className={`font-bold uppercase tracking-wider text-sm border-b border-gray-200 pb-2 mb-3 ${previewAccent}`}>
            Experience
          </h2>
          {resumeData.experience.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-bold text-sm">{item.role || "Role"}</h3>
                <span className="text-xs text-gray-500">{item.duration}</span>
              </div>
              <p className="text-sm italic text-gray-600">{item.company}</p>
              <p className="text-sm leading-6 mt-1 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      )}

      {resumeData.education.length > 0 && (
        <section className="mb-6">
          <h2 className={`font-bold uppercase tracking-wider text-sm border-b border-gray-200 pb-2 mb-3 ${previewAccent}`}>
            Education
          </h2>
          {resumeData.education.map((item, index) => (
            <div key={index} className="mb-3">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-bold text-sm">{item.degree || "Degree"}</h3>
                <span className="text-xs text-gray-500">{item.year}</span>
              </div>
              <p className="text-sm text-gray-600">{item.institution}</p>
              {item.details && (
                <p className="text-sm mt-1">{item.details}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {resumeData.projects.length > 0 && (
        <section className="mb-6">
          <h2 className={`font-bold uppercase tracking-wider text-sm border-b border-gray-200 pb-2 mb-3 ${previewAccent}`}>
            Projects
          </h2>
          {resumeData.projects.map((item, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-bold text-sm">{item.name || "Project Name"}</h3>
              {item.techStack && (
                <p className="text-xs text-gray-500 mt-1">{item.techStack}</p>
              )}
              {item.description && (
                <p className="text-sm leading-6 mt-1 whitespace-pre-wrap">
                  {item.description}
                </p>
              )}
              {item.link && (
                <p className="text-xs text-blue-700 mt-1">{item.link}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {resumeData.skills.some((skill) => skill.trim()) && (
        <section className="mb-6">
          <h2 className={`font-bold uppercase tracking-wider text-sm border-b border-gray-200 pb-2 mb-3 ${previewAccent}`}>
            Technical Skills
          </h2>
          <p className="text-sm leading-6">
            {resumeData.skills.filter((skill) => skill.trim()).join(" • ")}
          </p>
        </section>
      )}

      {resumeData.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className={`font-bold uppercase tracking-wider text-sm border-b border-gray-200 pb-2 mb-3 ${previewAccent}`}>
            Certifications
          </h2>
          {resumeData.certifications.map((item, index) => (
            <div key={index} className="mb-2 flex flex-wrap justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sm">{item.name || "Certification"}</h3>
                <p className="text-xs text-gray-600">{item.issuer}</p>
              </div>
              <span className="text-xs text-gray-500">{item.year}</span>
            </div>
          ))}
        </section>
      )}

      {!resumeData.summary &&
        resumeData.experience.length === 0 &&
        resumeData.education.length === 0 &&
        resumeData.projects.length === 0 &&
        resumeData.skills.length === 0 &&
        resumeData.certifications.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            Your resume preview will appear here as you add information.
          </p>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1120] text-white px-5 py-8 md:px-10">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            body {
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body * {
              visibility: hidden !important;
            }

            .print-area,
            .print-area * {
              visibility: visible !important;
            }

            .print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              min-height: auto !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              padding: 0 !important;
              color: #222 !important;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto">
        {editingId ? (
          <>
            <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
              <div>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setError("");
                    setMessage("");
                    fetchResumes();
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition mb-4"
                >
                  <ArrowLeft size={18} />
                  Back to Resumes
                </button>

                <h1 className="text-2xl md:text-3xl font-bold">
                  Resume Editor
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Edit your details and watch your resume preview update live.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPreview((value) => !value)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm"
                >
                  <Eye size={17} />
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>

                <button
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 text-sm"
                >
                  <Download size={17} />
                  Export PDF
                </button>

                <button
                  onClick={saveResume}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving..." : "Save Resume"}
                </button>
              </div>
            </div>

            {error && (
              <div className="no-print flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-5">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {message && (
              <div className="no-print bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-4 mb-5">
                {message}
              </div>
            )}

            <div className={`grid grid-cols-1 ${showPreview ? "xl:grid-cols-2" : ""} gap-6 items-start`}>
              {/* Editor */}
              <div className="no-print space-y-6">
                <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                  <h2 className={sectionHeading}>
                    <FileText className="text-emerald-400" size={20} />
                    Resume Settings
                  </h2>

                  <label className="block text-sm text-gray-400 mb-2">
                    Resume Title
                  </label>
                  <input
                    className={inputClass}
                    value={resumeData.title}
                    onChange={(e) =>
                      setResumeData((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="My Developer Resume"
                  />

                  <label className="block text-sm text-gray-400 mt-4 mb-2">
                    Choose Template
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() =>
                          setResumeData((p) => ({
                            ...p,
                            template: template.id,
                          }))
                        }
                        className={`p-3 rounded-lg border text-left transition ${
                          resumeData.template === template.id
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/10 bg-[#0b1120] hover:border-white/30"
                        }`}
                      >
                        <span className="block text-sm font-semibold">
                          {template.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                  <h2 className={sectionHeading}>
                    <User className="text-emerald-400" size={20} />
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        ["fullName", "Full Name"],
                        ["email", "Email"],
                        ["phone", "Phone"],
                        ["location", "Location"],
                        ["website", "Website URL"],
                        ["linkedin", "LinkedIn URL"],
                        ["github", "GitHub URL"],
                      ] as [keyof PersonalInfo, string][]
                    ).map(([field, label]) => (
                      <div key={field}>
                        <label className="block text-xs text-gray-400 mb-1.5">
                          {label}
                        </label>
                        <input
                          className={inputClass}
                          value={info[field]}
                          onChange={(e) =>
                            updatePersonalInfo(field, e.target.value)
                          }
                          placeholder={label}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                  <h2 className={sectionHeading}>
                    <FileText className="text-emerald-400" size={20} />
                    Professional Summary
                  </h2>
                  <textarea
                    rows={5}
                    className={inputClass}
                    value={resumeData.summary}
                    onChange={(e) =>
                      setResumeData((p) => ({ ...p, summary: e.target.value }))
                    }
                    placeholder="Write a short professional summary about yourself..."
                  />
                </div>

                {/* Education */}
                <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={sectionHeading}>
                      <GraduationCap className="text-emerald-400" size={20} />
                      Education
                    </h2>
                    <button
                      onClick={() => addArrayItem("education")}
                      className="text-emerald-400 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {resumeData.education.map((item, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-4 mb-3">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold">Education {index + 1}</span>
                        <button onClick={() => removeArrayItem("education", index)} className="text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(["degree", "institution", "year"] as const).map((field) => (
                          <input
                            key={field}
                            className={inputClass}
                            placeholder={
                              field === "degree" ? "Degree / Course" :
                              field === "institution" ? "Institution" : "Year"
                            }
                            value={item[field]}
                            onChange={(e) => updateArrayItem("education", index, field, e.target.value)}
                          />
                        ))}
                        <textarea
                          className={inputClass}
                          rows={2}
                          placeholder="Additional details"
                          value={item.details}
                          onChange={(e) => updateArrayItem("education", index, "details", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {resumeData.education.length === 0 && (
                    <p className="text-sm text-gray-500">No education added yet.</p>
                  )}
                </div>

                {/* Experience */}
                <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={sectionHeading}>
                      <Briefcase className="text-emerald-400" size={20} />
                      Experience
                    </h2>
                    <button
                      onClick={() => addArrayItem("experience")}
                      className="text-emerald-400 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {resumeData.experience.map((item, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-4 mb-3">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold">Experience {index + 1}</span>
                        <button onClick={() => removeArrayItem("experience", index)} className="text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(["role", "company", "duration"] as const).map((field) => (
                          <input
                            key={field}
                            className={inputClass}
                            placeholder={
                              field === "role" ? "Job Title / Role" :
                              field === "company" ? "Company" : "Duration"
                            }
                            value={item[field]}
                            onChange={(e) => updateArrayItem("experience", index, field, e.target.value)}
                          />
                        ))}
                        <textarea
                          className={inputClass}
                          rows={3}
                          placeholder="Describe your responsibilities and achievements"
                          value={item.description}
                          onChange={(e) => updateArrayItem("experience", index, "description", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {resumeData.experience.length === 0 && (
                    <p className="text-sm text-gray-500">No experience added yet.</p>
                  )}
                </div>

                {/* Projects */}
                <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={sectionHeading}>
                      <Code2 className="text-emerald-400" size={20} />
                      Projects
                    </h2>
                    <button
                      onClick={() => addArrayItem("projects")}
                      className="text-emerald-400 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {resumeData.projects.map((item, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-4 mb-3">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold">Project {index + 1}</span>
                        <button onClick={() => removeArrayItem("projects", index)} className="text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(["name", "techStack", "link"] as const).map((field) => (
                          <input
                            key={field}
                            className={inputClass}
                            placeholder={
                              field === "name" ? "Project Name" :
                              field === "techStack" ? "Technologies Used" : "Project URL"
                            }
                            value={item[field]}
                            onChange={(e) => updateArrayItem("projects", index, field, e.target.value)}
                          />
                        ))}
                        <textarea
                          className={inputClass}
                          rows={3}
                          placeholder="Project description"
                          value={item.description}
                          onChange={(e) => updateArrayItem("projects", index, "description", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  {resumeData.projects.length === 0 && (
                    <p className="text-sm text-gray-500">No projects added yet.</p>
                  )}
                </div>

                {/* Skills */}
                <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={sectionHeading}>
                      <Sparkles className="text-emerald-400" size={20} />
                      Skills
                    </h2>
                    <button
                      onClick={addSkill}
                      className="text-emerald-400 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Skill
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className={inputClass}
                          value={skill}
                          placeholder="e.g. React.js"
                          onChange={(e) => updateSkill(index, e.target.value)}
                        />
                        <button
                          onClick={() => removeSkill(index)}
                          className="text-red-400 px-2"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {resumeData.skills.length === 0 && (
                    <p className="text-sm text-gray-500">Add your technical and soft skills.</p>
                  )}
                </div>

                {/* Certifications */}
                <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={sectionHeading}>
                      <Award className="text-emerald-400" size={20} />
                      Certifications
                    </h2>
                    <button
                      onClick={() => addArrayItem("certifications")}
                      className="text-emerald-400 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {resumeData.certifications.map((item, index) => (
                    <div key={index} className="border border-white/10 rounded-xl p-4 mb-3">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold">Certification {index + 1}</span>
                        <button onClick={() => removeArrayItem("certifications", index)} className="text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(["name", "issuer", "year"] as const).map((field) => (
                          <input
                            key={field}
                            className={inputClass}
                            placeholder={
                              field === "name" ? "Certification Name" :
                              field === "issuer" ? "Issuing Organization" : "Year"
                            }
                            value={item[field]}
                            onChange={(e) => updateArrayItem("certifications", index, field, e.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {resumeData.certifications.length === 0 && (
                    <p className="text-sm text-gray-500">No certifications added yet.</p>
                  )}
                </div>

                <button
                  onClick={saveResume}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? "Saving Changes..." : "Save Resume"}
                </button>
              </div>

              {/* Live Preview */}
              {showPreview && (
                <div className="xl:sticky xl:top-6">
                  <div className="no-print flex items-center justify-between mb-3">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Eye size={18} className="text-emerald-400" />
                      Live Preview
                    </h2>
                    <span className="text-xs text-gray-500">A4 document</span>
                  </div>
                  {renderPreview()}
                </div>
              )}
            </div>

            {!showPreview && (
              <div className="no-print hidden">
                {renderPreview()}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
              <div>
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition mb-5"
                >
                  <ArrowLeft size={18} />
                  Back to Home
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Resume Builder</h1>
                    <p className="text-gray-400 text-sm mt-1">
                      Create and manage your professional resumes.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={createResume}
                disabled={creating}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition disabled:opacity-60"
              >
                {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={19} />}
                {creating ? "Creating..." : "Create Resume"}
              </button>
            </div>

            {error && (
              <div className="no-print flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="no-print bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-4 mb-6">
                {message}
              </div>
            )}

            <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                <p className="text-gray-400 text-sm">Total Resumes</p>
                <h2 className="text-3xl font-bold mt-2">{resumes.length}</h2>
              </div>

              <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                <p className="text-gray-400 text-sm">Default Resume</p>
                <h2 className="text-xl font-semibold mt-3">
                  {resumes.find((resume) => resume.isDefault)?.title || "Not set"}
                </h2>
              </div>

              <div className="bg-[#111c30] border border-white/5 rounded-2xl p-5">
                <p className="text-gray-400 text-sm">Available Templates</p>
                <h2 className="text-3xl font-bold mt-2">{templates.length}</h2>
              </div>
            </div>

            <div className="no-print mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">My Resumes</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Your saved resume documents
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
              </span>
            </div>

            {loading ? (
              <div className="no-print flex justify-center items-center py-24 text-emerald-400">
                <Loader2 size={32} className="animate-spin" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="no-print border border-dashed border-gray-700 rounded-2xl py-20 px-5 text-center bg-[#111c30]/50">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5">
                  <FileText size={30} />
                </div>
                <h3 className="text-xl font-bold mb-2">No resumes yet</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Create your first resume and start building your professional identity.
                </p>
                <button
                  onClick={createResume}
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition disabled:opacity-60"
                >
                  <Plus size={18} />
                  Create Your First Resume
                </button>
              </div>
            ) : (
              <div className="no-print grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="bg-[#111c30] border border-white/5 hover:border-emerald-500/40 rounded-2xl p-6 transition group"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <FileText size={25} />
                      </div>

                      {resume.isDefault && (
                        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Default
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 break-words">
                      {resume.title}
                    </h3>

                    <p className="text-sm text-gray-400 capitalize mb-4">
                      {resume.template} template
                    </p>

                    {resume.summary ? (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-5">
                        {resume.summary}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic mb-5">
                        No summary added yet
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
                      <CalendarDays size={14} />
                      Updated {formatDate(resume.updatedAt)}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                      <button
                        onClick={() => openEditor(resume.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => openEditor(resume.id)}
                        title="Open resume preview and export PDF"
                        className="p-2.5 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition"
                      >
                        <Download size={17} />
                      </button>

                      <button
                        onClick={() => deleteResume(resume.id)}
                        title="Delete resume"
                        className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="no-print mt-14">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="text-emerald-400" size={21} />
                <h2 className="text-xl font-bold">Available Templates</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-[#111c30] border border-white/5 rounded-xl p-5 hover:border-emerald-500/30 transition"
                  >
                    <div className="h-24 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-white/5 flex items-center justify-center mb-4">
                      <FileText size={34} className="text-emerald-400" />
                    </div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
