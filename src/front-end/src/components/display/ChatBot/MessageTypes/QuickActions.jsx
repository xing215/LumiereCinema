// components/ChatMessage/MessageTypes/QuickActions.jsx
import React from 'react';

/**
 * QuickActions - Component hiển thị các quick action buttons
 * 
 * Kiến thức: Component này nhận suggestions và quick_actions
 * từ backend response và render thành buttons
 */
const QuickActions = ({ suggestions = [], quickActions = [], onAction }) => {
  // Only show quickActions, remove suggestions
  const allActions = [
    ...(Array.isArray(quickActions) ? quickActions.map(qa => ({ ...qa, type: 'action' })) : [])
  ];
  if (allActions.length === 0) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex flex-wrap gap-2">
        {allActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onAction(action)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all transform hover:scale-105 shadow-sm break-words ${
              action.type === 'suggestion'
                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'
            }`}
          >
            {action.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
