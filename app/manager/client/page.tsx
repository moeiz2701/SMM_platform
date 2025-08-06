"use client"

import { useEffect, useState, useMemo } from "react"
import type { Client, ClientFilterTab } from "../../../components/client"
import dynamic from "next/dynamic"
import ReusableTable, { type TableColumn, type TableAction } from "../../../components/table"
const SearchClients = dynamic(() => import("../../../components/clientSearch"), { ssr: false })
import SearchBar from "../../../components/searchbar" // Add this import
import API_ROUTES from "@/app/apiRoutes"
import styles from "../../../styling/clients.module.css"

const filterTabs: ClientFilterTab[] = ["All Clients", "Active", "Inactive", "Pending"]

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<ClientFilterTab>("All Clients")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showSearchClient, setShowSearchClient] = useState(false)
  const [managerId, setManagerId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // First fetch the manager's ID
        const managerRes = await fetch(API_ROUTES.MANAGERS.ME, {
          credentials: 'include'
        })
        
        if (managerRes.ok) {
          const managerData = await managerRes.json()
          setManagerId(managerData.data?._id || null)
          
          // Then fetch clients for this manager
          const clientsRes = await fetch(API_ROUTES.CLIENTS.BY_MANAGER, {
            credentials: 'include'
          })
          
          if (clientsRes.ok) {
            const clientsData = await clientsRes.json()
            setClients(clientsData.data || [])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredClients = useMemo(() => {
    let filtered = clients
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.contactPerson?.email && client.contactPerson.email.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }
    if (activeTab !== "All Clients") {
      filtered = filtered.filter((client) => client.status === activeTab.toLowerCase())
    }
    return filtered
  }, [clients, searchTerm, activeTab])

  const handleRemoveClient = async (clientId: string) => {
    if (!managerId) return
    
    try {
      const res = await fetch(API_ROUTES.MANAGERS.REMOVE_CLIENT(managerId, clientId), {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        setClients(prevClients => prevClients.filter(client => client._id !== clientId))
      } else {
        const errorData = await res.json()
        console.error("Failed to remove client:", errorData.message)
      }
    } catch (error) {
      console.error("Error removing client:", error)
    }
  }
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return styles.statusActive
      case "inactive":
        return styles.statusInactive
      case "pending":
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

  // Prepare data for the table
  const tableData = useMemo(() => {
    return filteredClients.map(client => ({
      ...client,
      id: client._id,
      clientInfo: { 
        name: client.name, 
        company: client.company, 
        initials: getInitials(client.name) 
      },
      contactInfo: { 
        email: client.contactPerson?.email || "", 
        phone: client.contactPerson?.phone || "" 
      },
      status: client.status,
      lastActivity: client.lastActivity || "N/A",
      projects: client.projects || 0,
      revenueYTD: client.revenueYTD || 0
    }))
  }, [filteredClients])

  const tableActions: TableAction[] = [
    {
      label: "Remove",
      onClick: (row) => handleRemoveClient(row.id),
      className: styles.removeAction,
      icon: <span>🗑️</span>
    }
  ]

  const columns: TableColumn[] = [
    {
      key: "clientInfo",
      label: "CLIENT",
      render: (value) => (
        <div className={styles.clientInfo}>
          <div className={styles.clientAvatar}>{value.initials}</div>
          <div className={styles.clientDetails}>
            <div className={styles.clientName}>{value.name}</div>
            <div className={styles.clientCompany}>{value.company || "N/A"}</div>
          </div>
        </div>
      )
    },
    {
      key: "contactInfo",
      label: "CONTACT INFO",
      render: (value) => (
        <div className={styles.contactInfo}>
          <div className={styles.email}>{value.email || "N/A"}</div>
          <div className={styles.phone}>{value.phone || "N/A"}</div>
        </div>
      )
    },
    {
      key: "status",
      label: "STATUS",
      type: "status",
      render: (value) => (
        <span className={`${styles.statusBadge} ${getStatusClass(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: "lastActivity",
      label: "LAST ACTIVITY"
    },
    {
      key: "projects",
      label: "PROJECTS"
    },
    {
      key: "revenueYTD",
      label: "REVENUE YTD",
      type: "currency"
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (_, row) => (
        <div className={styles.actionButtons}>
          {tableActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick(row)
              }}
              className={action.className}
              title={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )
    }
  ]

 return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Client Management</h1>

          <div className={styles.topActions}>
            <div className={styles.leftActions}>
              <button className={styles.addButton} onClick={() => setShowSearchClient((v) => !v)}>
                <span className={styles.plusIcon}>+</span>
                Add Client
              </button>
            </div>
              
            <div className={styles.searchContainer}>
              <SearchBar 
                placeholder="Search clients..."
                onSearch={setSearchTerm}
                className={styles.searchBar}
              />
            </div>
          </div>
        </div>

        {showSearchClient ? (
          <div style={{ width: '100%', marginTop: 24 }} className={styles.searchClientContainer}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <button className="button2" onClick={() => setShowSearchClient(false)}>
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
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem' }}>
                  Loading clients...
                </div>
              ) : filteredClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '1.5rem', color: '#888' }}>
                  You have no {activeTab !== "All Clients" ? activeTab.toLowerCase() : ""} clients
                </div>
              ) : (
                <>
                  <ReusableTable
                    data={tableData}
                    columns={columns}
                    actions={tableActions}
                    searchable={false}
                    emptyMessage="No clients found"
                    className={styles.reusableTable}
                  />
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