const jwt = require("jsonwebtoken");

// This secret is fine for local dev — in production you'd use an env variable
const JWT_SECRET = "apex-test-portal-secret-key-2024";

// Middleware that checks for a valid JWT token in the Authorization header
// If the token is valid, it attaches the decoded user info to req.user
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid. Please log in again." });
  }
}

// Helper to check if the current user is an admin
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

module.exports = { authenticate, requireAdmin, JWT_SECRET };
