const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Every test route needs authentication
router.use(authenticate);

// GET /api/v1/tests — fetch tests belonging to the logged-in user
router.get("/", (req, res) => {
  const db = req.app.get("db");

  // Admins can see everything, regular users only see their own
  let tests;
  if (req.user.role === "admin") {
    tests = db.get("tests").value();
  } else {
    tests = db.get("tests").filter({ created_by: req.user.id }).value();
  }

  // Sort newest first
  tests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({ data: tests });
});

// POST /api/v1/tests — create a new test, stamped with the current user's ID
router.post("/", (req, res) => {
  const db = req.app.get("db");
  const data = req.body;

  const newTest = {
    ...data,
    id: `t-${uuidv4().slice(0, 8)}`,
    created_by: req.user.id,
    created_at: new Date().toISOString()
  };

  db.get("tests").push(newTest).write();

  res.status(201).json({ data: newTest });
});

// GET /api/v1/tests/:id — get a single test with its questions
router.get("/:id", (req, res) => {
  const db = req.app.get("db");
  const testId = req.params.id;

  const test = db.get("tests").find({ id: testId }).value();
  if (!test) {
    return res.status(404).json({ message: "Test not found." });
  }

  // Only the owner or an admin can view test details
  if (test.created_by !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "You don't have access to this test." });
  }

  const questions = db.get("questions").filter({ test_id: testId }).value();

  res.json({ data: { ...test, questions } });
});

// PUT /api/v1/tests/:id — update a test's properties
router.put("/:id", (req, res) => {
  const db = req.app.get("db");
  const testId = req.params.id;
  const updates = req.body;

  const test = db.get("tests").find({ id: testId });
  if (!test.value()) {
    return res.status(404).json({ message: "Test not found." });
  }

  // Only the owner or an admin can update
  if (test.value().created_by !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "You don't have permission to edit this test." });
  }

  test.assign(updates).write();
  res.json({ data: test.value() });
});

// DELETE /api/v1/tests/:id — delete a test and its questions
router.delete("/:id", (req, res) => {
  const db = req.app.get("db");
  const testId = req.params.id;

  const test = db.get("tests").find({ id: testId }).value();
  if (!test) {
    return res.status(404).json({ message: "Test not found." });
  }

  if (test.created_by !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "You don't have permission to delete this test." });
  }

  // Clean up the test's questions first, then the test itself
  db.get("questions").remove({ test_id: testId }).write();
  db.get("tests").remove({ id: testId }).write();

  res.json({ success: true });
});

module.exports = router;
