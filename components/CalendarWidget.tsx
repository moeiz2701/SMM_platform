"use client"

import { useState } from "react"
import "@/styling/ClientDashboard.css"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface Task {
  id: number
  title: string
  time: string
  type: "post" | "meeting" | "deadline"
}

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Sample tasks data
  const sampleTasks: Record<string, Task[]> = {
    "15": [
      { id: 1, title: 'Product Launch Post', time: '10:00 AM', type: 'post' },
      { id: 2, title: 'Marketing Review Meeting', time: '2:00 PM', type: 'meeting' },
    ],
    "18": [{ id: 3, title: 'Campaign Report Deadline', time: '5:00 PM', type: 'deadline' }],
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const today = new Date()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []
    const currentDateIter = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dateNum = currentDateIter.getDate()
      const isCurrentMonth = currentDateIter.getMonth() === month
      const isToday = currentDateIter.toDateString() === today.toDateString()

      days.push({
        date: dateNum,
        isCurrentMonth,
        isToday,
        tasks: sampleTasks[dateNum.toString()] || [],
      })

      currentDateIter.setDate(currentDateIter.getDate() + 1)
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const calendarDays = generateCalendarDays()
const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "post":
        return "#10b981"
      case "meeting":
        return "#3b82f6"
      case "deadline":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }
  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <div className="calendar-title">
          <Calendar size={20} />
          <h3>Calendar</h3>
        </div>
        <div className="calendar-nav">
          <button onClick={() => navigateMonth("prev")} className="nav-btn">
            <ChevronLeft size={16} />
          </button>
          <span className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={() => navigateMonth("next")} className="nav-btn">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {daysOfWeek.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="days-grid">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? "other-month" : ""} ${day.isToday ? "today" : ""}`}
            >
              <span className="day-number">{day.date}</span>
              {day.tasks.length > 0 && (
                <div className="task-indicators">
                  {day.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="task-dot"
                      style={{ backgroundColor: getTaskTypeColor(task.type) }}
                      title={`${task.title} - ${task.time}`}
                    />
                  ))}
                  {day.tasks.length > 3 && <span className="more-tasks">+{day.tasks.length - 3}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}





