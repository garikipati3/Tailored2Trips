const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getTripItinerary,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems
} = require("../controller/itinerary.controller");

const router = express.Router();

// All itinerary routes require authentication
router.use(protect);

// Itinerary routes
router.get("/trip/:tripId", getTripItinerary);
router.post("/trip/:tripId/items", addItineraryItem);
router.put("/trip/:tripId/items/:itemId", updateItineraryItem);
router.delete("/trip/:tripId/items/:itemId", deleteItineraryItem);
router.put("/trip/:tripId/reorder", reorderItineraryItems);

module.exports = router;