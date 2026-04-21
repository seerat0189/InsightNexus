const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  upsertPerformance,
  getPerformance,
  getAllPerformance,
  getBestSupplier,
  addDeliveryRecord,
} = require("../controllers/supplier.controller");

const { verifyToken } = require("../../../../shared/middleware/auth.middleware");
const { authorizeRoles } = require("../../../../shared/middleware/role.middleware");

router.post("/", verifyToken, authorizeRoles("admin", "manager"), createSupplier);
router.get("/", verifyToken, getSuppliers);
router.put("/:supplierId", verifyToken, authorizeRoles("admin", "manager"), updateSupplier);
router.delete("/:supplierId", verifyToken, authorizeRoles("admin"), deleteSupplier);

router.get("/best", verifyToken, getBestSupplier);

router.get("/performance/all", verifyToken, getAllPerformance);
router.post("/:supplierId/performance", verifyToken, authorizeRoles("admin", "manager"), upsertPerformance);
router.get("/:supplierId/performance", verifyToken, getPerformance);

router.post("/:supplierId/delivery", verifyToken, authorizeRoles("admin", "manager"), addDeliveryRecord);

module.exports = router;