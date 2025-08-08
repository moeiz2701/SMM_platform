"use client"

import { useState, useEffect } from "react"
import type {
  MetricCard,
  PlatformData,
  ReportTab,
  TrendType,
  DateRange,
  ContentPerformanceItem,
  FinancialData,
  AudienceData,
} from "../../../components/analytics"
import styles from "@/styling/reports.module.css"
import ReusableTable, { type TableColumn, type TableAction } from "../../../components/table"

// Facebook API Response Types
interface FacebookPageInfo {
  id: string
  name: string
  category: string
  current_fans: number
  followers_count: number
}

interface FacebookInsights {
  page_views: number
  page_impressions_unique: number
  page_reach: number
  page_engaged_users: number
  page_engaged_users: number
  page_fans_total: number
}

interface FacebookContentMetrics {
  total_posts: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_engagement: number
  average_engagement_per_post: number
  engagement_rate: number
}

interface FacebookReportData {
  success: boolean
  page_info: FacebookPageInfo
  insights: FacebookInsights
  content_metrics: FacebookContentMetrics
  report_generated_at: string
  data_source: string
}

const metricCards: MetricCard[] = [
  {
    id: "1",
    title: "Reach",
    value: "125,600",
    change: 12.5,
    changeType: "increase",
    subtitle: "Last 30 days",
  },
  {
    id: "2",
    title: "Engagement",
    value: "8,420",
    change: -3.2,
    changeType: "decrease",
    subtitle: "Last 30 days",
  },
  {
    id: "3",
    title: "Clicks",
    value: "2,340",
    change: 18.7,
    changeType: "increase",
    subtitle: "Last 30 days",
  },
  {
    id: "4",
    title: "Conversions",
    value: "156",
    change: 7.3,
    changeType: "increase",
    subtitle: "Last 30 days",
  },
]

const platformData: PlatformData[] = [
  {
    name: "Instagram",
    percentage: 42,
    change: 5.2,
    changeType: "increase",
    color: "#E1306C",
  },
  {
    name: "Facebook",
    percentage: 28,
    change: -2.1,
    changeType: "decrease",
    color: "#1877F2",
  },
  {
    name: "LinkedIn",
    percentage: 18,
    change: 8.4,
    changeType: "increase",
    color: "#0A66C2",
  },
  {
    name: "Twitter",
    percentage: 8,
    change: -1.5,
    changeType: "decrease",
    color: "#1DA1F2",
  },
  {
    name: "Other",
    percentage: 4,
    change: 0.8,
    changeType: "increase",
    color: "#6B7280",
  },
]

const contentPerformanceData: ContentPerformanceItem[] = [
  {
    id: "1",
    content: "Summer Collection Launch",
    type: "Instagram Post",
    date: "Jun 15, 2023",
    reach: 24500,
    engagement: 3200,
    clicks: 980,
    conversions: 125,
  },
  {
    id: "2",
    content: "10 Marketing Trends for 2023",
    type: "Blog Post",
    date: "Jun 10, 2023",
    reach: 18700,
    engagement: 2100,
    clicks: 1240,
    conversions: 85,
  },
  {
    id: "3",
    content: "Product Feature Announcement",
    type: "Email Newsletter",
    date: "Jun 5, 2023",
    reach: 15200,
    engagement: 1850,
    clicks: 720,
    conversions: 210,
  },
  {
    id: "4",
    content: "Customer Testimonial Series",
    type: "LinkedIn Post",
    date: "Jun 1, 2023",
    reach: 8900,
    engagement: 1450,
    clicks: 380,
    conversions: 45,
  },
  {
    id: "5",
    content: "Limited Time Offer",
    type: "Facebook Ad",
    date: "May 28, 2023",
    reach: 32100,
    engagement: 2800,
    clicks: 1560,
    conversions: 315,
  },
]

const financialData: FinancialData = {
  totalRevenue: {
    value: 128500,
    change: 12.5,
    changeType: "increase",
  },
  expenses: {
    value: 42800,
    change: 5.2,
    changeType: "increase",
  },
  profit: {
    value: 85700,
    change: 16.8,
    changeType: "increase",
  },
  revenueByClient: [
    {
      client: "ABC Corporation",
      revenue: 45000,
      expenses: 15750,
      profit: 29250,
      profitMargin: 65,
    },
    {
      client: "XYZ Company",
      revenue: 32000,
      expenses: 10240,
      profit: 21760,
      profitMargin: 68,
    },
    {
      client: "123 Industries",
      revenue: 28500,
      expenses: 9975,
      profit: 18525,
      profitMargin: 65,
    },
    {
      client: "Tech Solutions Inc",
      revenue: 23000,
      expenses: 6835,
      profit: 16165,
      profitMargin: 70,
    },
  ],
}

