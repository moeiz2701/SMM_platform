"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import styles from "../../../styling/invoices.module.css"
import { Eye } from "lucide-react"
import API_ROUTES from "@/app/apiRoutes"
import type { Invoice } from "@/types/invoice"
import Table, { type TableColumn } from "@/components/table"
import SearchBar from "@/components/searchbar"

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const itemsPerPage = 10

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
  try {
    setLoading(true)
    const res = await fetch(API_ROUTES.INVOICES.GET_BY_MANAGER, {
      method: "GET",
      credentials: "include", // Include cookies for auth/session
    })

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${await res.text()}`)
    }

    const data = await res.json()
    setInvoices(data.data || data)
  } catch (err: any) {
    setError(err.message || "Failed to fetch invoices")
    console.error("Error fetching invoices:", err)
  } finally {
    setLoading(false)
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10b981"
      case "pending":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "paid") return false
    return new Date(dueDate) < new Date()
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof invoice.campaign === 'object' && invoice.campaign?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof invoice.client === 'object' && invoice.client?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()))

    let matchesStatus = true
    if (statusFilter === "overdue") {
      matchesStatus = isOverdue(invoice.dueDate, invoice.status)
    } else if (statusFilter !== "all") {
      matchesStatus = invoice.status === statusFilter
    }

    return matchesSearch && matchesStatus
  })

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingAmount = invoices
    .filter((invoice) => invoice.status === "pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdueAmount = invoices
    .filter((invoice) => isOverdue(invoice.dueDate, invoice.status))
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  if (loading) {
    return (
      <div className={styles.invoicesPage}>
        <div className={styles.loading}>Loading invoices...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.invoicesPage}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchInvoices} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.invoicesPage}>
      <div className={styles.header}>
        <h1>Invoices</h1>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h3>Total Amount</h3>
          <p>${totalAmount.toLocaleString()}</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>Paid</h3>
          <p style={{ color: "#10b981" }}>${paidAmount.toLocaleString()}</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>Pending</h3>
          <p style={{ color: "#f59e0b" }}>${pendingAmount.toLocaleString()}</p>
        </div>
        <div className={styles.summaryCard}>
          <h3>Overdue</h3>
          <p style={{ color: "#ef4444" }}>${overdueAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <SearchBar 
            placeholder="Search invoices..."
            onSearch={setSearchTerm}
            className={styles.searchBar}
          />
        </div>

        <div className={styles.tabs}>
          {[
            "All Status",
            "Paid",
            "Pending",
            "Overdue"
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab === "All Status" ? "all" : tab.toLowerCase())}
              className={`${styles.tab} ${statusFilter === (tab === "All Status" ? "all" : tab.toLowerCase()) ? styles.tabActive : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <Table
          data={filteredInvoices}
          columns={[
            {
              key: "invoiceId",
              label: "INVOICE ID",
              sortable: true,
              render: (_, row) => (
                <span className={styles.invoiceId}>{row._id.slice(-8)}</span>
              )
            },
            {
              key: "campaign",
              label: "CAMPAIGN",
              sortable: true,
              render: (value) => (
                typeof value === 'object' && value ? value.name : 'N/A'
              )
            },
            {
              key: "client",
              label: "CLIENT",
              sortable: true,
              render: (value) => (
                typeof value === 'object' && value?.user ? value.user.name : 'N/A'
              )
            },
            {
              key: "amount",
              label: "AMOUNT",
              type: "currency",
              sortable: true
            },
            {
              key: "issuedDate",
              label: "ISSUE DATE",
              type: "date",
              sortable: true
            },
            {
              key: "dueDate",
              label: "DUE DATE",
              type: "date",
              sortable: true,
              render: (value, row) => (
                <span className={isOverdue(value, row.status) ? styles.overdue : ""}>
                  {new Date(value).toLocaleDateString()}
                </span>
              )
            },
            {
              key: "status",
              label: "STATUS",
              type: "status",
              sortable: true,
              render: (value, row) => {
                const overdue = isOverdue(row.dueDate, value)
                return (
                  <span className={styles.statusBadge} style={{ backgroundColor: overdue ? "#ef4444" : getStatusColor(value) }}>
                    {overdue ? "overdue" : value}
                  </span>
                )
              }
            },
            {
              key: "actions",
              label: "ACTIONS",
              render: (_, row) => (
                <div className={styles.actions}>
                  <Link href={`/manager/invoices/${row._id}`} className={styles.actionButton}>
                    <Eye size={16} />
                  </Link>
                </div>
              )
            }
          ]}
          pageSize={itemsPerPage}
          searchable={false}
          emptyMessage="No invoices found"
          className={styles.reusableTable}
        />
      </div>

      {filteredInvoices.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No invoices found</p>
        </div>
      )}
    </div>
  )
}

export default InvoicesPage
