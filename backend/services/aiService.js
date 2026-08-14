const { GoogleGenAI, Type } = require("@google/genai");

class AIServiceError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function getProviderStatus(error) {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number(error.status);
    if (Number.isFinite(status)) return status;
  }
  return undefined;
}

function isRateLimited(error, message) {
  return getProviderStatus(error) === 429 || /429|quota|rate limit/i.test(message);
}

function isAuthFailure(error, message) {
  const providerStatus = getProviderStatus(error);
  return providerStatus === 401 || providerStatus === 403 || /api[_\s-]?key|401|403/i.test(message);
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.NUMBER,
      description: "Job match score from 0 to 100.",
    },
    matchingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    missingSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    recommendedSkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    keyRequirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    seniority: {
      type: Type.STRING,
    },
    recommendation: {
      type: Type.STRING,
    },
  },
  required: [
    "matchScore",
    "matchingSkills",
    "missingSkills",
    "recommendedSkills",
    "keyRequirements",
    "seniority",
    "recommendation",
  ],
};

const resumeAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: { type: Type.NUMBER },
    matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
    matchingExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
    experienceGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
    resumeStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    resumeImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
    importantJobRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    recommendation: { type: Type.STRING },
    shouldApply: { type: Type.BOOLEAN },
  },
  required: [
    "matchScore",
    "matchingSkills",
    "missingSkills",
    "matchingExperience",
    "experienceGaps",
    "resumeStrengths",
    "resumeImprovements",
    "importantJobRequirements",
    "recommendation",
    "shouldApply",
  ],
};

const copilotSchema = {
  type: Type.OBJECT,
  properties: {
    coverLetter: { type: Type.STRING },
    fitExplanation: { type: Type.STRING },
    skillsToHighlight: { type: Type.ARRAY, items: { type: Type.STRING } },
    interviewQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          reason: { type: Type.STRING },
          whatToEmphasize: { type: Type.STRING },
        },
        required: ["question", "reason", "whatToEmphasize"],
      },
    },
    preparationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "coverLetter",
    "fitExplanation",
    "skillsToHighlight",
    "interviewQuestions",
    "preparationTips",
  ],
};

function validateAnalysis(value) {
  if (!value || typeof value !== "object") {
    throw new AIServiceError("AI returned an invalid analysis.");
  }

  const arrays = ["matchingSkills", "missingSkills", "recommendedSkills", "keyRequirements"];

  const score = Number(value.matchScore);

  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new AIServiceError("AI returned an invalid match score.");
  }

  for (const field of arrays) {
    if (!Array.isArray(value[field]) || value[field].some((item) => typeof item !== "string")) {
      throw new AIServiceError(`AI returned an invalid ${field} value.`);
    }
  }

  if (typeof value.seniority !== "string" || typeof value.recommendation !== "string") {
    throw new AIServiceError("AI returned an invalid recommendation.");
  }

  return {
    ...value,
    matchScore: Math.round(score),
  };
}

