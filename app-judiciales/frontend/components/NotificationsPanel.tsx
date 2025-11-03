'use client'

import Link from 'next/link'
import { Bell, CheckCheck, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Notification } from '@/hooks/useNotifications'

interface NotificationsPanelProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose
}: NotificationsPanelProps) {
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'error':
        return 'bg-red-50'
      default:
        return 'bg-blue-50'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${getNotificationBgColor(notification.type)} flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {notification.time}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(notification.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Link
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
              onClick={onClose}
            >
              View all notifications
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
