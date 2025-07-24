"use client"

import { useState } from "react"
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

const reportTabs: ReportTab[] = ["Performance", "Content Performance", "Audience", "Financial"]
const trendTypes: TrendType[] = ["Reach", "Engagement", "Clicks", "Conversions"]
const dateRanges: DateRange[] = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Last Year"]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("Performance")
  const [activeTrend, setActiveTrend] = useState<TrendType>("Engagement")
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("Last 30 Days")
  const [showFilters, setShowFilters] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  })

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

  const renderPerformanceTab = () => (
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
          <h2 className={styles.sectionTitle}>Performance Trends</h2>
          <div className={styles.trendButtons}>
            {trendTypes.map((trend) => (
              <button
                key={trend}
                onClick={() => setActiveTrend(trend)}
                className={`${styles.trendButton} ${activeTrend === trend ? styles.trendButtonActive : ""}`}
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
                {activeTrend} Over Time ({selectedDateRange})
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

      <div className={styles.platformSection}>
        <h2 className={styles.sectionTitle}>Platform Breakdown</h2>
        <div className={styles.platformContent}>
          <div className={styles.donutChartContainer}>
            <div className={styles.donutChart}>
              <svg viewBox="0 0 200 200" className={styles.donutSvg}>
                {platformData.map((platform, index) => {
                  const previousPercentages = platformData.slice(0, index).reduce((sum, p) => sum + p.percentage, 0)
                  const strokeDasharray = `${platform.percentage * 5.03} 502.4`
                  const strokeDashoffset = `-${previousPercentages * 5.03}`

                  return (
                    <circle
                      key={platform.name}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={platform.color}
                      strokeWidth="30"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      transform="rotate(-90 100 100)"
                      style={{ transition: "all 0.3s ease" }}
                    />
                  )
                })}
              </svg>
              <div className={styles.donutCenter}>
                <div className={styles.donutTitle}>Platform</div>
                <div className={styles.donutSubtitle}>Distribution</div>
              </div>
            </div>
          </div>
          <div className={styles.platformLegend}>
            {platformData.map((platform) => (
              <div key={platform.name} className={styles.platformItem}>
                <div className={styles.platformInfo}>
                  <div className={styles.platformIndicator} style={{ backgroundColor: platform.color }}></div>
                  <span className={styles.platformName}>{platform.name}</span>
                </div>
                <div className={styles.platformStats}>
                  <div className={styles.progressBarContainer}>
                    <div
                      className={styles.progressBar}
                      style={{
                        width: `${platform.percentage}%`,
                        backgroundColor: platform.color,
                      }}
                    />
                  </div>
                  <div className={styles.platformPercentage}>{platform.percentage}%</div>
                  <div className={`${styles.platformChange} ${styles[platform.changeType]}`}>
                    {formatChange(platform.change, platform.changeType)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )

  const renderContentPerformanceTab = () => {
  // Define columns for content performance table
  const contentPerformanceColumns: TableColumn[] = [
  {
    key: "content",
    label: "CONTENT",
    type: "string",
    sortable: true,
    render: (value) => <span className={styles.contentTitle} style={{ color: 'white' }}>{value}</span>,
  },
  {
    key: "type",
    label: "TYPE",
    type: "string",
    sortable: true,
    render: (value) => <span className={styles.contentType} style={{ color: 'white' }}>{value}</span>,
  },
  { 
    key: "date", 
    label: "DATE", 
    type: "date", 
    sortable: true,
    render: (value) => <span style={{ color: 'white' }}>{value}</span>
  },
  {
    key: "reach",
    label: "REACH",
    type: "number",
    sortable: true,
    render: (value) => <span className={styles.metricValue} style={{ color: 'white' }}>{formatNumber(value)}</span>,
  },
  {
    key: "engagement",
    label: "ENGAGEMENT",
    type: "number",
    sortable: true,
    render: (value) => <span className={styles.metricValue} style={{ color: 'white' }}>{formatNumber(value)}</span>,
  },
  {
    key: "clicks",
    label: "CLICKS",
    type: "number",
    sortable: true,
    render: (value) => <span className={styles.metricValue} style={{ color: 'white' }}>{formatNumber(value)}</span>,
  },
  {
    key: "conversions",
    label: "CONVERSIONS",
    type: "number",
    sortable: true,
    render: (value) => <span className={styles.metricValue} style={{ color: 'white' }}>{formatNumber(value)}</span>,
  },
]

  // Define actions for content performance
  const contentPerformanceActions: TableAction[] = [
    { 
      label: "View Details", 
      onClick: (row) => console.log("View Details", row),
      className: styles.actionLink
    },
  ]

  const handleEditContent = (row: ContentPerformanceItem) => {
    console.log("Editing content:", row)
    // Here you would typically open a modal or navigate to an edit page
  }

  const handleDeleteContent = (row: ContentPerformanceItem) => {
    console.log("Deleting content:", row)
    // Here you would typically show a confirmation dialog before deletion
  }

  return (
    <>
      <ReusableTable
        data={contentPerformanceData}
        columns={[
          ...contentPerformanceColumns,
          { key: "actions", label: "ACTIONS", type: "actions", sortable: false },
        ]}
        actions={contentPerformanceActions}
        pageSize={10}
        searchable={true}
        searchPlaceholder="Search content..."
        onRowClick={(row) => console.log("Content clicked:", row)}
        onEdit={handleEditContent}
        onDelete={handleDeleteContent}
        className={styles.reportsTable}
      />
    </>
  )
}
  const renderAudienceTab = () => (
    <div className={styles.audienceContent}>
      <div className={styles.demographicsSection}>
        <h2 className={styles.sectionTitle}>Demographics</h2>

        <div className={styles.ageDistribution}>
          <h3 className={styles.ageDistributionTitle}>Age Distribution</h3>
          {audienceData.ageDistribution.map((age) => (
            <div key={age.range} className={styles.ageItem}>
              <span className={styles.ageLabel}>{age.range}</span>
              <div className={styles.ageBarContainer}>
                <div className={styles.ageBar} style={{ width: `${age.percentage}%` }} />
              </div>
              <span className={styles.agePercentage}>{age.percentage}%</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className={styles.ageDistributionTitle}>Gender</h3>
          <div className={styles.genderChart}>
            <svg viewBox="0 0 200 200" className={styles.genderSvg}>
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="30"
                strokeDasharray={`${audienceData.gender.female * 5.03} 502.4`}
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="30"
                strokeDasharray={`${audienceData.gender.male * 5.03} 502.4`}
                strokeDashoffset={`-${audienceData.gender.female * 5.03}`}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className={styles.genderCenter}>
              <div className={styles.genderPercentage}>{audienceData.gender.female}%</div>
              <div className={styles.genderLabel}>Female</div>
            </div>
          </div>
          <div className={styles.genderLegend}>
            <div className={styles.genderLegendItem}>
              <div className={styles.genderIndicator} style={{ backgroundColor: "#4f46e5" }}></div>
              <span>Female: {audienceData.gender.female}%</span>
            </div>
            <div className={styles.genderLegendItem}>
              <div className={styles.genderIndicator} style={{ backgroundColor: "#e5e7eb" }}></div>
              <span>Male: {audienceData.gender.male}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.geographicSection}>
        <h2 className={styles.sectionTitle}>Geographic Distribution</h2>
        <div className={styles.mapPlaceholder}>Map visualization would go here</div>
        <div className={styles.countryList}>
          {audienceData.geographic.map((country) => (
            <div key={country.country} className={styles.countryItem}>
              <span className={styles.countryName}>{country.country}</span>
              <span className={styles.countryPercentage}>{country.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFinancialTab = () => {
    // Define columns for financial table
   const financialColumns: TableColumn[] = [
  {
    key: "client",
    label: "CLIENT",
    type: "string",
    sortable: true,
    render: (value) => <span className={styles.contentTitle} style={{ color: 'white' }}>{value}</span>,
  },
  {
    key: "revenue",
    label: "REVENUE",
    type: "currency",
    sortable: true,
    render: (value) => <span className={styles.metricValue} style={{ color: 'white' }}>{formatCurrency(value)}</span>,
  },
  {
    key: "expenses",
    label: "EXPENSES",
    type: "currency",
    sortable: true,
    render: (value) => <span className={styles.metricValue} style={{ color: 'white' }}>{formatCurrency(value)}</span>,
  },
  {
    key: "profit",
    label: "PROFIT",
    type: "currency",
    sortable: true,
    render: (value) => <span className={styles.metricValue} style={{ color: 'white' }}>{formatCurrency(value)}</span>,
  },
  {
    key: "profitMargin",
    label: "PROFIT MARGIN",
    type: "number",
    sortable: true,
    render: (value) => <span className={`${styles.metricValue} ${styles.increase}`} style={{ color: 'white' }}>{value}%</span>,
  },
]

    // Define actions for financial table
    const financialActions: TableAction[] = [
      { label: "View Report", onClick: (row) => console.log("View Report", row) },
      { label: "Download Invoice", onClick: (row) => console.log("Download Invoice", row) },
      { label: "Send Statement", onClick: (row) => console.log("Send Statement", row) },
    ]

    return (
      <>
        <div className={styles.financialCards}>
          <div className={styles.financialCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Total Revenue</h3>
            </div>
            <div className={styles.financialValue}>{formatCurrency(financialData.totalRevenue.value)}</div>
            <div className={styles.cardChange}>
              <span className={`${styles.changeText} ${styles[financialData.totalRevenue.changeType]}`}>
                {formatChange(financialData.totalRevenue.change, financialData.totalRevenue.changeType)} from last
                period
              </span>
            </div>
          </div>
  
          <div className={styles.financialCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Expenses</h3>
            </div>
            <div className={styles.financialValue}>{formatCurrency(financialData.expenses.value)}</div>
            <div className={styles.cardChange}>
              <span className={`${styles.changeText} ${styles[financialData.expenses.changeType]}`}>
                {formatChange(financialData.expenses.change, financialData.expenses.changeType)} from last period
              </span>
            </div>
          </div>

          <div className={styles.financialCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Profit</h3>
            </div>
            <div className={styles.financialValue}>{formatCurrency(financialData.profit.value)}</div>
            <div className={styles.cardChange}>
              <span className={`${styles.changeText} ${styles[financialData.profit.changeType]}`}>
                {formatChange(financialData.profit.change, financialData.profit.changeType)} from last period
              </span>
            </div>
          </div>
        </div>
    <div className={styles.financialSection}>
        <h2 className={styles.floatingTitle}>Revenue by Client</h2>
        <ReusableTable
          data={financialData.revenueByClient}
          columns={[...financialColumns, { key: "actions", label: "ACTIONS", type: "actions", sortable: false }]}
          actions={financialActions}
          pageSize={10}
          searchable={true}
          searchPlaceholder="Search clients..."
          onRowClick={(row) => console.log("Client clicked:", row)}
          className={styles.reportsTable}
        />
        </div>
      </>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Performance":
        return renderPerformanceTab()
      case "Content Performance":
        return renderContentPerformanceTab()
      case "Audience":
        return renderAudienceTab()
      case "Financial":
        return renderFinancialTab()
      default:
        return renderPerformanceTab()
    }
  }

  return (
  <div className={styles.layout}>
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports & Analytics</h1>
        
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

      <div className={styles.tabContent}>{renderTabContent()}</div>
      
      {/* Custom Date Range Modal remains the same */}
      {showDatePicker && (
        <div className={styles.datePickerOverlay} onClick={() => setShowDatePicker(false)}>
          <div className={styles.datePickerModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.datePickerHeader}>
              <h3 className={styles.datePickerTitle}>Select Custom Date Range</h3>
              <button className={styles.datePickerClose} onClick={() => setShowDatePicker(false)}>
                ×
              </button>
            </div>
            <div className={styles.datePickerContent}>
              <div className={styles.dateInputGroup}>
                <label className={styles.dateInputLabel}>Start Date</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.dateInputGroup}>
                <label className={styles.dateInputLabel}>End Date</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  className={styles.dateInput}
                />
              </div>
            </div>
            <div className={styles.datePickerActions}>
              <button className={styles.datePickerCancel} onClick={() => setShowDatePicker(false)}>
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