const express = require("express");
const router = express.Router();

const {
  createCostEntry,
  getCostEntries,
  deleteCostEntry,
  getCostDistribution,
  getProductSummary,
} = require("../controllers/cost.controller");

const { verifyToken } = require("../../../../shared/middleware/auth.middleware");
const { authorizeRoles } = require("../../../../shared/middleware/role.middleware");

// ── Cost Entry CRUD ────────────────────────────
router.post("/", verifyToken, authorizeRoles("admin", "manager"), createCostEntry);
router.get("/", verifyToken, getCostEntries);
router.delete("/:entryId", verifyToken, authorizeRoles("admin"), deleteCostEntry);

// ── Analytics ──────────────────────────────────
// Must be defined before /:entryId to avoid route conflicts
router.get("/distribution", verifyToken, getCostDistribution);
router.get("/products", verifyToken, getProductSummary);

module.exports = router;
