const prisma = require('../lib/db');

// Note: You'll need to set OPENWEATHER_API_KEY in your environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Get current weather for a location
const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Weather service not configured'
      });
    }

    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const weatherData = await response.json();

    // Transform the data to a more user-friendly format
    const transformedData = {
      location: {
        name: weatherData.name,
        country: weatherData.sys.country,
        coordinates: {
          lat: weatherData.coord.lat,
          lon: weatherData.coord.lon
        }
      },
      current: {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility / 1000, // Convert to km
        uvIndex: null, // Not available in current weather endpoint
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        condition: weatherData.weather[0].main
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data'
    });
  }
};

// Get weather forecast for a location
const getWeatherForecast = async (req, res) => {
  try {
    const { lat, lon, days = 5 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Weather service not configured'
      });
    }

    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=${Math.min(parseInt(days) * 8, 40)}`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const forecastData = await response.json();

    // Group forecast data by day
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          temperatures: [],
          conditions: [],
          humidity: [],
          windSpeed: [],
          precipitation: 0
        };
      }
      
      dailyForecasts[date].temperatures.push(item.main.temp);
      dailyForecasts[date].conditions.push({
        main: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      });
      dailyForecasts[date].humidity.push(item.main.humidity);
      dailyForecasts[date].windSpeed.push(item.wind.speed);
      
      if (item.rain && item.rain['3h']) {
        dailyForecasts[date].precipitation += item.rain['3h'];
      }
      if (item.snow && item.snow['3h']) {
        dailyForecasts[date].precipitation += item.snow['3h'];
      }
    });

    // Transform to final format
    const transformedForecast = Object.values(dailyForecasts).map(day => ({
      date: day.date,
      temperature: {
        min: Math.round(Math.min(...day.temperatures)),
        max: Math.round(Math.max(...day.temperatures)),
        avg: Math.round(day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length)
      },
      condition: day.conditions[0], // Use first condition of the day
      humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
      windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length),
      precipitation: Math.round(day.precipitation * 10) / 10 // Round to 1 decimal
    }));

    res.json({
      success: true,
      data: {
        location: {
          name: forecastData.city.name,
          country: forecastData.city.country,
          coordinates: {
            lat: forecastData.city.coord.lat,
            lon: forecastData.city.coord.lon
          }
        },
        forecast: transformedForecast
      }
    });
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast'
    });
  }
};

// Get weather for a place
const getPlaceWeather = async (req, res) => {
  try {
    const { placeId } = req.params;

    // Get place coordinates from database
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true
      }
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    if (!place.latitude || !place.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Place coordinates not available'
      });
    }

    // Check if we have a recent weather snapshot
    const recentSnapshot = await prisma.weatherSnapshot.findFirst({
      where: {
        placeId: placeId,
        capturedAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      },
      orderBy: {
        capturedAt: 'desc'
      }
    });

    if (recentSnapshot) {
      return res.json({
        success: true,
        data: recentSnapshot.payload,
        cached: true
      });
    }

    // Fetch fresh weather data
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Weather service not configured'
      });
    }

    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${place.latitude}&lon=${place.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const weatherData = await response.json();

    const transformedData = {
      location: {
        name: place.name,
        country: weatherData.sys.country,
        coordinates: {
          lat: place.latitude,
          lon: place.longitude
        }
      },
      current: {
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility / 1000,
        windSpeed: weatherData.wind.speed,
        windDirection: weatherData.wind.deg,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        condition: weatherData.weather[0].main
      },
      timestamp: new Date().toISOString()
    };

    // Save weather snapshot
    await prisma.weatherSnapshot.create({
      data: {
        placeId: placeId,
        payload: transformedData
      }
    });

    res.json({
      success: true,
      data: transformedData,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching place weather:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data for place'
    });
  }
};

module.exports = {
  getCurrentWeather,
  getWeatherForecast,
  getPlaceWeather
};