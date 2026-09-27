const reviewService = require("../services/reviewService");

const serviceMessages = {
    INVALID_ID: "ID không hợp lệ.",
    INVALID_RATING: "Rating phải là số nguyên từ 1 đến 5.",
    COMMENT_TOO_LONG: "Nội dung đánh giá không được vượt quá 1000 ký tự.",
    BOOKING_NOT_FOUND: "Không tìm thấy booking hoặc booking không thuộc tài khoản của bạn.",
    BOOKING_NOT_COMPLETED: "Chỉ booking đã COMPLETED mới được đánh giá.",
    REVIEW_EXISTS: "Booking này đã được đánh giá trước đó.",
};

async function createReview(req, res) {
    try {
        const { bookingId, rating, comment } = req.body;

        if (!bookingId || rating === undefined || rating === null) {
            return res.status(400).json({
                success: false,
                message: "bookingId và rating là bắt buộc."
            });
        }

        const result = await reviewService.createReview({
            userId: req.user.userId,
            bookingId,
            rating,
            comment
        });

        return res.status(201).json({
            success: true,
            message: "Đánh giá booking thành công.",
            data: result
        });
    } catch (error) {
        console.error("Create review error:", error);
        return sendServiceError(res, error, "Không thể tạo đánh giá.");
    }
}

async function getSalonReviews(req, res) {
    try {
        const reviews = await reviewService.getReviewsBySalonId(req.params.salonId);

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đánh giá thành công.",
            data: {
                total: reviews.length,
                items: reviews
            }
        });
    } catch (error) {
        console.error("Get salon reviews error:", error);
        return sendServiceError(res, error, "Không thể lấy danh sách đánh giá.");
    }
}

async function getMyReviews(req, res) {
    try {
        const reviews = await reviewService.getMyReviews(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Lấy đánh giá của tôi thành công.",
            data: {
                total: reviews.length,
                items: reviews
            }
        });
    } catch (error) {
        console.error("Get my reviews error:", error);
        return sendServiceError(res, error, "Không thể lấy đánh giá của tôi.");
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
    createReview,
    getSalonReviews,
    getMyReviews
};
