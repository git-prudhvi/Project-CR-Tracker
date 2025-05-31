const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const crRoutes = require("./routes/crRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint with API information
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CR Tracker API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      crs: "/api/crs",
      tasks: "/api/tasks",
      users: "/api/users"
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CR Tracker API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/crs", crRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 CR Tracker API running on port ${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
