
import express from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// Username validation
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

// URL validation
const isValidUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// Get logged-in user's profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        location: true,
        username: true,
        headline: true,
        websiteUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        isPublic: true,
        createdAt: true,
        githubAccount: {
          select: {
            username: true,
            profileUrl: true,
          },
        },
        projects: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            techStack: true,
            githubUrl: true,
            liveUrl: true,
            isFeatured: true,
            createdAt: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
    });
  }
});

// Update logged-in user's profile
router.put("/", requireAuth, async (req, res) => {
  try {
    const {
      name,
      username,
      headline,
      bio,
      location,
      avatarUrl,
      websiteUrl,
      linkedinUrl,
      twitterUrl,
      isPublic,
    } = req.body;

    // Validate name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 1 and 100 characters.",
        });
      }
    }

    // Validate username
    if (username !== undefined && username !== null) {
      if (
        typeof username !== "string" ||
        !usernameRegex.test(username.trim())
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Username must be 3-20 characters and contain only letters, numbers, and underscores.",
        });
      }
    }

    // Public profiles must have a username
    if (isPublic === true && username === undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: req.session.userId },
        select: { username: true },
      });

      if (!currentUser?.username) {
        return res.status(400).json({
          success: false,
          message: "Set a username before making your profile public.",
        });
      }
    }

    // Validate text fields
    const textFields = [
      { value: headline, name: "Headline", max: 150 },
      { value: bio, name: "Bio", max: 500 },
      { value: location, name: "Location", max: 100 },
    ];

    for (const field of textFields) {
      if (
        field.value !== undefined &&
        field.value !== null &&
        (typeof field.value !== "string" ||
          field.value.length > field.max)
      ) {
        return res.status(400).json({
          success: false,
          message: `${field.name} cannot exceed ${field.max} characters.`,
        });
      }
    }

    // Validate URLs
    const urlFields = [
      { value: avatarUrl, name: "Avatar URL" },
      { value: websiteUrl, name: "Website URL" },
      { value: linkedinUrl, name: "LinkedIn URL" },
      { value: twitterUrl, name: "Twitter URL" },
    ];

    for (const field of urlFields) {
      if (
        field.value !== undefined &&
        field.value !== null &&
        field.value !== "" &&
        !isValidUrl(field.value)
      ) {
        return res.status(400).json({
          success: false,
          message: `${field.name} must be a valid HTTP or HTTPS URL.`,
        });
      }
    }

    if (isPublic !== undefined && typeof isPublic !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isPublic must be a boolean value.",
      });
    }

    const data = {};

    if (name !== undefined) data.name = name.trim();
    if (username !== undefined) {
      data.username = username ? username.trim().toLowerCase() : null;
    }
    if (headline !== undefined) data.headline = headline?.trim() || null;
    if (bio !== undefined) data.bio = bio?.trim() || null;
    if (location !== undefined) data.location = location?.trim() || null;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null;
    if (websiteUrl !== undefined) data.websiteUrl = websiteUrl || null;
    if (linkedinUrl !== undefined) data.linkedinUrl = linkedinUrl || null;
    if (twitterUrl !== undefined) data.twitterUrl = twitterUrl || null;
    if (isPublic !== undefined) data.isPublic = isPublic;

    // Prevent publishing without a username
    if (data.isPublic === true && data.username === null) {
      return res.status(400).json({
        success: false,
        message: "A username is required for a public profile.",
      });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { username: true },
    });

    if (
      isPublic === true &&
      username === undefined &&
      !currentUser?.username
    ) {
      return res.status(400).json({
        success: false,
        message: "Set a username before making your profile public.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.session.userId },
      data,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        location: true,
        username: true,
        headline: true,
        websiteUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        isPublic: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This username is already taken.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
});

// Get public developer profile by username
router.get("/:username", async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        username,
        isPublic: true,
      },
      select: {
        name: true,
        avatarUrl: true,
        bio: true,
        location: true,
        username: true,
        headline: true,
        websiteUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        createdAt: true,
        githubAccount: {
          select: {
            username: true,
            profileUrl: true,
          },
        },
        projects: {
          orderBy: [
            { isFeatured: "desc" },
            { createdAt: "desc" },
          ],
          select: {
            id: true,
            title: true,
            description: true,
            techStack: true,
            githubUrl: true,
            liveUrl: true,
            isFeatured: true,
          },
        },
        skills: {
          select: {
            level: true,
            progress: true,
            status: true,
            skill: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Public developer profile not found.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Public profile error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch public profile.",
    });
  }
});

export default router;
