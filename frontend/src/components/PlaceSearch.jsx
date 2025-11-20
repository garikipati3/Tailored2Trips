import React, { useState, useEffect, useRef } from 'react';
import fetcher from '../utils/fetcher';

const PlaceSearch = ({ onPlaceSelect, placeholder = "Search for places...", className = "" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        searchPlaces(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle clicks outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaces = async (searchQuery) => {
    try {
      setIsLoading(true);
      const response = await fetcher(`/api/places/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (response.success && response.data.places) {
        setResults(response.data.places);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setQuery(place.name);
    setShowResults(false);
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.trim().length <= 2) {
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    if (results.length > 0 && query.trim().length > 2) {
      setShowResults(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={searchRef} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {results.map((place) => (
            <div
              key={place.place_id}
              onClick={() => handlePlaceSelect(place)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {place.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {place.formatted_address}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    {place.rating && (
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.trim().length > 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">No places found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;