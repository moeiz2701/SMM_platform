"use client"

import "@/styling/ClientDashboard.css"

export default function HeroBanner({ clientName }: { clientName: string }) {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Welcome back, {clientName}</h1>
          <p className="hero-subtitle">Here's what's happening with your account today</p>
        </div>
        <button className="hero-cta-btn">Request New Post</button>
      </div>
    </div>
  )
}
