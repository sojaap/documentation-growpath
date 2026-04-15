const express = require('express');
const router = express.Router();
const pool = require('./db');

// Search Skills
router.get('/skills', async (req, res) => {
  try {
    const { title, level } = req.query;
    let query = 'SELECT * FROM skill_courses WHERE 1=1';
    const params = [];
    if (title) {
      params.push(`%${title}%`);
      query += ` AND title ILIKE $${params.length}`;
    }
    if (level) {
      params.push(level);
      query += ` AND level = $${params.length}`;
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: GET all skills
router.get('/admin/skills', async (req, res) => {
  try {
    const { title } = req.query;
    
    // admin bisa melihat siapa pengunggahnya (JOIN ke table users)
    let query = `
      SELECT sc.*, u.full_name as creator_name 
      FROM skill_courses sc
      LEFT JOIN users u ON sc.created_by = u.id
      WHERE 1=1`;
    
    const params = [];

    if (title) {
      params.push(`%${title}%`);
      query += ` AND sc.title ILIKE $${params.length}`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: CRUD Skills
router.post('/admin/skills', async (req, res) => {
  try {
    const { title, type, description, level, duration_hours, url, created_by } = req.body;
    // log masuk data buat memastikan data diterima
    console.log("Data masuk:", req.body);

    const query = `INSERT INTO skill_courses (title, type, description, level, duration_hours, url, created_by, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *`;
    const result = await pool.query(query, [title, type, description, level, duration_hours, url, created_by]);
    res.status(201).json(result.rows[0]);
  } catch (err) { 
    console.error("ERROR DB:", err.message); 
    res.status(500).json({ error: err.message });}
});

router.put('/admin/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, description, level, duration_hours, url } = req.body;

    // mengecek apakah req.body tidak kosong
    if (!title) {
      return res.status(400).json({ error: "Field 'title' wajib diisi!" });
    }

    const query = `
      UPDATE skill_courses 
      SET title=$1, type=$2, description=$3, level=$4, duration_hours=$5, url=$6, updated_at=CURRENT_TIMESTAMP 
      WHERE id=$7 RETURNING *`;

    const result = await pool.query(query, [title, type, description, level, duration_hours, url, id]);

    // mengecek apakah data yang mau diupdate ada
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Gagal update, Skill dengan ID ${id} tidak ditemukan!` });
    }

    res.json({
      message: "Update berhasil",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("ERROR PUT:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/skills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM skill_courses WHERE id = $1', [id]);

    // mengecek apakah ada baris yang terhapus, jika tidak ada berarti ID tidak ditemukan
    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Gagal hapus, ID ${id} nggak ada di database!` });
    }

    res.json({ message: `Skill dengan ID ${id} berhasil dihapus` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Progress Tracking

// endpoint melihat daftar progress user beserta nama course-nya, filter berdasarkan user_id yang dikirim di header
router.get('/progress', async (req, res) => {
  try {
    const userId = req.headers['user-id']; 
    if (!userId) return res.status(400).json({ error: "Isi header user-id di Postman!" });
    const query = `SELECT up.*, sc.title as course_title FROM user_progress up JOIN skill_courses sc ON up.skill_course_id = sc.id WHERE up.user_id = $1`;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// endpoint update progress user
router.patch('/progress/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress_percent } = req.body;

    // jika status 'completed', otomatis isi completed_at, jika tidak kosongkan
    const query = `
      UPDATE user_progress 
      SET 
        status = $1::varchar, 
        progress_percent = $2::numeric, 
        completed_at = CASE WHEN $1::varchar = 'Completed' THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = $3 
      RETURNING *`;

    const result = await pool.query(query, [status, progress_percent, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Data progres tidak ditemukan!" });
    }

    res.json({
      message: "Progres berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// endpoint untuk melihat progress user keseluruhan atau filter berdasarkan user_id (admin)
router.get('/admin/progress', async (req, res) => {
  try {
    const { user_id } = req.query; // Opsional: ?user_id=1
    
    let query = `
      SELECT 
        up.id, 
        u.full_name as student_name, 
        sc.title as course_title, 
        up.status, 
        up.progress_percent,
        up.completed_at
      FROM user_progress up
      JOIN users u ON up.user_id = u.id
      JOIN skill_courses sc ON up.skill_course_id = sc.id`;
    
    const params = [];
    if (user_id) {
      params.push(user_id);
      query += ` WHERE up.user_id = $1`;
    }

    query += ` ORDER BY u.full_name ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// endpoint untuk menambahkan kursus ke daftar progress user (admin)
router.post('/admin/progress', async (req, res) => {
  try {
    const { user_id, skill_course_id, roadmap_content_id } = req.body;

    const query = `
      INSERT INTO user_progress (user_id, skill_course_id, roadmap_content_id, status, progress_percent, started_at)
      VALUES ($1, $2, $3, 'In Progress', 0, CURRENT_TIMESTAMP)
      RETURNING *`;

    const result = await pool.query(query, [user_id, skill_course_id, roadmap_content_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Export router agar bisa dipakai index.js
module.exports = router;