"use client"

import { useState, useEffect } from "react"
import styles from "../../../styling/ClientNotifications.module.css"
import SearchBar from "../../../components/searchbar"

type Notification = {
  id: number
  type: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: "high" | "medium" | "low"
  actionUrl?: string
  actionText?: string
  avatar?: string
  senderName?: string
  amount?: string
  meetingTime?: string
}

type NotificationType = {
  key: string
  label: string
  icon: string
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "manager",
    title: "New message from your manager",
    message: "Sarah Johnson has sent you a project update regarding your marketing campaign.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    priority: "high",
    actionUrl: "/client/messages",
    actionText: "View Message",
    avatar: "/placeholder.svg?height=40&width=40",
    senderName: "Sarah Johnson",
  },
  {
    id: 2,
    type: "project",
    title: "Project milestone completed",
    message: "Your Digital Marketing Campaign project has reached the 'Content Creation' milestone.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    priority: "medium",
    actionUrl: "/client/projects",
    actionText: "View Project",
  },
  {
    id: 3,
    type: "billing",
    title: "Invoice generated",
    message: "Your monthly invoice for $2,450.00 has been generated and is ready for payment.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    priority: "high",
    actionUrl: "/client/billing",
    actionText: "Pay Now",
    amount: "$2,450.00",
  },
  {
    id: 4,
    type: "system",
    title: "Account security update",
    message: "Your account password was successfully updated from a new device.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
    actionUrl: "/client/security",
    actionText: "Review Security",
  },
  {
    id: 5,
    type: "achievement",
    title: "Congratulations! Goal achieved",
    message: "You've successfully completed 5 projects this month. Keep up the great work!",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    priority: "low",
    actionUrl: "/client/dashboard",
    actionText: "View Dashboard",
  },
  {
    id: 6,
    type: "reminder",
    title: "Meeting reminder",
    message: "You have a strategy meeting with Michael Chen scheduled for tomorrow at 2:00 PM.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: false,
    priority: "medium",
    actionUrl: "/client/calendar",
    actionText: "View Calendar",
    meetingTime: "Tomorrow at 2:00 PM",
  },
  {
    id: 7,
    type: "update",
    title: "New features available",
    message: "We've added new collaboration tools to enhance your project management experience.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    priority: "low",
    actionUrl: "/client/features",
    actionText: "Explore Features",
  },
  {
    id: 8,
    type: "manager",
    title: "Manager assignment update",
    message: "Emily Rodriguez has been assigned as your secondary manager for content projects.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
    priority: "medium",
    actionUrl: "/client/manager",
    actionText: "View Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    senderName: "Emily Rodriguez",
  },
]

const notificationTypes: NotificationType[] = [
  { key: "all", label: "All Notifications", icon: "🔔" },
  { key: "manager", label: "Manager", icon: "👤" },
  { key: "project", label: "Projects", icon: "📊" },
  { key: "billing", label: "Billing", icon: "💳" },
  { key: "system", label: "System", icon: "⚙️" },
  { key: "reminder", label: "Reminders", icon: "⏰" },
  { key: "achievement", label: "Achievements", icon: "🏆" },
  { key: "update", label: "Updates", icon: "🆕" },
]

export default function ClientNotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter = selectedFilter === "all" || notification.type === selectedFilter
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const groupedNotifications = filteredNotifications.reduce((groups: Record<string, Notification[]>, notification) => {
    const date = notification.timestamp.toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
    return groups
  }, {})

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
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

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const toggleNotificationSelection = (id: number) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    )
  }

  const selectAllNotifications = () => {
    setSelectedNotifications(filteredNotifications.map((n) => n.id))
  }

  const clearSelection = () => {
    setSelectedNotifications([])
  }

  const bulkMarkAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) =>
        selectedNotifications.includes(notification.id) ? { ...notification, read: true } : notification
      )
    )
    clearSelection()
  }

  const bulkDelete = () => {
    setNotifications((prev) => prev.filter((notification) => !selectedNotifications.includes(notification.id)))
    clearSelection()
  }

  useEffect(() => {
    setShowBulkActions(selectedNotifications.length > 0)
  }, [selectedNotifications])

  const getNotificationIcon = (type: string) => {
    const typeConfig = notificationTypes.find((t) => t.key === type)
    return typeConfig ? typeConfig.icon : "🔔"
  }

  const getPriorityClass = (priority: "high" | "medium" | "low") => {
    switch (priority) {
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
                    key={notification.id}
                    className={`${styles.notificationCard} ${!notification.read ? styles.unread : ""} ${getPriorityClass(notification.priority)}`}
                  >
                    <div className={styles.notificationHeader}>
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className={styles.notificationCheckbox}
                      />

                      <div className={styles.notificationIcon}>
                        {notification.avatar ? (
                          <img src={notification.avatar} alt="" className={styles.avatarIcon} />
                        ) : (
                          <span className={styles.typeIcon}>{getNotificationIcon(notification.type)}</span>
                        )}
                      </div>

                      <div className={styles.notificationContent}>
                        <div className={styles.notificationTitle}>
                          {notification.title}
                        </div>
                        <div className={styles.notificationMessage}>{notification.message}</div>

                        {notification.senderName && (
                          <div className={styles.senderInfo}>From: {notification.senderName}</div>
                        )}

                        {notification.amount && (
                          <div className={styles.amountInfo}>
                            Amount: <span className={styles.amount}>{notification.amount}</span>
                          </div>
                        )}

                        {notification.meetingTime && (
                          <div className={styles.meetingInfo}>📅 {notification.meetingTime}</div>
                        )}
                      </div>

                      <div className={styles.notificationMeta}>
                        <span className={styles.timestamp}>{formatTimeAgo(notification.timestamp)}</span>
                        <div className={styles.notificationActions}>
                          {!notification.read && (
                            <button
                              className={styles.markReadButton}
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            className={styles.deleteButton}
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete notification"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {notification.actionUrl && (
                      <div className={styles.notificationFooter}>
                        <button className={styles.actionButton}>{notification.actionText}</button>
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