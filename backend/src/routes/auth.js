
import express from "express";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import { encryptToken } from "../utils/encryption.js";

const router = express.Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

const CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL ||
  "http://localhost:5000/api/auth/github/callback";

// Step 1: Start GitHub OAuth
router.get("/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "GitHub OAuth credentials are missing.",
    });
  }

  const state = crypto.randomBytes(32).toString("hex");

  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: CALLBACK_URL,
    scope: "read:user user:email",
    state,
  });

  req.session.save((error) => {
    if (error) {
      console.error("Session save error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to start GitHub login.",
      });
    }

    res.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`
    );
  });
});

// Step 2: GitHub OAuth callback
router.get("/github/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(
        `${FRONTEND_URL}/?authError=${encodeURIComponent(String(error))}`
      );
    }

    if (!code || !state || !req.session.oauthState) {
      return res.status(400).send("Invalid OAuth request.");
    }

    if (state !== req.session.oauthState) {
      return res.status(403).send("OAuth state validation failed.");
    }

    delete req.session.oauthState;

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: String(code),
          redirect_uri: CALLBACK_URL,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(
        tokenData.error_description || "GitHub token exchange failed."
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub profile
    const githubResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "DeveloperHub",
        },
      }
    );

    if (!githubResponse.ok) {
      throw new Error("Unable to fetch GitHub profile.");
    }

    const githubUser = await githubResponse.json();

    // Fetch verified email
    const emailResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "DeveloperHub",
        },
      }
    );

    let verifiedEmail = null;

    if (emailResponse.ok) {
      const emails = await emailResponse.json();

      const primaryEmail = emails.find(
        (item) => item.primary && item.verified
      );

      const anyVerifiedEmail = emails.find(
        (item) => item.verified
      );

      verifiedEmail =
        primaryEmail?.email || anyVerifiedEmail?.email || null;
    }

    const githubId = String(githubUser.id);
    const encryptedAccessToken = encryptToken(accessToken);

    const profileData = {
      name: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url || null,
      bio: githubUser.bio || null,
      location: githubUser.location || null,
    };

    // Check whether this GitHub account already exists
    const existingAccount = await prisma.gitHubAccount.findUnique({
      where: { githubId },
      include: { user: true },
    });

    let user;

    if (existingAccount) {
      // Update existing user and GitHub account
      user = await prisma.user.update({
        where: { id: existingAccount.userId },
        data: {
          ...profileData,
          email: verifiedEmail || existingAccount.user.email,
          githubAccount: {
            update: {
              username: githubUser.login,
              profileUrl: githubUser.html_url,
              accessToken: encryptedAccessToken,
            },
          },
        },
      });
    } else {
      // Try to link an existing user with the verified email
      let existingUser = verifiedEmail
        ? await prisma.user.findUnique({
            where: { email: verifiedEmail },
          })
        : null;

      // Never attach a second GitHub account to an already-linked user
      if (existingUser) {
        const linkedAccount = await prisma.gitHubAccount.findUnique({
          where: { userId: existingUser.id },
        });

        if (linkedAccount) {
          existingUser = null;
        }
      }

      if (existingUser) {
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            ...profileData,
            githubAccount: {
              create: {
                githubId,
                username: githubUser.login,
                profileUrl: githubUser.html_url,
                accessToken: encryptedAccessToken,
              },
            },
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            ...profileData,
            email: verifiedEmail,
            githubAccount: {
              create: {
                githubId,
                username: githubUser.login,
                profileUrl: githubUser.html_url,
                accessToken: encryptedAccessToken,
              },
            },
          },
        });
      }
    }

    // Regenerate session to prevent session fixation
    req.session.regenerate((sessionError) => {
      if (sessionError) {
        console.error("Session regeneration error:", sessionError);

        return res.status(500).send("Unable to create login session.");
      }

      req.session.userId = user.id;

      req.session.save((saveError) => {
        if (saveError) {
          console.error("Session save error:", saveError);

          return res.status(500).send("Unable to save login session.");
        }

        res.redirect(`${FRONTEND_URL}/?login=success`);
      });
    });
  } catch (error) {
    console.error("GitHub authentication error:", error);

    res.redirect(
      `${FRONTEND_URL}/?authError=${encodeURIComponent(
        "github_login_failed"
      )}`
    );
  }
});

// Step 3: Get currently logged-in user
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        location: true,
        createdAt: true,
        githubAccount: {
          select: {
            username: true,
            profileUrl: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Authentication check error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to check authentication.",
    });
  }
});

// Step 4: Logout
router.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to logout.",
      });
    }

   res.clearCookie("developerhub.sid", {
   httpOnly: true,
   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
   secure: process.env.NODE_ENV === "production",
   });

    res.json({
      success: true,
      message: "Logged out successfully.",
    });
  });
});

export default router;
