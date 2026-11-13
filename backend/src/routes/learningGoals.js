
import express from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

const validStatuses = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
];

// GET ALL LEARNING GOALS
router.get("/", async (req, res) => {
  try {
    const goals = await prisma.learningGoal.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error("Fetch goals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch learning goals",
    });
  }
});

// CREATE LEARNING GOAL
router.post("/", async (req, res) => {
  try {
    const { title, description, targetDate, status = "NOT_STARTED" } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Goal title is required",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid learning status",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    let parsedDate = null;

    if (targetDate !== undefined && targetDate !== null && targetDate !== "") {
      parsedDate = new Date(targetDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid target date",
        });
      }
    }

    const goal = await prisma.learningGoal.create({
      data: {
        userId: req.session.userId,
        title: title.trim(),
        description: description?.trim() || null,
        targetDate: parsedDate,
        status,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Learning goal created successfully!",
      data: goal,
    });
  } catch (error) {
    console.error("Create goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create learning goal",
    });
  }
});

// UPDATE LEARNING GOAL
router.patch("/:id", async (req, res) => {
  try {
    const { title, description, targetDate, status } = req.body;
    const data = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Goal title cannot be empty",
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

    if (targetDate !== undefined) {
      if (targetDate === null || targetDate === "") {
        data.targetDate = null;
      } else {
        const parsedDate = new Date(targetDate);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid target date",
          });
        }

        data.targetDate = parsedDate;
      }
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

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const result = await prisma.learningGoal.updateMany({
      where: {
        id: req.params.id,
        userId: req.session.userId,
      },
      data,
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Learning goal not found",
      });
    }

    const updatedGoal = await prisma.learningGoal.findFirst({
      where: {
        id: req.params.id,
        userId: req.session.userId,
      },
    });

    return res.json({
      success: true,
      message: "Learning goal updated successfully!",
      data: updatedGoal,
    });
  } catch (error) {
    console.error("Update goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update learning goal",
    });
  }
});

// DELETE LEARNING GOAL
router.delete("/:id", async (req, res) => {
  try {
    const result = await prisma.learningGoal.deleteMany({
      where: {
        id: req.params.id,
        userId: req.session.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Learning goal not found",
      });
    }

    return res.json({
      success: true,
      message: "Learning goal deleted successfully!",
    });
  } catch (error) {
    console.error("Delete goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete learning goal",
    });
  }
});

export default router;
