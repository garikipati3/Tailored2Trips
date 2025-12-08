const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getUserProfile,
  updateUserProfile,
  deactivateAccount
} = require("../controller/user.profile.controller");
const {
  getUserPreferences,
  updateUserPreferences,
  getPreferenceOptions
} = require("../controller/user.preferences.controller");

const router = express.Router();

// Profile routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.delete("/account", protect, deactivateAccount);

// Preferences routes
router.get("/preferences", protect, getUserPreferences);
router.put("/preferences", protect, updateUserPreferences);
router.get("/preferences/options", getPreferenceOptions);

module.exports = router;