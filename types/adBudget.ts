export interface AdBudget {
  _id: string
  campaign: string
  totalBudget: number
  currency: string
  budgetAllocation: {
    platform: string
    allocatedAmount: number
    spentAmount: number
    dailyLimit: number
    _id: string
  }[]
  client: string
  manager: string
  monthlyBreakdown: {
    month: number
    year: number
    allocatedAmount: number
    spentAmount: number
    _id: string
  }[]
  weeklyBreakdown: {
    week: number
    year: number
    allocatedAmount: number
    spentAmount: number
    _id: string
  }[]
  thresholds: any[]
  createdAt: string
  updatedAt: string
  __v: number
}
