
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to DeveloperHub API",
  });
});

// API test route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DeveloperHub backend is running!",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DeveloperHub API running on port ${PORT}`);
});
