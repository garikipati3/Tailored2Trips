import React, { useState, useEffect } from 'react';
import fetcher from '../utils/fetcher';
import ReviewsList from './ReviewsList';
import WeatherWidget from './WeatherWidget';

const PlaceDetails = ({ placeId, onClose, onAddToItinerary }) => {
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails();
      fetchCurrentUser();
    }
  }, [placeId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetcher('/api/user/profile');
      if (response.success) {
        setCurrentUserId(response.data.id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPlaceDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetcher(`/api/places/details/${placeId}`);
      
      if (response.success && response.data.place) {
        setPlace(response.data.place);
      } else {
        setError('Failed to load place details');
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setError('Failed to load place details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatOpeningHours = (openingHours) => {
    if (!openingHours || !openingHours.weekday_text) return null;
    
    return openingHours.weekday_text.map((day, index) => (
      <div key={index} className="text-sm text-gray-600">
        {day}
      </div>
    ));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!place) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{place.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-3">
              {place.rating && (
                <div className="flex items-center space-x-1">
                  <div className="flex">{renderStars(place.rating)}</div>
                  <span className="text-sm text-gray-600">
                    {place.rating} ({place.user_ratings_total || 0} reviews)
                  </span>
                </div>
              )}
              {place.price_level && (
                <div className="text-sm text-gray-600">
                  Price: {'$'.repeat(place.price_level)}
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-2">{place.formatted_address}</p>
            
            {place.formatted_phone_number && (
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Phone:</span> {place.formatted_phone_number}
              </p>
            )}
            
            {place.website && (
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Website:</span>{' '}
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {place.website}
                </a>
              </p>
            )}
          </div>

          {/* Opening Hours */}
          {place.opening_hours && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Opening Hours</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    place.opening_hours.open_now 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {place.opening_hours.open_now ? 'Open Now' : 'Closed'}
                  </span>
                </div>
                {formatOpeningHours(place.opening_hours)}
              </div>
            </div>
          )}

          {/* Weather */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Weather</h3>
            <WeatherWidget placeId={placeId} className="w-full" />
          </div>

          {/* Reviews */}
          <div className="mb-6">
            <ReviewsList
              targetType="PLACE"
              targetId={placeId}
              currentUserId={currentUserId}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {onAddToItinerary && (
              <button
                onClick={() => onAddToItinerary(place)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Itinerary
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;