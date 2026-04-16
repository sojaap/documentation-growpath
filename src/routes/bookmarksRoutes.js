const express = require("express");
const router = express.Router();
const db = require("../config/db");

// USER
router.post("/", async (req, res) => {
  const { user_id, career_path_id } = req.body;

  await db.query(
    "INSERT INTO bookmarks (user_id, career_path_id) VALUES ($1, $2)",
    [user_id, career_path_id],
  );

  res.json({ message: "Bookmark ditambahkan" });
});

// ADMIN
router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM bookmarks");
  res.json(result.rows);
});

module.exports = router;
