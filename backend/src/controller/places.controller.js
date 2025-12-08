const { sendResponse } = require("../utils/sendResponse");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Search places using Google Places API (fallback to mock)
const searchPlaces = async (req, res) => {
  try {
    const { query, location, radius = 50000, type } = req.query;

    if (!query) {
      return sendResponse(res, { status: 400, success: false, message: "Query parameter is required" });
    }
    
    if (GOOGLE_MAPS_API_KEY) {
      const params = new URLSearchParams({
        query,
        key: GOOGLE_MAPS_API_KEY
      });
      if (type) params.set('type', type);
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        return sendResponse(res, { status: 200, success: true, message: "Places retrieved successfully", data: {
          places: data.results,
          status: data.status
        }});
      }
    }

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

    const filteredPlaces = mockPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.formatted_address.toLowerCase().includes(query.toLowerCase())
    );

    return sendResponse(res, { status: 200, success: true, message: "Places retrieved successfully", data: {
      places: filteredPlaces,
      status: "OK"
    }});

  } catch (error) {
    console.error("Error searching places:", error);
    return sendResponse(res, { status: 500, success: false, message: "Internal server error" });
  }
};

// Get place details by place_id (fallback to mock)
const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return sendResponse(res, { status: 400, success: false, message: "Place ID is required" });
    }

    if (GOOGLE_MAPS_API_KEY) {
      const params = new URLSearchParams({ place_id: placeId, key: GOOGLE_MAPS_API_KEY });
      const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        return sendResponse(res, { status: 200, success: true, message: "Place details retrieved successfully", data: {
          place: data.result,
          status: data.status
        }});
      }
    }

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

    return sendResponse(res, { status: 200, success: true, message: "Place details retrieved successfully", data: {
      place: mockPlaceDetails,
      status: "OK"
    }});

  } catch (error) {
    console.error("Error getting place details:", error);
    return sendResponse(res, { status: 500, success: false, message: "Internal server error" });
  }
};

// Get nearby places (fallback to mock)
const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type } = req.query;

    if (!lat || !lng) {
      return sendResponse(res, { status: 400, success: false, message: "Latitude and longitude are required" });
    }

    if (GOOGLE_MAPS_API_KEY) {
      const params = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: String(radius),
        key: GOOGLE_MAPS_API_KEY
      });
      if (type) params.set('type', type);
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        return sendResponse(res, { status: 200, success: true, message: "Nearby places retrieved successfully", data: {
          places: data.results,
          status: data.status
        }});
      }
    }

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

    return sendResponse(res, { status: 200, success: true, message: "Nearby places retrieved successfully", data: {
      places: filteredPlaces,
      status: "OK"
    }});

  } catch (error) {
    console.error("Error getting nearby places:", error);
    return sendResponse(res, { status: 500, success: false, message: "Internal server error" });
  }
};

// Get place photo
const getPlacePhoto = async (req, res) => {
  try {
    const { photoReference } = req.params;
    const { maxwidth = 400, maxheight = 400 } = req.query;

    if (!photoReference) {
      return sendResponse(res, { status: 400, success: false, message: "Photo reference is required" });
    }

    // For now, return a placeholder image URL
    const photoUrl = `https://via.placeholder.com/${maxwidth}x${maxheight}?text=Place+Photo`;

    return sendResponse(res, { status: 200, success: true, message: "Photo URL retrieved successfully", data: {
      photo_url: photoUrl
    }});

  } catch (error) {
    console.error("Error getting place photo:", error);
    return sendResponse(res, { status: 500, success: false, message: "Internal server error" });
  }
};

// Autocomplete place suggestions (cities/locations)
const autocompletePlaces = async (req, res) => {
  try {
    const { input } = req.query;

    if (!input || input.trim().length < 1) {
      return sendResponse(res, { status: 400, success: false, message: "Input parameter is required" });
    }

    if (GOOGLE_MAPS_API_KEY) {
      const params = new URLSearchParams({
        input,
        key: GOOGLE_MAPS_API_KEY,
        types: "(cities)"
      });
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        const places = (data.predictions || []).map((p) => ({
          place_id: p.place_id,
          name: p.description,
          formatted_address: p.description
        }));
        return sendResponse(res, { status: 200, success: true, message: "Autocomplete results retrieved", data: { places, status: data.status } });
      }
    }

    const suggestions = [];
    const q = input.toLowerCase();
    const catalog = [
      { name: "Berlin, Germany", place_id: "mock_berlin", formatted_address: "Berlin, Germany" },
      { name: "Bern, Switzerland", place_id: "mock_bern", formatted_address: "Bern, Switzerland" },
      { name: "Bergen, Norway", place_id: "mock_bergen", formatted_address: "Bergen, Norway" },
      { name: "Birmingham, United Kingdom", place_id: "mock_birmingham", formatted_address: "Birmingham, UK" },
    ];
    for (const c of catalog) {
      if (c.name.toLowerCase().includes(q)) suggestions.push(c);
    }

    return sendResponse(res, { status: 200, success: true, message: "Autocomplete results retrieved", data: { places: suggestions, status: "OK" } });
  } catch (error) {
    console.error("Error autocomplete places:", error);
    return sendResponse(res, { status: 500, success: false, message: "Internal server error" });
  }
};

module.exports = {
  searchPlaces,
  getPlaceDetails,
  getNearbyPlaces,
  getPlacePhoto,
  autocompletePlaces
};
