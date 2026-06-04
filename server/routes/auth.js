const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// POST /api/v1/auth/login
// Validates userId + password, returns a JWT token and user profile
router.post("/login", (req, res) => {
  const db = req.app.get("db");
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: "User ID and password are required." });
  }

  // Look up the user in our database
  const user = db.get("users").find({ id: userId }).value();

  if (!user) {
    return res.status(401).json({ message: "Invalid User ID or Password. Please try again." });
  }

  // Compare the provided password with the stored hash
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid User ID or Password. Please try again." });
  }

  // Password checks out — generate a token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Send back the token and a sanitized user object (no password hash!)
  res.json({
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    }
  });
});

module.exports = router;
