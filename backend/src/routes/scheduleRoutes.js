const express = require("express");
const scheduleController = require("../controllers/scheduleController");

const router = express.Router();

// GET /api/schedules/employee/:employeeId
router.get("/employee/:employeeId", scheduleController.getByEmployeeId);

// GET /api/schedules/employee/:employeeId/available-slots?serviceId=1&date=2026-09-30
router.get("/employee/:employeeId/available-slots", scheduleController.getAvailableSlots);

module.exports = router;
