
"use client"

import "@/styling/ManagerDashboard.css"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const engagementData = [
  { name: "Mon", likes: 120, comments: 45, shares: 23 },
  { name: "Tue", likes: 190, comments: 67, shares: 34 },
  { name: "Wed", likes: 150, comments: 52, shares: 28 },
  { name: "Thu", likes: 220, comments: 78, shares: 41 },
  { name: "Fri", likes: 280, comments: 95, shares: 52 },
  { name: "Sat", likes: 340, comments: 112, shares: 67},
  { name: "Sun", likes: 290, comments: 89, shares: 45 },
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
