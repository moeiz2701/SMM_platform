"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import styles from "@/styling/calendar.module.css"
import SearchBar from "../../../components/searchbar"

interface CalendarContentItem {
  id: string
  title: string
  client: string
  time: string
  status: "Scheduled" | "Pending"
  type: string
  date: string
}

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  content: CalendarContentItem[]
}

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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 15)) // July 15, 2025
  const [selectedDate, setSelectedDate] = useState(15)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    contentType: "All Types",
    status: "All Statuses",
    client: "All Clients",
  })

  const filterRef = useRef<HTMLDivElement>(null)

  // Filter content based on search and filters
  const filteredContent = useMemo(() => {
    let filtered = [...sampleContent]

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(searchTermLower) ||
          item.client.toLowerCase().includes(searchTermLower)
      )
    }

    // Apply other filters
    if (filters.contentType !== "All Types") {
      filtered = filtered.filter(item => item.type === filters.contentType)
    }
    if (filters.status !== "All Statuses") {
      filtered = filtered.filter(item => item.status === filters.status)
    }
    if (filters.client !== "All Clients") {
      filtered = filtered.filter(item => item.client === filters.client)
    }

    return filtered
  }, [searchTerm, filters])

  // Generate calendar days with filtered content
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: CalendarDay[] = []

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dayContent = filteredContent.filter((item) => {
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
  }, [currentDate, filteredContent])

  // Click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter handlers
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      contentType: "All Types",
      status: "All Statuses",
      client: "All Clients",
    })
  }

  const applyFilters = () => {
    setShowFilters(false)
  }

  // Helper functions
  const getContentIcon = (type: string) => {
    switch (type) {
      case "Instagram": return "📷"
      case "Newsletter": return "📧"
      case "Blog": return "📝"
      case "Email": return "✉️"
      default: return "📄"
    }
  }

  const formatSelectedDate = () => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setMonth(direction === "prev" ? newDate.getMonth() - 1 : newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Content Calendar</h1>
          <div className={styles.actionsRow}>
            <div className={styles.leftActions}>
              <button className={styles.createButton}>
                <span className={styles.plusIcon}>+</span>
                Add Content
              </button>
              <div className={styles.filterWrapper} ref={filterRef}>
                <button 
                  className={styles.actionButton} 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span className={styles.actionIcon}>⚙</span>
                  Filter
                  <span className={`${styles.chevron} ${showFilters ? styles.chevronUp : ''}`}>▼</span>
                </button>
                {showFilters && (
                  <div className={styles.filterDropdown}>
                    <div className={styles.filterGroup}>
                      <label>Content Type</label>
                      <select
                        name="contentType"
                        value={filters.contentType}
                        onChange={handleFilterChange}
                        className={styles.filterSelect}
                      >
                        <option>All Types</option>
                        <option>Instagram</option>
                        <option>Newsletter</option>
                        <option>Blog</option>
                        <option>Email</option>
                      </select>
                    </div>

                    <div className={styles.filterGroup}>
                      <label>Status</label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className={styles.filterSelect}
                      >
                        <option>All Statuses</option>
                        <option>Scheduled</option>
                        <option>Pending</option>
                      </select>
                    </div>

                    <div className={styles.filterGroup}>
                      <label>Client</label>
                      <select
                        name="client"
                        value={filters.client}
                        onChange={handleFilterChange}
                        className={styles.filterSelect}
                      >
                        <option>All Clients</option>
                        <option>XYZ Fashion</option>
                        <option>ABC Corp</option>
                        <option>123 Industries</option>
                      </select>
                    </div>

                    <div className={styles.filterActions}>
                      <button className={styles.resetButton} onClick={resetFilters}>
                        Reset
                      </button>
                      <button className={styles.applyButton} onClick={applyFilters}>
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <SearchBar 
              placeholder="Search content..." 
              onSearch={setSearchTerm}
              className={styles.searchContainer}
            />
          </div>
          <div className={styles.headerDivider} />
          {/* Month Navigation */}
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
        </div>

        {/* Calendar Grid */}
        <div className={styles.contentArea}>
          <div className={styles.calendarSection}>
            <div className={styles.calendarGrid}>
              <div className={styles.dayHeaders}>
                {dayNames.map((day) => (
                  <div key={day} className={styles.dayHeader}>{day}</div>
                ))}
              </div>
              <div className={styles.daysGrid}>
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`${styles.dayCell} ${
                      !day.isCurrentMonth ? styles.otherMonth : ""
                    } ${
                      day.isToday ? styles.today : ""
                    } ${
                      selectedDate === day.date && day.isCurrentMonth ? styles.selected : ""
                    }`}
                    onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
                  >
                    <div className={styles.dayNumber}>
                      {day.date}
                      <button className={styles.addDayContent}>+</button>
                    </div>
                    <div className={styles.dayContent}>
                      {day.content.slice(0, 2).map((item) => (
                        <div key={item.id} className={`${styles.contentItem} ${styles[`status${item.status}`]}`}>
                          <span className={styles.contentIcon}>{getContentIcon(item.type)}</span>
                          <span className={styles.contentTitle}>
                            {item.title.length > 12 ? `${item.title.substring(0, 12)}...` : item.title}
                          </span>
                        </div>
                      ))}
                      {day.content.length > 2 && (
                        <div className={styles.moreItems}>+{day.content.length - 2} more</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Day Detail Section */}
          <div className={styles.dailyDetailSection}>
            <div className={styles.dailyDetailContainer}>
              <h3 className={styles.selectedDate}>{formatSelectedDate()}</h3>
              <div className={styles.dailyContent}>
                {filteredContent.filter(item => {
                  const itemDate = new Date(item.date)
                  return (
                    itemDate.getDate() === selectedDate &&
                    itemDate.getMonth() === currentDate.getMonth() &&
                    itemDate.getFullYear() === currentDate.getFullYear()
                  )
                }).length === 0 ? (
                  <div className={styles.noContent}>
                    <div className={styles.noContentIcon}>📅</div>
                    <h4 className={styles.noContentTitle}>No content scheduled</h4>
                    <p className={styles.noContentText}>Add some content to get started with your calendar.</p>
                    <button className={styles.addContentButton}>
                      <span className={styles.plusIcon}>+</span>
                      Add Content
                    </button>
                  </div>
                ) : (
                  filteredContent
                    .filter(item => {
                      const itemDate = new Date(item.date)
                      return (
                        itemDate.getDate() === selectedDate &&
                        itemDate.getMonth() === currentDate.getMonth() &&
                        itemDate.getFullYear() === currentDate.getFullYear()
                      )
                    })
                    .map((item) => (
                      <div key={item.id} className={styles.contentDetail}>
                        <div className={styles.contentHeader}>
                          <div className={styles.contentTitleSection}>
                            <span className={styles.contentTypeIcon}>{getContentIcon(item.type)}</span>
                            <h4 className={styles.contentDetailTitle}>{item.title}</h4>
                          </div>
                          <span className={`${styles.statusBadge} ${styles[`status${item.status}`]}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className={styles.contentMeta}>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Client:</span>
                            <span className={styles.metaValue}>{item.client}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Time:</span>
                            <span className={styles.metaValue}>{item.time}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Type:</span>
                            <span className={styles.metaValue}>{item.type}</span>
                          </div>
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