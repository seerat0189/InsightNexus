const express = require("express");
const router = express.Router();

const { addTransaction, getTransactions, getBurnRate, getRunway } = require("../controllers/finance.controller");

const { verifyToken } = require("../../../../shared/middleware/auth.middleware");
const { authorizeRoles } = require("../../../../shared/middleware/role.middleware");

router.post("/", verifyToken, authorizeRoles("admin", "manager"), addTransaction);
router.get("/", verifyToken, getTransactions);
router.get("/burn-rate", verifyToken, authorizeRoles("admin", "manager"), getBurnRate);
router.post("/runway", verifyToken, authorizeRoles("admin"), getRunway);

module.exports = router;