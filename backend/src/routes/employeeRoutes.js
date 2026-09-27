const express = require("express");
const employeeController = require("../controllers/employeeController");

const router = express.Router();

// GET /api/employees/salon/:salonId?search=...&page=1&limit=10
router.get("/salon/:salonId", employeeController.getBySalonId);

// GET /api/employees/:employeeId
router.get("/:employeeId", employeeController.getById);

module.exports = router;
