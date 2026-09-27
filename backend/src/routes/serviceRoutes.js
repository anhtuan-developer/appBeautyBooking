const express = require("express");
const serviceController = require("../controllers/serviceController");

const router = express.Router();

router.get("/salon/:salonId", serviceController.getBySalonId);
router.get("/:serviceId", serviceController.getById);

module.exports = router;
