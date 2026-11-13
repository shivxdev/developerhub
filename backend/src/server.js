
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

import prisma from "./config/prisma.js";
import usersRouter from "./routes/users.js";
import projectsRouter from "./routes/projects.js";
import authRouter from "./routes/auth.js";
import githubRouter from "./routes/github.js";
import skillsRouter from "./routes/skills.js";
import learningGoalsRouter from "./routes/learningGoals.js";
import profileRouter from "./routes/profile.js";
import resumesRouter from "./routes/resumes.js";

dotenv.config();

const app = express();

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing in backend/.env");
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Session middleware
app.use(
  session({
    name: "developerhub.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// API routes
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/auth", authRouter);
app.use("/api/github", githubRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/learning-goals", learningGoalsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/resumes", resumesRouter);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to DeveloperHub API",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DeveloperHub backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Database connection test
app.get("/api/db-test", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "PostgreSQL connected successfully!",
      database: "developerhub_db",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed!",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DeveloperHub API running on port ${PORT}`);
});
