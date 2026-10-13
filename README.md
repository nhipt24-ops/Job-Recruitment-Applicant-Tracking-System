# Job Recruitment & Applicant Tracking System
## Hệ thống tuyển dụng và theo dõi ứng viên (Đề tài số 10)

Dự án cuối kỳ nhóm 4 người. Sản phẩm chạy được thật với MySQL + Node.js + giao diện Bootstrap.

---

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Backend    | Node.js, Express, mysql2, bcrypt, jsonwebtoken |
| Frontend   | HTML, CSS, Bootstrap 5, JavaScript thuần |
| Database   | MySQL 8.x |
| Công cụ    | VS Code, MySQL Workbench, Git |

---

## 2. Chức năng đã hoàn thành

### Job Seeker (Người tìm việc)
- Đăng ký / Đăng nhập / Đăng xuất
- Xem danh sách & tìm kiếm việc làm
- Xem chi tiết tin tuyển dụng
- Tạo / cập nhật hồ sơ cá nhân (skills, experience, education...)
- Nộp đơn ứng tuyển + cover letter
- Theo dõi trạng thái đơn
- Xem lịch phỏng vấn

### Recruiter (Nhà tuyển dụng)
- Quản lý thông tin công ty
- CRUD tin tuyển dụng
- Xem danh sách ứng viên ứng tuyển
- Cập nhật trạng thái hồ sơ (pending → reviewing → interview → offered / rejected / hired)
- Tạo & quản lý lịch phỏng vấn

### Admin
- Xem thống kê hệ thống
- Quản lý người dùng (đổi role, xóa)
- Phân quyền

---

## 3. Cài đặt & Chạy trên Windows (ASUS)

### Bước 1: Cài phần mềm cần thiết
1. **Node.js** (LTS): https://nodejs.org → cài xong mở CMD gõ `node -v`
2. **MySQL** + **MySQL Workbench**: https://dev.mysql.com/downloads/installer/
3. **VS Code**: https://code.visualstudio.com
4. **Git** (nếu chưa có): https://git-scm.com

### Bước 2: Tạo database
1. Mở **MySQL Workbench** → kết nối Local instance
2. File → Open SQL Script → chọn file `database.sql`
3. Nhấn **Execute** (biểu tượng sét)
4. Kiểm tra database `job_ats` đã xuất hiện bên trái

### Bước 3: Cấu hình Backend
1. Mở thư mục `job-ats` bằng VS Code
2. Vào thư mục `backend`
3. Copy file `.env.example` thành `.env`
4. Sửa nội dung `.env`:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mật_khẩu_mysql_của_bạn
DB_NAME=job_ats
JWT_SECRET=mot_chuoi_bi_mat_dai_va_ngau_nhien
```

### Bước 4: Cài dependency & chạy
Mở terminal trong VS Code (Ctrl + `) rồi chạy lần lượt:

```bash
cd backend
npm install
npm start
```

Khi thấy dòng:
```
Job ATS Server đang chạy tại:
http://localhost:3000
```
→ Mở trình duyệt vào **http://localhost:3000**

---

## 4. Tài khoản demo (mật khẩu: 123456)

| Vai trò    | Email                    | Mật khẩu |
|------------|--------------------------|----------|
| Admin      | admin@ats.com            | 123456   |
| Recruiter  | recruiter1@company.com   | 123456   |
| Job Seeker | seeker1@gmail.com        | 123456   |
| Job Seeker | seeker2@gmail.com        | 123456   |

---

## 5. Cấu trúc thư mục

```
job-ats/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── routes/          (auth, jobs, applications, companies, profiles, interviews, admin)
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── css/style.css
│   ├── js/api.js, auth.js
│   ├── pages/           (seeker, recruiter, admin dashboard)
│   ├── index.html
│   ├── login.html
│   └── register.html
├── database.sql
├── README.md
└── .gitignore
```

---

## 6. Đưa code lên GitHub

```bash
cd job-ats
git init
git add .
git commit -m "Initial commit: Job ATS full source"
git branch -M main
git remote add origin https://github.com/USERNAME/job-ats.git
git push -u origin main
```

**Lưu ý**: Không commit file `.env` (đã có trong `.gitignore`).

---

## 7. Kiểm thử nhanh

1. Đăng nhập Admin → xem thống kê
2. Đăng nhập Recruiter → tạo tin tuyển dụng, xem ứng viên, tạo lịch PV
3. Đăng nhập Seeker → tìm việc, nộp đơn, cập nhật hồ sơ, xem trạng thái
4. Đổi trạng thái đơn từ phía Recruiter → Seeker thấy thay đổi

---

## 8. Ghi chú cho báo cáo

- **Kiến trúc**: 3-tier (Frontend ↔ REST API Backend ↔ MySQL)
- **Bảo mật**: bcrypt hash mật khẩu, JWT token, phân quyền theo role (middleware)
- **CRUD**: đầy đủ trên Jobs, Applications, Companies, Profiles, Interviews, Users
- **Database**: 6 bảng, khóa ngoại, UNIQUE constraint, dữ liệu mẫu sẵn

