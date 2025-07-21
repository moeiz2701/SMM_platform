export interface CalendarContentItem {
  id: string
  title: string
  client: string
  time: string
  status: "Scheduled" | "Pending"
  type: "Instagram" | "Newsletter" | "Blog" | "Email" | "Social Media"
  date: string
}

export interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  content: CalendarContentItem[]
}
