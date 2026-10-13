const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Lấy danh sách job (public + có thể filter)
router.get('/', async (req, res) => {
  try {
    const { search, location, job_type, status } = req.query;
    let sql = `
      SELECT j.*, c.name AS company_name, c.logo_url, u.full_name AS created_by_name
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      JOIN users u ON j.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND j.status = ?';
      params.push(status);
    } else {
      sql += ' AND j.status = "open"';
    }

    if (search) {
      sql += ' AND (j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (location) {
      sql += ' AND j.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (job_type) {
      sql += ' AND j.job_type = ?';
      params.push(job_type);
    }

    sql += ' ORDER BY j.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách việc làm.' });
  }
});

// Jobs của recruiter hiện tại (phải đặt trước /:id)
router.get('/my/list', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    let sql, params;
    if (req.user.role === 'admin') {
      sql = `SELECT j.*, c.name AS company_name FROM jobs j JOIN companies c ON j.company_id = c.id ORDER BY j.created_at DESC`;
      params = [];
    } else {
      sql = `SELECT j.*, c.name AS company_name FROM jobs j
             JOIN companies c ON j.company_id = c.id
             WHERE c.recruiter_id = ? ORDER BY j.created_at DESC`;
      params = [req.user.id];
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });

// Chi tiết 1 job
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, c.name AS company_name, c.description AS company_description,
              c.address AS company_address, c.website, c.logo_url
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Tạo job (recruiter)
router.post('/', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const { company_id, title, description, requirements, location, salary_min, salary_max, job_type, status } = req.body;

    if (!company_id || !title || !description) {
      return res.status(400).json({ message: 'company_id, title và description là bắt buộc.' });
    }

    // Kiểm tra company thuộc về recruiter này (trừ admin)
    if (req.user.role === 'recruiter') {
      const [comp] = await pool.query('SELECT id FROM companies WHERE id = ? AND recruiter_id = ?', [company_id, req.user.id]);
      if (comp.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền đăng tin cho công ty này.' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO jobs (company_id, title, description, requirements, location, salary_min, salary_max, job_type, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id, title, description, requirements || null, location || null,
        salary_min || null, salary_max || null, job_type || 'full_time',
        status || 'open', req.user.id
      ]
    );

    res.status(201).json({ message: 'Tạo tin tuyển dụng thành công.', jobId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi tạo tin tuyển dụng.' });
  }
});

// Cập nhật job
router.put('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const jobId = req.params.id;
    const { title, description, requirements, location, salary_min, salary_max, job_type, status } = req.body;

    // Kiểm tra quyền
    if (req.user.role === 'recruiter') {
      const [check] = await pool.query(
        `SELECT j.id FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE j.id = ? AND c.recruiter_id = ?`,
        [jobId, req.user.id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền sửa tin này.' });
      }
    }

    await pool.query(
      `UPDATE jobs SET title=?, description=?, requirements=?, location=?,
       salary_min=?, salary_max=?, job_type=?, status=? WHERE id=?`,
      [title, description, requirements, location, salary_min, salary_max, job_type, status, jobId]
    );

    res.json({ message: 'Cập nhật tin tuyển dụng thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật.' });
  }
});

// Xóa job
router.delete('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), async (req, res) => {
  try {
    const jobId = req.params.id;

    if (req.user.role === 'recruiter') {
      const [check] = await pool.query(
        `SELECT j.id FROM jobs j
         JOIN companies c ON j.company_id = c.id
         WHERE j.id = ? AND c.recruiter_id = ?`,
        [jobId, req.user.id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa tin này.' });
      }
    }

    await pool.query('DELETE FROM jobs WHERE id = ?', [jobId]);
    res.json({ message: 'Đã xóa tin tuyển dụng.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi xóa.' });
  }
});


  }
});

module.exports = router;
