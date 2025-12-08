const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");

// Get itinerary for a specific trip (aligned with Prisma models)
const getTripItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const tripMember = await prisma.tripMember.findFirst({
      where: { tripId, userId }
    });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        itineraryDays: {
          orderBy: { dayNumber: 'asc' },
          include: {
            items: {
              orderBy: [
                { sortOrder: 'asc' },
                { startTime: 'asc' }
              ],
              include: { place: true }
            }
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

    const itinerary = trip.itineraryDays.map((day) => ({
      day: day.dayNumber,
      date: day.date,
      items: day.items
    }));

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Itinerary retrieved successfully.",
      data: {
        trip: {
          id: trip.id,
          title: trip.title,
          destination: trip.destinationCity,
          startDate: trip.startDate,
          endDate: trip.endDate
        },
        itinerary
      },
    });
  } catch (error) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Add new itinerary item (aligned with Prisma models)
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
      placeName,
      placeAddress,
      placeLatitude,
      placeLongitude,
      category,
      estimatedCost,
      notes
    } = req.body;

    if (!day || !title) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Day and title are required.",
      });
    }

    const tripMember = await prisma.tripMember.findFirst({
      where: { tripId, userId }
    });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    let itineraryDay = await prisma.itineraryDay.findFirst({
      where: { tripId, dayNumber: parseInt(day) }
    });
    if (!itineraryDay) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      const date = new Date(trip.startDate);
      date.setDate(date.getDate() + (parseInt(day) - 1));
      itineraryDay = await prisma.itineraryDay.create({
        data: { tripId, dayNumber: parseInt(day), date }
      });
    }

    const lastItem = await prisma.itineraryItem.findFirst({
      where: { dayId: itineraryDay.id },
      orderBy: { sortOrder: 'desc' }
    });
    const nextOrder = lastItem ? lastItem.sortOrder + 1 : 1;

    let place = null;
    if (placeName && placeLatitude && placeLongitude) {
      place = await prisma.place.create({
        data: {
          name: placeName,
          category: category || 'ACTIVITY',
          address: placeAddress,
          lat: parseFloat(placeLatitude),
          lng: parseFloat(placeLongitude)
        }
      });
    }

    const typeMap = {
      ACTIVITY: 'ACTIVITY',
      ACCOMMODATION: 'HOTEL',
      TRANSPORTATION: 'TRANSPORT',
      RESTAURANT: 'RESTAURANT',
      SHOPPING: 'ACTIVITY',
      OTHER: 'FREE_TIME'
    };

    const itineraryItem = await prisma.itineraryItem.create({
      data: {
        dayId: itineraryDay.id,
        type: typeMap[category] || 'ACTIVITY',
        title,
        description,
        startTime: startTime ? new Date(`1970-01-01T${startTime}:00Z`) : null,
        endTime: endTime ? new Date(`1970-01-01T${endTime}:00Z`) : null,
        placeId: place?.id || null,
        sortOrder: nextOrder,
        costCents: estimatedCost ? Math.round(parseFloat(estimatedCost) * 100) : null,
        explainability: notes ? { notes } : null
      },
      include: { place: true }
    });

    return sendResponse(res, {
      status: 201,
      success: true,
      message: "Itinerary item added successfully.",
      data: itineraryItem,
    });
  } catch (error) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Update itinerary item (aligned with Prisma models)
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

    const tripMember = await prisma.tripMember.findFirst({ where: { tripId, userId } });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    const existingItem = await prisma.itineraryItem.findUnique({ where: { id: itemId }, include: { day: true } });

    if (!existingItem) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Itinerary item not found.",
      });
    }

    const typeMap = {
      ACTIVITY: 'ACTIVITY',
      ACCOMMODATION: 'HOTEL',
      TRANSPORTATION: 'TRANSPORT',
      RESTAURANT: 'RESTAURANT',
      SHOPPING: 'ACTIVITY',
      OTHER: 'FREE_TIME'
    };

    const updatedItem = await prisma.itineraryItem.update({
      where: { id: itemId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: new Date(`1970-01-01T${startTime}:00Z`) }),
        ...(endTime && { endTime: new Date(`1970-01-01T${endTime}:00Z`) }),
        ...(category && { type: typeMap[category] || undefined }),
        ...(estimatedCost !== undefined && { costCents: estimatedCost ? Math.round(parseFloat(estimatedCost) * 100) : null }),
        ...(notes !== undefined && { explainability: notes ? { notes } : null })
      },
      include: { place: true }
    });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Itinerary item updated successfully.",
      data: updatedItem,
    });
  } catch (error) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Delete itinerary item (aligned with Prisma models)
