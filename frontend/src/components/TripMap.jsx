import React, { useState, useEffect, useRef } from 'react';

const TripMap = ({ 
  itineraryItems = [], 
  selectedItem = null, 
  onItemSelect = () => {},
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 10 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
      setIsLoaded(true);
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [center, zoom]);

  // Create markers for itinerary items
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers = itineraryItems
      .filter(item => item.coordinates)
      .map((item, index) => {
        const marker = new window.google.maps.Marker({
          position: item.coordinates,
          map,
          title: item.title,
          icon: {
            url: getMarkerIcon(item.type),
            scaledSize: new window.google.maps.Size(32, 32)
          },
          animation: selectedItem?.id === item.id ? window.google.maps.Animation.BOUNCE : null
        });

        marker.addListener('click', () => {
          onItemSelect(item);
        });

        return marker;
      });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  }, [map, itineraryItems, selectedItem, isLoaded]);

  const getMarkerIcon = (type) => {
    const icons = {
      activity: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      meal: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
      transport: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      accommodation: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    };
    return icons[type] || icons.activity;
  };

  const handleDirections = () => {
    if (!map || itineraryItems.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true // Keep our custom markers
    });

    directionsRenderer.setMap(map);

    const waypoints = itineraryItems
      .filter(item => item.coordinates)
      .slice(1, -1) // Exclude start and end points
      .map(item => ({
        location: item.coordinates,
        stopover: true
      }));

    const start = itineraryItems.find(item => item.coordinates)?.coordinates;
    const end = itineraryItems.filter(item => item.coordinates).pop()?.coordinates;

    if (start && end) {
      directionsService.route({
        origin: start,
        destination: end,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        }
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {isLoaded && itineraryItems.length > 1 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleDirections}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Show Route
          </button>
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMap;