const express = require("express");
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authRateLimit } = require("../middleware/rateLimit");

const router = express.Router();

router.get("/register", (req, res) => {
    res.status(405).json({
        success: false,
        message: "Register dùng POST /api/auth/register",
        method: "POST",
        example: { fullName: "Nguyen Van A", email: "nguyenvana@gmail.com", phone: "0912345678", password: "123456" }
    });
});

router.post("/register", authRateLimit, authController.register);
router.post("/login", authRateLimit, authController.login);
router.get("/me", authMiddleware, authController.me);
router.patch("/profile", authMiddleware, authController.updateProfile);
router.patch("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
