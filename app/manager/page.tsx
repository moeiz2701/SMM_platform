import React from 'react'
import CalendarWidget from '@/components/dashboard/calendar-widget'
import AnalyticsCards from '@/components/dashboard/analytics-cards'
import EngagementChart from '@/components/dashboard/engagement-chart'
import MessagesWidget from '@/components/dashboard/messages-widget'
import PendingApprovals from '@/components/dashboard/pending-approvals'
import TopPosts from '@/components/dashboard/top-posts'




const page = () => {
  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
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
