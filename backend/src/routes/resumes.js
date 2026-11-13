
import express from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

const allowedTemplates = [
  "modern",
  "professional",
  "minimal",
  "creative",
];

const isObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value);

const isArray = (value) => Array.isArray(value);

const getResumeById = async (id, userId) => {
  return prisma.resume.findFirst({
    where: {
      id,
      userId,
    },
  });
};

// GET all resumes
router.get("/", async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.session.userId },
      orderBy: [
        { isDefault: "desc" },
        { updatedAt: "desc" },
      ],
    });

    res.json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    console.error("Fetch resumes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resumes",
    });
  }
});

// CREATE resume
router.post("/", async (req, res) => {
  try {
    const {
      title,
      template,
      isDefault,
      personalInfo,
      summary,
      education,
      experience,
      projects,
      skills,
      certifications,
    } = req.body;

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      return res.status(400).json({
        success: false,
        message: "Resume title must be a non-empty string",
      });
    }

    if (template !== undefined && !allowedTemplates.includes(template)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume template",
      });
    }

    if (personalInfo !== undefined && !isObject(personalInfo)) {
      return res.status(400).json({
        success: false,
        message: "Personal information must be an object",
      });
    }

    for (const [field, value] of Object.entries({
      education,
      experience,
      projects,
      skills,
      certifications,
    })) {
      if (value !== undefined && !isArray(value)) {
        return res.status(400).json({
          success: false,
          message: `${field} must be an array`,
        });
      }
    }

    if (summary !== undefined && summary !== null && typeof summary !== "string") {
      return res.status(400).json({
        success: false,
        message: "Summary must be a string",
      });
    }

    if (isDefault !== undefined && typeof isDefault !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isDefault must be a boolean",
      });
    }

    const userId = req.session.userId;

    const resumeCount = await prisma.resume.count({
      where: { userId },
    });

    const shouldBeDefault = isDefault === true || resumeCount === 0;

    const resume = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.resume.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.resume.create({
        data: {
          userId,
          title: title?.trim() || "My Resume",
          template: template || "modern",
          isDefault: shouldBeDefault,
          personalInfo: personalInfo ?? {},
          summary: summary ?? null,
          education: education ?? [],
          experience: experience ?? [],
          projects: projects ?? [],
          skills: skills ?? [],
          certifications: certifications ?? [],
        },
      });
    });

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      data: resume,
    });
  } catch (error) {
    console.error("Create resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create resume",
    });
  }
});

// GET single resume
router.get("/:id", async (req, res) => {
  try {
    const resume = await getResumeById(
      req.params.id,
      req.session.userId
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error("Fetch resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
    });
  }
});

// UPDATE resume
router.put("/:id", async (req, res) => {
  try {
    const userId = req.session.userId;

    const existingResume = await getResumeById(
      req.params.id,
      userId
    );

    if (!existingResume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const {
      title,
      template,
      isDefault,
      personalInfo,
      summary,
      education,
      experience,
      projects,
      skills,
      certifications,
    } = req.body;

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      return res.status(400).json({
        success: false,
        message: "Resume title must be a non-empty string",
      });
    }

    if (template !== undefined && !allowedTemplates.includes(template)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume template",
      });
    }

    if (personalInfo !== undefined && !isObject(personalInfo)) {
      return res.status(400).json({
        success: false,
        message: "Personal information must be an object",
      });
    }

    for (const [field, value] of Object.entries({
      education,
      experience,
      projects,
      skills,
      certifications,
    })) {
      if (value !== undefined && !isArray(value)) {
        return res.status(400).json({
          success: false,
          message: `${field} must be an array`,
        });
      }
    }

    if (summary !== undefined && summary !== null && typeof summary !== "string") {
      return res.status(400).json({
        success: false,
        message: "Summary must be a string",
      });
    }

    if (isDefault !== undefined && typeof isDefault !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isDefault must be a boolean",
      });
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (template !== undefined) updateData.template = template;
    if (personalInfo !== undefined) updateData.personalInfo = personalInfo;
    if (summary !== undefined) updateData.summary = summary;
    if (education !== undefined) updateData.education = education;
    if (experience !== undefined) updateData.experience = experience;
    if (projects !== undefined) updateData.projects = projects;
    if (skills !== undefined) updateData.skills = skills;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const updatedResume = await prisma.$transaction(async (tx) => {
      if (isDefault === true) {
        await tx.resume.updateMany({
          where: {
            userId,
            id: { not: req.params.id },
          },
          data: { isDefault: false },
        });
      }

      return tx.resume.update({
        where: { id: req.params.id },
        data: updateData,
      });
    });

    res.json({
      success: true,
      message: "Resume updated successfully",
      data: updatedResume,
    });
  } catch (error) {
    console.error("Update resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update resume",
    });
  }
});

// DELETE resume
router.delete("/:id", async (req, res) => {
  try {
    const resume = await getResumeById(
      req.params.id,
      req.session.userId
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    await prisma.resume.delete({
      where: { id: resume.id },
    });

    res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete resume",
    });
  }
});

export default router;
