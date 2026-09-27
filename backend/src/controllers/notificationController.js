const notificationService = require("../services/notificationService");

const serviceMessages = {
    INVALID_ID: "ID không hợp lệ.",
    INVALID_NOTIFICATION: "Thông tin thông báo không hợp lệ.",
    NOTIFICATION_TOO_LONG: "Nội dung thông báo vượt quá giới hạn cho phép.",
    NOTIFICATION_NOT_FOUND: "Không tìm thấy thông báo hoặc thông báo không thuộc tài khoản của bạn.",
    INVALID_PAGINATION: "page phải >= 1 và limit phải từ 1 đến 50."
};

async function getMyNotifications(req, res) {
    try {
        const unreadOnly = String(req.query.unreadOnly || "false").toLowerCase() === "true";
        const page = Number(req.query.page || 1);
        const limit = Number(req.query.limit || 20);
        const result = await notificationService.getMyNotifications(req.user.userId, { unreadOnly, page, limit });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách thông báo thành công.",
            data: result
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        return sendServiceError(res, error, "Không thể lấy danh sách thông báo.");
    }
}

async function getUnreadCount(req, res) {
    try {
        const unreadCount = await notificationService.getUnreadCount(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Lấy số thông báo chưa đọc thành công.",
            data: { unreadCount }
        });
    } catch (error) {
        console.error("Get unread notification count error:", error);
        return sendServiceError(res, error, "Không thể lấy số thông báo chưa đọc.");
    }
}

async function markAsRead(req, res) {
    try {
        const result = await notificationService.markAsRead(
            req.user.userId,
            req.params.notificationId
        );

        return res.status(200).json({
            success: true,
            message: "Đã đánh dấu thông báo là đã đọc.",
            data: result
        });
    } catch (error) {
        console.error("Mark notification as read error:", error);
        return sendServiceError(res, error, "Không thể cập nhật thông báo.");
    }
}

async function markAllAsRead(req, res) {
    try {
        const result = await notificationService.markAllAsRead(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Đã đánh dấu tất cả thông báo là đã đọc.",
            data: result
        });
    } catch (error) {
        console.error("Mark all notifications as read error:", error);
        return sendServiceError(res, error, "Không thể cập nhật thông báo.");
    }
}

function sendServiceError(res, error, fallbackMessage) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: serviceMessages[error.message] || fallbackMessage
    });
}

module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
