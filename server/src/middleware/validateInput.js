function validateAnalyzeInput(req, res, next) {
  const { skinTone, confidence, gender } = req.body;
  const errors = [];

  if (!skinTone || typeof skinTone !== "string") {
    errors.push("skinTone is required");
  }
  if (confidence === undefined || typeof confidence !== "number" || confidence < 0 || confidence > 1) {
    errors.push("confidence must be a number between 0 and 1");
  }
  if (!gender || typeof gender !== "string") {
    errors.push("gender is required");
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }
  next();
}

module.exports = { validateAnalyzeInput };
