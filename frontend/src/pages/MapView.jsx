import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopBar from '../components/TopBar';
import TripMap from '../components/TripMap';
import fetcher from '../utils/fetcher';

const MapView = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [itineraryItems, setItineraryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      
      // Fetch trip details
      const tripResponse = await fetcher(`/api/trips/${tripId}`);
      if (tripResponse.success) {
        setTrip(tripResponse.data);
      }

      // Fetch itinerary items
      const itineraryResponse = await fetcher(`/api/itinerary/${tripId}`);
      if (itineraryResponse.success) {
        // Add mock coordinates for demonstration (in real app, these would come from Places API)
        const itemsWithCoords = itineraryResponse.data.map((item, index) => ({
          ...item,
          coordinates: generateMockCoordinates(item.location, index)
        }));
        setItineraryItems(itemsWithCoords);
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
      toast.error('Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock coordinates based on location string (in real app, use geocoding)
  const generateMockCoordinates = (location, index) => {
    if (!location) return null;
    
    // Mock coordinates around NYC area for demonstration
    const baseLatLng = { lat: 40.7128, lng: -74.0060 };
    const offset = 0.01;
    
    return {
      lat: baseLatLng.lat + (Math.random() - 0.5) * offset + (index * 0.002),
      lng: baseLatLng.lng + (Math.random() - 0.5) * offset + (index * 0.002)
    };
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };

  const getMapCenter = () => {
    if (itineraryItems.length === 0) return { lat: 40.7128, lng: -74.0060 };
    
    const validItems = itineraryItems.filter(item => item.coordinates);
    if (validItems.length === 0) return { lat: 40.7128, lng: -74.0060 };
    
    const avgLat = validItems.reduce((sum, item) => sum + item.coordinates.lat, 0) / validItems.length;
    const avgLng = validItems.reduce((sum, item) => sum + item.coordinates.lng, 0) / validItems.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map view...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/trips/${tripId}`)}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
              >
                ← Back to Trip Details
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {trip?.title} - Map View
              </h1>
              <p className="text-gray-600 mt-1">
                Interactive map showing your itinerary locations
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {itineraryItems.length} locations
              </p>
              <p className="text-sm text-gray-500">
                {trip?.startDate} - {trip?.endDate}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Itinerary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Itinerary Items
              </h3>
              
              {itineraryItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No itinerary items found</p>
                  <button
                    onClick={() => navigate(`/trips/${tripId}/itinerary`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Add Items to Itinerary
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {itineraryItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedItem?.id === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {item.title}
                          </h4>
                          {item.location && (
                            <p className="text-xs text-gray-500 mt-1">
                              📍 {item.location}
                            </p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.type === 'activity' ? 'bg-red-100 text-red-800' :
                              item.type === 'meal' ? 'bg-orange-100 text-orange-800' :
                              item.type === 'transport' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              Day {item.day}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                <TripMap
                  itineraryItems={itineraryItems}
                  selectedItem={selectedItem}
                  onItemSelect={handleItemSelect}
                  center={getMapCenter()}
                  zoom={12}
                />
              </div>
            </div>
            
            {/* Selected Item Details */}
            {selectedItem && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedItem.title}
                </h3>
                {selectedItem.description && (
                  <p className="text-gray-600 mb-3">{selectedItem.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 capitalize">{selectedItem.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Day:</span>
                    <span className="ml-2">{selectedItem.day}</span>
                  </div>
                  {selectedItem.startTime && (
                    <div>
                      <span className="font-medium text-gray-700">Time:</span>
                      <span className="ml-2">
                        {selectedItem.startTime}
                        {selectedItem.endTime && ` - ${selectedItem.endTime}`}
                      </span>
                    </div>
                  )}
                  {selectedItem.cost && (
                    <div>
                      <span className="font-medium text-gray-700">Cost:</span>
                      <span className="ml-2">${selectedItem.cost}</span>
                    </div>
                  )}
                </div>
                {selectedItem.location && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2">{selectedItem.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;