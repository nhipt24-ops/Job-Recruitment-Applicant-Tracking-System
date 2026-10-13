const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Lấy danh sách công ty (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.full_name AS recruiter_name
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       ORDER BY c.name`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Công ty của recruiter hiện tại (phải đặt trước /:id)
router.get('/my/company', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM companies WHERE recruiter_id = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });

// Chi tiết công ty
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.full_name AS recruiter_name, u.email AS recruiter_email
       FROM companies c
       JOIN users u ON c.recruiter_id = u.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy công ty.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Recruiter tạo / cập nhật công ty của mình
router.post('/', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const { name, description, address, website, logo_url } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên công ty là bắt buộc.' });

    // Kiểm tra recruiter đã có công ty chưa (1 recruiter 1 công ty đơn giản)
    if (req.user.role === 'recruiter') {
      const [exist] = await pool.query('SELECT id FROM companies WHERE recruiter_id = ?', [req.user.id]);
      if (exist.length > 0) {
        return res.status(400).json({ message: 'Bạn đã có công ty. Hãy dùng API cập nhật.' });
      }
    }

    const recruiterId = req.user.role === 'admin' ? (req.body.recruiter_id || req.user.id) : req.user.id;

    const [result] = await pool.query(
      'INSERT INTO companies (name, description, address, website, logo_url, recruiter_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, address || null, website || null, logo_url || null, recruiterId]
    );

    res.status(201).json({ message: 'Tạo công ty thành công.', companyId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi tạo công ty.' });
  }
});

// Cập nhật công ty
router.put('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const companyId = req.params.id;
    const { name, description, address, website, logo_url } = req.body;

    if (req.user.role === 'recruiter') {
      const [check] = await pool.query('SELECT id FROM companies WHERE id = ? AND recruiter_id = ?', [companyId, req.user.id]);
      if (check.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền sửa công ty này.' });
      }
    }

    await pool.query(
      'UPDATE companies SET name=?, description=?, address=?, website=?, logo_url=? WHERE id=?',
      [name, description, address, website, logo_url, companyId]
    );

    res.json({ message: 'Cập nhật công ty thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật.' });
  }
});


  }
});

module.exports = router;
