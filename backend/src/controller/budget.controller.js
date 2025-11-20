const prisma = require("../lib/db");
const { sendResponse } = require("../utils/sendResponse");

// Get trip budget and expenses
const getTripBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this trip
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
          orderBy: {
            createdAt: 'desc'
          }
        },
        expenses: {
          include: {
            paidBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    // Calculate budget summary
    const totalBudget = trip.budgetLines.reduce((sum, line) => sum + line.amount, 0);
    const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBudget = totalBudget - totalExpenses;

    // Group expenses by category
    const expensesByCategory = trip.expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = {
          total: 0,
          count: 0,
          expenses: []
        };
      }
      acc[expense.category].total += expense.amount;
      acc[expense.category].count += 1;
      acc[expense.category].expenses.push(expense);
      return acc;
    }, {});

    res.json({
      budget: {
        total: totalBudget,
        spent: totalExpenses,
        remaining: remainingBudget,
        lines: trip.budgetLines
      },
      expenses: trip.expenses,
      expensesByCategory,
      summary: {
        totalBudget,
        totalExpenses,
        remainingBudget,
        percentageSpent: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0
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
    const { category, amount, description } = req.body;
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
        category,
        amount: parseFloat(amount),
        description
      }
    });

    res.status(201).json(budgetLine);
  } catch (error) {
    console.error('Error adding budget line:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update budget line
const updateBudgetLine = async (req, res) => {
  try {
    const { tripId, budgetLineId } = req.params;
    const { category, amount, description } = req.body;
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
        id: budgetLineId,
        tripId: tripId
      },
      data: {
        category,
        amount: parseFloat(amount),
        description
      }
    });

    res.json(budgetLine);
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
      where: {
        id: budgetLineId,
        tripId: tripId
      }
    });

    res.json({ message: 'Budget line deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget line:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add expense
const addExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, amount, category, description, date, paidById } = req.body;
    const userId = req.user.id;

    // Check if user has access to this trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    // If paidById is not provided, use current user
    const finalPaidById = paidById || userId;

    // Verify that paidById is a member of the trip
    const paidByMember = await prisma.tripMember.findFirst({
      where: {
        tripId: tripId,
        userId: finalPaidById
      }
    });

    if (!paidByMember) {
      return res.status(400).json({ error: 'Paid by user must be a member of the trip' });
    }

    const expense = await prisma.tripExpense.create({
      data: {
        tripId,
        title,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
        paidById: finalPaidById
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;
    const { title, amount, category, description, date, paidById } = req.body;
    const userId = req.user.id;

    // Check if user has access to this trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    // Check if expense exists and belongs to this trip
    const existingExpense = await prisma.tripExpense.findFirst({
      where: {
        id: expenseId,
        tripId: tripId
      }
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only allow the person who paid or trip admins to edit
    const userRole = await prisma.tripMember.findFirst({
      where: {
        tripId: tripId,
        userId: userId
      }
    });

    if (existingExpense.paidById !== userId && !['OWNER', 'ADMIN'].includes(userRole?.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to edit this expense' });
    }

    const expense = await prisma.tripExpense.update({
      where: {
        id: expenseId
      },
      data: {
        title,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
        paidById: paidById || existingExpense.paidById
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this trip
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        members: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found or access denied' });
    }

    // Check if expense exists and belongs to this trip
    const existingExpense = await prisma.tripExpense.findFirst({
      where: {
        id: expenseId,
        tripId: tripId
      }
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only allow the person who paid or trip admins to delete
    const userRole = await prisma.tripMember.findFirst({
      where: {
        tripId: tripId,
        userId: userId
      }
    });

    if (existingExpense.paidById !== userId && !['OWNER', 'ADMIN'].includes(userRole?.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to delete this expense' });
    }

    await prisma.tripExpense.delete({
      where: {
        id: expenseId
      }
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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