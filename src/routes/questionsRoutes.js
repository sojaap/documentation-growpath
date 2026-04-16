const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ======================
// GET ALL QUESTIONS
// ======================
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM assessment_questions");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// POST (CREATE QUESTION)
// ======================
router.post("/", async (req, res) => {
  const { question_text, question_type, category, created_by } = req.body;

  try {
    await db.query(
      `INSERT INTO assessment_questions 
      (question_text, question_type, category, created_by) 
      VALUES ($1, $2, $3, $4)`,
      [question_text, question_type, category, created_by],
    );

    res.json({ message: "Question ditambahkan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// PUT (UPDATE QUESTION)
// ======================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { question_text, question_type, category } = req.body;

  try {
    await db.query(
      `UPDATE assessment_questions 
       SET question_text=$1, question_type=$2, category=$3 
       WHERE id=$4`,
      [question_text, question_type, category, id],
    );

    res.json({ message: "Question diupdate" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// DELETE (FIX FOREIGN KEY)
// ======================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. hapus child table (answers)
    await db.query(
      "DELETE FROM user_assessment_answers WHERE question_id = $1",
      [id],
    );

    // 2. hapus child table (options)
    await db.query("DELETE FROM assessment_options WHERE question_id = $1", [
      id,
    ]);

    // 3. baru hapus question
    await db.query("DELETE FROM assessment_questions WHERE id = $1", [id]);

    res.json({ message: "Question berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
