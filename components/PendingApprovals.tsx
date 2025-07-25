"use client"

import "@/styling/ClientDashboard.css"
import { Clock, Eye, Check, X, AlertCircle } from "lucide-react"

interface Approval {
  id: number
  type: "post" | "campaign" | "story"
  title: string
  submittedBy: string
  timeAgo: string
  priority: "urgent" | "high" | "medium" | "low"
  preview?: string
}

const pendingApprovals: Approval[] = [
    {
      id: 1,
      type: "post",
      title: "Q2 Social Media Report",
      submittedBy: "Marketing Team",
      timeAgo: "30 min ago",
      priority: "urgent",
      preview: "Complete report of all Q2 social media activities and performance metrics",
    },
    {
      id: 2,
      type: "post",
      title: "New Product Launch Post",
      submittedBy: "Content Team",
      timeAgo: "1 hour ago",
      priority: "high",
      preview: "Announcement post for our new product line launching next week",
    },
    {
      id: 3,
      type: "story",
      title: "Brand Guidelines Update",
      submittedBy: "Design Team",
      timeAgo: "2 hours ago",
      priority: "medium",
      preview: "Updated brand guidelines with new color palette and typography",
    },
  ]


export default function PendingApprovals() {

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
                    <span className="submitted-by">by {approval.submittedBy}</span>
                  </div>
                </div>
              </div>
              <div className="approval-indicators">
                <div className={`priority-badge ${approval.priority}`}>
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
    </div>
  )
}