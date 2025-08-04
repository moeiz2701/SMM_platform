"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import styles from "../../../styling/invoices.module.css"
import { Search, Eye } from "lucide-react"
import API_ROUTES from "@/app/apiRoutes"
import type { Invoice } from "@/types/invoice"

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
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
      invoice.campaign?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesStatus = true
    if (statusFilter === "overdue") {
      matchesStatus = isOverdue(invoice.dueDate, invoice.status)
    } else if (statusFilter !== "all") {
      matchesStatus = invoice.status === statusFilter
    }

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage)

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
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={styles.statusFilter}>
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.invoicesTable}>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Campaign</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((invoice) => {
              const overdue = isOverdue(invoice.dueDate, invoice.status)
              return (
                <tr key={invoice._id} className={overdue ? styles.overdueRow : ""}>
                  <td className={styles.invoiceId}>{invoice._id.slice(-8)}</td>
                  <td>{invoice.campaign?.name || "N/A"}</td>
                    <td>{invoice.client?.name || "N/A"}</td>
                  <td className={styles.amount}>${invoice.amount.toLocaleString()}</td>
                  <td>{new Date(invoice.issuedDate).toLocaleDateString()}</td>
                  <td className={overdue ? styles.overdue : ""}>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: overdue ? "#ef4444" : getStatusColor(invoice.status) }}
                    >
                      {overdue ? "overdue" : invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/manager/invoices/${invoice._id}`} className={styles.actionButton}>
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`${styles.pageButton} ${currentPage === page ? styles.active : ""}`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}

      {filteredInvoices.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No invoices found</p>
        </div>
      )}
    </div>
  )
}

export default InvoicesPage
