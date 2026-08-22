require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !JWT_SECRET) {
  console.error("ERROR: MONGO_URI or JWT_SECRET is missing in .env");
  process.exit(1);
}

// =======================
// User Schema
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
      trim: true
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
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// =======================
// JWT Middleware
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

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }

  next();
}

// =======================
// Test Route
// =======================

// =======================
// Register
// =======================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, userId, email, password } = req.body;

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

    const existingUser = await User.findOne({
      $or: [
        { userId: userId },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User ID or email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      userId,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
});

// =======================
// Login
// =======================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "User ID and password are required"
      });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid User ID or password"
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid User ID or password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        userId: user.userId,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// =======================
// Current User
// =======================

app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to get user"
    });
  }
});

// =======================
// Admin Dashboard API
// =======================

app.get("/api/admin/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch users"
    });
  }
});

// =======================
// Create Admin
// =======================

async function createAdmin() {
  const adminUserId = process.env.ADMIN_USER_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminUserId || !adminPassword || !adminEmail) {
    console.log("Admin variables not configured.");
    return;
  }

  const existingAdmin = await User.findOne({
    userId: adminUserId
  });

  if (existingAdmin) {
    console.log("Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await User.create({
    name: "Administrator",
    userId: adminUserId,
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    role: "admin"
  });

  console.log("Admin account created.");
}

// =======================
// Start Server
// =======================

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    await createAdmin();

app.get("/", (req,res) => res.sendFile(__dirname + "/public/index.html"));
app.use(express.static(__dirname + "/public"));
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();
