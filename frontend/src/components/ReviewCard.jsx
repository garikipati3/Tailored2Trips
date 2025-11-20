import React, { useState } from 'react';
import { Star, Edit, Trash2, User } from 'lucide-react';
import fetcher from '../utils/fetcher';

const ReviewCard = ({ review, onEdit, onDelete, currentUserId, showActions = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    rating: review.rating,
    title: review.title || '',
    content: review.content || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetcher(`/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (response.success) {
        onEdit && onEdit(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetcher(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        onDelete && onDelete(review.id);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setEditData({ ...editData, rating: star }) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {review.user?.profilePhotoUrl ? (
              <img
                src={review.user.profilePhotoUrl}
                alt={review.user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {review.user?.fullName || 'Anonymous User'}
            </h4>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        
        {showActions && currentUserId === review.userId && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-3">
        {isEditing ? (
          renderStars(editData.rating, true)
        ) : (
          renderStars(review.rating)
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="Review title (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            placeholder="Write your review..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {review.title && (
            <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
          )}
          {review.content && (
            <p className="text-gray-700 leading-relaxed">{review.content}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;