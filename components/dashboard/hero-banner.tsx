"use client"

import "@/styling/ManagerDashboard.css"

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Welcome back, Manager</h1>
          <p className="hero-subtitle">Manage your agency, clients, and team all in one place.</p>
        </div>
        <button className="hero-cta-btn">Create New</button>
      </div>
    </div>
  )
}
