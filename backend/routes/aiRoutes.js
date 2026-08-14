const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const {
  AIServiceError,
  analyzeJobDescription,
  analyzeResumeMatch,
  generateApplicationCopilot,
} = require("../services/aiService");
const { extractResumeText, isSupportedResume } = require("../services/resumeParser");

const router = express.Router();
const MAX_JOB_DESCRIPTION_LENGTH = 20000;
const MAX_RESUME_LENGTH = 50000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function handleUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError)
    return res.status(400).json({
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Resume files must be 5 MB or smaller."
          : "Unable to upload that resume.",
    });
  next(error);
}

router.post("/analyze-job", authMiddleware, async (req, res) => {
  const { jobDescription } = req.body;
  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    return res.status(400).json({ message: "Please paste a job description to analyze." });
  }
  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    return res
      .status(400)
      .json({ message: "Job descriptions must be 20,000 characters or fewer." });
  }
  try {
    const analysis = await analyzeJobDescription(jobDescription.trim());
    res.json({ analysis });
  } catch (error) {
    const status = error instanceof AIServiceError ? error.status : 500;
    res.status(status).json({
      message: error instanceof Error ? error.message : "Unable to analyze this job description.",
    });
  }
});

router.post(
  "/analyze-resume",
  authMiddleware,
  upload.single("resume"),
  handleUploadError,
  async (req, res) => {
    try {
      if (req.file && !isSupportedResume(req.file))
        return res.status(400).json({ message: "Please upload a PDF, DOCX, or TXT resume." });
      const uploadedText = req.file ? await extractResumeText(req.file) : "";
      const resumeText =
        typeof req.body.resumeText === "string" && req.body.resumeText.trim()
          ? req.body.resumeText.trim()
          : uploadedText.trim();
      const jobDescription =
        typeof req.body.jobDescription === "string" ? req.body.jobDescription.trim() : "";
      if (!resumeText)
        return res.status(400).json({ message: "Upload a resume or paste its text to continue." });
      if (!jobDescription)
        return res.status(400).json({ message: "Please paste a job description to analyze." });
      if (resumeText.length > MAX_RESUME_LENGTH)
        return res.status(400).json({ message: "Resume text must be 50,000 characters or fewer." });
      if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH)
        return res
          .status(400)
          .json({ message: "Job descriptions must be 20,000 characters or fewer." });
      const analysis = await analyzeResumeMatch(resumeText, jobDescription);
      res.json({ analysis });
    } catch (error) {
      const status = error instanceof AIServiceError ? error.status : 500;
      res.status(status).json({
        message: error instanceof Error ? error.message : "Unable to analyze your resume.",
      });
    }
  },
);

router.post("/application-copilot", authMiddleware, async (req, res) => {
  const resumeText = typeof req.body.resumeText === "string" ? req.body.resumeText.trim() : "";
  const jobDescription =
    typeof req.body.jobDescription === "string" ? req.body.jobDescription.trim() : "";
  if (!resumeText)
    return res.status(400).json({ message: "Please paste your resume to continue." });
  if (!jobDescription)
    return res.status(400).json({ message: "Please paste a job description to continue." });
  if (resumeText.length > MAX_RESUME_LENGTH)
    return res.status(400).json({ message: "Resume text must be 50,000 characters or fewer." });
  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH)
    return res
      .status(400)
      .json({ message: "Job descriptions must be 20,000 characters or fewer." });
  try {
    const kit = await generateApplicationCopilot(resumeText, jobDescription);
    res.json({ kit });
  } catch (error) {
    const status = error instanceof AIServiceError ? error.status : 500;
    res.status(status).json({
      message: error instanceof Error ? error.message : "Unable to prepare your application.",
    });
  }
});

module.exports = router;
