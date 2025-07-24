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

export interface ContentPerformanceItem {
  id: string
  content: string
  type: string
  date: string
  reach: number
  engagement: number
  clicks: number
  conversions: number
}

export interface FinancialData {
  totalRevenue: {
    value: number
    change: number
    changeType: "increase" | "decrease"
  }
  expenses: {
    value: number
    change: number
    changeType: "increase" | "decrease"
  }
  profit: {
    value: number
    change: number
    changeType: "increase" | "decrease"
  }
  revenueByClient: {
    client: string
    revenue: number
    expenses: number
    profit: number
    profitMargin: number
  }[]
}

export interface AudienceData {
  ageDistribution: {
    range: string
    percentage: number
  }[]
  gender: {
    female: number
    male: number
  }
  geographic: {
    country: string
    percentage: number
  }[]
}

export type ReportTab = "Performance" | "Content Performance" | "Audience" | "Financial"
export type TrendType = "Reach" | "Engagement" | "Clicks" | "Conversions"
export type DateRange = "Last 7 Days" | "Last 30 Days" | "Last 90 Days" | "Last Year"
