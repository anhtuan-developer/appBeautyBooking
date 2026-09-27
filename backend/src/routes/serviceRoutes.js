const express = require("express");
const serviceController = require("../controllers/serviceController");

const router = express.Router();

// GET /api/services?search=&salonId=&page=&limit=
router.get("/", serviceController.getAll);

// Giữ route tương thích với phiên bản trước.
router.get("/salon/:salonId", serviceController.getBySalonId);

// GET /api/services/:serviceId?salonId=1
router.get("/:serviceId", serviceController.getById);

module.exports = router;
