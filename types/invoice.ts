export interface Invoice {
  _id: string
  manager: {
    _id: string
    user?: {
      name: string
      email: string
    }
  } | string
  client: {
    _id: string
    user?: {
      name: string
      email: string
    }
  } | string
  campaign: {
    _id: string
    name: string
  } | string
  budget: {
    _id: string
    totalBudget: number
  } | string
  amount: number
  status: "pending" | "paid"
  dueDate: string
  generatedAt: string
  issuedDate: string
  paymentDate?: string
}