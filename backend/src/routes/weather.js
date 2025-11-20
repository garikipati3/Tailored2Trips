const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCurrentWeather,
  getWeatherForecast,
  getPlaceWeather
} = require('../controller/weather.controller');

// Get current weather by coordinates
router.get('/current', protect, getCurrentWeather);

// Get weather forecast by coordinates
router.get('/forecast', protect, getWeatherForecast);

// Get weather for a specific place
router.get('/place/:placeId', protect, getPlaceWeather);

module.exports = router;