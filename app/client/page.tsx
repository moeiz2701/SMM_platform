"use client"

import React from 'react';
import HeroBanner from '@/components/HeroBanner';
import AnalyticsCards from '@/components/AnalyticsCards';
import CalendarWidget from '@/components/CalendarWidget';
import EngagementChart from '@/components/EngagementChart';
import MessagesWidget from '@/components/MessageWidget';
import PendingApprovals from '@/components/PendingApprovals';
import TopPosts from '@/components/TopPosts';

const page = () => {

  const clientName = "Acme Corp"; // Replace with dynamic client name
  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <HeroBanner clientName={clientName} />
        <AnalyticsCards />
        <div className="dashboard-row">
          <CalendarWidget />
          <EngagementChart />
        </div>
        <div className="dashboard-row">
          <MessagesWidget />
          <PendingApprovals />
        </div>
        <TopPosts />
      </div>
    </div>
  )
}

export default page
