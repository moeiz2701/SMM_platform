"use client"

import { useState } from "react"
import type { MetricCard, PlatformData, ReportTab, TrendType, DateRange } from "../../../components/analytics"
import styles from "@/styling/reports.module.css"

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

const reportTabs: ReportTab[] = ["Performance", "Content Performance", "Audience", "Financial"]
const trendTypes: TrendType[] = ["Reach", "Engagement", "Clicks", "Conversions"]
const dateRanges: DateRange[] = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Last Year"]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("Performance")
  const [activeTrend, setActiveTrend] = useState<TrendType>("Engagement")
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("Last 30 Days")

  const formatChange = (change: number, changeType: "increase" | "decrease") => {
    const sign = changeType === "increase" ? "+" : "-"
    const arrow = changeType === "increase" ? "↗" : "↘"
    return `${sign}${Math.abs(change)}% ${arrow}`
  }

  return (
    <div className={styles.layout}>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reports & Analytics</h1>

          <div className={styles.topActions}>
            <div className={styles.dateSelector}>
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
              <button className={styles.chooseDatesButton}>Choose Dates</button>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <span className={styles.actionIcon}>⚙</span>
                Filter
              </button>
              <button className={styles.actionButton}>
                <span className={styles.actionIcon}>📤</span>
                Export
              </button>
              <button className={styles.actionButton}>
                <span className={styles.actionIcon}>🔗</span>
                Share
              </button>
            </div>
          </div>
        </div>

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
                <div className={styles.chartTitle}>{activeTrend} Over Time</div>
                <div className={styles.chartContent}>
                  {/* Chart visualization would go here */}
                  <div className={styles.chartLines}>
                    <div className={styles.chartLine} style={{ height: "60%" }}></div>
                    <div className={styles.chartLine} style={{ height: "80%" }}></div>
                    <div className={styles.chartLine} style={{ height: "45%" }}></div>
                    <div className={styles.chartLine} style={{ height: "90%" }}></div>
                    <div className={styles.chartLine} style={{ height: "70%" }}></div>
                    <div className={styles.chartLine} style={{ height: "85%" }}></div>
                    <div className={styles.chartLine} style={{ height: "65%" }}></div>
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
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={platformData[0].color}
                    strokeWidth="30"
                    strokeDasharray={`${platformData[0].percentage * 5.03} 502.4`}
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={platformData[1].color}
                    strokeWidth="30"
                    strokeDasharray={`${platformData[1].percentage * 5.03} 502.4`}
                    strokeDashoffset={`-${platformData[0].percentage * 5.03}`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={platformData[2].color}
                    strokeWidth="30"
                    strokeDasharray={`${platformData[2].percentage * 5.03} 502.4`}
                    strokeDashoffset={`-${(platformData[0].percentage + platformData[1].percentage) * 5.03}`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={platformData[3].color}
                    strokeWidth="30"
                    strokeDasharray={`${platformData[3].percentage * 5.03} 502.4`}
                    strokeDashoffset={`-${(platformData[0].percentage + platformData[1].percentage + platformData[2].percentage) * 5.03}`}
                    transform="rotate(-90 100 100)"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={platformData[4].color}
                    strokeWidth="30"
                    strokeDasharray={`${platformData[4].percentage * 5.03} 502.4`}
                    strokeDashoffset={`-${(platformData[0].percentage + platformData[1].percentage + platformData[2].percentage + platformData[3].percentage) * 5.03}`}
                    transform="rotate(-90 100 100)"
                  />
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
                      ></div>
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
      </main>
    </div>
  )
}
