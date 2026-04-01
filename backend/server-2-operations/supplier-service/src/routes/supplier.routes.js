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
} = require("../controllers/supplier.controller");

const { verifyToken } = require("../../../../shared/middleware/auth.middleware");
const { authorizeRoles } = require("../../../../shared/middleware/role.middleware");

// ── Supplier CRUD ──────────────────────────────
router.post("/", verifyToken, authorizeRoles("admin", "manager"), createSupplier);
router.get("/", verifyToken, getSuppliers);
router.put("/:supplierId", verifyToken, authorizeRoles("admin", "manager"), updateSupplier);
router.delete("/:supplierId", verifyToken, authorizeRoles("admin"), deleteSupplier);

// ── Performance Tracking ───────────────────────
// Must be defined before /:supplierId to avoid route conflicts
router.get("/performance/all", verifyToken, getAllPerformance);
router.post("/:supplierId/performance", verifyToken, authorizeRoles("admin", "manager"), upsertPerformance);
router.get("/:supplierId/performance", verifyToken, getPerformance);

module.exports = router;
