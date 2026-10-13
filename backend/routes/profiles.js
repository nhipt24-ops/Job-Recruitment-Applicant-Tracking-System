const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Lấy profile của chính mình
router.get('/me', authenticateToken, authorizeRoles('job_seeker'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.full_name, u.email, u.phone
       FROM applicant_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) {
      // Tạo profile trống nếu chưa có
      await pool.query('INSERT INTO applicant_profiles (user_id) VALUES (?)', [req.user.id]);
      const [newRows] = await pool.query(
        `SELECT p.*, u.full_name, u.email, u.phone
         FROM applicant_profiles p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ?`,
        [req.user.id]
      );
      return res.json(newRows[0]);
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Cập nhật profile
router.put('/me', authenticateToken, authorizeRoles('job_seeker'), async (req, res) => {
  try {
    const { skills, experience, education, resume_url, summary } = req.body;

    const [exist] = await pool.query('SELECT id FROM applicant_profiles WHERE user_id = ?', [req.user.id]);
    if (exist.length === 0) {
      await pool.query(
        'INSERT INTO applicant_profiles (user_id, skills, experience, education, resume_url, summary) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, skills || null, experience || null, education || null, resume_url || null, summary || null]
      );
    } else {
      await pool.query(
        'UPDATE applicant_profiles SET skills=?, experience=?, education=?, resume_url=?, summary=? WHERE user_id=?',
        [skills || null, experience || null, education || null, resume_url || null, summary || null, req.user.id]
      );
    }

    res.json({ message: 'Cập nhật hồ sơ thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ.' });
  }
});

// Xem profile theo user_id (recruiter/admin)
router.get('/:userId', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.full_name, u.email, u.phone
       FROM applicant_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?`,
      [req.params.userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

module.exports = router;
