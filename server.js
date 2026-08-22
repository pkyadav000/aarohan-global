require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// CONFIG
// =======================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !JWT_SECRET) {
  console.error("ERROR: MONGO_URI or JWT_SECRET is missing in .env");
  process.exit(1);
}

// =======================
// DATABASE
// =======================

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});

// =======================
// USER SCHEMA
// =======================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

// =======================
// AUTH MIDDLEWARE
// =======================

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

// =======================
// ADMIN MIDDLEWARE
// =======================

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }

  next();
}

// =======================
// HOME
// =======================

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// =======================
// HEALTH CHECK
// =======================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Aarohan Global backend is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// =======================
// REGISTER
// =======================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      userId,
      email,
      password
    } = req.body;

    if (!name || !userId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const cleanUserId =
      String(userId)
        .trim()
        .toUpperCase();

    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase();

    const existingUser =
      await User.findOne({
        $or: [
          {
            userId: cleanUserId
          },
          {
            email: cleanEmail
          }
        ]
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User ID or email already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user =
      await User.create({
        name: name.trim(),

        userId: cleanUserId,

        email: cleanEmail,

        password: hashedPassword,

        role: "user",

        active: true
      });

    return res.status(201).json({
      success: true,
      message: "Registration successful",

      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
});

// =======================
// LOGIN
// =======================

app.post("/api/auth/login", async (req, res) => {
  try {

    const {
      userId,
      password
    } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message:
          "User ID and password are required"
      });
    }

    const cleanUserId =
      String(userId)
        .trim()
        .toUpperCase();

    const user =
      await User.findOne({
        userId: cleanUserId
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid User ID or password"
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message:
          "Account is inactive"
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid User ID or password"
      });
    }

    const token =
      jwt.sign(
        {
          id: user._id.toString(),
          userId: user.userId,
          role: user.role
        },
        JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

    return res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// =======================
// CURRENT USER
// =======================

app.get(
  "/api/auth/me",
  auth,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.json({
        success: true,
        user
      });

    } catch (error) {

      console.error(
        "ME ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to get user"
      });
    }
  }
);

// =======================
// ADMIN USERS
// =======================

app.get(
  "/api/admin/users",
  auth,
  adminOnly,
  async (req, res) => {

    try {

      const users =
        await User.find()
          .select("-password")
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,
        count: users.length,
        users
      });

    } catch (error) {

      console.error(
        "ADMIN USERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch users"
      });
    }
  }
);

// =======================
// ADMIN CREATE
// =======================

async function createAdmin() {

  const adminUserId =
    process.env.ADMIN_USER_ID;

  const adminPassword =
    process.env.ADMIN_PASSWORD;

  const adminEmail =
    process.env.ADMIN_EMAIL;

  if (
    !adminUserId ||
    !adminPassword ||
    !adminEmail
  ) {

    console.log(
      "Admin variables not configured."
    );

    return;
  }

  const cleanUserId =
    adminUserId
      .trim()
      .toUpperCase();

  const cleanEmail =
    adminEmail
      .trim()
      .toLowerCase();

  const existingAdmin =
    await User.findOne({
      userId: cleanUserId
    });

  if (existingAdmin) {

    console.log(
      "Admin already exists."
    );

    return;
  }

  const hashedPassword =
    await bcrypt.hash(
      adminPassword,
      12
    );

  await User.create({

    name: "Administrator",

    userId: cleanUserId,

    email: cleanEmail,

    password: hashedPassword,

    role: "admin",

    active: true
  });

  console.log(
    "Admin account created."
  );
}

// =======================
// STATIC FRONTEND
// =======================

app.use(
  express.static(
    __dirname + "/public"
  )
);

// =======================
// 404 API
// =======================

app.use(
  "/api",
  (req, res) => {

    res.status(404).json({
      success: false,
      message: "API route not found"
    });

  }
);

// =======================
// START SERVER
// =======================

async function startServer() {

  try {

    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      "MongoDB connected"
    );

    await createAdmin();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {

        console.log(
          `Aarohan Global running on port ${PORT}`
        );

      }
    );

  } catch (error) {

    console.error(
      "STARTUP ERROR:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
