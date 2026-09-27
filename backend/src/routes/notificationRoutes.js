const express = require("express");
const notificationController = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", notificationController.getMyNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:notificationId/read", notificationController.markAsRead);

module.exports = router;
