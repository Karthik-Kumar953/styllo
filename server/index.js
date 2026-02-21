require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express");
const path = require("path");
const cors = require("cors");
const analyzeRoutes = require("./src/routes/analyze");
const adminRoutes = require("./src/routes/admin");
const { connectDB } = require("./src/config/db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api", analyzeRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Production: serve React client build ──
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDist));

  // All non-API routes → React's index.html (client-side routing)
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`✨ Styllo API running on port ${PORT}`);
});
