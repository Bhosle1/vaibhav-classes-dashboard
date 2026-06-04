const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// POST /api/v1/questions/bulk — save multiple questions at once
router.post("/bulk", (req, res) => {
  const db = req.app.get("db");
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "Please provide an array of questions." });
  }

  // Stamp each question with a unique ID
  const formatted = questions.map((q) => ({
    ...q,
    id: `q-${uuidv4().slice(0, 8)}`
  }));

  // Append to the existing question bank
  const existing = db.get("questions").value();
  db.set("questions", [...existing, ...formatted]).write();

  res.json({ success: true, data: formatted });
});

// GET /api/v1/questions?test_id=xxx — get questions for a specific test
router.get("/", (req, res) => {
  const db = req.app.get("db");
  const testId = req.query.test_id;

  if (!testId) {
    return res.status(400).json({ message: "test_id query parameter is required." });
  }

  const questions = db.get("questions").filter({ test_id: testId }).value();
  res.json({ data: questions });
});

module.exports = router;
