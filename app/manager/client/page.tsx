"use client"

import { useState, useMemo } from "react"
import type { Client, ClientFilterTab } from "../../../components/client"
import styles from "@/styling/clients.module.css"

const sampleClients: Client[] = [
  {
    id: "1",
    name: "Robert Johnson",
    company: "ABC Corporation",
    email: "robert@abccorp.com",
    phone: "(555) 123-4567",
    status: "Active",
    lastActivity: "2 days ago",
    projects: 3,
    revenueYTD: 45000,
  },
  {
    id: "2",
    name: "Sarah Williams",
    company: "XYZ Fashion",
    email: "sarah@xyzfashion.com",
    phone: "(555) 234-5678",
    status: "Active",
    lastActivity: "Today",
    projects: 5,
    revenueYTD: 78000,
  },
  {
    id: "3",
    name: "Michael Chen",
    company: "123 Industries",
    email: "michael@123industries.com",
    phone: "(555) 345-6789",
    status: "Inactive",
    lastActivity: "1 week ago",
    projects: 1,
    revenueYTD: 12000,
  },
  {
    id: "4",
    name: "Emily Davis",
    company: "Tech Solutions Inc",
    email: "emily@techsolutions.com",
    phone: "(555) 456-7890",
    status: "Pending",
    lastActivity: "3 days ago",
    projects: 0,
    revenueYTD: 0,
  },
  {
    id: "5",
    name: "David Martinez",
    company: "Global Marketing Co",
    email: "david@globalmarketing.com",
    phone: "(555) 567-8901",
    status: "Active",
    lastActivity: "1 day ago",
    projects: 7,
    revenueYTD: 95000,
  },
  {
    id: "6",
    name: "Lisa Thompson",
    company: "Creative Agency",
    email: "lisa@creativeagency.com",
    phone: "(555) 678-9012",
    status: "Inactive",
    lastActivity: "2 weeks ago",
    projects: 2,
    revenueYTD: 28000,
  },
]

const filterTabs: ClientFilterTab[] = ["All Clients", "Active", "Inactive", "Pending"]

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<ClientFilterTab>("All Clients")

  const filteredClients = useMemo(() => {
    let filtered = sampleClients

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab !== "All Clients") {
      filtered = filtered.filter((client) => client.status === activeTab)
    }

    return filtered
  }, [searchTerm, activeTab])

  const getStatusClass = (status: Client["status"]) => {
    switch (status) {
      case "Active":
        return styles.statusActive
      case "Inactive":
        return styles.statusInactive
      case "Pending":
        return styles.statusPending
      default:
        return styles.statusInactive
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className={styles.layout}>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Client Management</h1>

          <div className={styles.topActions}>
            <div className={styles.leftActions}>
              <button className={styles.addButton}>
                <span className={styles.plusIcon}>+</span>
                Add Client
              </button>
              <button className={styles.filterButton}>
                <span className={styles.filterIcon}>⚙</span>
                Filter
              </button>
            </div>

            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
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
                <th>CLIENT</th>
                <th>CONTACT INFO</th>
                <th>STATUS</th>
                <th>LAST ACTIVITY</th>
                <th>PROJECTS</th>
                <th>REVENUE YTD</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr key={client.id} className={index % 2 === 0 ? styles.evenRow : ""}>
                  <td className={styles.clientCell}>
                    <div className={styles.clientInfo}>
                      <div className={styles.clientAvatar}>{getInitials(client.name)}</div>
                      <div className={styles.clientDetails}>
                        <div className={styles.clientName}>{client.name}</div>
                        <div className={styles.clientCompany}>{client.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.contactCell}>
                    <div className={styles.contactInfo}>
                      <div className={styles.email}>{client.email}</div>
                      <div className={styles.phone}>{client.phone}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(client.status)}`}>{client.status}</span>
                  </td>
                  <td className={styles.activityCell}>{client.lastActivity}</td>
                  <td className={styles.projectsCell}>{client.projects}</td>
                  <td className={styles.revenueCell}>{formatCurrency(client.revenueYTD)}</td>
                  <td className={styles.actionsCell}>
                    <button className={styles.actionsButton}>
                      <span className={styles.dotsIcon}>⋮</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <span className={styles.counter}>
            Showing {filteredClients.length} of {sampleClients.length} clients
          </span>
        </div>
      </main>
    </div>
  )
}
