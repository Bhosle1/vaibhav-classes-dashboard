const express = require("express");
const bcrypt = require("bcryptjs");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// All user management routes require admin access
router.use(authenticate, requireAdmin);

// GET /api/v1/users — list all registered users
router.get("/", (req, res) => {
  const db = req.app.get("db");
  const users = db.get("users").value();

  // Strip out the password hash before sending — never expose that
  const sanitized = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    created_at: u.created_at
  }));

  res.json({ data: sanitized });
});

// POST /api/v1/users — create a new user
router.post("/", (req, res) => {
  const db = req.app.get("db");
  const { userId, password, name, email, role } = req.body;

  // Basic validation
  if (!userId || !password || !name) {
    return res.status(400).json({ message: "userId, password, and name are required." });
  }

  // Check if someone already has this ID
  const existing = db.get("users").find({ id: userId }).value();
  if (existing) {
    return res.status(409).json({ message: `User "${userId}" already exists.` });
  }

  // Hash the password and save
  const salt = bcrypt.genSaltSync(10);
  const newUser = {
    id: userId,
    name,
    email: email || "",
    password: bcrypt.hashSync(password, salt),
    role: role || "teacher",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6c63ff&color=fff&size=100`,
    created_at: new Date().toISOString()
  };

  db.get("users").push(newUser).write();

  // Return the user without the password hash
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ data: safeUser });
});

// PUT /api/v1/users/:id — update an existing user
router.put("/:id", (req, res) => {
  const db = req.app.get("db");
  const userId = req.params.id;
  const updates = req.body;

  const user = db.get("users").find({ id: userId });
  if (!user.value()) {
    return res.status(404).json({ message: "User not found." });
  }

  // If they're changing the password, hash the new one
  if (updates.password) {
    const salt = bcrypt.genSaltSync(10);
    updates.password = bcrypt.hashSync(updates.password, salt);
  }

  // Apply the updates
  user.assign(updates).write();

  const updated = user.value();
  const { password: _, ...safeUser } = updated;
  res.json({ data: safeUser });
});

// DELETE /api/v1/users/:id — remove a user and all their data
router.delete("/:id", (req, res) => {
  const db = req.app.get("db");
  const userId = req.params.id;

  // Don't let someone delete themselves — that would be awkward
  if (userId === req.user.id) {
    return res.status(400).json({ message: "You can't delete your own account." });
  }

  const user = db.get("users").find({ id: userId }).value();
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Grab all tests owned by this user so we can clean up their questions too
  const userTests = db.get("tests").filter({ created_by: userId }).value();
  const testIds = userTests.map(t => t.id);

  // Remove the user's questions, tests, and then the user record itself
  db.get("questions").remove(q => testIds.includes(q.test_id)).write();
  db.get("tests").remove({ created_by: userId }).write();
  db.get("users").remove({ id: userId }).write();

  res.json({ success: true, message: `User "${userId}" and all their data have been deleted.` });
});

module.exports = router;
