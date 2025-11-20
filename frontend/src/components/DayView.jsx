import React from 'react';
import ItineraryItem from './ItineraryItem';

const DayView = ({ 
  day, 
  items, 
  onEditItem, 
  onDeleteItem, 
  onReorderItems,
  onAddItem 
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDragStart = (e, itemId) => {
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('text/plain');
    const draggedItem = items.find(item => item.id === draggedItemId);
    
    if (draggedItem) {
      onReorderItems(day, draggedItemId, targetIndex);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Day {day}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000))}
            </p>
          </div>
          <button
            onClick={() => onAddItem(day)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Activity
          </button>
        </div>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No activities planned for this day</p>
            <button
              onClick={() => onAddItem(day)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500"
            >
              Add your first activity
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="cursor-move"
              >
                <ItineraryItem
                  item={item}
                  onEdit={() => onEditItem(item)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;