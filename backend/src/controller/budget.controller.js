const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");

// Get trip budget and expenses
const getTripBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

  // Check if user has access to this trip and load budget lines
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      members: {
        some: {
          userId: userId
        }
      }
    },
    include: {
      budgetLines: {
        include: { category: true }
      }
    }
  });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

  // Calculate budget summary (amounts in dollars)
  const totalBudget = trip.budgetLines.reduce((sum, line) => sum + (line.budgetCents || 0), 0) / 100;
  const totalExpenses = trip.budgetLines.reduce((sum, line) => sum + (line.spentCents || 0), 0) / 100;
  const remainingBudget = Math.max(0, totalBudget - totalExpenses);

  // Group spent by category based on budget lines
  const expensesByCategory = trip.budgetLines.reduce((acc, line) => {
    const label = line.category?.label || line.categoryCode;
    if (!acc[label]) {
      acc[label] = { total: 0, count: 0, expenses: [] };
    }
    const spent = (line.spentCents || 0) / 100;
    acc[label].total += spent;
    acc[label].count += spent > 0 ? 1 : 0;
    return acc;
  }, {});

  return sendResponse(res, {
    status: 200,
    success: true,
    message: "Budget retrieved successfully",
    data: {
      budget: {
        total: totalBudget,
        spent: totalExpenses,
        remaining: remainingBudget,
        lines: trip.budgetLines.map((line) => ({
          id: line.id,
          categoryCode: line.categoryCode,
          categoryLabel: line.category?.label || line.categoryCode,
          budget: (line.budgetCents || 0) / 100,
          spent: (line.spentCents || 0) / 100
        }))
      },
      expenses: [],
      expensesByCategory,
      summary: {
        totalBudget,
        totalExpenses,
        remainingBudget,
        percentageSpent: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0
      }
    }
  });
  } catch (error) {
    console.error('Error fetching trip budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add budget line
const addBudgetLine = async (req, res) => {
  try {
    const { tripId } = req.params;
  const { categoryCode, budget } = req.body;
    const userId = req.user.id;

    // Check if user has access to this trip and is admin/owner
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId: userId,
            role: {
              in: ['OWNER', 'ADMIN']
            }
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or insufficient permissions' });
    }

  const budgetLine = await prisma.tripBudgetLine.create({
    data: {
      tripId,
      categoryCode: categoryCode,
      budgetCents: budget ? Math.round(parseFloat(budget) * 100) : 0,
      spentCents: 0
    },
    include: { category: true }
  });

  return sendResponse(res, {
    status: 201,
    success: true,
    message: "Budget line added",
    data: budgetLine
  });
  } catch (error) {
    console.error('Error adding budget line:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update budget line
const updateBudgetLine = async (req, res) => {
  try {
    const { tripId, budgetLineId } = req.params;
  const { categoryCode, budget, spent } = req.body;
    const userId = req.user.id;

    // Check if user has access to this trip and is admin/owner
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId: userId,
            role: {
              in: ['OWNER', 'ADMIN']
            }
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or insufficient permissions' });
    }

  const budgetLine = await prisma.tripBudgetLine.update({
    where: {
      id: budgetLineId
    },
    data: {
      ...(categoryCode !== undefined && { categoryCode }),
      ...(budget !== undefined && { budgetCents: Math.round(parseFloat(budget) * 100) }),
      ...(spent !== undefined && { spentCents: Math.round(parseFloat(spent) * 100) })
    },
    include: { category: true }
  });

  return sendResponse(res, {
    status: 200,
    success: true,
    message: "Budget line updated",
    data: budgetLine
  });
  } catch (error) {
    console.error('Error updating budget line:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete budget line
const deleteBudgetLine = async (req, res) => {
  try {
    const { tripId, budgetLineId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this trip and is admin/owner
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId: userId,
            role: {
              in: ['OWNER', 'ADMIN']
            }
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or insufficient permissions' });
    }

  await prisma.tripBudgetLine.delete({
    where: { id: budgetLineId }
  });

  return sendResponse(res, {
    status: 200,
    success: true,
    message: "Budget line deleted successfully"
  });
  } catch (error) {
    console.error('Error deleting budget line:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add expense
const addExpense = async (req, res) => {
  return sendResponse(res, {
    status: 501,
    success: false,
    message: "Expenses are not implemented in current schema"
  });
};

// Update expense
const updateExpense = async (req, res) => {
  return sendResponse(res, {
    status: 501,
    success: false,
    message: "Expenses are not implemented in current schema"
  });
};

// Delete expense
const deleteExpense = async (req, res) => {
  return sendResponse(res, {
    status: 501,
    success: false,
    message: "Expenses are not implemented in current schema"
  });
};

module.exports = {
  getTripBudget,
  addBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
  addExpense,
  updateExpense,
  deleteExpense
};
