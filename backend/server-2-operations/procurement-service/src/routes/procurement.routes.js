const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require("../controllers/procurement.controller");

const { verifyToken } = require("../../../../shared/middleware/auth.middleware");
const { authorizeRoles } = require("../../../../shared/middleware/role.middleware");

router.post("/", verifyToken, authorizeRoles("admin", "manager"), createOrder);
router.get("/", verifyToken, getOrders);
router.patch("/:orderId/status", verifyToken, authorizeRoles("admin", "manager"), updateOrderStatus);

module.exports = router;