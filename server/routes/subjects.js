const express = require("express");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

// GET /api/v1/subjects — all subjects (shared reference data)
router.get("/", (req, res) => {
  const db = req.app.get("db");
  const url = req.baseUrl;

  // This router is mounted on /subjects, /topics, and /sub-topics
  // so we figure out which collection to return based on the base URL
  if (url.includes("sub-topics")) {
    // POST /api/v1/sub-topics/multi-topics is handled below
    const subTopics = db.get("subTopics").value();
    return res.json({ data: subTopics });
  }

  if (url.includes("topics")) {
    const topics = db.get("topics").value();
    return res.json({ data: topics });
  }

  // Default: subjects
  const subjects = db.get("subjects").value();
  res.json({ data: subjects });
});

// GET /api/v1/topics/subject/:subjectId — topics filtered by subject
router.get("/subject/:subjectId", (req, res) => {
  const db = req.app.get("db");
  const subjectId = req.params.subjectId;
  const topics = db.get("topics").filter({ subject_id: subjectId }).value();
  res.json({ data: topics });
});

// POST /api/v1/sub-topics/multi-topics — fetch sub-topics for multiple topic IDs
router.post("/multi-topics", (req, res) => {
  const db = req.app.get("db");
  const { topicIds } = req.body;

  if (!topicIds || !Array.isArray(topicIds)) {
    return res.status(400).json({ message: "topicIds array is required." });
  }

  const subTopics = db.get("subTopics")
    .filter(s => topicIds.includes(s.topic_id))
    .value();

  res.json({ data: subTopics });
});

module.exports = router;
