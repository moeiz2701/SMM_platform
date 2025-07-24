export interface Client {
  _id: string
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: "Active" | "Inactive" | "Pending"
  lastActivity: string
  projects: number
  revenueYTD: number
  avatar?: string
}

export type ClientFilterTab = "All Clients" | "Active" | "Inactive" | "Pending"
