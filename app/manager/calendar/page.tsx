"use client"

import { useState, useMemo } from "react"
import type { CalendarContentItem, CalendarDay } from "../../../components/calender"
import styles from "@/styling/calendar.module.css"

const sampleContent: CalendarContentItem[] = [
  {
    id: "1",
    title: "Instagram Post - Summer Collection",
    client: "XYZ Fashion",
    time: "10:00 AM",
    status: "Scheduled",
    type: "Instagram",
    date: "2025-07-15",
  },
  {
    id: "2",
    title: "Weekly Newsletter - Tech Updates",
    client: "ABC Corp",
    time: "2:00 PM",
    status: "Pending",
    type: "Newsletter",
    date: "2025-07-15",
  },
  {
    id: "3",
    title: "Blog Post - Marketing Trends",
    client: "123 Industries",
    time: "9:00 AM",
    status: "Scheduled",
    type: "Blog",
    date: "2025-07-18",
  },
  {
    id: "4",
    title: "Instagram Story Series",
    client: "XYZ Fashion",
    time: "11:30 AM",
    status: "Pending",
    type: "Instagram",
    date: "2025-07-22",
  },
  {
    id: "5",
    title: "Email Campaign Launch",
    client: "ABC Corp",
    time: "3:00 PM",
    status: "Scheduled",
    type: "Email",
    date: "2025-07-25",
  },
]

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 15)) // July 15, 2025
  const [selectedDate, setSelectedDate] = useState(15)

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []
    const currentDateObj = new Date()

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dayContent = sampleContent.filter((item) => {
        const itemDate = new Date(item.date)
        return (
          itemDate.getDate() === date.getDate() &&
          itemDate.getMonth() === date.getMonth() &&
          itemDate.getFullYear() === date.getFullYear()
        )
      })

      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getDate() === 15 && date.getMonth() === month && date.getFullYear() === year,
        content: dayContent,
      })
    }

    return days
  }, [currentDate])

  const selectedDayContent = useMemo(() => {
    return sampleContent.filter((item) => {
      const itemDate = new Date(item.date)
      return (
        itemDate.getDate() === selectedDate &&
        itemDate.getMonth() === currentDate.getMonth() &&
        itemDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }, [selectedDate, currentDate])

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getContentIcon = (type: CalendarContentItem["type"]) => {
    switch (type) {
      case "Instagram":
        return "📷"
      case "Newsletter":
        return "📧"
      case "Blog":
        return "📝"
      case "Email":
        return "✉️"
      case "Social Media":
        return "📱"
      default:
        return "📄"
    }
  }

  const getStatusClass = (status: CalendarContentItem["status"]) => {
    return status === "Scheduled" ? styles.statusScheduled : styles.statusPending
  }

  const formatSelectedDate = () => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className={styles.layout}>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Content Calendar</h1>

          <div className={styles.topActions}>
            <div className={styles.monthNavigation}>
              <button className={styles.navButton} onClick={() => navigateMonth("prev")}>
                ←
              </button>
              <span className={styles.monthYear}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button className={styles.navButton} onClick={() => navigateMonth("next")}>
                →
              </button>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.addButton}>
                <span className={styles.plusIcon}>+</span>
                Add Content
              </button>
              <button className={styles.filterButton}>
                <span className={styles.filterIcon}>⚙</span>
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.calendarSection}>
            <div className={styles.calendarGrid}>
              <div className={styles.dayHeaders}>
                {dayNames.map((day) => (
                  <div key={day} className={styles.dayHeader}>
                    {day}
                  </div>
                ))}
              </div>

              <div className={styles.daysGrid}>
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`${styles.dayCell} ${
                      !day.isCurrentMonth ? styles.otherMonth : ""
                    } ${day.isToday ? styles.today : ""}`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className={styles.dayNumber}>
                      {day.date}
                      <button className={styles.addDayContent}>+</button>
                    </div>

                    <div className={styles.dayContent}>
                      {day.content.slice(0, 2).map((item) => (
                        <div key={item.id} className={`${styles.contentItem} ${getStatusClass(item.status)}`}>
                          <span className={styles.contentIcon}>{getContentIcon(item.type)}</span>
                          <span className={styles.contentTitle}>
                            {item.title.length > 12 ? `${item.title.substring(0, 12)}...` : item.title}
                          </span>
                        </div>
                      ))}
                      {day.content.length > 2 && <div className={styles.moreItems}>+{day.content.length - 2} more</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.dailyDetailSection}>
            <div className={styles.dailyDetailContainer}>
              <h3 className={styles.selectedDate}>{formatSelectedDate()}</h3>

              <div className={styles.dailyContent}>
                {selectedDayContent.length === 0 ? (
                  <div className={styles.noContent}>
                    <p>No content scheduled for this day</p>
                    <button className={styles.addContentButton}>
                      <span className={styles.plusIcon}>+</span>
                      Add Content
                    </button>
                  </div>
                ) : (
                  selectedDayContent.map((item) => (
                    <div key={item.id} className={styles.contentDetail}>
                      <div className={styles.contentHeader}>
                        <h4 className={styles.contentDetailTitle}>{item.title}</h4>
                        <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>{item.status}</span>
                      </div>

                      <div className={styles.contentMeta}>
                        <p className={styles.clientInfo}>
                          <strong>Client:</strong> {item.client}
                        </p>
                        <p className={styles.timeInfo}>
                          <strong>Time:</strong> {item.time}
                        </p>
                      </div>

                      <div className={styles.contentActions}>
                        <button className={styles.editButton}>Edit</button>
                        <button className={styles.previewButton}>Preview</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
