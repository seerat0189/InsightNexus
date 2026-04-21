const express = require("express");
const router = express.Router();

const { createItem, getItems, updateStock, deleteItem, updateReorder } = require("../controllers/inventory.controller");

const { verifyToken } = require("../../../../shared/middleware/auth.middleware");
const { authorizeRoles } = require("../../../../shared/middleware/role.middleware");

router.post("/", verifyToken, authorizeRoles("admin", "manager"), createItem);
router.get("/", verifyToken, getItems);
router.patch("/:itemId/stock", verifyToken, authorizeRoles("admin", "manager"), updateStock);
router.patch("/:itemId/reorder", verifyToken, authorizeRoles("admin", "manager"), updateReorder);
router.delete("/:itemId", verifyToken, authorizeRoles("admin"), deleteItem);

module.exports = router;