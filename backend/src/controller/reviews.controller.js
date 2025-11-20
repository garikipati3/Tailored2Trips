const prisma = require("../lib/db");

// Get reviews for a specific place
const getPlaceReviews = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const reviews = await prisma.review.findMany({
      where: { 
        targetType: 'PLACE',
        targetId: placeId 
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const totalReviews = await prisma.review.count({
      where: { 
        targetType: 'PLACE',
        targetId: placeId 
      }
    });

    const averageRating = await prisma.review.aggregate({
      where: { 
        targetType: 'PLACE',
        targetId: placeId 
      },
      _avg: { rating: true }
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit)
        },
        averageRating: averageRating._avg.rating || 0
      }
    });
  } catch (error) {
    console.error('Error fetching place reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

// Get reviews for a specific trip
const getTripReviews = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const reviews = await prisma.review.findMany({
      where: { 
        targetType: 'TRIP',
        targetId: tripId 
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const totalReviews = await prisma.review.count({
      where: { 
        targetType: 'TRIP',
        targetId: tripId 
      }
    });

    const averageRating = await prisma.review.aggregate({
      where: { 
        targetType: 'TRIP',
        targetId: tripId 
      },
      _avg: { rating: true }
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit)
        },
        averageRating: averageRating._avg.rating || 0
      }
    });
  } catch (error) {
    console.error('Error fetching trip reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

// Create a new review
const createReview = async (req, res) => {
  try {
    const { rating, title, content, targetType, targetId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: 'Target type and target ID are required'
      });
    }

    // Validate target type
    if (!['PLACE', 'TRIP', 'USER'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type'
      });
    }

    // Check if user already reviewed this target
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        targetType,
        targetId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        title,
        content,
        userId,
        targetType,
        targetId
      },
      include: {
        user: {
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
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, content } = req.body;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating && { rating: parseInt(rating) }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content })
      },
      include: {
        user: {
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
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        userId
      }
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or unauthorized'
      });
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const totalReviews = await prisma.review.count({
      where: { userId }
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

module.exports = {
  getPlaceReviews,
  getTripReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
};