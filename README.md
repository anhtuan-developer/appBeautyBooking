# BeautyBooking

Ứng dụng đặt lịch salon/chăm sóc sắc đẹp, tiếp tục phát triển trên mã nguồn gốc.

## Công nghệ

- Backend: Node.js, Express, SQL Server, JWT.
- Mobile: React Native, Expo Router, TypeScript.
- Các API hiện có: xác thực, salon, dịch vụ, nhân viên, lịch làm việc, booking, đánh giá, thông báo.

## Cấu trúc

- `backend/`: API và kết nối SQL Server.
- `mobile/`: ứng dụng Expo.
- `BeautyBookingSQL.sql`: script cơ sở dữ liệu hiện có.
- `database/`: truy vấn chẩn đoán booking.

## 1. Chuẩn bị backend

1. Cài Node.js LTS và SQL Server/SQL Server Express cùng ODBC Driver phù hợp.
2. Mở SQL Server Management Studio, tạo/chọn cơ sở dữ liệu và chạy `BeautyBookingSQL.sql` theo cấu hình dự án.
3. Tạo file `backend/.env` từ `backend/.env.example`.
4. Điền đúng máy chủ SQL Server, tên database, driver và một `JWT_SECRET` dài, ngẫu nhiên. Không đưa file `.env` lên Git.
5. Cài và chạy backend:

```bash
cd backend
npm install
npm run dev
```

Kiểm tra API:
- `http://localhost:3000/`
- `http://localhost:3000/api/health`

`/api/health` phải trả trạng thái database thành công trước khi kiểm thử các tính năng cần SQL Server.

## 2. Chuẩn bị ứng dụng Expo

1. Tạo `mobile/.env` từ `mobile/.env.example`.
2. Đặt `EXPO_PUBLIC_API_URL`:
   - Trình duyệt trên cùng máy chạy backend: `http://localhost:3000/api`
   - Điện thoại thật: `http://IP_MAY_TINH:3000/api` (thay bằng IPv4 LAN của máy tính).
3. Điện thoại và máy tính phải dùng mạng có thể kết nối với nhau. Cho phép Node.js qua Windows Firewall trên mạng riêng nếu cần.
4. Cài và chạy:

```bash
cd mobile
npm install
npx expo start
```

Mở bằng Expo Go hoặc nhấn `w` để chạy bản web. Khi thay đổi `.env`, khởi động lại Expo; nếu cấu hình cũ còn lưu, chạy `npx expo start -c`.

## 3. Luồng khách hàng

1. Đăng ký / đăng nhập.
2. Khám phá salon, tìm kiếm và xem chi tiết.
3. Chọn dịch vụ, nhân viên, ngày và khung giờ.
4. Xác nhận đặt lịch.
5. Xem chi tiết hoặc hủy lịch theo trạng thái được backend cho phép.
6. Nhận thông báo; cập nhật hồ sơ và đổi mật khẩu.

## 4. Kiểm tra đã thực hiện trong lần rà soát này

- `npx tsc --noEmit`: thành công.
- `node --check` cho các file JavaScript trong `backend/src`: thành công.
- `npx expo export --platform web`: đóng gói web thành công.

Đây là các kiểm tra tĩnh/đóng gói. Chưa xác nhận kết nối với SQL Server thật, chưa chạy toàn bộ API integration tests trên môi trường đang hoạt động, và chưa kiểm thử trực tiếp trên điện thoại.

## 5. Trước khi triển khai thật

- Thay `JWT_SECRET` bằng giá trị ngẫu nhiên mạnh; không dùng cấu hình mẫu.
- Cấu hình `CORS_ORIGIN` theo domain được phép, không mở tất cả origin trong production.
- Chỉ sử dụng HTTPS khi triển khai công khai; không đưa thông tin bí mật vào biến `EXPO_PUBLIC_*` vì các biến này được đóng gói phía client.
- Kiểm tra quyền truy cập theo vai trò và quyền sở hữu dữ liệu ở backend.
- Kiểm thử booking đồng thời, múi giờ/ngày giờ, thông báo, review, trạng thái hủy và lỗi mất kết nối.
- Tạo bản sao lưu cơ sở dữ liệu và cấu hình logging/monitoring trước khi phát hành.
