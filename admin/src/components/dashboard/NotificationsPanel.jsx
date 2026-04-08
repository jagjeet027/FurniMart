import React from 'react';

const NotificationItem = ({ notification, onRead }) => (
  <div 
    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${notification.isNew ? 'bg-blue-50' : ''}`}
    onClick={() => onRead(notification.id)}
  >
    <div className="flex justify-between items-start">
      <p className="text-sm text-gray-800">{notification.message}</p>
      {notification.isNew && (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          New
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
  </div>
);

const NotificationsPanel = ({ notifications, onRead, onClose }) => (
  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
    <div className="p-4 border-b bg-gradient-to-r from-indigo-900 to-purple-900">
      <h3 className="text-lg font-semibold text-white">Notifications</h3>
    </div>
    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No notifications
        </div>
      ) : (
        notifications.map(notification => (
          <NotificationItem 
            key={notification.id}
            notification={notification}
            onRead={onRead}
          />
        ))
      )}
    </div>
  </div>
);

export default NotificationsPanel;