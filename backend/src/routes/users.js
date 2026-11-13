
import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

// CREATE USER
router.post("/", async (req, res) => {
  try {
    const { name, email, bio, location } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        bio: bio?.trim() || null,
        location: location?.trim() || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: user,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
});

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// GET SINGLE USER
router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

// UPDATE USER
router.patch("/:id", async (req, res) => {
  try {
    const { name, email, bio, location, avatarUrl } = req.body;

    const data = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      data.name = name.trim();
    }

    if (email !== undefined) data.email = email?.trim() || null;
    if (bio !== undefined) data.bio = bio?.trim() || null;
    if (location !== undefined) data.location = location?.trim() || null;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl?.trim() || null;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });

    res.json({
      success: true,
      message: "User updated successfully!",
      data: user,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
});

export default router;
