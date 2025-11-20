const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");

// Get user preferences
const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId,
          travelStyles: [],
          interests: [],
          languages: ["en"],
          notificationEmail: true,
          notificationPush: true,
          theme: "system"
        }
      });
    }

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Preferences retrieved successfully.",
      data: preferences,
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update user preferences
const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      travelStyles,
      interests,
      budgetMin,
      budgetMax,
      homeAirport,
      languages,
      notificationEmail,
      notificationPush,
      theme
    } = req.body;

    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...(travelStyles !== undefined && { travelStyles }),
        ...(interests !== undefined && { interests }),
        ...(budgetMin !== undefined && { budgetMin }),
        ...(budgetMax !== undefined && { budgetMax }),
        ...(homeAirport !== undefined && { homeAirport }),
        ...(languages !== undefined && { languages }),
        ...(notificationEmail !== undefined && { notificationEmail }),
        ...(notificationPush !== undefined && { notificationPush }),
        ...(theme !== undefined && { theme }),
      },
      create: {
        userId,
        travelStyles: travelStyles || [],
        interests: interests || [],
        budgetMin,
        budgetMax,
        homeAirport,
        languages: languages || ["en"],
        notificationEmail: notificationEmail !== undefined ? notificationEmail : true,
        notificationPush: notificationPush !== undefined ? notificationPush : true,
        theme: theme || "system"
      }
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Preferences updated successfully.",
      data: updatedPreferences,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get available travel styles and interests (for frontend dropdowns)
const getPreferenceOptions = async (req, res) => {
  try {
    const options = {
      travelStyles: [
        "Adventure",
        "Luxury",
        "Budget",
        "Cultural",
        "Relaxation",
        "Business",
        "Family",
        "Solo",
        "Romantic",
        "Backpacking"
      ],
      interests: [
        "Museums",
        "Food & Dining",
        "Nightlife",
        "Shopping",
        "Nature",
        "History",
        "Art",
        "Sports",
        "Music",
        "Photography",
        "Architecture",
        "Local Culture",
        "Adventure Sports",
        "Beaches",
        "Mountains"
      ],
      themes: ["light", "dark", "system"],
      languages: [
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "it", name: "Italian" },
        { code: "pt", name: "Portuguese" },
        { code: "ja", name: "Japanese" },
        { code: "ko", name: "Korean" },
        { code: "zh", name: "Chinese" }
      ]
    };

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Preference options retrieved successfully.",
      data: options,
    });
  } catch (error) {
    console.error("Get preference options error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  getPreferenceOptions
};