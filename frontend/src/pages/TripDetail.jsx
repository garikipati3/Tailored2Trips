import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopBar from '../components/TopBar';
import ReviewsList from '../components/ReviewsList';
import TripChat from '../components/TripChat';
import WeatherWidget from '../components/WeatherWidget';
import fetcher from '../utils/fetcher';

const TripDetail = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await fetcher(`/api/trip/${tripId}`);
      
      if (response.success) {
        setTrip(response.data);
        // Find current user's role
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUserId(currentUser.id);
        const userMember = response.data.members.find(m => m.user.id === currentUser.id);
        setUserRole(userMember?.role || null);
      } else {
        toast.error(response.message || 'Failed to fetch trip details');
        navigate('/trips');
      }
    } catch (error) {
      console.error('Fetch trip details error:', error);
      toast.error('Failed to fetch trip details');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetcher(`/api/trip/${tripId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        toast.success('Trip deleted successfully');
        navigate('/trips');
      } else {
        toast.error(response.message || 'Failed to delete trip');
      }
    } catch (error) {
      console.error('Delete trip error:', error);
      toast.error('Failed to delete trip');
    }
  };

  const getTripStatus = (trip) => {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    if (startDate > now) return 'upcoming';
    if (endDate < now) return 'completed';
    return 'ongoing';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN';
  const canDelete = userRole === 'OWNER';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Trip not found</h3>
          <p className="text-gray-500 mt-2">The trip you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/trips')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  const status = getTripStatus(trip);
  const duration = calculateDuration(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {trip.coverImageUrl && (
          <img
            src={trip.coverImageUrl}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <div className="flex justify-between items-end">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{trip.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <p className="text-xl opacity-90">{trip.destination}</p>
                <p className="text-lg opacity-75 mt-1">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ({duration} days)
                </p>
              </div>
              
              {canEdit && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md backdrop-blur-sm transition-all duration-200"
                  >
                    Edit Trip
                  </button>
                  {canDelete && (
                    <button
                      onClick={handleDeleteTrip}
                      className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-4 py-2 rounded-md transition-all duration-200"
                    >
                      Delete Trip
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'itinerary', label: 'Itinerary' },
              { key: 'map', label: 'Map View' },
              { key: 'expenses', label: 'Expenses' },
              { key: 'weather', label: 'Weather' },
              { key: 'members', label: 'Members' },
              { key: 'chat', label: 'Chat' },
              { key: 'reviews', label: 'Reviews' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {trip.description || 'No description provided for this trip.'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{duration}</div>
                    <div className="text-sm text-gray-500">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{trip.members.length}</div>
                    <div className="text-sm text-gray-500">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{trip._count.itineraryItems}</div>
                    <div className="text-sm text-gray-500">Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{trip._count.expenses}</div>
                    <div className="text-sm text-gray-500">Expenses</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created by</span>
                    <p className="text-gray-900">{trip.createdBy.fullName}</p>
                  </div>
                  
                  {trip.budget && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Budget</span>
                      <p className="text-gray-900">${trip.budget.toLocaleString()}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Visibility</span>
                    <p className="text-gray-900">{trip.isPublic ? 'Public' : 'Private'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created</span>
                    <p className="text-gray-900">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                  {canEdit && (
                    <button
                      onClick={() => setShowMemberModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add Member
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {trip.members.map((member) => (
                    <div key={member.user.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                          {member.user.profilePhotoUrl ? (
                            <img
                              src={member.user.profilePhotoUrl}
                              alt={member.user.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            member.user.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.user.fullName}</p>
                          <p className="text-xs text-gray-500">@{member.user.username}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                        member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Plan Your Trip Itinerary</h3>
              <p className="mt-1 text-sm text-gray-500">Create a detailed day-by-day plan for your trip with activities, places, and schedules.</p>
              <div className="mt-6">
                <button 
                  onClick={() => navigate(`/trips/${tripId}/itinerary`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Open Itinerary Planner
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Interactive Map View</h3>
              <p className="mt-1 text-sm text-gray-500">Visualize your itinerary on an interactive map with markers, routes, and location details.</p>
              <div className="mt-6">
                <button 
                  onClick={() => navigate(`/trips/${tripId}/map`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Open Map View
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Manage Trip Budget & Expenses</h3>
              <p className="mt-1 text-sm text-gray-500">Track your trip expenses, set budgets, and manage costs with detailed analytics.</p>
              <div className="mt-6">
                <button 
                  onClick={() => navigate(`/trips/${tripId}/budget`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Open Budget Manager
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h3>
                <WeatherWidget 
                  coordinates={{ lat: trip.latitude, lon: trip.longitude }} 
                  className="w-full" 
                />
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Tips</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>Check the weather forecast before planning outdoor activities</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>Pack appropriate clothing based on the temperature range</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>Consider indoor alternatives for rainy days</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>Stay hydrated and use sun protection on sunny days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <MembersTab
            trip={trip}
            userRole={userRole}
            onMemberUpdate={fetchTripDetails}
            onAddMember={() => setShowMemberModal(true)}
          />
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <TripChat
              tripId={tripId}
              currentUserId={currentUserId}
            />
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <ReviewsList
              targetType="TRIP"
              targetId={tripId}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditTripModal
          trip={trip}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchTripDetails();
          }}
        />
      )}

      {showMemberModal && (
        <AddMemberModal
          tripId={tripId}
          onClose={() => setShowMemberModal(false)}
          onSuccess={() => {
            setShowMemberModal(false);
            fetchTripDetails();
          }}
        />
      )}
    </div>
  );
};

// Members Tab Component
const MembersTab = ({ trip, userRole, onMemberUpdate, onAddMember }) => {
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetcher(`/api/trip/${trip.id}/members/${memberId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        toast.success('Member removed successfully');
        onMemberUpdate();
      } else {
        toast.error(response.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Remove member error:', error);
      toast.error('Failed to remove member');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const response = await fetcher(`/api/trip/${trip.id}/members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.success) {
        toast.success('Member role updated successfully');
        onMemberUpdate();
      } else {
        toast.error(response.message || 'Failed to update member role');
      }
    } catch (error) {
      console.error('Update member role error:', error);
      toast.error('Failed to update member role');
    }
  };

  const canManageMembers = userRole === 'OWNER' || userRole === 'ADMIN';
  const canChangeRoles = userRole === 'OWNER';

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Trip Members</h3>
          {canManageMembers && (
            <button
              onClick={onAddMember}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Member
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {trip.members.map((member) => (
          <div key={member.user.id} className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium text-gray-600 mr-4">
                {member.user.profilePhotoUrl ? (
                  <img
                    src={member.user.profilePhotoUrl}
                    alt={member.user.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  member.user.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">{member.user.fullName}</h4>
                <p className="text-gray-500">@{member.user.username}</p>
                <p className="text-sm text-gray-400">{member.user.email}</p>
                <p className="text-xs text-gray-400">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {canChangeRoles && member.role !== 'OWNER' ? (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.user.id, e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  member.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                  member.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
              )}

              {canManageMembers && member.role !== 'OWNER' && (
                <button
                  onClick={() => handleRemoveMember(member.user.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Edit Trip Modal Component
const EditTripModal = ({ trip, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: trip.title,
    description: trip.description || '',
    destination: trip.destination,
    startDate: trip.startDate.split('T')[0],
    endDate: trip.endDate.split('T')[0],
    budget: trip.budget || '',
    isPublic: trip.isPublic,
    coverImageUrl: trip.coverImageUrl || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const response = await fetcher(`/api/trip/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.success) {
        toast.success('Trip updated successfully!');
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to update trip');
      }
    } catch (error) {
      console.error('Update trip error:', error);
      toast.error('Failed to update trip');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Trip</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (USD)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Make this trip public
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Trip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add Member Modal Component
const AddMemberModal = ({ tripId, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      const response = await fetcher(`/api/trip/${tripId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (response.success) {
        toast.success('Member added successfully!');
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Add member error:', error);
      toast.error('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Member</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;