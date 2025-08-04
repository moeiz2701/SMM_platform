export interface Invoice {
  _id: string
  manager: string
  client: string
  campaign: string
  budget: string
  amount: number
  status: "pending" | "paid"
  dueDate: string
  generatedAt: string
  issuedDate: string
  paymentDate?: string
}