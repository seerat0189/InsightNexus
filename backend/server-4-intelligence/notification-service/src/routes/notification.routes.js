const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

const { verifyToken } = require("../../../../shared/middleware/auth.middleware");
const { authorizeRoles } = require("../../../../shared/middleware/role.middleware");

// ── Notifications ──────────────────────────────
// Must be defined before /:id to avoid route conflicts
router.get("/unread-count", verifyToken, getUnreadCount);
router.patch("/read-all", verifyToken, markAllAsRead);

// router.post("/", verifyToken, authorizeRoles("admin", "manager"), createNotification); // service-to-service token
router.post("/", verifyToken, createNotification);
router.get("/", verifyToken, getNotifications);
router.patch("/:id/read", verifyToken, markAsRead);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteNotification);

module.exports = router;