const audienceData: AudienceData = {
  ageDistribution: [
    { range: "18-24", percentage: 15 },
    { range: "25-34", percentage: 32 },
    { range: "35-44", percentage: 28 },
    { range: "45-54", percentage: 18 },
    { range: "55+", percentage: 7 },
  ],
  gender: {
    female: 75,
    male: 25,
  },
  geographic: [
    { country: "United States", percentage: 45 },
    { country: "United Kingdom", percentage: 23 },
    { country: "Canada", percentage: 12 },
    { country: "Australia", percentage: 8 },
    { country: "Germany", percentage: 7 },
    { country: "Other", percentage: 5 },
  ],
}

const reportTabs: ReportTab[] = ["LinkedIn", "Facebook", "Instagram"]
const trendTypes: TrendType[] = ["Reach", "Engagement", "Clicks", "Conversions"]
const dateRanges: DateRange[] = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Last Year"]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("Facebook")
  const [activeTrend, setActiveTrend] = useState<TrendType>("Engagement")
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("Last 30 Days")
  const [showFilters, setShowFilters] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  })
  const [facebookData, setFacebookData] = useState<FacebookReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch Facebook data when Facebook tab is active
  useEffect(() => {
    if (activeTab === "Facebook") {
      fetchFacebookData()
    }
  }, [activeTab])

  const fetchFacebookData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Step 1: Get current user information
      const userResponse = await fetch("http://localhost:3000/api/v1/auth/me", {
        method: 'GET',
        credentials: 'include',
      })

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user information")
      }

      const userData = await userResponse.json()
      const userId = userData.data._id || userData.client

      // Step 2: Get manager information and their managed clients
      const managedClientsResponse = await fetch(`http://localhost:3000/api/v1/managers/${userId}/clients`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!managedClientsResponse.ok) {
        throw new Error("Failed to fetch managed clients")
      }

      const managedClientsData = await managedClientsResponse.json()
      const managedClients = managedClientsData.data || []

      if (managedClients.length === 0) {
        throw new Error("No clients found for this manager")
      }

      // Extract client IDs for filtering
      const managedClientIds = managedClients.map(client => client._id)

      // Step 3: Get all social accounts
      const socialAccountsResponse = await fetch("http://localhost:3000/api/v1/social-accounts", {
        method: 'GET',
        credentials: 'include',
      })

      if (!socialAccountsResponse.ok) {
        throw new Error("Failed to fetch social accounts")
      }

      const socialAccountsData = await socialAccountsResponse.json()
      // Extract the actual array from the response
      const allSocialAccounts = socialAccountsData.data || socialAccountsData

      // Step 4: Filter accounts by managed client IDs and find Facebook accounts
      const managerFacebookAccounts = allSocialAccounts.filter((account) => {
        // Check if the account belongs to one of the managed clients
        const accountClientId = account.client || account.user
        const isClientManaged = managedClientIds.some(clientId => 
          clientId === accountClientId || clientId.toString() === accountClientId?.toString()
        )
        const isFacebook = account.platform.toLowerCase() === 'facebook'
        return isClientManaged && isFacebook
      })

      if (managerFacebookAccounts.length === 0) {
        throw new Error("No Facebook accounts found for this manager's clients")
      }

      // Step 5: Extract access tokens and fetch data from each Facebook account
      const facebookReports = []
      console.log("hello")
      console.log(managerFacebookAccounts)

      for (const facebookAccount of managerFacebookAccounts) {
        if (!facebookAccount.accessToken) {
          console.warn(`Facebook account ${facebookAccount.id} has no access token, skipping...`)
          continue
        }

        try {
          const facebookReportResponse = await fetch("http://localhost:3000/api/v1/analytics/facebook-report", {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              access_token: facebookAccount.accessToken
            })
          })

          if (facebookReportResponse.ok) {
            const reportData = await facebookReportResponse.json()
            facebookReports.push({
              ...reportData,
              account_info: {
                id: facebookAccount.id,
                client_id: facebookAccount.client || facebookAccount.user,
                platform: facebookAccount.platform
              }
            })
          } else {
            console.warn(`Failed to fetch data for Facebook account ${facebookAccount.id}`)
          }
        } catch (accountError) {
          console.warn(`Error fetching data for Facebook account ${facebookAccount.id}:`, accountError)
        }
      }

      if (facebookReports.length === 0) {
        throw new Error("No Facebook data could be retrieved from any connected accounts")
      }

      console.log(facebookReports)

      // Step 6: Aggregate all Facebook data into combined statistics
      const aggregatedData = {
        success: true,
        page_info: {
          category: "",
          current_fans: 0,
          followers_count: 0
        },
        insights: {
          page_views: 0,
          page_impressions_unique: 0,
          page_reach: 0,
          page_engaged_users: 0,
          page_fans_total: 0
        },
        content_metrics: {
          total_posts: 0,
          total_likes: 0,
          total_comments: 0,
          total_shares: 0,
          total_engagement: 0,
          average_engagement_per_post: 0,
          engagement_rate: 0
        },
        report_generated_at: new Date().toISOString(),
        data_source: "Facebook Graph API (Multiple Manager Clients)",
        account_count: facebookReports.length,
        client_count: managedClients.length,
        managed_clients: managedClients.map(client => ({
          id: client._id,
          name: client.name || client.email || 'Unknown Client'
        }))
      }

      // Aggregate the data from all Facebook accounts
      facebookReports.forEach(report => {
        if (report.page_info) {
          aggregatedData.page_info.current_fans += report.page_info.current_fans || 0
          aggregatedData.page_info.followers_count += report.page_info.followers_count || 0
        }

        if (report.insights) {
          aggregatedData.insights.page_views += report.insights.page_views || 0
          aggregatedData.insights.page_impressions_unique += report.insights.page_impressions_unique || 0
          aggregatedData.insights.page_reach += report.insights.page_reach || 0
          aggregatedData.insights.page_engaged_users += report.insights.page_engaged_users || 0
          aggregatedData.insights.page_fans_total += report.insights.page_fans_total || 0
        }

        if (report.content_metrics) {
          aggregatedData.content_metrics.total_posts += report.content_metrics.total_posts || 0
          aggregatedData.content_metrics.total_likes += report.content_metrics.total_likes || 0
          aggregatedData.content_metrics.total_comments += report.content_metrics.total_comments || 0
          aggregatedData.content_metrics.total_shares += report.content_metrics.total_shares || 0
          aggregatedData.content_metrics.total_engagement += report.content_metrics.total_engagement || 0
        }
      })

      // Calculate average engagement per post and engagement rate
      if (aggregatedData.content_metrics.total_posts > 0) {
        aggregatedData.content_metrics.average_engagement_per_post = 
          aggregatedData.content_metrics.total_engagement / aggregatedData.content_metrics.total_posts

        // Calculate engagement rate as (total_engagement / total_fans) * 100
        if (aggregatedData.insights.page_fans_total > 0) {
          aggregatedData.content_metrics.engagement_rate = 
            (aggregatedData.content_metrics.total_engagement / aggregatedData.insights.page_fans_total) * 100
        }
      }

      setFacebookData(aggregatedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching Facebook data")
    } finally {
      setLoading(false)
    }
  }

  const formatChange = (change: number, changeType: "increase" | "decrease") => {
    const sign = changeType === "increase" ? "+" : "-"
    const arrow = changeType === "increase" ? "↗" : "↘"
    return `${sign}${Math.abs(change)}% ${arrow}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const handleFilterToggle = () => {
    setShowFilters(!showFilters)
  }

  const handleExport = () => {
    console.log("Exporting report data...")
  }

  const handleShare = () => {
    console.log("Sharing report...")
  }

  const handleChooseDates = () => {
    setShowDatePicker(!showDatePicker)
  }

  // Generate chart data based on active trend
  const generateChartData = () => {
    const baseValues = {
      Reach: [60, 80, 45, 90, 70, 85, 65],
      Engagement: [40, 65, 30, 75, 55, 70, 50],
      Clicks: [30, 50, 25, 60, 45, 55, 40],
      Conversions: [20, 35, 15, 45, 30, 40, 25],
    }
    return baseValues[activeTrend] || baseValues.Engagement
  }

  const chartData = generateChartData()

  const renderFacebookTab = () => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>Loading Facebook data...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>Error: {error}</div>
          <button onClick={fetchFacebookData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )
    }

    if (!facebookData) {
      return (
        <div className={styles.noDataContainer}>
          <div className={styles.noDataMessage}>No Facebook data available</div>
        </div>
      )
    }

    const { page_info, insights, content_metrics } = facebookData

    return (
      <>
        {/* Page Overview Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Page Overview</h2>
        </div>
        <div className={styles.summaryCards}>
          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Current Fans</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(page_info.current_fans)}</div>
            <div className={styles.cardSubtitle}>Total page fans</div>
          </div>
          
          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Followers</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(page_info.followers_count)}</div>
            <div className={styles.cardSubtitle}>Page followers</div>
          </div>
        </div>

        {/* Page Insights Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Page Insights</h2>
        </div>
        <div className={styles.summaryCards}>
          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Page Views</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(insights.page_views)}</div>
            <div className={styles.cardSubtitle}>Total page views</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Unique Impressions</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(insights.page_impressions_unique)}</div>
            <div className={styles.cardSubtitle}>Unique page impressions</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Page Reach</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(insights.page_reach)}</div>
            <div className={styles.cardSubtitle}>Total reach</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Engaged Users</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(insights.page_engaged_users)}</div>
            <div className={styles.cardSubtitle}>Users who engaged</div>
          </div>
        </div>

        {/* Content Performance Section */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Content Performance</h2>
        </div>
        <div className={styles.summaryCards}>
          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Posts</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(content_metrics.total_posts)}</div>
            <div className={styles.cardSubtitle}>Published posts</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Likes</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(content_metrics.total_likes)}</div>
            <div className={styles.cardSubtitle}>Post likes</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Comments</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(content_metrics.total_comments)}</div>
            <div className={styles.cardSubtitle}>Post comments</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Shares</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(content_metrics.total_shares)}</div>
            <div className={styles.cardSubtitle}>Post shares</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Engagement</h3>
            </div>
            <div className={styles.cardValue}>{formatNumber(content_metrics.total_engagement)}</div>
            <div className={styles.cardSubtitle}>All interactions</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Avg Engagement</h3>
            </div>
            <div className={styles.cardValue}>{content_metrics.average_engagement_per_post.toFixed(1)}</div>
            <div className={styles.cardSubtitle}>Per post</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Engagement Rate</h3>
            </div>
            <div className={styles.cardValue}>{content_metrics.engagement_rate.toFixed(2)}%</div>
            <div className={styles.cardSubtitle}>Overall rate</div>
          </div>
        </div>

        {/* Performance Trends Section */}
        <div className={styles.performanceSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Facebook Performance Trends</h2>
            <div className={styles.trendButtons}>
              {trendTypes.map((trend) => (
                <button
                  key={trend}
                  onClick={() => setActiveTrend(trend)}
                  className={`${styles.trendButton} ${
                    activeTrend === trend ? styles.trendButtonActive : ""
                  }`}
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chartPlaceholder}>
              <div className={styles.chartArea}>
                <div className={styles.chartTitle}>
                  Facebook {activeTrend} Over Time ({selectedDateRange})
                </div>
                <div className={styles.chartContent}>
                  <div className={styles.chartLines}>
                    {chartData.map((value, index) => (
                      <div
                        key={index}
                        className={styles.chartLine}
                        style={{ height: `${value}%` }}
                        title={`Day ${index + 1}: ${value}%`}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.chartAxis}>
                  <span>1</span>
                  <span>6</span>
                  <span>11</span>
                  <span>16</span>
                  <span>21</span>
                  <span>26</span>
                  <span>30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Info */}
        <div className={styles.dataSourceSection}>
          <div className={styles.dataSourceInfo}>
            <p><strong>Data Source:</strong> {facebookData.data_source}</p>
            <p><strong>Report Generated:</strong> {new Date(facebookData.report_generated_at).toLocaleString()}</p>
          </div>
        </div>
      </>
    )
  }

  const renderLinkedInTab = () => (
    <>
      <div className={styles.summaryCards}>
        {metricCards.map((card) => (
          <div key={card.id} className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
            </div>
            <div className={styles.cardValue}>{card.value}</div>
            <div className={styles.cardChange}>
              <span className={`${styles.changeText} ${styles[card.changeType]}`}>
                {formatChange(card.change, card.changeType)}
              </span>
            </div>
            <div className={styles.cardSubtitle}>{card.subtitle}</div>
          </div>
        ))}
      </div>

      <div className={styles.performanceSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>LinkedIn Performance Trends</h2>
          <div className={styles.trendButtons}>
            {trendTypes.map((trend) => (
              <button
                key={trend}
                onClick={() => setActiveTrend(trend)}
                className={`${styles.trendButton} ${
                  activeTrend === trend ? styles.trendButtonActive : ""
                }`}
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartContainer}>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartArea}>
              <div className={styles.chartTitle}>
                LinkedIn {activeTrend} Over Time ({selectedDateRange})
              </div>
              <div className={styles.chartContent}>
                <div className={styles.chartLines}>
                  {chartData.map((value, index) => (
                    <div
                      key={index}
                      className={styles.chartLine}
                      style={{ height: `${value}%` }}
                      title={`Day ${index + 1}: ${value}%`}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.chartAxis}>
                <span>1</span>
                <span>6</span>
                <span>11</span>
                <span>16</span>
                <span>21</span>
                <span>26</span>
                <span>30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const renderInstagramTab = () => (
    <>
      <div className={styles.summaryCards}>
        {metricCards.map((card) => (
          <div key={card.id} className={styles.metricCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
            </div>
            <div className={styles.cardValue}>{card.value}</div>
            <div className={styles.cardChange}>
              <span className={`${styles.changeText} ${styles[card.changeType]}`}>
                {formatChange(card.change, card.changeType)}
              </span>
            </div>
            <div className={styles.cardSubtitle}>{card.subtitle}</div>
          </div>
        ))}
      </div>

      <div className={styles.performanceSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Instagram Performance Trends</h2>
          <div className={styles.trendButtons}>
            {trendTypes.map((trend) => (
              <button
                key={trend}
                onClick={() => setActiveTrend(trend)}
                className={`${styles.trendButton} ${
                  activeTrend === trend ? styles.trendButtonActive : ""
                }`}
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.chartContainer}>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartArea}>
              <div className={styles.chartTitle}>
                Instagram {activeTrend} Over Time ({selectedDateRange})
              </div>
              <div className={styles.chartContent}>
                <div className={styles.chartLines}>
                  {chartData.map((value, index) => (
                    <div
                      key={index}
                      className={styles.chartLine}
                      style={{ height: `${value}%` }}
                      title={`Day ${index + 1}: ${value}%`}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.chartAxis}>
                <span>1</span>
                <span>6</span>
                <span>11</span>
                <span>16</span>
                <span>21</span>
                <span>26</span>
                <span>30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "LinkedIn":
        return renderLinkedInTab()
      case "Facebook":
        return renderFacebookTab()
      case "Instagram":
        return renderInstagramTab()
      default:
        return renderFacebookTab()
    }
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Social Media Analytics</h1>
          
          {/* Moved Date Controls and Actions to be above tabs */}
          <div className={styles.headerBottom}>
            <div className={styles.dateControls}>
              <div className={styles.dateControlGroup}>
                <span className={styles.dateLabel}>Period:</span>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value as DateRange)}
                  className={styles.dateDropdown}
                >
                  {dateRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.dateControlGroup}>
                <button className={styles.datePickerButton} onClick={handleChooseDates}>
                  <span className={styles.calendarIcon}></span>
                  Custom Range
                </button>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.actionButton} onClick={handleExport}>
                <span className={styles.actionIcon}>📤</span>
                Export
              </button>
              <button className={styles.actionButton} onClick={handleShare}>
                <span className={styles.actionIcon}>🔗</span>
                Share
              </button>
            </div>
          </div>

          {/* Tabs moved below the controls */}
          <div className={styles.tabs}>
            {reportTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>

        {/* Custom Date Range Modal remains the same */}
        {showDatePicker && (
          <div className={styles.datePickerOverlay} onClick={() => setShowDatePicker(false)}>
            <div className={styles.datePickerModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.datePickerHeader}>
                <h3 className={styles.datePickerTitle}>Select Custom Date Range</h3>
                <button
                  className={styles.datePickerClose}
                  onClick={() => setShowDatePicker(false)}
                >
                  ×
                </button>
              </div>
              <div className={styles.datePickerContent}>
                <div className={styles.dateInputGroup}>
                  <label className={styles.dateInputLabel}>Start Date</label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className={styles.dateInput}
                  />
                </div>
                <div className={styles.dateInputGroup}>
                  <label className={styles.dateInputLabel}>End Date</label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) =>
                      setCustomDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className={styles.dateInput}
                  />
                </div>
              </div>
              <div className={styles.datePickerActions}>
                <button
                  className={styles.datePickerCancel}
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.datePickerApply}
                  onClick={() => {
                    console.log("Applied custom date range:", customDateRange)
                    setShowDatePicker(false)
                  }}
                >
                  Apply Range
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
