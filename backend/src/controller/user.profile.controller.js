const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.appUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        profilePhotoUrl: true,
        locale: true,
        currency: true,
        createdAt: true,
        isActive: true,
        userPreferences: true
      }
    });

    if (!user) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "User not found.",
      });
    }

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Profile retrieved successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, bio, profilePhotoUrl, locale, currency } = req.body;

    const updatedUser = await prisma.appUser.update({
      where: { id: userId },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(profilePhotoUrl !== undefined && { profilePhotoUrl }),
        ...(locale !== undefined && { locale }),
        ...(currency !== undefined && { currency }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        bio: true,
        profilePhotoUrl: true,
        locale: true,
        currency: true,
        updatedAt: true
      }
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Deactivate user account
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.appUser.update({
      where: { id: userId },
      data: { isActive: false }
    });

    // Clear the authentication cookie
    res.clearCookie("token");

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Account deactivated successfully.",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deactivateAccount
};