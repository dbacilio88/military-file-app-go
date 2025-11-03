import { useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'New Person Added',
    message: 'Juan Pérez has been successfully added to the system',
    time: '5 min ago',
    read: false
  },
  {
    id: '2',
    type: 'info',
    title: 'System Update',
    message: 'The system will be updated tonight at 2:00 AM',
    time: '1 hour ago',
    read: false
  },
  {
    id: '3',
    type: 'warning',
    title: 'Backup Reminder',
    message: 'Remember to backup your data before the update',
    time: '2 hours ago',
    read: false
  },
  {
    id: '4',
    type: 'success',
    title: 'Report Generated',
    message: 'Monthly report has been generated successfully',
    time: '1 day ago',
    read: true
  },
  {
    id: '5',
    type: 'info',
    title: 'New Feature Available',
    message: 'Check out the new analytics dashboard',
    time: '2 days ago',
    read: true
  }
]

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: 'Just now',
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  }
}
