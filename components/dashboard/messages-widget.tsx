
"use client"

import "@/styling/ManagerDashboard.css"

import { MessageSquare, User, CheckCheck } from "lucide-react"

interface Message {
  id: number
  sender: string
  avatar?: string
  content: string
  platform: "instagram" | "facebook" | "twitter"
  timeAgo: string
  isRead: boolean
  priority: "high" | "medium" | "low"
}

const messages: Message[] = [
  {
    id: 1,
    sender: "Sarah Johnson",
    content: "Hi! I'm interested in your summer collection. Can you provide more details about sizing?",
    platform: "instagram",
    timeAgo: "5 min ago",
    isRead: false,
    priority: "high",
  },
  {
    id: 2,
    sender: "Mike Chen",
    content: "Great post about sustainability! Would love to collaborate on an eco-friendly project.",
    platform: "facebook",
    timeAgo: "15 min ago",
    isRead: false,
    priority: "medium",
  },
  {
    id: 3,
    sender: "Emma Davis",
    content: "Thank you for the quick response! The product arrived and it's perfect.",
    platform: "twitter",
    timeAgo: "1 hour ago",
    isRead: true,
    priority: "low",
  },
  {
    id: 4,
    sender: "Alex Rodriguez",
    content: "Is there a discount available for bulk orders? I'm planning to order 50+ items.",
    platform: "instagram",
    timeAgo: "2 hours ago",
    isRead: false,
    priority: "high",
  },
]

export default function MessagesWidget() {
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "#e1306c"
      case "facebook":
        return "#1877f2"
      case "twitter":
        return "#1da1f2"
      default:
        return "#6b7280"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  return (
    <div className="messages-widget">
      <div className="messages-header">
        <div className="header-title">
          <MessageSquare size={20} />
          <h3>Recent Messages</h3>
        </div>
        <div className="unread-count">{messages.filter((m) => !m.isRead).length} unread</div>
      </div>

      <div className="messages-list">
        {messages.map((message) => (
          <div key={message.id} className={`message-item ${!message.isRead ? "unread" : ""}`}>
            <div className="message-header">
              <div className="sender-info">
                <div className="avatar">
                  <User size={16} />
                </div>
                <div className="sender-details">
                  <span className="sender-name">{message.sender}</span>
                  <div className="message-meta">
                    <div className="platform-dot" style={{ backgroundColor: getPlatformColor(message.platform) }}></div>
                    <span className="time-ago">{message.timeAgo}</span>
                  </div>
                </div>
              </div>
              <div className="message-indicators">
                <div
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(message.priority) }}
                  title={`${message.priority} priority`}
                ></div>
                {message.isRead && <CheckCheck size={14} className="read-indicator" />}
              </div>
            </div>

            <div className="message-content">
              <p>{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="messages-footer">
        <button className="view-all-messages">View All Messages</button>
      </div>

      {/* styles moved to ManagerDashboard.css */}
    </div>
  )
}
