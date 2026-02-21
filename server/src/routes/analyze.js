const express = require("express");
const { validateAnalyzeInput } = require("../middleware/validateInput");
const { analyzeHandler, analyzeTextHandler, analyzeFormHandler, decodeOutfitHandler, decodeOutfitImageHandler, trendRadarHandler } = require("../controllers/analyzeController");

const router = express.Router();

// Photo-based analysis
router.post("/analyze", validateAnalyzeInput, analyzeHandler);

// Text prompt analysis (no photo)
router.post("/analyze-text", analyzeTextHandler);

// Form-based analysis (no photo)
router.post("/analyze-form", analyzeFormHandler);

// Decode any outfit (text-based)
router.post("/decode-outfit", decodeOutfitHandler);

// Decode any outfit (image-based — vision AI)
router.post("/decode-outfit-image", decodeOutfitImageHandler);

// Personalized trend radar
router.post("/trends", trendRadarHandler);

module.exports = router;
