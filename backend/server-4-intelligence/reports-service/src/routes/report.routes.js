const express = require("express");
const router = express.Router();

const { getDashboard } = require("../controllers/report.controller");

const { verifyToken } = require("../../../../shared/middleware/auth.middleware");

router.get("/dashboard", verifyToken, getDashboard);

module.exports = router;