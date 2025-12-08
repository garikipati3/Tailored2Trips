import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopBar from '../components/TopBar';
import fetcher from '../utils/fetcher';

const Budget = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingBudgetLine, setEditingBudgetLine] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBudgetData();
  }, [tripId]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const response = await fetcher(`/api/budget/trip/${tripId}`);
      setBudgetData(response.data || response);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast.error('Failed to load budget data');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudgetLine = (budgetLineData) => {
    if (editingBudgetLine) {
      updateBudgetLine(editingBudgetLine.id, budgetLineData);
    } else {
      createBudgetLine(budgetLineData);
    }
  };

  const createBudgetLine = async (budgetLineData) => {
    try {
      await fetcher(`/api/budget/trip/${tripId}/budget-line`, {
        method: 'POST',
        body: JSON.stringify(budgetLineData)
      });
      toast.success('Budget line added successfully');
      setShowBudgetModal(false);
      fetchBudgetData();
    } catch (error) {
      console.error('Error creating budget line:', error);
      toast.error('Failed to add budget line');
    }
  };

  const updateBudgetLine = async (budgetLineId, budgetLineData) => {
    try {
      await fetcher(`/api/budget/trip/${tripId}/budget-line/${budgetLineId}`, {
        method: 'PUT',
        body: JSON.stringify(budgetLineData)
      });
      toast.success('Budget line updated successfully');
      setShowBudgetModal(false);
      setEditingBudgetLine(null);
      fetchBudgetData();
    } catch (error) {
      console.error('Error updating budget line:', error);
      toast.error('Failed to update budget line');
    }
  };

  const deleteBudgetLine = async (budgetLineId) => {
    if (!window.confirm('Are you sure you want to delete this budget line?')) {
      return;
    }

    try {
      await fetcher(`/api/budget/trip/${tripId}/budget-line/${budgetLineId}`, {
        method: 'DELETE'
      });
      toast.success('Budget line deleted successfully');
      fetchBudgetData();
    } catch (error) {
      console.error('Error deleting budget line:', error);
      toast.error('Failed to delete budget line');
    }
  };

  const handleAddExpense = (expenseData) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
    } else {
      createExpense(expenseData);
    }
  };

  const createExpense = async (expenseData) => {
    try {
      await fetcher(`/api/budget/trip/${tripId}/expense`, {
        method: 'POST',
        body: JSON.stringify(expenseData)
      });
      toast.success('Expense added successfully');
      setShowExpenseModal(false);
      fetchBudgetData();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const updateExpense = async (expenseId, expenseData) => {
    try {
      await fetcher(`/api/budget/trip/${tripId}/expense/${expenseId}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData)
      });
      toast.success('Expense updated successfully');
      setShowExpenseModal(false);
      setEditingExpense(null);
      fetchBudgetData();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await fetcher(`/api/budget/trip/${tripId}/expense/${expenseId}`, {
        method: 'DELETE'
      });
      toast.success('Expense deleted successfully');
      fetchBudgetData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="text-center py-12">
          <p className="text-gray-500">Budget data not found</p>
        </div>
      </div>
    );
  }

  const { budget, expenses, expensesByCategory, summary } = budgetData;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(`/trips/${tripId}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Trip
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Trip Budget</h1>
              <p className="text-gray-600">Manage your trip budget and track expenses</p>
            </div>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">${summary.totalBudget.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${summary.totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${summary.remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <svg className={`w-6 h-6 ${summary.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${summary.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${summary.remainingBudget.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">% Spent</p>
                <p className="text-2xl font-bold text-gray-900">{summary.percentageSpent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900">Budget Progress</h3>
            <span className="text-sm text-gray-500">{summary.percentageSpent.toFixed(1)}% used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                summary.percentageSpent > 100 ? 'bg-red-500' : 
                summary.percentageSpent > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(summary.percentageSpent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'budget', label: 'Budget Lines' },
                { key: 'expenses', label: 'Expenses' },
                { key: 'categories', label: 'By Category' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                budget={budget} 
                expenses={expenses} 
                expensesByCategory={expensesByCategory}
                onAddBudgetLine={() => setShowBudgetModal(true)}
                onAddExpense={() => setShowExpenseModal(true)}
              />
            )}
            
            {activeTab === 'budget' && (
              <BudgetTab 
                budgetLines={budget.lines}
                onAddBudgetLine={() => setShowBudgetModal(true)}
                onEditBudgetLine={(line) => {
                  setEditingBudgetLine(line);
                  setShowBudgetModal(true);
                }}
                onDeleteBudgetLine={deleteBudgetLine}
              />
            )}
            
            {activeTab === 'expenses' && (
              <ExpensesTab 
                expenses={expenses}
                onAddExpense={() => setShowExpenseModal(true)}
                onEditExpense={(expense) => {
                  setEditingExpense(expense);
                  setShowExpenseModal(true);
                }}
                onDeleteExpense={deleteExpense}
              />
            )}
            
            {activeTab === 'categories' && (
              <CategoriesTab expensesByCategory={expensesByCategory} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBudgetModal && (
        <BudgetLineModal
          isOpen={showBudgetModal}
          onClose={() => {
            setShowBudgetModal(false);
            setEditingBudgetLine(null);
          }}
          onSave={handleAddBudgetLine}
          editingBudgetLine={editingBudgetLine}
        />
      )}

      {showExpenseModal && (
        <ExpenseModal
          isOpen={showExpenseModal}
          onClose={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
          }}
          onSave={handleAddExpense}
          editingExpense={editingExpense}
          tripId={tripId}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ budget, expenses, expensesByCategory, onAddBudgetLine, onAddExpense }) => {
  const recentExpenses = expenses.slice(0, 5);
  const topCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
            <button
              onClick={onAddExpense}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Add Expense
            </button>
          </div>
          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No expenses recorded yet</p>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{expense.title}</p>
                    <p className="text-sm text-gray-500">{expense.category} • {expense.paidBy.name}</p>
                  </div>
                  <span className="font-medium text-gray-900">${expense.amount.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Spending Categories</h3>
          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No expenses by category yet</p>
            ) : (
              topCategories.map(([category, data]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{category}</p>
                    <p className="text-sm text-gray-500">{data.count} expenses</p>
                  </div>
                  <span className="font-medium text-gray-900">${data.total.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-4">
        <button
          onClick={onAddBudgetLine}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Budget Line
        </button>
        <button
          onClick={onAddExpense}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

// Budget Tab Component (placeholder - would need full implementation)
const BudgetTab = ({ budgetLines, onAddBudgetLine, onEditBudgetLine, onDeleteBudgetLine }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Budget Lines</h3>
        <button
          onClick={onAddBudgetLine}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Budget Line
        </button>
      </div>
      {/* Budget lines list would go here */}
      <p className="text-gray-500">Budget lines management coming soon...</p>
    </div>
  );
};

// Expenses Tab Component (placeholder - would need full implementation)
const ExpensesTab = ({ expenses, onAddExpense, onEditExpense, onDeleteExpense }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">All Expenses</h3>
        <button
          onClick={onAddExpense}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Add Expense
        </button>
      </div>
      {/* Expenses list would go here */}
      <p className="text-gray-500">Detailed expenses management coming soon...</p>
    </div>
  );
};

// Categories Tab Component (placeholder - would need full implementation)
const CategoriesTab = ({ expensesByCategory }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Expenses by Category</h3>
      {/* Category breakdown would go here */}
      <p className="text-gray-500">Category analysis coming soon...</p>
    </div>
  );
};

// Budget Line Modal Component (placeholder - would need full implementation)
const BudgetLineModal = ({ isOpen, onClose, onSave, editingBudgetLine }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">
          {editingBudgetLine ? 'Edit Budget Line' : 'Add Budget Line'}
        </h3>
        <p className="text-gray-500">Budget line form coming soon...</p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Expense Modal Component (placeholder - would need full implementation)
const ExpenseModal = ({ isOpen, onClose, onSave, editingExpense, tripId }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">
          {editingExpense ? 'Edit Expense' : 'Add Expense'}
        </h3>
        <p className="text-gray-500">Expense form coming soon...</p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Budget;
