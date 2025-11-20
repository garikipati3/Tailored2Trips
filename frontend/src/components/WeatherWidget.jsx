import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Thermometer } from 'lucide-react';

const WeatherWidget = ({ placeId, coordinates, className = '' }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    fetchWeatherData();
  }, [placeId, coordinates]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      let weatherResponse, forecastResponse;

      if (placeId) {
        // Fetch weather for a specific place
        weatherResponse = await fetch(`/api/weather/place/${placeId}`, {
          credentials: 'include'
        });
      } else if (coordinates?.lat && coordinates?.lon) {
        // Fetch weather by coordinates
        weatherResponse = await fetch(
          `/api/weather/current?lat=${coordinates.lat}&lon=${coordinates.lon}`,
          { credentials: 'include' }
        );
        
        forecastResponse = await fetch(
          `/api/weather/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&days=5`,
          { credentials: 'include' }
        );
      } else {
        throw new Error('Either placeId or coordinates are required');
      }

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json();
      setWeather(weatherData.data);

      if (forecastResponse) {
        const forecastData = await forecastResponse.json();
        setForecast(forecastData.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition, size = 24) => {
    const iconProps = { size, className: 'text-blue-500' };
    
    switch (condition?.toLowerCase()) {
      case 'clear':
        return <Sun {...iconProps} className="text-yellow-500" />;
      case 'clouds':
        return <Cloud {...iconProps} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain {...iconProps} />;
      case 'snow':
        return <CloudSnow {...iconProps} />;
      default:
        return <Cloud {...iconProps} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="text-center text-red-600">
          <Cloud size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Weather data unavailable</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{weather.location.name}</h3>
            <p className="text-blue-100 text-sm">{weather.location.country}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weather.current.condition, 32)}
              <span className="text-2xl font-bold">{weather.current.temperature}°C</span>
            </div>
            <p className="text-blue-100 text-sm capitalize">{weather.current.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {forecast && (
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'current'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'forecast'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            5-Day Forecast
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {activeTab === 'current' && (
          <div className="space-y-4">
            {/* Feels Like */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Feels like</span>
              <span className="font-medium">{weather.current.feelsLike}°C</span>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Droplets size={16} className="text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Humidity</p>
                  <p className="text-sm font-medium">{weather.current.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Wind size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Wind</p>
                  <p className="text-sm font-medium">{weather.current.windSpeed} m/s</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Eye size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Visibility</p>
                  <p className="text-sm font-medium">{weather.current.visibility} km</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Thermometer size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Pressure</p>
                  <p className="text-sm font-medium">{weather.current.pressure} hPa</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forecast' && forecast && (
          <div className="space-y-3">
            {forecast.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(day.condition.main, 20)}
                  <div>
                    <p className="text-sm font-medium">{formatDate(day.date)}</p>
                    <p className="text-xs text-gray-500 capitalize">{day.condition.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {day.temperature.max}° / {day.temperature.min}°
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Droplets size={12} className="mr-1" />
                      {day.humidity}%
                    </span>
                    <span className="flex items-center">
                      <Wind size={12} className="mr-1" />
                      {day.windSpeed}m/s
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="px-4 pb-2">
        <p className="text-xs text-gray-400">
          Last updated: {new Date(weather.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default WeatherWidget;