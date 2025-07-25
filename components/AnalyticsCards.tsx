"use client"

import "@/styling/ClientDashboard.css"

import type React from "react"
import { Users, TrendingUp, MessageSquare, Clock } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
}

function AnalyticsCard({ title, value, change, changeType, icon }: AnalyticsCardProps) {
  const changeColor = {
    positive: "#10b981",
    negative: "#ef4444",
    neutral: "#6b7280",
  }[changeType]
  return (
    <div className="analytics-card">
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="card-info">
          <h3 className="card-title">{title}</h3>
          <p className="card-value">{value}</p>
        </div>
      </div>
      <div className="card-change" style={{ color: changeColor }}>
        {change}
      </div>

      {/* styles moved to ManagerDashboard.css */}
    </div>
  )
}

export default function AnalyticsCards() {
  const cards = [
    {
      title: "Total Posts",
      value: "150",
      change: "+12% from last month",
      changeType: "positive" as const,
      icon: <Users size={24} />,
    },
    {
      title: "Engagement Rate",
      value: "9.1%",
      change: "+2.1% from last week",
      changeType: "positive" as const,
      icon: <TrendingUp size={24} />,
    },
    {
      title: "New Messages",
      value: "5",
      change: "+2 new today",
      changeType: "neutral" as const,
      icon: <MessageSquare size={24} />,
    },
    {
      title: "Pending Approvals",
      value: "3",
      change: "-1 from yesterday",
      changeType: "positive" as const,
      icon: <Clock size={24} />,
    },
  ]

 return (
    <div className="analytics-grid">
      {cards.map((card, index) => (
        <AnalyticsCard key={index} {...card} />
      ))}
    </div>
  )
}
