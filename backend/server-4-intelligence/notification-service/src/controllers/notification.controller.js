const notificationService = require("../services/notification.service");


exports.createNotification = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = {
      ...req.body,
      companyId: req.user.companyId,
    };

    const notification = await notificationService.createNotification(data);

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.companyId);

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.companyId);

    res.status(200).json({ success: true, unreadCount: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, req.user.companyId);

    res.status(200).json({ success: true, notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.companyId);

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await notificationService.deleteNotification(id, req.user.companyId);

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
