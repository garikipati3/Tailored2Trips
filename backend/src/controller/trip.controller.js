const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");

// Create a new trip
const createTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      destination,
      startDate,
      endDate,
      budget,
      isPublic,
      coverImageUrl,
    } = req.body;

    // Validation
    if (!title || !destination || !startDate || !endDate) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Title, destination, start date, and end date are required.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "End date must be after start date.",
      });
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        destinationCity: destination,
        startDate: start,
        endDate: end,
        totalBudgetCents: budget ? Math.round(parseFloat(budget) * 100) : null,
        visibility: isPublic ? "PUBLIC" : "PRIVATE",

        ownerId: userId,

        members: {
          create: {
            userId,
            role: "OWNER",
            joinedAt: new Date(),
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    const itineraryItemCount = await prisma.itineraryItem.count({
      where: { day: { tripId: trip.id } },
    });
    const budgetLineCount = await prisma.tripBudgetLine.count({
      where: { tripId: trip.id },
    });

    const responseTrip = {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      destination: trip.destinationCity,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.totalBudgetCents
        ? Math.round(trip.totalBudgetCents / 100)
        : null,
      isPublic: trip.visibility === "PUBLIC",
      members: trip.members,
      createdBy: trip.owner,
      _count: {
        itineraryItems: itineraryItemCount,
        expenses: budgetLineCount,
      },
    };

    return sendResponse(res, {
      status: 201,
      success: true,
      message: "Trip created successfully.",
      data: responseTrip,
    });
  } catch (error) {
    console.error("Create trip error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get all trips for the authenticated user
const getUserTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let whereClause = {
      members: {
        some: {
          userId,
        },
      },
    };

    // Filter by status if provided
    if (status) {
      const now = new Date();
      if (status === "upcoming") {
        whereClause.startDate = { gt: now };
      } else if (status === "ongoing") {
        whereClause.AND = [
          { startDate: { lte: now } },
          { endDate: { gte: now } },
        ];
      } else if (status === "completed") {
        whereClause.endDate = { lt: now };
      }
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    const totalTrips = await prisma.trip.count({
      where: whereClause,
    });

    const shapedTrips = await Promise.all(
      trips.map(async (t) => {
        const itineraryItemCount = await prisma.itineraryItem.count({
          where: { day: { tripId: t.id } },
        });
        const budgetLineCount = await prisma.tripBudgetLine.count({
          where: { tripId: t.id },
        });
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          destination: t.destinationCity,
          startDate: t.startDate,
          endDate: t.endDate,
          budget: t.totalBudgetCents
            ? Math.round(t.totalBudgetCents / 100)
            : null,
          isPublic: t.visibility === "PUBLIC",
          members: t.members,
          createdBy: t.owner,
          _count: {
            itineraryItems: itineraryItemCount,
            expenses: budgetLineCount,
          },
        };
      })
    );

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Trips retrieved successfully.",
      data: {
        trips: shapedTrips,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalTrips,
          pages: Math.ceil(totalTrips / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get user trips error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get a specific trip by ID
const getTripById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          { visibility: "PUBLIC" },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePhotoUrl: true,
                email: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        itineraryDays: {
          orderBy: { dayNumber: "asc" },
          include: {
            items: {
              orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }],
              include: { place: true },
            },
          },
        },
      },
    });

    if (!trip) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Trip not found or access denied.",
      });
    }

    const itineraryItemCount = await prisma.itineraryItem.count({
      where: { day: { tripId } },
    });
    const budgetLineCount = await prisma.tripBudgetLine.count({
      where: { tripId },
    });

    const shapedTrip = {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      destination: trip.destinationCity,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.totalBudgetCents
        ? Math.round(trip.totalBudgetCents / 100)
        : null,
      isPublic: trip.visibility === "PUBLIC",
      members: trip.members,
      createdBy: trip.owner,
      _count: {
        itineraryItems: itineraryItemCount,
        expenses: budgetLineCount,
      },
      itineraryDays: trip.itineraryDays,
    };

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Trip retrieved successfully.",
      data: shapedTrip,
    });
  } catch (error) {
    console.error("Get trip by ID error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update a trip
const updateTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;
    const {
      title,
      description,
      destination,
      startDate,
      endDate,
      budget,
      isPublic,
      coverImageUrl,
    } = req.body;

    // Check if user has permission to update the trip
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId,
            role: { in: ["OWNER", "EDITOR"] },
          },
        },
      },
    });

    if (!existingTrip) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Trip not found or insufficient permissions.",
      });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return sendResponse(res, {
          status: 400,
          success: false,
          message: "End date must be after start date.",
        });
      }
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(destination !== undefined && { destinationCity: destination }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(budget !== undefined && {
          totalBudgetCents: budget
            ? Math.round(parseFloat(budget) * 100)
            : null,
        }),
        ...(isPublic !== undefined && {
          visibility: isPublic ? "PUBLIC" : "PRIVATE",
        }),
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    const itineraryItemCount2 = await prisma.itineraryItem.count({
      where: { day: { tripId } },
    });
    const budgetLineCount2 = await prisma.tripBudgetLine.count({
      where: { tripId },
    });

    const shapedUpdatedTrip = {
      id: updatedTrip.id,
      title: updatedTrip.title,
      description: updatedTrip.description,
      destination: updatedTrip.destinationCity,
      startDate: updatedTrip.startDate,
      endDate: updatedTrip.endDate,
      budget: updatedTrip.totalBudgetCents
        ? Math.round(updatedTrip.totalBudgetCents / 100)
        : null,
      isPublic: updatedTrip.visibility === "PUBLIC",
      members: updatedTrip.members,
      createdBy: updatedTrip.owner,
      _count: {
        itineraryItems: itineraryItemCount2,
        expenses: budgetLineCount2,
      },
    };

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Trip updated successfully.",
      data: shapedUpdatedTrip,
    });
  } catch (error) {
    console.error("Update trip error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Delete a trip
const deleteTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    // Check if user is the owner of the trip
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    if (!existingTrip) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message:
          "Trip not found or insufficient permissions. Only owners can delete trips.",
      });
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Trip deleted successfully.",
    });
  } catch (error) {
    console.error("Delete trip error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Add member to trip
const addTripMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;
    const { email, role = "VIEWER" } = req.body;

    // Check if user has permission to add members
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId,
            role: { in: ["OWNER", "EDITOR"] },
          },
        },
      },
    });

    if (!trip) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Trip not found or insufficient permissions.",
      });
    }

    // Find user by email
    const userToAdd = await prisma.appUser.findUnique({
      where: { email },
      select: { id: true, username: true, fullName: true, email: true },
    });

    if (!userToAdd) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "User not found with this email.",
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: userToAdd.id,
        },
      },
    });

    if (existingMember) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "User is already a member of this trip.",
      });
    }

    const newMember = await prisma.tripMember.create({
      data: {
        tripId,
        userId: userToAdd.id,
        role,
        joinedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePhotoUrl: true,
            email: true,
          },
        },
      },
    });

    return sendResponse(res, {
      status: 201,
      success: true,
      message: "Member added successfully.",
      data: newMember,
    });
  } catch (error) {
    console.error("Add trip member error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Remove member from trip
const removeTripMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId, memberId } = req.params;

    // Check if user has permission to remove members
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId,
            role: { in: ["OWNER", "EDITOR"] },
          },
        },
      },
    });

    if (!trip) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Trip not found or insufficient permissions.",
      });
    }

    // Check if member exists and is not the owner
    const memberToRemove = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: memberId,
        },
      },
    });

    if (!memberToRemove) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Member not found in this trip.",
      });
    }

    if (memberToRemove.role === "OWNER") {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Cannot remove the trip owner.",
      });
    }

    await prisma.tripMember.delete({
      where: {
        tripId_userId: {
          tripId,
          userId: memberId,
        },
      },
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Member removed successfully.",
    });
  } catch (error) {
    console.error("Remove trip member error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update member role
const updateMemberRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId, memberId } = req.params;
    const { role } = req.body;

    if (!["EDITOR", "VIEWER"].includes(role)) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Invalid role. Must be EDITOR or VIEWER.",
      });
    }

    // Check if user is the owner
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    if (!trip) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message:
          "Trip not found or insufficient permissions. Only owners can change member roles.",
      });
    }

    const updatedMember = await prisma.tripMember.update({
      where: {
        tripId_userId: {
          tripId,
          userId: memberId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profilePhotoUrl: true,
            email: true,
          },
        },
      },
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Member role updated successfully.",
      data: updatedMember,
    });
  } catch (error) {
    console.error("Update member role error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addTripMember,
  removeTripMember,
  updateMemberRole,
};
