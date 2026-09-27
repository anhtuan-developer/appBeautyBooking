const express = require("express");
const salonController = require("../controllers/salonController");

const router = express.Router();

router.get("/", salonController.getAll);
router.get("/:salonId", salonController.getById);

module.exports = router;
