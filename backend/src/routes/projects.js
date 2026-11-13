
import express from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// Protect every project route
router.use(requireAuth);

// CREATE PROJECT
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      techStack,
      githubUrl,
      liveUrl,
      isFeatured,
    } = req.body;

    // User identity comes only from the authenticated session
    const userId = req.session.userId;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required",
      });
    }

    if (
      techStack !== undefined &&
      (!Array.isArray(techStack) ||
        !techStack.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Tech stack must be an array of strings",
      });
    }

    const project = await prisma.project.create({
      data: {
        userId,
        title: title.trim(),
        description:
          typeof description === "string" ? description.trim() || null : null,
        techStack: techStack || [],
        githubUrl:
          typeof githubUrl === "string" ? githubUrl.trim() || null : null,
        liveUrl:
          typeof liveUrl === "string" ? liveUrl.trim() || null : null,
        isFeatured: isFeatured ?? false,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully!",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
});

// GET ALL LOGGED-IN USER PROJECTS
router.get("/", async (req, res) => {
  try {
    const userId = req.session.userId;

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Fetch projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
});

// GET SINGLE PROJECT (OWNER ONLY)
router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.session.userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Fetch project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
});

// UPDATE PROJECT (OWNER ONLY)
router.patch("/:id", async (req, res) => {
  try {
    const {
      title,
      description,
      techStack,
      githubUrl,
      liveUrl,
      isFeatured,
    } = req.body;

    const data = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Project title cannot be empty",
        });
      }
      data.title = title.trim();
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Description must be a string",
        });
      }
      data.description = description?.trim() || null;
    }

    if (techStack !== undefined) {
      if (
        !Array.isArray(techStack) ||
        !techStack.every((item) => typeof item === "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Tech stack must be an array of strings",
        });
      }
      data.techStack = techStack;
    }

    if (githubUrl !== undefined) {
      if (githubUrl !== null && typeof githubUrl !== "string") {
        return res.status(400).json({
          success: false,
          message: "GitHub URL must be a string",
        });
      }
      data.githubUrl = githubUrl?.trim() || null;
    }

    if (liveUrl !== undefined) {
      if (liveUrl !== null && typeof liveUrl !== "string") {
        return res.status(400).json({
          success: false,
          message: "Live URL must be a string",
        });
      }
      data.liveUrl = liveUrl?.trim() || null;
    }

    if (isFeatured !== undefined) {
      if (typeof isFeatured !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isFeatured must be true or false",
        });
      }
      data.isFeatured = isFeatured;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    // Update only if this project belongs to the logged-in user
    const result = await prisma.project.updateMany({
      where: {
        id: req.params.id,
        userId: req.session.userId,
      },
      data,
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const updatedProject = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        userId: req.session.userId,
      },
    });

    return res.json({
      success: true,
      message: "Project updated successfully!",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
});

// DELETE PROJECT (OWNER ONLY)
router.delete("/:id", async (req, res) => {
  try {
    const result = await prisma.project.deleteMany({
      where: {
        id: req.params.id,
        userId: req.session.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      message: "Project deleted successfully!",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
});

export default router;
