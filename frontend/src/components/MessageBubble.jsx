import React, { useState } from 'react';

const MessageBubble = ({ message, isOwnMessage, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEdit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      await onEdit(message.id, editContent.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await onDelete(message.id);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {!isOwnMessage && (
          <div className="flex items-center mb-1">
            {message.sender?.profilePhotoUrl ? (
              <img
                src={message.sender.profilePhotoUrl}
                alt={message.sender.fullName}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  {message.sender?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600 font-medium">
              {message.sender?.fullName || 'Unknown User'}
            </span>
          </div>
        )}
        
        <div
          className={`relative px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-gray-900 bg-white border rounded resize-none"
                rows="2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {isOwnMessage && showActions && (
                <div className="absolute top-0 right-0 -mt-8 flex gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                    title="Edit message"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    title="Delete message"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
          
          <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;