"use client"


import { useEffect, useState, useMemo } from "react"
import type { Client, ClientFilterTab } from "../../../components/client"
import dynamic from "next/dynamic"
const SearchClients = dynamic(() => import("../../../components/clientSearch"), { ssr: false })
import API_ROUTES from "@/app/apiRoutes"
import styles from "../../../styling/clients.module.css"

const filterTabs: ClientFilterTab[] = ["All Clients", "Active", "Inactive", "Pending"]

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<ClientFilterTab>("All Clients")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showSearchClient, setShowSearchClient] = useState(false)

  useEffect(() => {
    async function fetchClients() {
      setLoading(true)
      try {
        // Get current user id
        const userRes = await fetch(API_ROUTES.AUTH.ME, { credentials: 'include' })
        const userData = await userRes.json()
        const userId = userData.data?._id
        if (!userId) {
          setClients([])
          setLoading(false)
          return
        }
        // Fetch clients for this user
        const res = await fetch(API_ROUTES.CLIENTS.BY_USER(userId), { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setClients(data.data || [])
        } else {
          setClients([])
        }
      } catch {
        setClients([])
      }
      setLoading(false)
    }
    fetchClients()
  }, [])

  const filteredClients = useMemo(() => {
    let filtered = clients
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (activeTab !== "All Clients") {
      filtered = filtered.filter((client) => client.status === activeTab)
    }
    return filtered
  }, [clients, searchTerm, activeTab])

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
          <h2 >Client Management</h2>

          <div className={styles.topActions}>
            <div className={styles.leftActions}>
              <button className={styles.addButton} onClick={() => setShowSearchClient((v) => !v)}>
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

        {showSearchClient ? (
          <div style={{ width: '100%', marginTop: 24 }} className={styles.searchClientContainer}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <button className="button2"
                onClick={() => setShowSearchClient(false)}
              >
                ← Back
              </button>
              
            </div>
            <div style={{ width: '100%' }}>
              <SearchClients />
            </div>
          </div>
        ) : (
          <>
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
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem' }}>Loading clients...</div>
              ) : filteredClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '1.5rem', color: '#888' }}>
                  You have no clients
                </div>
              ) : (
                <>
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
                        <tr key={client.id || client._id} className={index % 2 === 0 ? styles.evenRow : ""}>
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
                  <div className={styles.footer}>
                    <span className={styles.counter}>
                      Showing {filteredClients.length} of {clients.length} clients
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
