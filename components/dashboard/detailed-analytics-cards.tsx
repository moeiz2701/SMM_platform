"use client"

import { useState, useEffect } from "react"
import { API_ROUTES } from "@/app/apiRoutes"
import { Users, TrendingUp, MessageSquare, Clock, Star, UserCheck, UserX, Target } from "lucide-react"
import "@/styling/ManagerDashboard.css"

interface DetailedManagerStats {
  overview: {
    totalClients: number
    activeClients: number
    pendingRequests: number
    approvedRequests: number
    totalReviews: number
    avgRating: number
  }
  performance: {
    clientSatisfaction: number
    responseRate: string
    retentionRate: string
  }
  recent: {
    recentClients: Array<{
      id: string
      name: string
      status: string
      assignedAt: string
    }>
  }
}

interface AnalyticsCardProps {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  loading?: boolean
  subtitle?: string
}

function DetailedAnalyticsCard({ title, value, change, changeType, icon, loading, subtitle }: AnalyticsCardProps) {
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
          {subtitle && <p className="card-subtitle" style={{ fontSize: '0.75rem', color: '#666', margin: '0' }}>{subtitle}</p>}
        </div>
      </div>
      <div className="card-change" style={{ color: changeColor }}>
        {loading ? "..." : change}
      </div>
    </div>
  )
}

export default function DetailedAnalyticsCards() {
  const [stats, setStats] = useState<DetailedManagerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetailedStats = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(API_ROUTES.MANAGERS.ME_STATS, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch detailed manager stats')
        }
        
        const data = await response.json()
        
        if (!data.success || !data.data) {
          throw new Error('Manager stats not found')
        }
        
        setStats(data.data)
      } catch (err) {
        console.error('Error fetching detailed stats:', err)
        setError('Failed to load detailed analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchDetailedStats()
  }, [])

  const getDetailedCards = () => {
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
          title: "Active Clients",
          value: "0",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <UserCheck size={24} />,
        },
        {
          title: "Pending Requests",
          value: "0",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <Clock size={24} />,
        },
        {
          title: "Client Satisfaction",
          value: "0.0",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <Star size={24} />,
        },
        {
          title: "Response Rate",
          value: "0%",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <Target size={24} />,
        },
        {
          title: "Client Retention",
          value: "0%",
          change: "Loading...",
          changeType: "neutral" as const,
          icon: <TrendingUp size={24} />,
        },
      ]
    }

    return [
      {
        title: "Total Clients",
        value: stats.overview.totalClients,
        subtitle: `${stats.overview.activeClients} active`,
        change: stats.overview.totalClients > 0 ? 
          `${stats.overview.activeClients} of ${stats.overview.totalClients} active` : 
          "No clients assigned yet",
        changeType: stats.overview.totalClients > 0 ? "positive" as const : "neutral" as const,
        icon: <Users size={24} />,
      },
      {
        title: "Active Clients",
        value: stats.overview.activeClients,
        subtitle: `${((stats.overview.activeClients / Math.max(stats.overview.totalClients, 1)) * 100).toFixed(0)}% of total`,
        change: stats.overview.activeClients === stats.overview.totalClients ? 
          "All clients active!" : 
          `${stats.overview.totalClients - stats.overview.activeClients} inactive`,
        changeType: stats.overview.activeClients === stats.overview.totalClients ? 
          "positive" as const : "neutral" as const,
        icon: <UserCheck size={24} />,
      },
      {
        title: "Pending Requests",
        value: stats.overview.pendingRequests,
        subtitle: `${stats.overview.approvedRequests} approved total`,
        change: stats.overview.pendingRequests > 0 ? 
          `${stats.overview.pendingRequests} waiting for response` : 
          "No pending requests",
        changeType: stats.overview.pendingRequests === 0 ? "positive" as const : "neutral" as const,
        icon: <Clock size={24} />,
      },
      {
        title: "Client Satisfaction",
        value: `${stats.overview.avgRating.toFixed(1)}/5.0`,
        subtitle: `Based on ${stats.overview.totalReviews} reviews`,
        change: stats.overview.avgRating >= 4.5 ? "Excellent!" : 
               stats.overview.avgRating >= 4.0 ? "Very Good" :
               stats.overview.avgRating >= 3.0 ? "Good" : "Needs Improvement",
        changeType: stats.overview.avgRating >= 4.0 ? "positive" as const : 
                   stats.overview.avgRating >= 3.0 ? "neutral" as const : "negative" as const,
        icon: <Star size={24} />,
      },
      {
        title: "Response Rate",
        value: `${stats.performance.responseRate}%`,
        subtitle: "Request approval rate",
        change: parseFloat(stats.performance.responseRate) >= 80 ? "High response rate" : 
               parseFloat(stats.performance.responseRate) >= 60 ? "Good response rate" : 
               "Could improve",
        changeType: parseFloat(stats.performance.responseRate) >= 80 ? "positive" as const : 
                   parseFloat(stats.performance.responseRate) >= 60 ? "neutral" as const : "negative" as const,
        icon: <Target size={24} />,
      },
      {
        title: "Client Retention",
        value: `${stats.performance.retentionRate}%`,
        subtitle: "Active client percentage",
        change: parseFloat(stats.performance.retentionRate) >= 90 ? "Excellent retention" : 
               parseFloat(stats.performance.retentionRate) >= 75 ? "Good retention" : 
               "Focus on retention",
        changeType: parseFloat(stats.performance.retentionRate) >= 90 ? "positive" as const : 
                   parseFloat(stats.performance.retentionRate) >= 75 ? "neutral" as const : "negative" as const,
        icon: <TrendingUp size={24} />,
      },
    ]
  }

  const cards = getDetailedCards()

  return (
    <div className="detailed-analytics-container">
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>Manager Performance Analytics</h2>
      {error && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          background: '#fee', 
          borderRadius: '8px', 
          color: '#c53030',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      <div className="analytics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {cards.map((card, index) => (
          <DetailedAnalyticsCard key={index} {...card} loading={loading} />
        ))}
      </div>
      
      {stats && stats.recent.recentClients.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Recent Clients</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {stats.recent.recentClients.map((client) => (
              <div key={client.id} style={{ 
                padding: '0.75rem', 
                background: '#f9f9f9', 
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{client.name}</strong>
                  <span style={{ marginLeft: '0.5rem', color: '#666' }}>({client.status})</span>
                </div>
                <small style={{ color: '#888' }}>
                  {new Date(client.assignedAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
