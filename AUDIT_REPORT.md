# Báo cáo rà soát BeautyBooking

## Phạm vi
Đọc mã nguồn trong `backend/src`, `mobile/app`, `mobile/services`, `mobile/context`, `mobile/lib`, `mobile/types`, file cấu hình và script SQL. Không dùng thông tin bí mật trong file `.env` của bản tải lên trong gói bàn giao.

## Phát hiện và xử lý trong bản này
1. Địa chỉ API của thiết bị thật được hard-code trong `mobile/lib/api.ts`. Đã hỗ trợ `EXPO_PUBLIC_API_URL` và thêm `mobile/.env.example`.
2. Backend đã có API thông báo nhưng chưa có màn hình mobile tương ứng. Đã thêm service và màn hình thông báo, hỗ trợ đánh dấu đã đọc.
3. Backend đã có API cập nhật hồ sơ/đổi mật khẩu nhưng chưa có màn hình truy cập thuận tiện. Đã thêm màn hình hồ sơ.
4. Trang chủ trước đây chưa có liên kết rõ ràng đến lịch đặt, thông báo và hồ sơ. Đã bổ sung lối tắt.
5. Đã bổ sung README hướng dẫn cấu hình local và ghi rõ các kiểm tra chưa thực hiện.

## Kết quả kiểm tra
- TypeScript: pass (`tsc --noEmit`).
- Cú pháp JavaScript backend: pass (`node --check`).
- Expo web export: pass.

## Giới hạn còn lại
- Không thể xác minh kết nối SQL Server của máy người dùng chỉ từ file ZIP.
- Chưa thực hiện kiểm thử HTTP end-to-end với database thật.
- Chưa xác minh toàn bộ phản hồi API so với dữ liệu thực tế trong database.
- Chưa kiểm thử trên thiết bị Android/iOS vật lý.
- Cần hoàn thiện/kiểm thử quyền chủ salon/nhân viên, quản lý dịch vụ/lịch làm việc, review, badge số thông báo chưa đọc, xử lý mất mạng và quy trình phát hành.

## Lưu ý bảo mật
Bản bàn giao không chứa `backend/.env` hoặc `node_modules`. Hãy tự tạo `.env` từ `.env.example`, nhập cấu hình local của bạn và không chia sẻ JWT secret/mật khẩu database.
