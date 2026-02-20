const express = require("express");
const { validateAnalyzeInput } = require("../middleware/validateInput");
const { analyzeHandler, analyzeTextHandler, analyzeFormHandler } = require("../controllers/analyzeController");

const router = express.Router();

// Photo-based analysis
router.post("/analyze", validateAnalyzeInput, analyzeHandler);

// Text prompt analysis (no photo)
router.post("/analyze-text", analyzeTextHandler);

// Form-based analysis (no photo)
router.post("/analyze-form", analyzeFormHandler);

module.exports = router;
