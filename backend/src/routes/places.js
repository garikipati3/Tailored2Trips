const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  searchPlaces,
  getPlaceDetails,
  getNearbyPlaces,
  getPlacePhoto,
  autocompletePlaces
} = require("../controller/places.controller");

// Search places
router.get("/search", protect, searchPlaces);
// Autocomplete place suggestions
router.get("/autocomplete", protect, autocompletePlaces);

// Get place details by place_id
router.get("/details/:placeId", protect, getPlaceDetails);

// Get nearby places
router.get("/nearby", protect, getNearbyPlaces);

// Get place photo
router.get("/photo/:photoReference", protect, getPlacePhoto);

module.exports = router;
