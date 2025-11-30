const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTripBudget,
  addBudgetLine,
  updateBudgetLine,
  deleteBudgetLine,
  addExpense,
  updateExpense,
  deleteExpense
} = require('../controller/budget.controller');

// Protect all budget routes
router.use(protect);

// Budget routes
router.get('/trip/:tripId', getTripBudget);
router.post('/trip/:tripId/budget-line', addBudgetLine);
router.put('/trip/:tripId/budget-line/:budgetLineId', updateBudgetLine);
router.delete('/trip/:tripId/budget-line/:budgetLineId', deleteBudgetLine);

// Expense routes
router.post('/trip/:tripId/expense', addExpense);
router.put('/trip/:tripId/expense/:expenseId', updateExpense);
router.delete('/trip/:tripId/expense/:expenseId', deleteExpense);

module.exports = router;