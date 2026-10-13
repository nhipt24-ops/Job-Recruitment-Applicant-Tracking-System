# Test Cases - Job Recruitment & Applicant Tracking System

## Tài khoản dùng để test
- Admin: admin@ats.com / 123456
- Recruiter: recruiter1@company.com / 123456
- Seeker: seeker1@gmail.com / 123456

| ID | Chức năng | Vai trò | Bước thực hiện | Kết quả mong đợi | Kết quả thực tế | Pass/Fail |
|----|-----------|---------|----------------|------------------|-----------------|-----------|
| TC01 | Đăng ký | Guest | Điền form đăng ký seeker mới | Tạo tài khoản thành công, chuyển login | | |
| TC02 | Đăng nhập | All | Nhập đúng email + 123456 | Vào đúng dashboard theo role | | |
| TC03 | Đăng nhập sai | Guest | Nhập sai mật khẩu | Báo lỗi "Email hoặc mật khẩu không đúng" | | |
| TC04 | Tìm việc | Seeker | Tìm theo từ khóa "Developer" | Hiện danh sách job phù hợp | | |
| TC05 | Nộp đơn | Seeker | Chọn job + cover letter → Nộp | Thông báo thành công, đơn xuất hiện trong "Đơn ứng tuyển" | | |
| TC06 | Nộp đơn trùng | Seeker | Nộp lại cùng 1 job | Báo "Bạn đã ứng tuyển vị trí này rồi" | | |
| TC07 | Cập nhật hồ sơ | Seeker | Sửa skills/experience → Lưu | Thông báo lưu thành công | | |
| TC08 | Tạo tin tuyển dụng | Recruiter | Điền form tạo job → Lưu | Tin xuất hiện trong danh sách | | |
| TC09 | Sửa / Xóa tin | Recruiter | Sửa hoặc xóa tin của mình | Cập nhật/xóa thành công | | |
| TC10 | Cập nhật trạng thái | Recruiter | Đổi status ứng viên thành interview | Status đổi, seeker thấy được | | |
| TC11 | Tạo lịch PV | Recruiter | Chọn ứng viên → tạo lịch | Lịch xuất hiện, status đơn = interview | | |
| TC12 | Xem thống kê | Admin | Vào tab Thống kê | Hiện số users, jobs, applications, companies | | |
| TC13 | Đổi role | Admin | Đổi role 1 user | Role cập nhật thành công | | |
| TC14 | Phân quyền | Seeker | Thử gọi API admin | 403 Forbidden | | |
| TC15 | Đăng xuất | All | Bấm Đăng xuất | Về trang login, token bị xóa | | |

**Hướng dẫn**: Chạy từng test case, ghi kết quả thực tế và đánh dấu Pass/Fail trước khi nộp bài.
