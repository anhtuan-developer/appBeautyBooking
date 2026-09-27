const express = require("express");
const reviewController = require("../controllers/reviewController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Xem review của salon và review của chính mình đều yêu cầu đăng nhập ở giai đoạn backend này.
router.use(authMiddleware);

// Tạo review cho một booking đã COMPLETED của chính user.
router.post("/", reviewController.createReview);

// Review của một salon.
router.get("/salon/:salonId", reviewController.getSalonReviews);

// Review do chính user hiện tại tạo.
router.get("/my-reviews", reviewController.getMyReviews);

module.exports = router;
