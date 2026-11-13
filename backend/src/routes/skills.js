
import express from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

const validLevels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

const validStatuses = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
];

// GET ALL USER SKILLS
router.get("/", async (req, res) => {
  try {
    const skills = await prisma.userSkill.findMany({
      where: { userId: req.session.userId },
      include: { skill: true },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Fetch skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch skills",
    });
  }
});

// ADD SKILL
router.post("/", async (req, res) => {
  try {
    const {
      name,
      category,
      level = "BEGINNER",
      progress = 0,
      status = "NOT_STARTED",
      notes,
    } = req.body;

    const userId = req.session.userId;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill level",
      });
    }

    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be an integer between 0 and 100",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid learning status",
      });
    }

    const skillName = name.trim();

    const skill = await prisma.skill.upsert({
      where: { name: skillName },
      update: {
        ...(typeof category === "string" && category.trim()
          ? { category: category.trim() }
          : {}),
      },
      create: {
        name: skillName,
        category:
          typeof category === "string" ? category.trim() || null : null,
      },
    });

    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId: {
          userId,
          skillId: skill.id,
        },
      },
      update: {
        level,
        progress,
        status,
        notes: typeof notes === "string" ? notes.trim() || null : null,
      },
      create: {
        userId,
        skillId: skill.id,
        level,
        progress,
        status,
        notes: typeof notes === "string" ? notes.trim() || null : null,
      },
      include: { skill: true },
    });

    return res.status(201).json({
      success: true,
      message: "Skill added successfully!",
      data: userSkill,
    });
  } catch (error) {
    console.error("Add skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add skill",
    });
  }
});

// UPDATE USER SKILL
router.patch("/:skillId", async (req, res) => {
  try {
    const { level, progress, status, notes } = req.body;

    const data = {};

    if (level !== undefined) {
      if (!validLevels.includes(level)) {
        return res.status(400).json({
          success: false,
          message: "Invalid skill level",
        });
      }
      data.level = level;
    }

    if (progress !== undefined) {
      if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          message: "Progress must be an integer between 0 and 100",
        });
      }
      data.progress = progress;
    }

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid learning status",
        });
      }
      data.status = status;
    }

    if (notes !== undefined) {
      if (notes !== null && typeof notes !== "string") {
        return res.status(400).json({
          success: false,
          message: "Notes must be a string",
        });
      }
      data.notes = notes?.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const result = await prisma.userSkill.updateMany({
      where: {
        skillId: req.params.skillId,
        userId: req.session.userId,
      },
      data,
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const updatedSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId: req.session.userId,
          skillId: req.params.skillId,
        },
      },
      include: { skill: true },
    });

    return res.json({
      success: true,
      message: "Skill updated successfully!",
      data: updatedSkill,
    });
  } catch (error) {
    console.error("Update skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update skill",
    });
  }
});

// DELETE USER SKILL
router.delete("/:skillId", async (req, res) => {
  try {
    const result = await prisma.userSkill.deleteMany({
      where: {
        skillId: req.params.skillId,
        userId: req.session.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    return res.json({
      success: true,
      message: "Skill deleted successfully!",
    });
  } catch (error) {
    console.error("Delete skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete skill",
    });
  }
});

export default router;
