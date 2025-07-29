export interface ContentItem {
  id: string
  title: string
  type: string
  client: string
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected"
  dueDate: string
  assignedTo: string
}

export type FilterTab = "all" | "draft" | "scheduled" | "published" | "failed"
