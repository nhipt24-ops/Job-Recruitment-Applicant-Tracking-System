const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Tạo lịch phỏng vấn (recruiter)
router.post('/', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const { application_id, interview_date, interview_type, location_or_link, notes } = req.body;
    if (!application_id || !interview_date) {
      return res.status(400).json({ message: 'application_id và interview_date là bắt buộc.' });
    }

    // Kiểm tra quyền trên application
    if (req.user.role === 'recruiter') {
      const [check] = await pool.query(
        `SELECT a.id FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN companies c ON j.company_id = c.id
         WHERE a.id = ? AND c.recruiter_id = ?`,
        [application_id, req.user.id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền tạo lịch cho đơn này.' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO interviews (application_id, interview_date, interview_type, location_or_link, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [application_id, interview_date, interview_type || 'online', location_or_link || null, notes || null]
    );

    // Cập nhật status application thành interview
    await pool.query('UPDATE applications SET status = "interview" WHERE id = ?', [application_id]);

    res.status(201).json({ message: 'Tạo lịch phỏng vấn thành công.', interviewId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi tạo lịch phỏng vấn.' });
  }
});

// Cập nhật kết quả / thông tin phỏng vấn
router.put('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const { interview_date, interview_type, location_or_link, notes, result } = req.body;
    const interviewId = req.params.id;

    if (req.user.role === 'recruiter') {
      const [check] = await pool.query(
        `SELECT i.id FROM interviews i
         JOIN applications a ON i.application_id = a.id
         JOIN jobs j ON a.job_id = j.id
         JOIN companies c ON j.company_id = c.id
         WHERE i.id = ? AND c.recruiter_id = ?`,
        [interviewId, req.user.id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền sửa lịch này.' });
      }
    }

    await pool.query(
      `UPDATE interviews SET interview_date=?, interview_type=?, location_or_link=?, notes=?, result=?
       WHERE id=?`,
      [interview_date, interview_type, location_or_link, notes, result || 'pending', interviewId]
    );

    res.json({ message: 'Cập nhật lịch phỏng vấn thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật.' });
  }
});

// Recruiter xem danh sách phỏng vấn
router.get('/for-recruiter', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    let sql, params;
    if (req.user.role === 'admin') {
      sql = `
        SELECT i.*, a.status AS app_status, u.full_name AS applicant_name, u.email,
               j.title AS job_title, c.name AS company_name
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        JOIN users u ON a.user_id = u.id
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        ORDER BY i.interview_date DESC
      `;
      params = [];
    } else {
      sql = `
        SELECT i.*, a.status AS app_status, u.full_name AS applicant_name, u.email,
               j.title AS job_title, c.name AS company_name
        FROM interviews i
        JOIN applications a ON i.application_id = a.id
        JOIN users u ON a.user_id = u.id
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE c.recruiter_id = ?
        ORDER BY i.interview_date DESC
      `;
      params = [req.user.id];
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Ứng viên xem lịch phỏng vấn của mình
router.get('/my', authenticateToken, authorizeRoles('job_seeker'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, j.title AS job_title, c.name AS company_name
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.user_id = ?
       ORDER BY i.interview_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

module.exports = router;