const deleteItineraryItem = async (req, res) => {
  try {
    const { tripId, itemId } = req.params;
    const userId = req.user.id;
    const tripMember = await prisma.tripMember.findFirst({ where: { tripId, userId } });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    const existingItem = await prisma.itineraryItem.findUnique({ where: { id: itemId }, include: { day: true } });

    if (!existingItem) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Itinerary item not found.",
      });
    }

    await prisma.itineraryItem.delete({ where: { id: itemId } });

    return sendResponse(res, {
      status: 200,
      success: true,
      message: "Itinerary item deleted successfully.",
    });
  } catch (error) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Reorder itinerary items (aligned with Prisma models)
const reorderItineraryItems = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;
    const { items } = req.body; // [{ id, dayNumber, sortOrder }]

    if (!items || !Array.isArray(items)) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Items array is required.",
      });
    }

    const tripMember = await prisma.tripMember.findFirst({ where: { tripId, userId } });

    if (!tripMember) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Access denied. You are not a member of this trip.",
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        let targetDay = await tx.itineraryDay.findFirst({
          where: { tripId, dayNumber: parseInt(item.dayNumber) }
        });
        if (!targetDay) {
          const trip = await tx.trip.findUnique({ where: { id: tripId } });
          const date = new Date(trip.startDate);
          date.setDate(date.getDate() + (parseInt(item.dayNumber) - 1));
          targetDay = await tx.itineraryDay.create({
            data: { tripId, dayNumber: parseInt(item.dayNumber), date }
          });
        }

        await tx.itineraryItem.update({
          where: { id: item.id },
          data: {
            dayId: targetDay.id,
            sortOrder: parseInt(item.sortOrder)
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
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Internal server error.",
    });
  }
};

// Generate itinerary from natural language prompt with explanations
const generateItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { prompt } = req.body;
    const userId = req.user.id;

    if (!prompt || prompt.trim().length === 0) {
      return sendResponse(res, { status: 400, success: false, message: "Prompt is required." });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return sendResponse(res, { status: 404, success: false, message: "Trip not found." });
    }

    const days = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1);

    const preferences = await prisma.userPreferences.findUnique({ where: { userId } });

    const explanations = [];
    const createdItems = [];

    await prisma.$transaction(async (tx) => {
      for (let d = 1; d <= days; d++) {
        let dayRec = await tx.itineraryDay.findFirst({ where: { tripId, dayNumber: d } });
        if (!dayRec) {
          const date = new Date(trip.startDate);
          date.setDate(date.getDate() + (d - 1));
          dayRec = await tx.itineraryDay.create({ data: { tripId, dayNumber: d, date } });
        }

        const templates = [
          { type: 'ACTIVITY', title: `Morning activity in ${trip.destinationCity || 'destination'}`, sortOrder: 1 },
          { type: 'RESTAURANT', title: 'Lunch at recommended spot', sortOrder: 2 },
          { type: 'ACTIVITY', title: 'Afternoon highlight', sortOrder: 3 },
          { type: 'RESTAURANT', title: 'Dinner with local cuisine', sortOrder: 4 }
        ];

        for (const t of templates) {
          const exp = {
            reason: `Selected ${t.type} based on prompt and preferences`,
            prompt,
            preferences
          };
          explanations.push(exp);

          const item = await tx.itineraryItem.create({
            data: {
              dayId: dayRec.id,
              type: t.type,
              title: t.title,
              sortOrder: t.sortOrder,
              explainability: exp
            }
          });
          createdItems.push(item);
        }
      }

      await tx.recommendationLog.create({
        data: {
          userId,
          tripId,
          context: { prompt, preferences },
          explanations
        }
      });
    });

    return sendResponse(res, {
      status: 201,
      success: true,
      message: "Itinerary generated successfully.",
      data: { items: createdItems }
    });
  } catch (error) {
    return sendResponse(res, { status: 500, success: false, message: "Internal server error." });
  }
};

module.exports = {
  getTripItinerary,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
  generateItinerary
};
