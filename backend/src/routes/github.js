
import express from "express";
import prisma from "../config/prisma.js";
import { decryptToken } from "../utils/encryption.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

const GITHUB_API = "https://api.github.com";

// Helper: Make authenticated GitHub API requests
async function githubRequest(endpoint, accessToken) {
  const response = await fetch(`${GITHUB_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "DeveloperHub",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "GitHub API request failed"
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

// GET GITHUB OVERVIEW
router.get("/overview", async (req, res) => {
  try {
    const userId = req.session.userId;

    // Find authenticated user's GitHub account
    const githubAccount = await prisma.gitHubAccount.findUnique({
      where: { userId },
      select: {
        username: true,
        accessToken: true,
      },
    });

    if (!githubAccount || !githubAccount.accessToken) {
      return res.status(404).json({
        success: false,
        message: "GitHub account or access token not found.",
      });
    }

    // Decrypt stored GitHub access token
    const accessToken = decryptToken(githubAccount.accessToken);

    // Fetch GitHub profile
    const profile = await githubRequest("/user", accessToken);

    // Fetch public repositories (up to 1000)
    let repositories = [];

    for (let page = 1; page <= 10; page++) {
      const pageRepositories = await githubRequest(
        `/user/repos?visibility=public&affiliation=owner&sort=updated&per_page=100&page=${page}`,
        accessToken
      );

      repositories = repositories.concat(pageRepositories);

      if (pageRepositories.length < 100) {
        break;
      }
    }

    // Calculate repository statistics
    const totalStars = repositories.reduce(
      (total, repo) => total + repo.stargazers_count,
      0
    );

    const totalForks = repositories.reduce(
      (total, repo) => total + repo.forks_count,
      0
    );

    // Count repositories by primary language
    const languageCounts = {};

    repositories.forEach((repo) => {
      if (repo.language) {
        languageCounts[repo.language] =
          (languageCounts[repo.language] || 0) + 1;
      }
    });

    const languages = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Return only useful repository information
    const formattedRepositories = repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      homepage: repo.homepage,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
    }));

    return res.json({
      success: true,
      message: "GitHub overview fetched successfully!",
      data: {
        profile: {
          username: profile.login,
          name: profile.name,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          profileUrl: profile.html_url,
          followers: profile.followers,
          following: profile.following,
          publicRepos: profile.public_repos,
          publicGists: profile.public_gists,
        },
        stats: {
          totalRepositories: repositories.length,
          totalStars,
          totalForks,
          totalLanguages: languages.length,
        },
        languages,
        repositories: formattedRepositories,
      },
    });
  } catch (error) {
    console.error("GitHub overview error:", error);

    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        message: "GitHub token is invalid or expired. Please reconnect GitHub.",
      });
    }

    if (error.status === 403 || error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "GitHub API rate limit reached. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to fetch GitHub overview.",
    });
  }
});

export default router;
