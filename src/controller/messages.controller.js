const prisma = require('../lib/db');

// Get messages for a trip
const getTripMessages = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is a member of the trip
    const tripMember = await prisma.tripMember.findFirst({
      where: {
        tripId: parseInt(tripId),
        userId: req.user.id
      }
    });

    if (!tripMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this trip'
      });
    }

    const messages = await prisma.tripMessage.findMany({
      where: {
        tripId: parseInt(tripId)
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: parseInt(limit)
    });

    const totalMessages = await prisma.tripMessage.count({
      where: {
        tripId: parseInt(tripId)
      }
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasMore: offset + messages.length < totalMessages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trip messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Send a message to a trip
const sendMessage = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { content, messageType = 'TEXT' } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if user is a member of the trip
    const tripMember = await prisma.tripMember.findFirst({
      where: {
        tripId: parseInt(tripId),
        userId: req.user.id
      }
    });

    if (!tripMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this trip'
      });
    }

    const message = await prisma.tripMessage.create({
      data: {
        content: content.trim(),
        senderId: req.user.id,
        tripId: parseInt(tripId)
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Update a message
const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if message exists and user owns it
    const existingMessage = await prisma.tripMessage.findUnique({
      where: { id: parseInt(messageId) }
    });

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (existingMessage.senderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    const updatedMessage = await prisma.tripMessage.update({
      where: { id: parseInt(messageId) },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Check if message exists and user owns it
    const existingMessage = await prisma.tripMessage.findUnique({
      where: { id: parseInt(messageId) }
    });

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (existingMessage.senderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await prisma.tripMessage.delete({
      where: { id: parseInt(messageId) }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

module.exports = {
  getTripMessages,
  sendMessage,
  updateMessage,
  deleteMessage
};