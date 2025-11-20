const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");

// Get itinerary for a specific trip
const getTripItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this trip
    const tripMember = await prisma.tripMember.findFirst({
      where: {
        tripId: parseInt(tripId),
        userId: userId
      }
    });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    // Get trip details with itinerary items
    const trip = await prisma.trip.findUnique({
      where: { id: parseInt(tripId) },
      include: {
        itineraryItems: {
          orderBy: [
            { day: 'asc' },
            { startTime: 'asc' },
            { order: 'asc' }
          ],
          include: {
            place: true
          }
        }
      }
    });

    if (!trip) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Trip not found.",
      });
    }

    // Group itinerary items by day
    const itineraryByDay = {};
    const totalDays = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1;

    // Initialize all days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(trip.startDate);
      date.setDate(date.getDate() + (day - 1));
      itineraryByDay[day] = {
        day,
        date: date.toISOString().split('T')[0],
        items: []
      };
    }

    // Add items to their respective days
    trip.itineraryItems.forEach(item => {
      if (itineraryByDay[item.day]) {
        itineraryByDay[item.day].items.push(item);
      }
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Itinerary retrieved successfully.",
      data: {
        trip: {
          id: trip.id,
          title: trip.title,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate
        },
        itinerary: Object.values(itineraryByDay)
      },
    });
  } catch (error) {
    console.error("Get trip itinerary error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Add new itinerary item
const addItineraryItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    const {
      day,
      title,
      description,
      startTime,
      endTime,
      placeId,
      placeName,
      placeAddress,
      placeLatitude,
      placeLongitude,
      category,
      estimatedCost,
      notes
    } = req.body;

    // Validation
    if (!day || !title) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Day and title are required.",
      });
    }

    // Check if user has access to this trip
    const tripMember = await prisma.tripMember.findFirst({
      where: {
        tripId: parseInt(tripId),
        userId: userId
      }
    });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    // Get the next order number for this day
    const lastItem = await prisma.itineraryItem.findFirst({
      where: {
        tripId: parseInt(tripId),
        day: parseInt(day)
      },
      orderBy: { order: 'desc' }
    });

    const nextOrder = lastItem ? lastItem.order + 1 : 1;

    // Create place if provided
    let place = null;
    if (placeId || (placeName && placeLatitude && placeLongitude)) {
      place = await prisma.place.upsert({
        where: { 
          googlePlaceId: placeId || `custom_${Date.now()}_${Math.random()}`
        },
        update: {},
        create: {
          googlePlaceId: placeId || `custom_${Date.now()}_${Math.random()}`,
          name: placeName,
          address: placeAddress,
          latitude: placeLatitude ? parseFloat(placeLatitude) : null,
          longitude: placeLongitude ? parseFloat(placeLongitude) : null,
          category: category || 'OTHER'
        }
      });
    }

    // Create itinerary item
    const itineraryItem = await prisma.itineraryItem.create({
      data: {
        tripId: parseInt(tripId),
        day: parseInt(day),
        title,
        description,
        startTime: startTime ? new Date(`1970-01-01T${startTime}:00Z`) : null,
        endTime: endTime ? new Date(`1970-01-01T${endTime}:00Z`) : null,
        placeId: place?.id,
        category: category || 'ACTIVITY',
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        notes,
        order: nextOrder,
        createdById: userId
      },
      include: {
        place: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    return sendResponse(res, {
      status: 201,
      success: true,
      message: "Itinerary item added successfully.",
      data: itineraryItem,
    });
  } catch (error) {
    console.error("Add itinerary item error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update itinerary item
const updateItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      startTime,
      endTime,
      category,
      estimatedCost,
      notes
    } = req.body;

    // Check if user has access to this trip
    const tripMember = await prisma.tripMember.findFirst({
      where: {
        tripId: parseInt(tripId),
        userId: userId
      }
    });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    // Check if item exists and belongs to this trip
    const existingItem = await prisma.itineraryItem.findFirst({
      where: {
        id: parseInt(itemId),
        tripId: parseInt(tripId)
      }
    });

    if (!existingItem) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Itinerary item not found.",
      });
    }

    // Update the item
    const updatedItem = await prisma.itineraryItem.update({
      where: { id: parseInt(itemId) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: new Date(`1970-01-01T${startTime}:00Z`) }),
        ...(endTime && { endTime: new Date(`1970-01-01T${endTime}:00Z`) }),
        ...(category && { category }),
        ...(estimatedCost !== undefined && { estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
      include: {
        place: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Itinerary item updated successfully.",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Update itinerary item error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Delete itinerary item
const deleteItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this trip
    const tripMember = await prisma.tripMember.findFirst({
      where: {
        tripId: parseInt(tripId),
        userId: userId
      }
    });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    // Check if item exists and belongs to this trip
    const existingItem = await prisma.itineraryItem.findFirst({
      where: {
        id: parseInt(itemId),
        tripId: parseInt(tripId)
      }
    });

    if (!existingItem) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Itinerary item not found.",
      });
    }

    // Delete the item
    await prisma.itineraryItem.delete({
      where: { id: parseInt(itemId) }
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Itinerary item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete itinerary item error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Reorder itinerary items
const reorderItineraryItems = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    const { items } = req.body; // Array of { id, day, order }

    if (!items || !Array.isArray(items)) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Items array is required.",
      });
    }

    // Check if user has access to this trip
    const tripMember = await prisma.tripMember.findFirst({
      where: {
        tripId: parseInt(tripId),
        userId: userId
      }
    });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    // Update items in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.itineraryItem.update({
          where: { id: parseInt(item.id) },
          data: {
            day: parseInt(item.day),
            order: parseInt(item.order),
            updatedAt: new Date()
          }
        });
      }
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Itinerary items reordered successfully.",
    });
  } catch (error) {
    console.error("Reorder itinerary items error:", error);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getTripItinerary,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems
};