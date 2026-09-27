const bookingService = require("../services/bookingService");

const serviceMessages = {
    INVALID_DATE: "Ngày đặt lịch không hợp lệ. Dùng định dạng YYYY-MM-DD.",
    INVALID_TIME: "Giờ bắt đầu không hợp lệ. Dùng định dạng HH:mm.",
    INVALID_ID: "employeeId, serviceId hoặc userId không hợp lệ.",
    INVALID_BOOKING_ID: "bookingId không hợp lệ.",
    EMPLOYEE_NOT_FOUND: "Không tìm thấy nhân viên.",
    EMPLOYEE_INACTIVE: "Nhân viên hiện không nhận lịch.",
    SALON_INACTIVE: "Salon hiện không hoạt động.",
    SERVICE_NOT_FOUND: "Không tìm thấy dịch vụ hoặc dịch vụ không thuộc salon của nhân viên.",
    SERVICE_INACTIVE: "Dịch vụ hiện không hoạt động.",
    BOOKING_CROSSES_MIDNIGHT: "Thời lượng dịch vụ vượt quá cuối ngày và không thể đặt lịch.",
    OUTSIDE_WORKING_HOURS: "Thời gian đặt nằm ngoài lịch làm việc của nhân viên.",
    SLOT_ALREADY_BOOKED: "Khung giờ này vừa được người khác đặt. Vui lòng chọn khung giờ khác.",
    BOOKING_LOCK_FAILED: "Khung giờ đang được xử lý bởi một yêu cầu khác. Vui lòng thử lại.",
    BOOKING_IN_PAST: "Không thể đặt lịch vào thời gian đã qua.",
    NOTE_TOO_LONG: "Ghi chú không được vượt quá 500 ký tự.",
    INVALID_PAGINATION: "page phải >= 1 và limit phải từ 1 đến 50.",
    BOOKING_NOT_FINISHED: "Chỉ có thể hoàn thành booking sau khi thời gian dịch vụ đã kết thúc.",
    BOOKING_NOT_FOUND: "Không tìm thấy booking hoặc booking không thuộc tài khoản của bạn.",
    BOOKING_NOT_PENDING: "Chỉ booking đang ở trạng thái PENDING mới được hủy.",
    INVALID_BOOKING_STATUS: "Trạng thái booking không hợp lệ.",
    INVALID_STATUS_TRANSITION: "Không thể chuyển booking sang trạng thái này.",
    FORBIDDEN: "Bạn không có quyền thực hiện thao tác này."
};

async function createBooking(req, res) {
    try {
        const { employeeId, serviceId, bookingDate, startTime, note } = req.body;

        if (!employeeId || !serviceId || !bookingDate || !startTime) {
            return res.status(400).json({
                success: false,
                message: "employeeId, serviceId, bookingDate và startTime là bắt buộc."
            });
        }

        const result = await bookingService.createBooking({
            userId: req.user.userId,
            employeeId,
            serviceId,
            bookingDate,
            startTime,
            note
        });

        return res.status(201).json({
            success: true,
            message: "Đặt lịch thành công.",
            data: result
        });
    } catch (error) {
        console.error("Create booking error:", error);
        return sendServiceError(res, error, "Không thể tạo lịch đặt.");
    }
}

async function getMyBookings(req, res) {
    try {
        const result = await bookingService.getMyBookings(req.user.userId, {
            page: req.query.page,
            limit: req.query.limit,
            status: req.query.status
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách booking thành công.",
            data: result
        });
    } catch (error) {
        console.error("Get my bookings error:", error);
        return sendServiceError(res, error, "Không thể lấy danh sách booking.");
    }
}

async function getBookingDetail(req, res) {
    try {
        const result = await bookingService.getBookingDetail(
            req.user.userId,
            req.params.bookingId
        );

        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết booking thành công.",
            data: result
        });
    } catch (error) {
        console.error("Get booking detail error:", error);
        return sendServiceError(res, error, "Không thể lấy chi tiết booking.");
    }
}

async function cancelBooking(req, res) {
    try {
        const result = await bookingService.cancelBooking(
            req.user.userId,
            req.params.bookingId
        );

        return res.status(200).json({
            success: true,
            message: "Hủy booking thành công.",
            data: result
        });
    } catch (error) {
        console.error("Cancel booking error:", error);
        return sendServiceError(res, error, "Không thể hủy booking.");
    }
}

async function updateBookingStatus(req, res) {
    try {
        const result = await bookingService.updateBookingStatus({
            userId: req.user.userId,
            role: req.user.role,
            bookingId: req.params.bookingId,
            status: req.body.status
        });

        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái booking thành công.",
            data: result
        });
    } catch (error) {
        console.error("Update booking status error:", error);
        return sendServiceError(res, error, "Không thể cập nhật trạng thái booking.");
    }
}

function sendServiceError(res, error, fallbackMessage) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: serviceMessages[error.message] || fallbackMessage,
        ...(error.message === "SLOT_ALREADY_BOOKED" && error.conflict
            ? { conflict: error.conflict }
            : {})
    });
}

module.exports = {
    createBooking,
    getMyBookings,
    getBookingDetail,
    cancelBooking,
    updateBookingStatus
};
