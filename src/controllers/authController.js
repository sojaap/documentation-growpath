const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "email dan password wajib diisi"
    });
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "user tidak ditemukan"
      });
    }

    const user = result.rows[0];

    if (user.password_hash !== password) {
      return res.status(401).json({
        status: "error",
        message: "email atau password salah"
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      status: "success",
      data: { token },
      message: "login berhasil"
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "internal server error"
    });
  }
};

//Register
exports.register = async (req, res) => {
  const { full_name, email, password, role } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "semua field wajib diisi"
    });
  }

  try {
    const check = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (check.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "email sudah digunakan"
      });
    }

    const result = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [full_name, email, password, role || 'user']
    );

    res.json({
      status: "success",
      data: result.rows[0],
      message: "registrasi berhasil"
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "internal server error"
    });
  }
};