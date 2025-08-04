"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import styles from "../../../../styling/invoiceDetails.module.css"
import { ArrowLeft, Check, Calendar, User, CreditCard } from "lucide-react"
import API_ROUTES from "@/app/apiRoutes"
import type { Invoice } from "@/types/invoice"

const InvoiceDetailPage = () => {
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const invoiceId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

        const fetchInvoice = async () => {
        try {
            setLoading(true)
            const res = await fetch(API_ROUTES.INVOICES.GET(invoiceId), {
            method: "GET",
            credentials: "include", // Include cookies for authentication
            })

            if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.message || `Error ${res.status}`)
            }

            const data = await res.json()
            setInvoice(data.data || data)
        } catch (err: any) {
            setError(err.message || "Failed to fetch invoice")
            console.error("Error fetching invoice:", err)
        } finally {
            setLoading(false)
        }
        }

  const handleMarkAsPaid = async () => {
    if (!invoice || invoice.status === "paid") return

    try {
      setUpdating(true)
      await invoiceAPI.markAsPaid(invoice._id)
      setInvoice((prev) => (prev ? { ...prev, status: "paid", paymentDate: new Date().toISOString() } : null))
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to mark invoice as paid")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading invoice...</div>
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={fetchInvoice} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  if (!invoice) {
    return <div className={styles.loading}>Invoice not found</div>
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

  const overdue = isOverdue(invoice.dueDate, invoice.status)
  const statusDisplay = overdue ? "overdue" : invoice.status
  const statusColor = overdue ? "#ef4444" : getStatusColor(invoice.status)

  return (
    <div className={styles.invoiceDetailPage}>
      <div className={styles.header}>
        <Link href="/client/invoices" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Invoices
        </Link>
        <div className={styles.titleSection}>
          <h1>Invoice #{invoice._id.slice(-8)}</h1>
          <div className={styles.headerActions}>
            <span className={styles.statusBadge} style={{ backgroundColor: statusColor }}>
              {statusDisplay}
            </span>
            <div className={styles.actionButtons}>
              {invoice.status !== "paid" && (
                <button onClick={handleMarkAsPaid} className={styles.paidButton} disabled={updating}>
                  <Check size={16} />
                  {updating ? "Updating..." : "Mark as Paid"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.invoiceCard}>
          <div className={styles.invoiceHeader}>
            <div className={styles.companyInfo}>
              <h2>Your Company Name</h2>
              <p>123 Your Street</p>
              <p>Your City, State 12345</p>
              <p>contact@yourcompany.com</p>
            </div>
            <div className={styles.invoiceInfo}>
              <h3>Invoice Details</h3>
              <div className={styles.invoiceDetails}>
                <div className={styles.detailRow}>
                  <span>Invoice ID:</span>
                  <span className={styles.invoiceId}>{invoice._id}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Generated:</span>
                  <span>{new Date(invoice.generatedAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Issue Date:</span>
                  <span>{new Date(invoice.issuedDate).toLocaleDateString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Due Date:</span>
                  <span className={overdue ? styles.overdue : ""}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
                {invoice.paymentDate && (
                  <div className={styles.detailRow}>
                    <span>Paid Date:</span>
                    <span>{new Date(invoice.paymentDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.overview}>
            <div className={styles.overviewCard}>
              <Calendar size={24} />
              <div>
                <h3>Campaign</h3>
                <p>{invoice.campaign?.name}</p>
              </div>
            </div>

            <div className={styles.overviewCard}>
              <User size={24} />
              <div>
                <h3>Client</h3>
                <p>{invoice.client?.user?.name}</p>
              </div>
            </div>

            <div className={styles.overviewCard}>
              <CreditCard size={24} />
              <div>
                <h3>Budget</h3>
                <p>{invoice.budget?.totalBudget}</p>
              </div>
            </div>
          </div>

          <div className={styles.amountSection}>
            <div className={styles.amountCard}>
              <h3>Invoice Amount</h3>
              <div className={styles.totalAmount}>${invoice.amount.toLocaleString()}</div>
              <div className={styles.amountBreakdown}>
                <div className={styles.breakdownRow}>
                  <span>Subtotal:</span>
                  <span>${invoice.amount.toLocaleString()}</span>
                </div>
                <div className={styles.breakdownRow}>
                  <span>Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div className={`${styles.breakdownRow} ${styles.total}`}>
                  <span>Total:</span>
                  <span>${invoice.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.referenceSection}>
            <h3>Reference Information</h3>
            <div className={styles.referenceGrid}>
              <div className={styles.referenceItem}>
                <span className={styles.referenceLabel}>Manager ID:</span>
                <span className={styles.referenceValue}>{invoice.manager?.user?.name}</span>
              </div>
              <div className={styles.referenceItem}>
                <span className={styles.referenceLabel}>Client ID:</span>
                <span className={styles.referenceValue}>{invoice.client?.user?.name}</span>
              </div>
              <div className={styles.referenceItem}>
                <span className={styles.referenceLabel}>Campaign ID:</span>
                <span className={styles.referenceValue}>{invoice.campaign?.name}</span>
              </div>
              <div className={styles.referenceItem}>
                <span className={styles.referenceLabel}>Budget ID:</span>
                <span className={styles.referenceValue}>{invoice.budget?.totalBudget}</span>
              </div>
            </div>
          </div>

          {invoice.status === "paid" && invoice.paymentDate && (
            <div className={styles.paymentInfo}>
              <h3>Payment Information</h3>
              <div className={styles.paymentDetails}>
                <div className={styles.detailRow}>
                  <span>Status:</span>
                  <span className={styles.paidStatus}>Paid</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Payment Date:</span>
                  <span>{new Date(invoice.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetailPage
