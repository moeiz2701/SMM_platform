export interface MetricCard {
  id: string
  title: string
  value: string
  change: number
  changeType: "increase" | "decrease"
  subtitle: string
}

export interface PlatformData {
  name: string
  percentage: number
  change: number
  changeType: "increase" | "decrease"
  color: string
}

export type ReportTab = "Performance" | "Content Performance" | "Audience" | "Financial"
export type TrendType = "Reach" | "Engagement" | "Clicks" | "Conversions"
export type DateRange = "Last 7 Days" | "Last 30 Days" | "Last 90 Days" | "Last Year"
