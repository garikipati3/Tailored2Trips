import React, { useState, useEffect } from 'react';
import { Star, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import fetcher from '../utils/fetcher';

const ReviewsList = ({ targetType, targetId, currentUserId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [targetType, targetId, pagination.page]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = targetType === 'PLACE' 
        ? `/api/reviews/places/${targetId}`
        : `/api/reviews/trips/${targetId}`;
      
      const response = await fetcher(`${endpoint}?page=${pagination.page}&limit=${pagination.limit}`);
      
      if (response.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.averageRating);
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }));
      } else {
        setError('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowForm(false);
    // Refresh to get updated average rating
    fetchReviews();
  };

  const handleReviewEdited = (updatedReview) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === updatedReview.id ? updatedReview : review
      )
    );
    // Refresh to get updated average rating
    fetchReviews();
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
    // Refresh to get updated average rating
    fetchReviews();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({pagination.total} review{pagination.total !== 1 ? 's' : ''})
        </span>
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} reviews
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 text-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reviews</h2>
          {pagination.total > 0 && renderStars(averageRating)}
        </div>
        
        {currentUserId && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Write Review</span>
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          targetType={targetType}
          targetId={targetId}
          onReviewAdded={handleReviewAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onEdit={handleReviewEdited}
              onDelete={handleReviewDeleted}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default ReviewsList;