
"use client"

import "@/styling/ManagerDashboard.css"

import { Clock, Eye, Check, X, AlertCircle } from "lucide-react"

interface Approval {
  id: number
  type: "post" | "campaign" | "story"
  title: string
  client: string
  platform: "instagram" | "facebook" | "twitter"
  submittedBy: string
  timeAgo: string
  priority: "urgent" | "high" | "medium" | "low"
  preview?: string
}

const pendingApprovals: Approval[] = [
  {
    id: 1,
    type: "post",
    title: "Summer Sale Announcement",
    client: "Fashion Brand Co.",
    platform: "instagram",
    submittedBy: "Jessica Miller",
    timeAgo: "30 min ago",
    priority: "urgent",
    preview: "🌞 SUMMER SALE IS HERE! Get up to 50% off on all summer essentials...",
  },
  {
    id: 2,
    type: "campaign",
    title: "Back to School Campaign",
    client: "EduTech Solutions",
    platform: "facebook",
    submittedBy: "David Park",
    timeAgo: "1 hour ago",
    priority: "high",
    preview: "Complete campaign package with 5 posts, 3 stories, and video content",
  },
  {
    id: 3,
    type: "story",
    title: "Behind the Scenes Story",
    client: "Local Restaurant",
    platform: "instagram",
    submittedBy: "Maria Garcia",
    timeAgo: "2 hours ago",
    priority: "medium",
    preview: "Behind the scenes footage of our chef preparing today's special",
  },
  {
    id: 4,
    type: "post",
    title: "Product Launch Teaser",
    client: "Tech Startup Inc.",
    platform: "twitter",
    submittedBy: "Alex Thompson",
    timeAgo: "3 hours ago",
    priority: "high",
    preview: "Something big is coming... 🚀 Stay tuned for our biggest announcement yet!",
  },
]

export default function PendingApprovals() {
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
      case "urgent":
        return "#dc2626"
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return "📝"
      case "campaign":
        return "📊"
      case "story":
        return "📱"
      default:
        return "📄"
    }
  }

  return (
    <div className="pending-approvals">
      <div className="approvals-header">
        <div className="header-title">
          <Clock size={20} />
          <h3>Pending Approvals</h3>
        </div>
        <div className="urgent-count">{pendingApprovals.filter((a) => a.priority === "urgent").length} urgent</div>
      </div>

      <div className="approvals-list">
        {pendingApprovals.map((approval) => (
          <div key={approval.id} className={`approval-item priority-${approval.priority}`}>
            <div className="approval-header">
              <div className="approval-info">
                <div className="type-badge">
                  <span className="type-icon">{getTypeIcon(approval.type)}</span>
                  <span className="type-text">{approval.type}</span>
                </div>
                <div className="approval-details">
                  <h4 className="approval-title">{approval.title}</h4>
                  <div className="approval-meta">
                    <span className="client-name">{approval.client}</span>
                    <div
                      className="platform-dot"
                      style={{ backgroundColor: getPlatformColor(approval.platform) }}
                    ></div>
                    <span className="submitted-by">by {approval.submittedBy}</span>
                  </div>
                </div>
              </div>
              <div className="approval-indicators">
                <div className="priority-badge" style={{ backgroundColor: getPriorityColor(approval.priority) }}>
                  {approval.priority === "urgent" && <AlertCircle size={12} />}
                  {approval.priority}
                </div>
                <span className="time-ago">{approval.timeAgo}</span>
              </div>
            </div>

            {approval.preview && (
              <div className="approval-preview">
                <p>{approval.preview}</p>
              </div>
            )}

            <div className="approval-actions">
              <button className="action-btn preview-btn">
                <Eye size={14} />
                Preview
              </button>
              <button className="action-btn approve-btn">
                <Check size={14} />
                Approve
              </button>
              <button className="action-btn reject-btn">
                <X size={14} />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="approvals-footer">
        <button className="view-all-approvals">View All Pending Items</button>
      </div>

      {/* styles moved to ManagerDashboard.css */}
    </div>
  )
}
