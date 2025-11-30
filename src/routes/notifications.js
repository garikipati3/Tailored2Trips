const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controller/notifications.controller');

// Get user notifications
router.get('/', protect, getUserNotifications);

// Mark notification as read
router.put('/:notificationId/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Delete notification
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;