async function analyzeJobDescription(jobDescription) {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIServiceError("GEMINI_API_KEY is missing from backend/.env.");
  }

  try {
    const client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Analyze this job description for an early-career job seeker.

Return ONLY JSON matching the provided schema.

Calculate:
- matchScore from 0 to 100
- matchingSkills
- missingSkills
- recommendedSkills
- keyRequirements
- seniority
- recommendation

Do not invent information about the candidate.
Base the analysis only on the job description.

JOB DESCRIPTION:

${jobDescription}
`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    if (!response || !response.text) {
      throw new AIServiceError("Gemini returned an empty response.");
    }

    let parsed;

    try {
      parsed = JSON.parse(response.text);
    } catch (parseError) {
      console.error("GEMINI JOB ANALYSIS JSON PARSE ERROR:", {
        type: parseError instanceof Error ? parseError.name : typeof parseError,
        message: parseError instanceof Error ? parseError.message : String(parseError),
      });
      throw new AIServiceError("Gemini returned an invalid JSON response.");
    }

    return validateAnalysis(parsed);
  } catch (error) {
    const errorMessage = toErrorMessage(error);
    console.error("GEMINI JOB ANALYSIS ERROR:", {
      type: error instanceof Error ? error.name : typeof error,
      message: errorMessage,
      status: getProviderStatus(error),
    });

    if (error instanceof AIServiceError) {
      throw error;
    }

    if (isAuthFailure(error, errorMessage)) {
      throw new AIServiceError("Gemini API authentication failed. Check your GEMINI_API_KEY.", 500);
    }

    if (isRateLimited(error, errorMessage)) {
      throw new AIServiceError("Gemini API quota or rate limit reached.", 429);
    }

    throw new AIServiceError("Unable to analyze this job description right now.", 500);
  }
}

function validateResumeAnalysis(value) {
  if (!value || typeof value !== "object")
    throw new AIServiceError("AI returned an invalid resume analysis.");
  const fields = [
    "matchingSkills",
    "missingSkills",
    "matchingExperience",
    "experienceGaps",
    "resumeStrengths",
    "resumeImprovements",
    "importantJobRequirements",
  ];
  const score = Number(value.matchScore);
  if (
    !Number.isFinite(score) ||
    score < 0 ||
    score > 100 ||
    typeof value.recommendation !== "string" ||
    typeof value.shouldApply !== "boolean"
  ) {
    throw new AIServiceError("AI returned an invalid resume analysis.");
  }
  if (
    fields.some(
      (field) =>
        !Array.isArray(value[field]) || value[field].some((item) => typeof item !== "string"),
    )
  ) {
    throw new AIServiceError("AI returned an invalid resume analysis.");
  }
  return { ...value, matchScore: Math.round(score) };
}

async function analyzeResumeMatch(resumeText, jobDescription) {
  if (!process.env.GEMINI_API_KEY)
    throw new AIServiceError(
      "AI analysis is not configured yet. Please add GEMINI_API_KEY to the backend environment.",
    );
  try {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Compare the resume to the job description. Return only JSON matching the schema. Be conservative: count only skills and experience explicitly demonstrated in the resume. Do not invent qualifications or treat implied skills as confirmed.\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
      config: { responseMimeType: "application/json", responseSchema: resumeAnalysisSchema },
    });
    if (!response || !response.text)
      throw new AIServiceError("AI returned an empty resume analysis.");
    try {
      return validateResumeAnalysis(JSON.parse(response.text));
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      throw new AIServiceError("AI returned an invalid resume analysis.");
    }
  } catch (error) {
    if (error instanceof AIServiceError) {
      console.error("GEMINI RESUME ANALYSIS ERROR:", {
        type: error.name,
        message: error.message,
        status: error.status,
      });
      throw error;
    }
    const errorMessage = toErrorMessage(error);
    const status = isRateLimited(error, errorMessage) ? 429 : 500;
    console.error("GEMINI RESUME ANALYSIS ERROR:", {
      type: error instanceof Error ? error.name : typeof error,
      message: errorMessage,
      status: getProviderStatus(error),
    });
    throw new AIServiceError(
      status === 429
        ? "AI is busy right now. Please try again shortly."
        : "Unable to analyze your resume right now.",
      status,
    );
  }
}

function validateCopilot(value) {
  if (
    !value ||
    typeof value !== "object" ||
    typeof value.coverLetter !== "string" ||
    typeof value.fitExplanation !== "string"
  ) {
    throw new AIServiceError("AI returned an invalid application kit.");
  }
  if (
    !Array.isArray(value.skillsToHighlight) ||
    value.skillsToHighlight.some((item) => typeof item !== "string") ||
    !Array.isArray(value.preparationTips) ||
    value.preparationTips.some((item) => typeof item !== "string") ||
    !Array.isArray(value.interviewQuestions) ||
    value.interviewQuestions.length !== 5
  ) {
    throw new AIServiceError("AI returned an invalid application kit.");
  }
  if (
    value.interviewQuestions.some(
      (item) =>
        !item ||
        typeof item.question !== "string" ||
        typeof item.reason !== "string" ||
        typeof item.whatToEmphasize !== "string",
    )
  ) {
    throw new AIServiceError("AI returned invalid interview questions.");
  }
  return value;
}

async function generateApplicationCopilot(resumeText, jobDescription) {
  if (!process.env.GEMINI_API_KEY)
    throw new AIServiceError(
      "AI analysis is not configured yet. Please add GEMINI_API_KEY to the backend environment.",
    );
  try {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: `You are an expert technical recruiter and career coach. Create a tailored application preparation kit from the supplied resume and job description. Return only JSON matching the schema. Strict rules: never invent experience, skills, projects, achievements, employers, education, or qualifications. Only use evidence explicitly in the resume. If a requirement is absent, do not imply it is present. Keep the cover letter professional, specific, and 250-350 words. Generate exactly 5 realistic technical, project, behavioral, and role-specific interview questions. Make preparation tips address actual resume-to-job gaps.\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}` }] }],
      config: { responseMimeType: "application/json", responseSchema: copilotSchema },
    });
    if (!response || !response.text)
      throw new AIServiceError("AI returned an empty application kit.");
    try {
      return validateCopilot(JSON.parse(response.text));
    } catch (error) {
      if (error instanceof AIServiceError) throw error;
      throw new AIServiceError("AI returned an invalid application kit.");
    }
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    const providerStatus = getProviderStatus(error);
    const providerMessage = toErrorMessage(error);
    console.error("GEMINI APPLICATION COPILOT ERROR:", {
      type: error instanceof Error ? error.name : typeof error,
      message: providerMessage,
      status: Number.isFinite(providerStatus) ? providerStatus : undefined,
    });
    const status = isRateLimited(error, providerMessage) ? 429 : 500;
    throw new AIServiceError(
      status === 429
        ? "AI is busy right now. Please try again shortly."
        : providerMessage || "Unable to prepare your application right now.",
      status,
    );
  }
}

module.exports = {
  AIServiceError,
  analyzeJobDescription,
  analyzeResumeMatch,
  generateApplicationCopilot,
};
