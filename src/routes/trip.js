const express = require("express");
const {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addTripMember,
  removeTripMember,
  updateMemberRole
} = require("../controller/trip.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All trip routes require authentication
router.use(protect);

// Trip CRUD operations
router.post("/", createTrip);
router.get("/", getUserTrips);
router.get("/:tripId", getTripById);
router.put("/:tripId", updateTrip);
router.delete("/:tripId", deleteTrip);

// Trip member management
router.post("/:tripId/members", addTripMember);
router.delete("/:tripId/members/:memberId", removeTripMember);
router.put("/:tripId/members/:memberId/role", updateMemberRole);

module.exports = router;