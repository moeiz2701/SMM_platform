export interface Invoice {
  id: string
  invoiceNumber: string
  client: string
  amount: number
  date: string
  dueDate: string
  status: "Paid" | "Pending" | "Overdue" | "Draft" | "Cancelled"
}

export interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  client: string
}

export interface ExpenseCategory {
  name: string
  amount: number
  color: string
  percentage: number
}

export interface PaymentStatus {
  client: string
  total: number
  paid: number
  pending: number
  overdue: number
}

export interface SummaryCard {
  id: string
  title: string
  amount: number
  icon: string
  color: string
}

export type BillingTab = "Invoices" | "Expenses" | "Reports"

export interface FilterState {
  status: string
  client: string
  fromDate: string
  toDate: string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}
