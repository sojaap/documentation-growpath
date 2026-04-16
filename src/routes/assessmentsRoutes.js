const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET soal
router.get("/", async (req, res) => {
  const result = await db.query(`
    SELECT q.id, q.question_text, o.id as option_id, o.option_text
    FROM assessment_questions q
    JOIN assessment_options o ON q.id = o.question_id
  `);

  res.json(result.rows);
});

// POST jawaban
router.post("/answer", async (req, res) => {
  const { session_id, question_id, option_id, score } = req.body;

  await db.query(
    `
    INSERT INTO user_assessment_answers 
    (session_id, question_id, option_id, answer_score)
    VALUES ($1, $2, $3, $4)
  `,
    [session_id, question_id, option_id, score],
  );

  res.json({ message: "Jawaban tersimpan" });
});

module.exports = router;
