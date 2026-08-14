const express = require("express");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const editableFields = ["company", "role", "status", "nextAction", "jobUrl"];
const allowedStatuses = ["Applied", "Screening", "Interview", "Offer", "Rejected"];
const MAX_COMPANY_LENGTH = 120;
const MAX_ROLE_LENGTH = 160;
const MAX_NEXT_ACTION_LENGTH = 300;
const MAX_JOB_URL_LENGTH = 2048;

function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateApplicationId(id, res) {
  if (mongoose.isValidObjectId(id)) return true;
  res.status(404).json({ message: "Application not found" });
  return false;
}

function validateApplicationInput({ company, role, status, nextAction, jobUrl }) {
  if (!company || !role) return "Company and role are required";
  if (company.length > MAX_COMPANY_LENGTH)
    return `Company must be ${MAX_COMPANY_LENGTH} characters or fewer.`;
  if (role.length > MAX_ROLE_LENGTH) return `Role must be ${MAX_ROLE_LENGTH} characters or fewer.`;
  if (status && !allowedStatuses.includes(status)) return "Status is invalid.";
  if (nextAction && nextAction.length > MAX_NEXT_ACTION_LENGTH)
    return `Next action must be ${MAX_NEXT_ACTION_LENGTH} characters or fewer.`;
  if (jobUrl) {
    if (jobUrl.length > MAX_JOB_URL_LENGTH) {
      return `Job URL must be ${MAX_JOB_URL_LENGTH} characters or fewer.`;
    }
    try {
      // Validate URL structure without changing stored format.
      new URL(jobUrl);
    } catch {
      return "Job URL must be a valid URL.";
    }
  }
  return null;
}

function validateApplicationUpdateInput(update) {
  if (Object.prototype.hasOwnProperty.call(update, "company")) {
    if (!update.company) return "Company is required.";
    if (update.company.length > MAX_COMPANY_LENGTH)
      return `Company must be ${MAX_COMPANY_LENGTH} characters or fewer.`;
  }
  if (Object.prototype.hasOwnProperty.call(update, "role")) {
    if (!update.role) return "Role is required.";
    if (update.role.length > MAX_ROLE_LENGTH)
      return `Role must be ${MAX_ROLE_LENGTH} characters or fewer.`;
  }
  if (Object.prototype.hasOwnProperty.call(update, "status")) {
    if (!allowedStatuses.includes(update.status)) return "Status is invalid.";
  }
  if (
    Object.prototype.hasOwnProperty.call(update, "nextAction") &&
    update.nextAction &&
    update.nextAction.length > MAX_NEXT_ACTION_LENGTH
  ) {
    return `Next action must be ${MAX_NEXT_ACTION_LENGTH} characters or fewer.`;
  }
  if (Object.prototype.hasOwnProperty.call(update, "jobUrl") && update.jobUrl) {
    if (update.jobUrl.length > MAX_JOB_URL_LENGTH)
      return `Job URL must be ${MAX_JOB_URL_LENGTH} characters or fewer.`;
    try {
      new URL(update.jobUrl);
    } catch {
      return "Job URL must be a valid URL.";
    }
  }
  return null;
}

function applicationUpdate(body) {
  return editableFields.reduce((update, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) update[field] = body[field];
    return update;
  }, {});
}

// CREATE APPLICATION
router.post("/", authMiddleware, async (req, res) => {
  try {
    const company = toTrimmedString(req.body?.company);
    const role = toTrimmedString(req.body?.role);
    const status = toTrimmedString(req.body?.status) || "Applied";
    const nextAction = toTrimmedString(req.body?.nextAction);
    const jobUrl = toTrimmedString(req.body?.jobUrl);
    const appliedDate = req.body?.appliedDate;

    const validationMessage = validateApplicationInput({
      company,
      role,
      status,
      nextAction,
      jobUrl,
    });
    if (validationMessage) return res.status(400).json({ message: validationMessage });

    const application = await Application.create({
      user: req.userId,
      company,
      role,
      appliedDate: appliedDate || Date.now(),
      status: status || "Applied",
      nextAction,
      jobUrl,
    });

    res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    console.error(
      "CREATE APPLICATION ERROR:",
      error instanceof Error ? error.message : String(error),
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET ALL APPLICATIONS FOR LOGGED-IN USER
router.get("/", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      applications,
    });
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error instanceof Error ? error.message : String(error));

    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET ONE APPLICATION FOR LOGGED-IN USER
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!validateApplicationId(req.params.id, res)) return;
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.json({ application });
  } catch (error) {
    console.error("GET APPLICATION ERROR:", error instanceof Error ? error.message : String(error));
    res
      .status(error.name === "CastError" ? 404 : 500)
      .json({ message: error.name === "CastError" ? "Application not found" : "Server error" });
  }
});

// UPDATE APPLICATION
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!validateApplicationId(req.params.id, res)) return;
    const update = applicationUpdate(req.body);
    const normalizedUpdate = {
      ...update,
      ...(Object.prototype.hasOwnProperty.call(update, "company")
        ? { company: toTrimmedString(update.company) }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(update, "role")
        ? { role: toTrimmedString(update.role) }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(update, "status")
        ? { status: toTrimmedString(update.status) }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(update, "nextAction")
        ? { nextAction: toTrimmedString(update.nextAction) }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(update, "jobUrl")
        ? { jobUrl: toTrimmedString(update.jobUrl) }
        : {}),
    };

    if (!Object.keys(normalizedUpdate).length) {
      return res.status(400).json({ message: "No valid fields were provided for update." });
    }

    const validationMessage = validateApplicationUpdateInput(normalizedUpdate);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const application = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      normalizedUpdate,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.json({
      message: "Application updated successfully",
      application,
    });
  } catch (error) {
    console.error("UPDATE APPLICATION ERROR:", error instanceof Error ? error.message : String(error));

    res
      .status(error.name === "CastError" ? 404 : 500)
      .json({ message: error.name === "CastError" ? "Application not found" : "Server error" });
  }
});

// DELETE APPLICATION
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!validateApplicationId(req.params.id, res)) return;
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("DELETE APPLICATION ERROR:", error instanceof Error ? error.message : String(error));

    res
      .status(error.name === "CastError" ? 404 : 500)
      .json({ message: error.name === "CastError" ? "Application not found" : "Server error" });
  }
});

module.exports = router;
