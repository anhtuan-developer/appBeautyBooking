const express = require("express");
const bookingController = require("../controllers/bookingController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Tất cả API booking đều yêu cầu đăng nhập.
router.use(authMiddleware);

// Tạo booking.
router.post("/", bookingController.createBooking);

// Danh sách booking của chính người dùng đang đăng nhập.
router.get("/my-bookings", bookingController.getMyBookings);

// Salon/employee/admin cập nhật trạng thái booking.
router.patch(
    "/:bookingId/status",
    requireRole("SALON", "EMPLOYEE", "ADMIN"),
    bookingController.updateBookingStatus
);

// Xem chi tiết một booking của chính người dùng.
router.get("/:bookingId", bookingController.getBookingDetail);

// Hủy booking: chỉ booking PENDING mới được hủy.
router.patch("/:bookingId/cancel", bookingController.cancelBooking);

module.exports = router;
