const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const name = toTrimmedString(req.body?.name);
    const email = toTrimmedString(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    if (name.length > MAX_NAME_LENGTH) {
      return res.status(400).json({
        message: "Name must be 100 characters or fewer.",
      });
    }
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }
    if (password.length < 6 || password.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: "Password must be between 6 and 128 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error instanceof Error ? error.message : String(error));

    res.status(500).json({
      message: "Server error",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const email = toTrimmedString(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: "Password is too long.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error instanceof Error ? error.message : String(error));

    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET CURRENT USER - PROTECTED
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    console.error("ME ERROR:", error instanceof Error ? error.message : String(error));

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;