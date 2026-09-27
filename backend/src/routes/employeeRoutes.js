const express = require("express");
const employeeController = require("../controllers/employeeController");

const router = express.Router();

router.get("/salon/:salonId", employeeController.getBySalonId);
router.get("/:employeeId", employeeController.getById);

module.exports = router;
