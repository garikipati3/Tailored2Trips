const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTripMessages,
  sendMessage,
  updateMessage,
  deleteMessage
} = require('../controller/messages.controller');

// Get messages for a trip
router.get('/trip/:tripId', protect, getTripMessages);

// Send a message to a trip
router.post('/trip/:tripId', protect, sendMessage);

// Update a message
router.put('/:messageId', protect, updateMessage);

// Delete a message
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;