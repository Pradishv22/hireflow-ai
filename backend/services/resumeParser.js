const path = require("path");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");
const { AIServiceError } = require("./aiService");

const allowedExtensions = new Set([".pdf", ".docx", ".txt"]);

function isSupportedResume(file) {
  return Boolean(
    file && allowedExtensions.has(path.extname(file.originalname || "").toLowerCase()),
  );
}

async function extractResumeText(file) {
  if (!isSupportedResume(file))
    throw new AIServiceError("Please upload a PDF, DOCX, or TXT resume.", 400);
  try {
    const extension = path.extname(file.originalname).toLowerCase();
    if (extension === ".txt") return file.buffer.toString("utf8");
    if (extension === ".docx") return (await mammoth.extractRawText({ buffer: file.buffer })).value;
    const parser = new PDFParse({ data: file.buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  } catch {
    throw new AIServiceError(
      "We couldn't read that resume file. Try pasting its text instead.",
      400,
    );
  }
}

module.exports = { extractResumeText, isSupportedResume };
