const express = require("express");
const cors = require("cors");
const path = require("path");

// -- Route modules --
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const testRoutes = require("./routes/tests");
const questionRoutes = require("./routes/questions");
const subjectRoutes = require("./routes/subjects");

// -- Database setup --
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const bcrypt = require("bcryptjs");

const adapter = new FileSync(path.join(__dirname, "db.json"));
const db = low(adapter);

// Seed the database with default data if it's the first run
db.defaults({
  users: [],
  tests: [],
  questions: [],
  subjects: [
    { id: "math", name: "Mathematics" },
    { id: "sci", name: "Science" },
    { id: "eng", name: "English" },
    { id: "his", name: "History" }
  ],
  topics: [
    { id: "math-algebra", name: "Algebra", subject_id: "math" },
    { id: "math-calculus", name: "Calculus", subject_id: "math" },
    { id: "math-geometry", name: "Geometry", subject_id: "math" },
    { id: "sci-physics", name: "Physics", subject_id: "sci" },
    { id: "sci-chemistry", name: "Chemistry", subject_id: "sci" },
    { id: "sci-biology", name: "Biology", subject_id: "sci" },
    { id: "eng-grammar", name: "Grammar", subject_id: "eng" },
    { id: "eng-literature", name: "Literature", subject_id: "eng" },
    { id: "his-world", name: "World History", subject_id: "his" },
    { id: "his-ancient", name: "Ancient Civilizations", subject_id: "his" }
  ],
  subTopics: [
    { id: "sub-linear", name: "Linear Equations", topic_id: "math-algebra" },
    { id: "sub-quadratic", name: "Quadratic Equations", topic_id: "math-algebra" },
    { id: "sub-limits", name: "Limits & Continuity", topic_id: "math-calculus" },
    { id: "sub-derivatives", name: "Derivatives", topic_id: "math-calculus" },
    { id: "sub-triangles", name: "Triangles & Trigonometry", topic_id: "math-geometry" },
    { id: "sub-circles", name: "Circles & Polygons", topic_id: "math-geometry" },
    { id: "sub-mechanics", name: "Classical Mechanics", topic_id: "sci-physics" },
    { id: "sub-thermo", name: "Thermodynamics", topic_id: "sci-physics" },
    { id: "sub-organic", name: "Organic Chemistry", topic_id: "sci-chemistry" },
    { id: "sub-inorganic", name: "Inorganic Chemistry", topic_id: "sci-chemistry" },
    { id: "sub-genetics", name: "Genetics", topic_id: "sci-biology" },
    { id: "sub-ecology", name: "Ecology", topic_id: "sci-biology" },
    { id: "sub-tenses", name: "Verb Tenses", topic_id: "eng-grammar" },
    { id: "sub-punctuation", name: "Punctuation", topic_id: "eng-grammar" },
    { id: "sub-shakespeare", name: "Shakespearean Drama", topic_id: "eng-literature" },
    { id: "sub-modern", name: "Modern Prose", topic_id: "eng-literature" },
    { id: "sub-ww2", name: "World War II", topic_id: "his-world" },
    { id: "sub-coldwar", name: "Cold War Era", topic_id: "his-world" },
    { id: "sub-egypt", name: "Ancient Egypt", topic_id: "his-ancient" },
    { id: "sub-rome", name: "Roman Empire", topic_id: "his-ancient" }
  ]
}).write();

// Create default admin user if no users exist yet
const existingUsers = db.get("users").value();
if (existingUsers.length === 0) {
  const salt = bcrypt.genSaltSync(10);
  db.get("users").push(
    {
      id: "vaibhav",
      name: "Vaibhav Bhosle",
      email: "vaibhav@apexportal.com",
      password: bcrypt.hashSync("123456789", salt),
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
      created_at: new Date().toISOString()
    },
    {
      id: "ajinkya",
      name: "Ajinkya",
      email: "ajinkya@apexportal.com",
      password: bcrypt.hashSync("123456789", salt),
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      created_at: new Date().toISOString()
    }
  ).write();
  console.log("✅ Seeded default admin users: vaibhav, ajinkya");
}

// Make the db accessible in routes via req.app.get("db")
const app = express();

app.set("db", db);

// -- Middleware --
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Simple request logger so you can see what's hitting the server
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// -- Mount routes --
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tests", testRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/topics", subjectRoutes);       // topics share the same router
app.use("/api/v1/sub-topics", subjectRoutes);    // sub-topics too

// Health check endpoint — useful for Postman and debugging
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// -- Start the server --
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Apex Test Portal API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/v1/health\n`);
});
