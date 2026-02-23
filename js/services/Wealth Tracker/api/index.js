const express = require("express");
const router = express.Router();

// Example: GET /api/health
router.get("/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

// ...add endpoints for portfolio, auth, etc. here...

module.exports = router;
