
"use client"

import "@/styling/ManagerDashboard.css"
import { useState, useEffect } from "react"
import { API_ROUTES } from "@/app/apiRoutes"
import type React from "react"
import { Users, TrendingUp, MessageSquare, Clock } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  loading?: boolean
}

interface ManagerStats {
  totalClients: number
  pendingRequests: number
  totalMessages: number
  engagementRate: number
}

function AnalyticsCard({ title, value, change, changeType, icon, loading }: AnalyticsCardProps) {
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
          <p className="card-value">{loading ? "Loading..." : value}</p>
        </div>
      </div>
      <div className="card-change" style={{ color: changeColor }}>
        {loading ? "..." : change}
      </div>
    </div>
  )
}

export default function AnalyticsCards() {
  const [stats, setStats] = useState<ManagerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchManagerStats = async () => {
      try {
        setLoading(true)
        
        // Fetch manager statistics from the dedicated stats endpoint
        const statsResponse = await fetch(API_ROUTES.MANAGERS.ME_STATS, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch manager stats')
        }
        
        const statsData = await statsResponse.json()
        
        if (!statsData.success || !statsData.data) {
          throw new Error('Manager stats not found')
        }
        
        const managerStats = statsData.data
        
        // Map the backend stats to our component stats
        const stats: ManagerStats = {
          totalClients: managerStats.overview.totalClients,
          pendingRequests: managerStats.overview.pendingRequests,
          totalMessages: 0, // You can add this to the backend stats if needed
          engagementRate: managerStats.overview.avgRating
        }
        
        setStats(stats)
      } catch (err) {
        console.error('Error fetching manager stats:', err)
        setError('Failed to load analytics data')
        // Set default stats as fallback
        setStats({
          totalClients: 0,
          pendingRequests: 0,
          totalMessages: 0,
          engagementRate: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchManagerStats()
  }, [])

  const getCards = () => {
    if (!stats) {
      return [
        {
          title: "Total Clients",
          value: "0",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <Users size={24} />,
        },
        {
          title: "Manager Rating",
          value: "0.0",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <TrendingUp size={24} />,
        },
        {
          title: "Messages",
          value: "0",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <MessageSquare size={24} />,
        },
        {
          title: "Pending Requests",
          value: "0",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <Clock size={24} />,
        },
      ]
    }

    return [
      {
        title: "Total Clients",
        value: stats.totalClients,
        change: stats.totalClients > 0 ? `Managing ${stats.totalClients} client${stats.totalClients !== 1 ? 's' : ''}` : "No clients yet",
        changeType: stats.totalClients > 0 ? "positive" as const : "neutral" as const,
        icon: <Users size={24} />,
      },
      {
        title: "Manager Rating",
        value: `${stats.engagementRate.toFixed(1)}/5.0`,
        change: stats.engagementRate >= 4 ? "Excellent rating!" : stats.engagementRate >= 3 ? "Good rating" : "Room for improvement",
        changeType: stats.engagementRate >= 4 ? "positive" as const : stats.engagementRate >= 3 ? "neutral" as const : "negative" as const,
        icon: <TrendingUp size={24} />,
      },
      {
        title: "Messages",
        value: stats.totalMessages,
        change: "Communication activity",
        changeType: "neutral" as const,
        icon: <MessageSquare size={24} />,
      },
      {
        title: "Pending Requests",
        value: stats.pendingRequests,
        change: stats.pendingRequests > 0 ? `${stats.pendingRequests} client${stats.pendingRequests !== 1 ? 's' : ''} waiting` : "No pending requests",
        changeType: stats.pendingRequests > 0 ? "neutral" as const : "positive" as const,
        icon: <Clock size={24} />,
      },
    ]
  }

  const cards = getCards()

  return (
    <div className="analytics-grid">
      {error && (
        <div className="error-message" style={{ gridColumn: '1 / -1', padding: '1rem', background: '#fee', borderRadius: '8px', color: '#c53030' }}>
          {error}
        </div>
      )}
      {cards.map((card, index) => (
        <AnalyticsCard key={index} {...card} loading={loading} />
      ))}
    </div>
  )
}
