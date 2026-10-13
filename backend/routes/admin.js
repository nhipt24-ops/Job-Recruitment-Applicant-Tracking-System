const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Tất cả route admin đều cần quyền admin
router.use(authenticateToken, authorizeRoles('admin'));

// Danh sách tất cả users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, full_name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Cập nhật role user
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const valid = ['job_seeker', 'recruiter', 'admin'];
    if (!valid.includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ.' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'Cập nhật role thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật role.' });
  }
});

// Xóa user
router.delete('/users/:id', async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Không thể xóa chính mình.' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Đã xóa người dùng.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi xóa.' });
  }
});

// Thống kê tổng quan
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const [[{ total_jobs }]] = await pool.query('SELECT COUNT(*) AS total_jobs FROM jobs');
    const [[{ total_applications }]] = await pool.query('SELECT COUNT(*) AS total_applications FROM applications');
    const [[{ total_companies }]] = await pool.query('SELECT COUNT(*) AS total_companies FROM companies');
    const [[{ open_jobs }]] = await pool.query('SELECT COUNT(*) AS open_jobs FROM jobs WHERE status = "open"');

    res.json({
      total_users,
      total_jobs,
      open_jobs,
      total_applications,
      total_companies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

module.exports = router;
