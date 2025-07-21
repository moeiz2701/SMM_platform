"use client"

import { useState, useMemo } from "react"
import type { ContentItem, FilterTab } from "../../../components/content"
import styles from "@/styling/content.module.css"

const sampleData: ContentItem[] = [
  {
    id: "1",
    title: "Q3 Social Media Campaign for ABC Corp",
    type: "Social Media",
    client: "ABC Corporation",
    status: "Approved",
    dueDate: "Jul 15, 2023",
    assignedTo: "Taylor",
  },
  {
    id: "2",
    title: "Weekly Newsletter - Tech Updates",
    type: "Email",
    client: "XYZ Company",
    status: "Pending Approval",
    dueDate: "Jul 10, 2023",
    assignedTo: "Jamie V",
  },
  {
    id: "3",
    title: 'Blog Post: "10 Marketing Trends for 2023"',
    type: "Blog",
    client: "123 Industries",
    status: "Draft",
    dueDate: "Jul 20, 2023",
    assignedTo: "Alex M",
  },
  {
    id: "4",
    title: "Product Launch Press Release",
    type: "PR",
    client: "ABC Corporation",
    status: "Rejected",
    dueDate: "Jul 5, 2023",
    assignedTo: "Taylor",
  },
  {
    id: "5",
    title: "Instagram Story Series - Summer Collection",
    type: "Social Media",
    client: "XYZ Company",
    status: "Draft",
    dueDate: "Jul 25, 2023",
    assignedTo: "Jamie V",
  },
]

const filterTabs: FilterTab[] = ["All Content", "Drafts", "Pending Approval", "Approved", "Rejected"]
const ITEMS_PER_PAGE = 3;
export default function ContentPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<FilterTab>("All Content")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    contentType: "All Types",
    client: "All Clients",
    assignedTo: "All Team Members"
  })

  // Get all unique values for filter dropdowns
  const contentTypes = useMemo(() => {
    const types = new Set(sampleData.map(item => item.type))
    return ["All Types", ...Array.from(types)]
  }, [])

  const clients = useMemo(() => {
    const clientList = new Set(sampleData.map(item => item.client))
    return ["All Clients", ...Array.from(clientList)]
  }, [])

  const teamMembers = useMemo(() => {
    const members = new Set(sampleData.map(item => item.assignedTo))
    return ["All Team Members", ...Array.from(members)]
  }, [])
 const [currentPage, setCurrentPage] = useState(1)
  const filteredData = useMemo(() => {
    let filtered = sampleData

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.client.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab !== "All Content") {
      const statusMap: Record<string, ContentItem["status"]> = {
        Drafts: "Draft",
        "Pending Approval": "Pending Approval",
        Approved: "Approved",
        Rejected: "Rejected",
      }
      filtered = filtered.filter((item) => item.status === statusMap[activeTab])
    }

    // Apply additional filters
    if (filters.contentType !== "All Types") {
      filtered = filtered.filter(item => item.type === filters.contentType)
    }

    if (filters.client !== "All Clients") {
      filtered = filtered.filter(item => item.client === filters.client)
    }

    if (filters.assignedTo !== "All Team Members") {
      filtered = filtered.filter(item => item.assignedTo === filters.assignedTo)
    }

    return filtered
  }, [searchTerm, activeTab, filters])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }
  const getStatusBadgeClass = (status: ContentItem["status"]) => {
    switch (status) {
      case "Approved":
        return styles.statusApproved
      case "Pending Approval":
        return styles.statusPending
      case "Rejected":
        return styles.statusRejected
      case "Draft":
        return styles.statusDraft
      default:
        return styles.statusDraft
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      contentType: "All Types",
      client: "All Clients",
      assignedTo: "All Team Members"
    })
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Content Management</h1>
            <div className={styles.headerActions}>
              <button className={styles.createButton}>
                <span className={styles.plusIcon}>+</span>
                Create Content
              </button>
              <div className={styles.filterWrapper}>
                <button 
                  className={styles.filterButton}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span className={styles.filterIcon}>⚙</span>
                  Filter
                  <span className={`${styles.chevronIcon} ${showFilters ? styles.chevronUp : ''}`}>▼</span>
                </button>
                
                {showFilters && (
                  <div className={styles.filterDropdown}>
                    <div className={styles.filterGroup}>
                      <label htmlFor="contentType">Content Type</label>
                      <select
                        id="contentType"
                        name="contentType"
                        value={filters.contentType}
                        onChange={handleFilterChange}
                      >
                        {contentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.filterGroup}>
                      <label htmlFor="client">Client</label>
                      <select
                        id="client"
                        name="client"
                        value={filters.client}
                        onChange={handleFilterChange}
                      >
                        {clients.map(client => (
                          <option key={client} value={client}>{client}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.filterGroup}>
                      <label htmlFor="assignedTo">Assigned To</label>
                      <select
                        id="assignedTo"
                        name="assignedTo"
                        value={filters.assignedTo}
                        onChange={handleFilterChange}
                      >
                        {teamMembers.map(member => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className={styles.filterActions}>
                      <button 
                        className={styles.resetButton}
                        onClick={resetFilters}
                      >
                        Reset
                      </button>
                      <button 
                        className={styles.applyButton}
                        onClick={() => setShowFilters(false)}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>TITLE</th>
                <th>TYPE</th>
                <th>CLIENT</th>
                <th>STATUS</th>
                <th>DUE DATE</th>
                <th>ASSIGNED TO</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? styles.evenRow : ""}>
                  <td className={styles.titleCell}>{item.title}</td>
                  <td>{item.type}</td>
                  <td>{item.client}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(item.status)}`}>{item.status}</span>
                  </td>
                  <td className={styles.dueDateCell}>{item.dueDate}</td>
                  <td>
                    <div className={styles.assignedUser}>
                      <div className={styles.userAvatar}>{item.assignedTo.charAt(0)}</div>
                      <span>{item.assignedTo}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <span className={styles.counter}>
            Showing {paginatedData.length} of {filteredData.length} content items
          </span>
          
          {/* Pagination Controls */}
          <div className={styles.pagination}>
            <button
              className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}