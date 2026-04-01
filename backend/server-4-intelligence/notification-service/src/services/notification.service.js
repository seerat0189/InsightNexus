const Notification = require("../models/Notification");

// ──────────────────────────────────────────────
// NOTIFICATION OPERATIONS
// ──────────────────────────────────────────────

exports.createNotification = async (data) => {
  const notification = await Notification.create(data);
  return notification;
};

exports.getNotifications = async (companyId) => {
  return await Notification.find({ companyId }).sort({ createdAt: -1 });
};

exports.getUnreadCount = async (companyId) => {
  return await Notification.countDocuments({ companyId, read: false });
};

exports.markAsRead = async (notificationId, companyId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, companyId },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) throw new Error("Notification not found");
  return notification;
};

exports.markAllAsRead = async (companyId) => {
  const result = await Notification.updateMany(
    { companyId, read: false },
    { $set: { read: true } }
  );

  return { modifiedCount: result.modifiedCount };
};

exports.deleteNotification = async (notificationId, companyId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    companyId,
  });

  if (!notification) throw new Error("Notification not found");
  return notification;
};
