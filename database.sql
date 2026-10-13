-- =============================================
-- Job Recruitment & Applicant Tracking System
-- Database: job_ats
-- Chạy bằng MySQL Workbench (Windows):
--   1. Mở MySQL Workbench → kết nối Local instance
--   2. File → Open SQL Script → chọn file này
--   3. Nhấn biểu tượng sét (Execute) hoặc Ctrl+Shift+Enter
--   4. Kiểm tra database job_ats xuất hiện bên trái
-- =============================================

DROP DATABASE IF EXISTS job_ats;
CREATE DATABASE job_ats CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_ats;

-- 1. Bảng users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('job_seeker', 'recruiter', 'admin') NOT NULL DEFAULT 'job_seeker',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Bảng companies
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    website VARCHAR(100),
    logo_url VARCHAR(255),
    recruiter_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Bảng jobs
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location VARCHAR(100),
    salary_min INT DEFAULT NULL,
    salary_max INT DEFAULT NULL,
    job_type ENUM('full_time', 'part_time', 'internship', 'remote') DEFAULT 'full_time',
    status ENUM('open', 'closed', 'draft') DEFAULT 'open',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- 4. Bảng applicant_profiles
CREATE TABLE applicant_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    skills TEXT,
    experience TEXT,
    education TEXT,
    resume_url VARCHAR(255),
    summary TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Bảng applications
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    cover_letter TEXT,
    status ENUM('pending', 'reviewing', 'interview', 'offered', 'rejected', 'hired') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, user_id)
) ENGINE=InnoDB;

-- 6. Bảng interviews
CREATE TABLE interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    interview_date DATETIME NOT NULL,
    interview_type ENUM('online', 'offline', 'phone') DEFAULT 'online',
    location_or_link VARCHAR(255),
    notes TEXT,
    result ENUM('pending', 'passed', 'failed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==================== DỮ LIỆU MẪU ====================
-- Mật khẩu tất cả tài khoản demo: 123456
-- Hash bcrypt (cost 10)

INSERT INTO users (email, password, full_name, phone, role) VALUES
('admin@ats.com', '$2b$10$QLZ8BiEbalBzURU912DT9eOQPnUkwgO9gspY66a7cGSNGFUP1NLqC', 'Admin Hệ thống', '0900000001', 'admin'),
('recruiter1@company.com', '$2b$10$QLZ8BiEbalBzURU912DT9eOQPnUkwgO9gspY66a7cGSNGFUP1NLqC', 'Nguyễn Văn Recruiter', '0901234567', 'recruiter'),
('seeker1@gmail.com', '$2b$10$QLZ8BiEbalBzURU912DT9eOQPnUkwgO9gspY66a7cGSNGFUP1NLqC', 'Trần Thị Ứng Viên', '0912345678', 'job_seeker'),
('seeker2@gmail.com', '$2b$10$QLZ8BiEbalBzURU912DT9eOQPnUkwgO9gspY66a7cGSNGFUP1NLqC', 'Lê Văn Ứng Viên 2', '0923456789', 'job_seeker');

INSERT INTO companies (name, description, address, website, recruiter_id) VALUES
('TechViet Solutions', 'Công ty phần mềm hàng đầu Việt Nam chuyên phát triển web và mobile.', '123 Nguyễn Huệ, Quận 1, TP.HCM', 'https://techviet.vn', 2),
('Digital Hub VN', 'Startup công nghệ giáo dục và AI.', '45 Lê Lợi, Quận 1, TP.HCM', 'https://digitalhub.vn', 2);

INSERT INTO jobs (company_id, title, description, requirements, location, salary_min, salary_max, job_type, status, created_by) VALUES
(1, 'Fullstack Developer (Node.js + React)', 
 'Phát triển và bảo trì hệ thống web fullstack. Làm việc với team Agile, tham gia code review và deploy.',
 '1+ năm kinh nghiệm Node.js/Express, React, MySQL. Biết Git, REST API. Ưu tiên biết Docker.',
 'TP.HCM', 15000000, 25000000, 'full_time', 'open', 2),

(1, 'Intern Frontend Developer',
 'Thực tập Frontend, hỗ trợ phát triển giao diện người dùng với React và Bootstrap.',
 'Sinh viên năm 3-4, nắm vững HTML/CSS/JavaScript. Biết React là lợi thế.',
 'TP.HCM / Remote', 3000000, 5000000, 'internship', 'open', 2),

(2, 'Backend Developer (Node.js)',
 'Xây dựng API và microservices cho nền tảng giáo dục.',
 'Kinh nghiệm Express, MySQL hoặc MongoDB. Hiểu JWT, authentication.',
 'TP.HCM', 12000000, 20000000, 'full_time', 'open', 2),

(1, 'QA Tester',
 'Kiểm thử phần mềm, viết test case, báo cáo bug.',
 'Có kiến thức cơ bản về testing. Biết Selenium hoặc Postman là lợi thế.',
 'TP.HCM', 10000000, 15000000, 'full_time', 'closed', 2);

INSERT INTO applicant_profiles (user_id, skills, experience, education, summary) VALUES
(3, 'JavaScript, Node.js, Express, MySQL, React, Git', 
 '1 năm freelance phát triển website cho khách hàng nhỏ. Đã làm 2 dự án fullstack.',
 'Đại học Công nghệ Thông tin - ĐHQG TP.HCM (năm cuối)',
 'Sinh viên năm cuối đam mê lập trình web, mong muốn tìm vị trí Fullstack Developer.'),
(4, 'HTML, CSS, Bootstrap, JavaScript cơ bản',
 'Thực tập 3 tháng tại công ty outsource, hỗ trợ làm landing page.',
 'Đại học Khoa học Tự nhiên - ĐHQG TP.HCM (mới tốt nghiệp)',
 'Mới tốt nghiệp, muốn bắt đầu sự nghiệp với vị trí Intern Frontend.');

INSERT INTO applications (job_id, user_id, cover_letter, status) VALUES
(1, 3, 'Em rất quan tâm đến vị trí Fullstack Developer tại TechViet. Em đã có kinh nghiệm Node.js và React, mong được đóng góp cho team.', 'pending'),
(2, 4, 'Em muốn thực tập Frontend tại công ty. Em đã nắm vững HTML/CSS/JS và đang học React.', 'reviewing'),
(3, 3, 'Em cũng quan tâm đến vị trí Backend tại Digital Hub.', 'pending');

INSERT INTO interviews (application_id, interview_date, interview_type, location_or_link, notes, result) VALUES
(2, '2026-10-20 10:00:00', 'online', 'https://meet.google.com/abc-xyz-123', 'Phỏng vấn vòng 1 - kỹ thuật cơ bản', 'pending');

-- ==================== TRUY VẤN KIỂM TRA ====================
SELECT '=== KIỂM TRA DỮ LIỆU ===' AS info;

SELECT 'Users' AS table_name, COUNT(*) AS total FROM users
UNION ALL SELECT 'Companies', COUNT(*) FROM companies
UNION ALL SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL SELECT 'Profiles', COUNT(*) FROM applicant_profiles
UNION ALL SELECT 'Applications', COUNT(*) FROM applications
UNION ALL SELECT 'Interviews', COUNT(*) FROM interviews;

SELECT id, email, full_name, role FROM users;
SELECT id, title, status, location FROM jobs;
SELECT a.id, u.full_name AS applicant, j.title AS job, a.status 
FROM applications a
JOIN users u ON a.user_id = u.id
JOIN jobs j ON a.job_id = j.id;
