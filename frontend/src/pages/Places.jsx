import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import PlaceSearch from '../components/PlaceSearch';
import PlaceDetails from '../components/PlaceDetails';
import fetcher from '../utils/fetcher';
import { toast } from 'react-toastify';

const Places = () => {
  const { tripId } = useParams();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null);

  const categories = [
    { id: 'all', name: 'All Places', icon: '🏢' },
    { id: 'tourist_attraction', name: 'Attractions', icon: '🎭' },
    { id: 'restaurant', name: 'Restaurants', icon: '🍽️' },
    { id: 'lodging', name: 'Hotels', icon: '🏨' },
    { id: 'shopping_mall', name: 'Shopping', icon: '🛍️' },
    { id: 'museum', name: 'Museums', icon: '🏛️' },
    { id: 'park', name: 'Parks', icon: '🌳' },
    { id: 'hospital', name: 'Healthcare', icon: '🏥' },
    { id: 'gas_station', name: 'Gas Stations', icon: '⛽' }
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          fetchNearbyPlaces(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (Sydney) if geolocation fails
          const defaultLocation = { lat: -33.8688, lng: 151.2093 };
          setUserLocation(defaultLocation);
          fetchNearbyPlaces(defaultLocation.lat, defaultLocation.lng);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyPlaces(userLocation.lat, userLocation.lng, selectedCategory);
    }
  }, [selectedCategory, userLocation]);

  const fetchNearbyPlaces = async (lat, lng, type = 'all') => {
    try {
      setIsLoadingNearby(true);
      const typeParam = type !== 'all' ? `&type=${type}` : '';
      const response = await fetcher(`/api/places/nearby?lat=${lat}&lng=${lng}${typeParam}`);
      
      if (response.success && response.data.places) {
        setNearbyPlaces(response.data.places);
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      toast.error('Failed to load nearby places');
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
  };

  const handleAddToItinerary = async (place) => {
    try {
      // This would integrate with the itinerary system
      const itineraryItem = {
        title: place.name,
        description: `Visit ${place.name}`,
        location: place.formatted_address,
        type: 'activity',
        startTime: '09:00',
        endTime: '11:00',
        cost: 0,
        day: 1 // Default to day 1, user can change later
      };

      const response = await fetcher(`/api/itinerary/${tripId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itineraryItem),
      });

      if (response.success) {
        toast.success(`${place.name} added to itinerary!`);
        setSelectedPlace(null);
      } else {
        toast.error('Failed to add place to itinerary');
      }
    } catch (error) {
      console.error('Error adding to itinerary:', error);
      toast.error('Failed to add place to itinerary');
    }
  };

  const renderPlaceCard = (place) => (
    <div
      key={place.place_id}
      onClick={() => handlePlaceSelect(place)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {place.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {place.vicinity || place.formatted_address}
          </p>
          <div className="flex items-center mt-2 space-x-3">
            {place.rating && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-gray-600 ml-1">{place.rating}</span>
              </div>
            )}
            {place.price_level && (
              <div className="text-xs text-gray-600">
                {'$'.repeat(place.price_level)}
              </div>
            )}
            {place.distance && (
              <div className="text-xs text-gray-500">
                {(place.distance / 1000).toFixed(1)} km away
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Places</h1>
          <p className="mt-2 text-gray-600">
            Search for places and discover what's around you
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Search Places</h2>
          <PlaceSearch
            onPlaceSelect={handlePlaceSelect}
            placeholder="Search cities or places (type 3+ letters)..."
            className="max-w-md"
            useAutocomplete={true}
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Nearby Places */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedCategory === 'all' ? 'Nearby Places' : `Nearby ${categories.find(c => c.id === selectedCategory)?.name}`}
            </h2>
            {userLocation && (
              <button
                onClick={() => fetchNearbyPlaces(userLocation.lat, userLocation.lng, selectedCategory)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            )}
          </div>

          {isLoadingNearby ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : nearbyPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyPlaces.map(renderPlaceCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No places found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or category filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Place Details Modal */}
      {selectedPlace && (
        <PlaceDetails
          placeId={selectedPlace.place_id}
          onClose={() => setSelectedPlace(null)}
          onAddToItinerary={tripId ? handleAddToItinerary : null}
        />
      )}
    </div>
  );
};

export default Places;
