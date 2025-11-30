const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPlaceReviews,
  getTripReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
} = require('../controller/reviews.controller');

// Get reviews for a specific place
router.get('/places/:placeId', getPlaceReviews);

// Get reviews for a specific trip
router.get('/trips/:tripId', getTripReviews);

// Get current user's reviews
router.get('/my-reviews', protect, getUserReviews);

// Create a new review
router.post('/', protect, createReview);

// Update a review
router.put('/:reviewId', protect, updateReview);

// Delete a review
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;