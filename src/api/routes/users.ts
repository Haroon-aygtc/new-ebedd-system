import express from "express";
import User from "../models/User";

const router = express.Router();

// Get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// Get a user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Create a new user
router.post("/", async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const user = await User.create({
      id: Date.now().toString(),
      name,
      email,
      role: role || "user",
      status: status || "active",
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Update a user
router.put("/:id", async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if email already exists (if changing email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      status: status || user.status,
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Delete a user
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.destroy();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export const usersRouter = router;
