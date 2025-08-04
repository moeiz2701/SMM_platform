import { Types } from 'mongoose';
export interface AdCampaign {
  _id: string
  name: string
  objective: "awareness" | "traffic" | "engagement" | "leads" | "sales" | "conversions"
  startDate: string
  endDate: string
  status: "draft" | "active" | "paused" | "completed" | "archived"
  targetAudience: {
    ageRange: {
      min: number
      max: number
    }
    genders: string[]
    locations: string[]
    interests: string[]
    languages: string[]
  }
  platforms: {
    platform: "instagram" | "linkedin" | "facebook" | "twitter"
    account: string
    campaignId?: string
    status?: string
    dailyBudget?: number
  }[]
  client: string
  manager: string
  createdAt: string
  updatedAt: string
}
