import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopBar from '../components/TopBar';
import fetcher from '../utils/fetcher';

const Itinerary = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItinerary();
  }, [tripId]);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const response = await fetcher(`/api/itinerary/trip/${tripId}`);
      if (response.success) {
        setTrip(response.data.trip);
        setItinerary(response.data.itinerary);
      } else {
        toast.error(response.message || 'Failed to load itinerary');
        navigate('/trips');
      }
    } catch (error) {
      console.error('Fetch itinerary error:', error);
      toast.error('Failed to load itinerary');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowAddItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddItemModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetcher(`/api/itinerary/trip/${tripId}/items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        toast.success('Item deleted successfully');
        fetchItinerary();
      } else {
        toast.error(response.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Delete item error:', error);
      toast.error('Failed to delete item');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading itinerary...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/trips/${tripId}`)}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Trip Details
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{trip?.title} - Itinerary</h1>
          <p className="text-gray-600 mt-2">
            {trip?.destination} • {formatDate(trip?.startDate)} - {formatDate(trip?.endDate)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Day Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Days</h3>
              <div className="space-y-2">
                {itinerary.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedDay === day.day
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Day {day.day}</div>
                    <div className="text-sm opacity-75">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs mt-1">
                      {day.items.length} {day.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Day Details */}
          <div className="lg:col-span-3">
            {itinerary.find(day => day.day === selectedDay) && (
              <DayView
                day={itinerary.find(day => day.day === selectedDay)}
                onAddItem={handleAddItem}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                formatTime={formatTime}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItemModal && (
        <AddItemModal
          tripId={tripId}
          day={selectedDay}
          item={editingItem}
          onClose={() => {
            setShowAddItemModal(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowAddItemModal(false);
            setEditingItem(null);
            fetchItinerary();
          }}
        />
      )}
    </div>
  );
};

// Day View Component
const DayView = ({ day, onAddItem, onEditItem, onDeleteItem, formatTime }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Day {day.day}</h2>
            <p className="text-gray-600">
              {new Date(day.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onAddItem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Item
          </button>
        </div>
      </div>

      <div className="p-6">
        {day.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No items planned for this day</div>
            <button
              onClick={onAddItem}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {day.items.map((item, index) => (
              <ItineraryItem
                key={item.id}
                item={item}
                index={index}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item.id)}
                formatTime={formatTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Itinerary Item Component
const ItineraryItem = ({ item, index, onEdit, onDelete, formatTime }) => {
  const getCategoryColor = (category) => {
    const colors = {
      ACCOMMODATION: 'bg-purple-100 text-purple-800',
      TRANSPORTATION: 'bg-blue-100 text-blue-800',
      ACTIVITY: 'bg-green-100 text-green-800',
      RESTAURANT: 'bg-orange-100 text-orange-800',
      SHOPPING: 'bg-pink-100 text-pink-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.OTHER;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
            {item.startTime && (
              <span className="text-sm text-gray-600">
                {formatTime(item.startTime)}
                {item.endTime && ` - ${formatTime(item.endTime)}`}
              </span>
            )}
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
          
          {item.description && (
            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
          )}
          
          {item.place && (
            <div className="text-sm text-gray-500 mb-2">
              📍 {item.place.name}
              {item.place.address && <span className="ml-2">{item.place.address}</span>}
            </div>
          )}
          
          {item.estimatedCost && (
            <div className="text-sm text-green-600 font-medium">
              Estimated cost: ${item.estimatedCost}
            </div>
          )}
          
          {item.notes && (
            <div className="text-sm text-gray-500 mt-2 italic">
              Note: {item.notes}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Item Modal Component
const AddItemModal = ({ tripId, day, item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    startTime: item?.startTime ? formatTimeForInput(item.startTime) : '',
    endTime: item?.endTime ? formatTimeForInput(item.endTime) : '',
    category: item?.category || 'ACTIVITY',
    estimatedCost: item?.estimatedCost || '',
    notes: item?.notes || '',
    placeName: item?.place?.name || '',
    placeAddress: item?.place?.address || ''
  });
  const [loading, setLoading] = useState(false);

  function formatTimeForInput(timeString) {
    if (!timeString) return '';
    const time = new Date(timeString);
    return time.toTimeString().slice(0, 5);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setLoading(true);
      const url = item 
        ? `/api/itinerary/trip/${tripId}/items/${item.id}`
        : `/api/itinerary/trip/${tripId}/items`;
      
      const method = item ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        day: day,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null
      };

      const response = await fetcher(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.success) {
        toast.success(item ? 'Item updated successfully' : 'Item added successfully');
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('Save item error:', error);
      toast.error('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'} - Day {day}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Visit Eiffel Tower"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Additional details about this activity..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ACTIVITY">Activity</option>
              <option value="ACCOMMODATION">Accommodation</option>
              <option value="TRANSPORTATION">Transportation</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="SHOPPING">Shopping</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place Name
              </label>
              <input
                type="text"
                value={formData.placeName}
                onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Eiffel Tower"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.placeAddress}
              onChange={(e) => setFormData({ ...formData, placeAddress: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full address of the place"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="Any additional notes or reminders..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Itinerary;