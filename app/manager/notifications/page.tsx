"use client"

import { useState, useEffect } from "react"
import styles from "../../../styling/ClientNotifications.module.css"
import SearchBar from "../../../components/searchbar"
import API_ROUTES from "../../apiRoutes"

type Notification = {
  _id: string
  type: 'post' | 'budget' | 'system' | 'analytics'
  title: string
  message: string
  relatedEntity?: {
    entityType: string
    entityId: string
  }
  isRead: boolean
  priority: "high" | "medium" | "low" | "critical"
  actionRequired: boolean
  actionTaken: boolean
  user: string
  createdAt: string
}

type NotificationType = {
  key: string
  label: string
  icon: string
}

const notificationTypes = [
  { key: "all", label: "All Notifications", icon: "🔔" },
  { key: "post", label: "Posts", icon: "📝" },
  { key: "budget", label: "Budget", icon: "💰" },
  { key: "system", label: "System", icon: "⚙️" },
  { key: "analytics", label: "Analytics", icon: "📊" },
]

export default function ClientNotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ROUTES.NOTIFICATIONS.GET_ALL, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      if (data.success) {
        setNotifications(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to fetch notifications')
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching notifications')
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter = selectedFilter === "all" || notification.type === selectedFilter
    const matchesSearch =
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const groupedNotifications = filteredNotifications.reduce((groups: Record<string, Notification[]>, notification) => {
    const date = new Date(notification.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
    return groups
  }, {})

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date()
    const timestamp = new Date(createdAt)
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(API_ROUTES.NOTIFICATIONS.MARK_AS_READ(id), {
        method: 'PUT',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => (notification._id === id ? { ...notification, isRead: true } : notification))
        )
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(API_ROUTES.NOTIFICATIONS.MARK_ALL_READ, {
        method: 'PUT',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  const deleteNotification = async (id: string) => {
    // Note: The backend doesn't have a delete endpoint, so we'll just remove from local state
    // You might want to add a delete endpoint in the backend later
    setNotifications((prev) => prev.filter((notification) => notification._id !== id))
  }

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    )
  }

  const selectAllNotifications = () => {
    setSelectedNotifications(filteredNotifications.map((n) => n._id))
  }

  const clearSelection = () => {
    setSelectedNotifications([])
  }

  const bulkMarkAsRead = async () => {
    try {
      // Mark selected notifications as read
      for (const id of selectedNotifications) {
        await fetch(API_ROUTES.NOTIFICATIONS.MARK_AS_READ(id), {
          method: 'PUT',
          credentials: 'include'
        })
      }
      
      setNotifications((prev) =>
        prev.map((notification) =>
          selectedNotifications.includes(notification._id) ? { ...notification, isRead: true } : notification
        )
      )
      clearSelection()
    } catch (err) {
      console.error('Error bulk marking as read:', err)
    }
  }

  const bulkDelete = () => {
    setNotifications((prev) => prev.filter((notification) => !selectedNotifications.includes(notification._id)))
    clearSelection()
  }

  useEffect(() => {
    setShowBulkActions(selectedNotifications.length > 0)
  }, [selectedNotifications])

  const getNotificationIcon = (type: string) => {
    const typeConfig = notificationTypes.find((t) => t.key === type)
    return typeConfig ? typeConfig.icon : "🔔"
  }

  const getPriorityClass = (priority: "high" | "medium" | "low" | "critical") => {
    switch (priority) {
      case "critical":
      case "high":
        return styles.priorityHigh
      case "medium":
        return styles.priorityMedium
      case "low":
        return styles.priorityLow
      default:
        return ""
    }
  }

  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setSearchQuery(query)
  }

  if (loading) {
    return (
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Loading Notifications...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Error Loading Notifications</h1>
            <p className={styles.subtitle}>{error}</p>
            <button onClick={fetchNotifications} className={styles.markAllButton}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            Notifications
            {/* {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>} */}
          </h1>
          <p className={styles.subtitle}>Stay updated with your latest activities and messages</p>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <button className={styles.markAllButton} onClick={markAllAsRead}>
          Mark All Read
        </button>

        <SearchBar placeholder="Search content..." onSearch={handleSearch} className={styles.searchContainer} />
        </div>
      

        <div className={styles.tabs}>
        {notificationTypes.map((type) => (
          <button
            key={type.key}
            className={`${styles.tab} ${selectedFilter === type.key ? styles.tabActive : ""}`}
            onClick={() => setSelectedFilter(type.key)}
          >
            {type.label}
            {type.key === "all" && unreadCount > 0 && (
              <span className={styles.filterBadge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {showBulkActions && (
        <div className={styles.bulkActions}>
          <div className={styles.bulkInfo}>
            <span>{selectedNotifications.length} selected</span>
            <button className={styles.selectAllButton} onClick={selectAllNotifications}>
              Select All
            </button>
            <button className={styles.clearSelectionButton} onClick={clearSelection}>
              Clear
            </button>
          </div>
          <div className={styles.bulkButtons}>
            <button className={styles.bulkReadButton} onClick={bulkMarkAsRead}>
              Mark as Read
            </button>
            <button className={styles.bulkDeleteButton} onClick={bulkDelete}>
              Delete
            </button>
          </div>
        </div>
      )}

      <div className={styles.notificationsContainer}>
        {Object.keys(groupedNotifications).length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔔</div>
            <h3>No notifications found</h3>
            <p>You're all caught up! Check back later for new updates.</p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
            <div key={date} className={styles.notificationGroup}>
              <div className={styles.dateHeader}>
                <span className={styles.dateLabel}>{getDateLabel(date)}</span>
                <div className={styles.dateLine}></div>
              </div>

              <div className={styles.notificationsList}>
                {dayNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`${styles.notificationCard} ${!notification.isRead ? styles.unread : ""} ${getPriorityClass(notification.priority)}`}
                  >
                    <div className={styles.notificationHeader}>
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => toggleNotificationSelection(notification._id)}
                        className={styles.notificationCheckbox}
                      />

                      <div className={styles.notificationIcon}>
                        <span className={styles.typeIcon}>{getNotificationIcon(notification.type)}</span>
                      </div>

                      <div className={styles.notificationContent}>
                        <div className={styles.notificationTitle}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </div>
                        <div className={styles.notificationMessage}>{notification.message}</div>
                      </div>

                      <div className={styles.notificationMeta}>
                        <span className={styles.timestamp}>{formatTimeAgo(notification.createdAt)}</span>
                        <div className={styles.notificationActions}>
                          {!notification.isRead && (
                            <button
                              className={styles.markReadButton}
                              onClick={() => markAsRead(notification._id)}
                              title="Mark as read"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            className={styles.deleteButton}
                            onClick={() => deleteNotification(notification._id)}
                            title="Delete notification"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {notification.priority === "critical" && (
                      <div className={styles.notificationFooter}>
                        <div className={styles.urgentBadge}>Action Required</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}