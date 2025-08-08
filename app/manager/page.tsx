import HeroBanner from "@/components/dashboard/hero-banner"
import CalendarWidget from "@/components/dashboard/calendar-widget"
import AnalyticsCards from "@/components/dashboard/analytics-cards"
import EngagementChart from "@/components/dashboard/engagement-chart"
import MessagesWidget from "@/components/dashboard/messages-widget"
import PendingApprovals from "@/components/dashboard/pending-approvals"
import TopPosts from "@/components/dashboard/top-posts"

const page = () => {
  return (
    <div className="animation">
    <div className="dashboard-grid">
      <div className="dashboard-main">
        <HeroBanner />
        <AnalyticsCards />
        <div className="dashboard-row">
          <CalendarWidget />
          <EngagementChart />
        </div>
        <div className="dashboard-row">
          <MessagesWidget />
          <PendingApprovals />
        </div>
        
      </div>
    </div>
    </div>
  )
}

export default page
