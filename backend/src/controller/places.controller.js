const { sendResponse } = require("../utils/sendResponse");

// Search places using Google Places API
const searchPlaces = async (req, res) => {
  try {
    const { query, location, radius = 50000, type } = req.query;

    if (!query) {
      return sendResponse(res, 400, "Query parameter is required");
    }

    // For now, return mock data - will integrate with Google Places API later
    const mockPlaces = [
      {
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        name: "Sydney Opera House",
        formatted_address: "Bennelong Point, Sydney NSW 2000, Australia",
        geometry: {
          location: {
            lat: -33.8567844,
            lng: 151.213108
          }
        },
        rating: 4.6,
        price_level: 3,
        types: ["tourist_attraction", "point_of_interest", "establishment"],
        photos: [
          {
            photo_reference: "mock_photo_reference_1",
            height: 400,
            width: 600
          }
        ],
        opening_hours: {
          open_now: true,
          weekday_text: [
            "Monday: 9:00 AM – 5:00 PM",
            "Tuesday: 9:00 AM – 5:00 PM",
            "Wednesday: 9:00 AM – 5:00 PM",
            "Thursday: 9:00 AM – 5:00 PM",
            "Friday: 9:00 AM – 5:00 PM",
            "Saturday: 9:00 AM – 5:00 PM",
            "Sunday: 9:00 AM – 5:00 PM"
          ]
        }
      },
      {
        place_id: "ChIJP3Sa8ziYEmsRUKgyFmh9AQM",
        name: "Sydney Harbour Bridge",
        formatted_address: "Sydney Harbour Bridge, Sydney NSW, Australia",
        geometry: {
          location: {
            lat: -33.8523341,
            lng: 151.2107085
          }
        },
        rating: 4.7,
        price_level: 2,
        types: ["tourist_attraction", "point_of_interest", "establishment"],
        photos: [
          {
            photo_reference: "mock_photo_reference_2",
            height: 400,
            width: 600
          }
        ],
        opening_hours: {
          open_now: true
        }
      }
    ];

    // Filter by query
    const filteredPlaces = mockPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.formatted_address.toLowerCase().includes(query.toLowerCase())
    );

    return sendResponse(res, 200, "Places retrieved successfully", {
      places: filteredPlaces,
      status: "OK"
    });

  } catch (error) {
    console.error("Error searching places:", error);
    return sendResponse(res, 500, "Internal server error");
  }
};

// Get place details by place_id
const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return sendResponse(res, 400, "Place ID is required");
    }

    // Mock place details - will integrate with Google Places API later
    const mockPlaceDetails = {
      place_id: placeId,
      name: "Sydney Opera House",
      formatted_address: "Bennelong Point, Sydney NSW 2000, Australia",
      formatted_phone_number: "+61 2 9250 7111",
      website: "https://www.sydneyoperahouse.com/",
      geometry: {
        location: {
          lat: -33.8567844,
          lng: 151.213108
        }
      },
      rating: 4.6,
      user_ratings_total: 45234,
      price_level: 3,
      types: ["tourist_attraction", "point_of_interest", "establishment"],
      photos: [
        {
          photo_reference: "mock_photo_reference_1",
          height: 400,
          width: 600
        }
      ],
      opening_hours: {
        open_now: true,
        periods: [
          {
            close: { day: 0, time: "1700" },
            open: { day: 0, time: "0900" }
          }
        ],
        weekday_text: [
          "Monday: 9:00 AM – 5:00 PM",
          "Tuesday: 9:00 AM – 5:00 PM",
          "Wednesday: 9:00 AM – 5:00 PM",
          "Thursday: 9:00 AM – 5:00 PM",
          "Friday: 9:00 AM – 5:00 PM",
          "Saturday: 9:00 AM – 5:00 PM",
          "Sunday: 9:00 AM – 5:00 PM"
        ]
      },
      reviews: [
        {
          author_name: "John Smith",
          author_url: "https://www.google.com/maps/contrib/123456789",
          language: "en",
          profile_photo_url: "https://lh3.googleusercontent.com/a-/mock_photo",
          rating: 5,
          relative_time_description: "2 weeks ago",
          text: "Absolutely stunning architecture and amazing performances. A must-visit when in Sydney!",
          time: 1640995200
        }
      ]
    };

    return sendResponse(res, 200, "Place details retrieved successfully", {
      place: mockPlaceDetails,
      status: "OK"
    });

  } catch (error) {
    console.error("Error getting place details:", error);
    return sendResponse(res, 500, "Internal server error");
  }
};

// Get nearby places
const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type } = req.query;

    if (!lat || !lng) {
      return sendResponse(res, 400, "Latitude and longitude are required");
    }

    // Mock nearby places - will integrate with Google Places API later
    const mockNearbyPlaces = [
      {
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        name: "Sydney Opera House",
        vicinity: "Bennelong Point, Sydney",
        geometry: {
          location: {
            lat: -33.8567844,
            lng: 151.213108
          }
        },
        rating: 4.6,
        price_level: 3,
        types: ["tourist_attraction"],
        distance: 1200 // meters
      },
      {
        place_id: "ChIJP3Sa8ziYEmsRUKgyFmh9AQM",
        name: "Sydney Harbour Bridge",
        vicinity: "Sydney Harbour Bridge, Sydney",
        geometry: {
          location: {
            lat: -33.8523341,
            lng: 151.2107085
          }
        },
        rating: 4.7,
        price_level: 2,
        types: ["tourist_attraction"],
        distance: 800 // meters
      }
    ];

    // Filter by type if provided
    let filteredPlaces = mockNearbyPlaces;
    if (type) {
      filteredPlaces = mockNearbyPlaces.filter(place => 
        place.types.includes(type)
      );
    }

    return sendResponse(res, 200, "Nearby places retrieved successfully", {
      places: filteredPlaces,
      status: "OK"
    });

  } catch (error) {
    console.error("Error getting nearby places:", error);
    return sendResponse(res, 500, "Internal server error");
  }
};

// Get place photo
const getPlacePhoto = async (req, res) => {
  try {
    const { photoReference } = req.params;
    const { maxwidth = 400, maxheight = 400 } = req.query;

    if (!photoReference) {
      return sendResponse(res, 400, "Photo reference is required");
    }

    // For now, return a placeholder image URL
    const photoUrl = `https://via.placeholder.com/${maxwidth}x${maxheight}?text=Place+Photo`;

    return sendResponse(res, 200, "Photo URL retrieved successfully", {
      photo_url: photoUrl
    });

  } catch (error) {
    console.error("Error getting place photo:", error);
    return sendResponse(res, 500, "Internal server error");
  }
};

module.exports = {
  searchPlaces,
  getPlaceDetails,
  getNearbyPlaces,
  getPlacePhoto
};