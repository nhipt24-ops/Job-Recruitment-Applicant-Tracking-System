const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Ứng viên nộp đơn
router.post('/', authenticateToken, authorizeRoles('job_seeker'), async (req, res) => {
  try {
    const { job_id, cover_letter } = req.body;
    if (!job_id) {
      return res.status(400).json({ message: 'job_id là bắt buộc.' });
    }

    // Kiểm tra job còn mở
    const [jobs] = await pool.query('SELECT id, status FROM jobs WHERE id = ?', [job_id]);
    if (jobs.length === 0 || jobs[0].status !== 'open') {
      return res.status(400).json({ message: 'Tin tuyển dụng không tồn tại hoặc đã đóng.' });
    }

    // Kiểm tra đã ứng tuyển chưa
    const [exist] = await pool.query(
      'SELECT id FROM applications WHERE job_id = ? AND user_id = ?',
      [job_id, req.user.id]
    );
    if (exist.length > 0) {
      return res.status(400).json({ message: 'Bạn đã ứng tuyển vị trí này rồi.' });
    }

    const [result] = await pool.query(
      'INSERT INTO applications (job_id, user_id, cover_letter) VALUES (?, ?, ?)',
      [job_id, req.user.id, cover_letter || null]
    );

    res.status(201).json({ message: 'Nộp đơn thành công.', applicationId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi nộp đơn.' });
  }
});

// Ứng viên xem đơn của mình
router.get('/my', authenticateToken, authorizeRoles('job_seeker'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, j.title, j.location, j.salary_min, j.salary_max, j.status AS job_status,
              c.name AS company_name
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Recruiter xem ứng viên của các job mình quản lý
router.get('/for-recruiter', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    let sql, params;
    if (req.user.role === 'admin') {
      sql = `
        SELECT a.*, u.full_name, u.email, u.phone, j.title AS job_title, c.name AS company_name,
               p.skills, p.experience, p.education, p.summary
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN applicant_profiles p ON u.id = p.user_id
        ORDER BY a.applied_at DESC
      `;
      params = [];
    } else {
      sql = `
        SELECT a.*, u.full_name, u.email, u.phone, j.title AS job_title, c.name AS company_name,
               p.skills, p.experience, p.education, p.summary
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN applicant_profiles p ON u.id = p.user_id
        WHERE c.recruiter_id = ?
        ORDER BY a.applied_at DESC
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

// Cập nhật trạng thái đơn (recruiter)
router.put('/:id/status', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'reviewing', 'interview', 'offered', 'rejected', 'hired'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const appId = req.params.id;

    // Kiểm tra quyền
    if (req.user.role === 'recruiter') {
      const [check] = await pool.query(
        `SELECT a.id FROM applications a
         JOIN jobs j ON a.job_id = j.id
         JOIN companies c ON j.company_id = c.id
         WHERE a.id = ? AND c.recruiter_id = ?`,
        [appId, req.user.id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật đơn này.' });
      }
    }

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, appId]);
    res.json({ message: 'Cập nhật trạng thái thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái.' });
  }
});

module.exports = router;
