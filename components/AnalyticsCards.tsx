"use client"

import "@/styling/ClientDashboard.css"

import type React from "react"
import { Users, TrendingUp, MessageSquare, DollarSign } from "lucide-react"

interface Analytics {
  totalEngagement: number;
  reachGrowth: number;
  conversionRate: number;
  roi: number;
}

interface AnalyticsCardsProps {
  analytics: Analytics;
}

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

export default function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  const cards = [
    {
      title: "Total Engagement",
      value: analytics.totalEngagement.toLocaleString(),
      change: "+12% from last month",
      changeType: "positive" as const,
      icon: <Users size={24} />,
    },
    {
      title: "Reach Growth",
      value: `${analytics.reachGrowth}%`,
      change: `${analytics.reachGrowth > 0 ? '+' : ''}${analytics.reachGrowth}% this month`,
      changeType: analytics.reachGrowth >= 0 ? "positive" as const : "negative" as const,
      icon: <TrendingUp size={24} />,
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate}%`,
      change: "Based on click-through",
      changeType: "neutral" as const,
      icon: <MessageSquare size={24} />,
    },
    {
      title: "ROI",
      value: `${analytics.roi}%`,
      change: "Return on Investment",
      changeType: analytics.roi >= 0 ? "positive" as const : "negative" as const,
      icon: <DollarSign size={24} />,
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
