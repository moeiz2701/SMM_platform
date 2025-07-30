"use client"

import { useState, useMemo, useRef, useEffect, useContext } from "react"
import styles from "@/styling/calendar.module.css"
import SearchBar from "@/components/searchbar"
import { useClient } from "@/contexts/clientContext"
import API_ROUTES from "@/app/apiRoutes"

// Interfaces
interface CalendarContentItem {
  id: string
  title: string
  time: string
  status: "Scheduled" | "Pending" | "Published" | "Draft"
  type: string
  date: string
}

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  content: CalendarContentItem[]
}

interface Post {
  _id: string
  title: string
  scheduledTime: string
  status: "draft" | "scheduled" | "published" | "failed"
  platforms: {
    platform: string
    status: string
  }[]
  media?: {
    mediaType: string
    url: string
  }[]
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const { client, loading: clientLoading } = useClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    contentType: "All Types",
    status: "All Statuses",
  })
  const [posts, setPosts] = useState<CalendarContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filterRef = useRef<HTMLDivElement>(null)

  // Fetch posts for the current client
  useEffect(() => {
    const fetchPosts = async () => {
      console.log('Fetching posts...')
      if (!client?._id) {
        console.log('No client ID available yet')
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        const queryParams = new URLSearchParams({
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
          status: 'scheduled,published',
          sort: 'scheduledTime'
        })

        const url = `${API_ROUTES.POSTS.BY_CLIENT(client._id)}?${queryParams}`
        console.log('Request URL:', url)

        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        const transformedPosts = data.data.map((post: Post) => {
          let displayStatus: "Scheduled" | "Pending" | "Published" | "Draft"
          switch (post.status) {
            case 'scheduled':
              displayStatus = "Scheduled"
              break
            case 'published':
              displayStatus = "Published"
              break
            case 'draft':
              displayStatus = "Draft"
              break
            default:
              displayStatus = "Pending"
          }

          const postType = post.platforms[0]?.platform || 'Post'
          const postDate = new Date(post.scheduledTime)
          const formattedTime = postDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })

          return {
            id: post._id,
            title: post.title,
            time: formattedTime,
            status: displayStatus,
            type: postType,
            date: postDate.toISOString().split('T')[0]
          }
        })

        setPosts(transformedPosts)
      } catch (err) {
        console.error("Error fetching posts:", err)
        setError("Failed to load calendar data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [client, currentDate]) 

  // Filter content based on search and filters
  const filteredContent = useMemo(() => {
    let filtered = [...posts]

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        item => item.title.toLowerCase().includes(searchTermLower))
    }

    // Apply content type filter
    if (filters.contentType !== "All Types") {
      filtered = filtered.filter(item => 
        item.type.toLowerCase() === filters.contentType.toLowerCase()
      )
    }

    // Apply status filter
    if (filters.status !== "All Statuses") {
      filtered = filtered.filter(item => 
        filters.status === "Scheduled" ? item.status === "Scheduled" :
        filters.status === "Pending" ? item.status === "Pending" :
        filters.status === "Published" ? item.status === "Published" :
        item.status === "Draft"
      )
    }

    return filtered
  }, [searchTerm, filters, posts])

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
        isToday: date.getDate() === new Date().getDate() && 
                 date.getMonth() === new Date().getMonth() && 
                 date.getFullYear() === new Date().getFullYear(),
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
    })
  }

  const applyFilters = () => {
    setShowFilters(false)
  }

  // Helper functions
  const getContentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "instagram": return "📷"
      case "newsletter": return "📧"
      case "blog": return "📝"
      case "email": return "✉️"
      case "facebook": return "👍"
      case "twitter": return "🐦"
      case "linkedin": return "💼"
      case "tiktok": return "🎵"
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

  if (clientLoading || isLoading) {
    return (
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.loading}>
            Loading calendar data...
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.error}>
            {error}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Content Calendar</h1>
          <div className={styles.actionsRow}>
            <div className={styles.leftActions}>
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
                  <div className={styles.filterDropdown} style={{ left: '0', right: 'auto' }}>
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
                        <option>Facebook</option>
                        <option>Twitter</option>
                        <option>LinkedIn</option>
                        <option>TikTok</option>
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
                        <option>Published</option>
                        <option>Draft</option>
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
                    <p className={styles.noContentText}>There is no content scheduled for this day.</p>
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
                            <span className={styles.metaLabel}>Time:</span>
                            <span className={styles.metaValue}>{item.time}</span>
                          </div>
                          <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Type:</span>
                            <span className={styles.metaValue}>{item.type}</span>
                          </div>
                        </div>
                        <div className={styles.contentActions}>
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