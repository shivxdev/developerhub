import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
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
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 5000;

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing.");
}

const databaseUrl =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Database connection URL is missing.");
}

if (isProduction) {
  app.set("trust proxy", 1);
}

// PostgreSQL connection pool for persistent sessions
const { Pool } = pg;

const sessionPool = new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

sessionPool.on("error", (error) => {
  console.error("Session database pool error:", error.message);
});

const PgSession = connectPgSimple(session);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    store: new PgSession({
      pool: sessionPool,
      tableName: "session",
      createTableIfMissing: true,
      pruneSessionInterval: 60 * 15,
    }),
    name: "developerhub.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// API Routes
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/auth", authRouter);
app.use("/api/github", githubRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/learning-goals", learningGoalsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/resumes", resumesRouter);

// Welcome
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to DeveloperHub API",
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DeveloperHub backend is running!",
    timestamp: new Date().toISOString(),
  });
});

// Database Test
app.get("/api/db-test", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "PostgreSQL connected successfully!",
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed!",
    });
  }
});

app.listen(PORT, () => {
  console.log(`DeveloperHub API running on port ${PORT}`);
});
