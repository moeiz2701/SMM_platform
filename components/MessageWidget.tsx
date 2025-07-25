"use client"

import "@/styling/ClientDashboard.css"
import { MessageSquare, User, CheckCheck } from "lucide-react"

interface Message {
  id: number
  sender: string
  content: string
  platform: "instagram" | "facebook" | "twitter"
  timeAgo: string
  isRead: boolean
  priority: "high" | "medium" | "low"
}

export default function MessagesWidget() {
  const messages: Message[] = [
    {
      id: 1,
      sender: "Marketing Team",
      content: "Your Q2 campaign report is ready for review",
      platform: "facebook",
      timeAgo: "30 min ago",
      isRead: false,
      priority: "high",
    },
    {
      id: 2,
      sender: "Support Team",
      content: "We need your approval for the new post design",
      platform: "instagram",
      timeAgo: "1 hour ago",
      isRead: false,
      priority: "medium",
    },
    {
      id: 3,
      sender: "Analytics Team",
      content: "Latest engagement metrics show 12% increase",
      platform: "twitter",
      timeAgo: "2 hours ago",
      isRead: true,
      priority: "low",
    },
  ]

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
