"use client"

import "@/styling/ClientDashboard.css"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const engagementData = [
  { name: "Mon", likes: 80, comments: 20, shares: 10 },
  { name: "Tue", likes: 120, comments: 35, shares: 15 },
  { name: "Wed", likes: 90, comments: 25, shares: 12 },
  { name: "Thu", likes: 150, comments: 40, shares: 20 },
  { name: "Fri", likes: 110, comments: 30, shares: 18 },
  { name: "Sat", likes: 60, comments: 15, shares: 8 },
  { name: "Sun", likes: 40, comments: 10, shares: 5 },
]
export default function EngagementChart() {
  return (
    <div className="engagement-chart">
      <div className="chart-header">
        <h3>Post Engagement Analytics</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#4f46e5" }}></div>
            <span>Likes</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#10b981" }}></div>
            <span>Comments</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#f59e0b" }}></div>
            <span>Shares</span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f9fafb",
              }}
            />
            <Bar dataKey="likes" fill="#4f46e5" radius={[2, 2, 0, 0]} />
            <Bar dataKey="comments" fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="shares" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* styles moved to ManagerDashboard.css */}
    </div>
  )
}



