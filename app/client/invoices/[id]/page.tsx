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
  const [paying, setPaying] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

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
        if (!invoiceId) return
        
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

  const handlePayInvoice = async () => {
    if (!invoice || invoice.status === "paid" || !invoiceId) return

    try {
      setPaying(true)
      setPaymentError(null)
      
      const res = await fetch(API_ROUTES.INVOICES.PAY(invoiceId), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        }
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Payment failed")
      }

      if (data.success && data.data.paymentStatus === "succeeded") {
        // Payment successful
        setInvoice((prev) => prev ? { 
          ...prev, 
          status: "paid", 
          paymentDate: new Date().toISOString() 
        } : null)
        alert("Payment processed successfully!")
      } else if (data.requiresAction) {
        // 3D Secure authentication required
        // In a real app, you'd handle this with Stripe's frontend SDK
        alert("Additional authentication required. Please contact support.")
      } else {
        throw new Error("Payment processing failed")
      }
    } catch (err: any) {
      setPaymentError(err.message || "Failed to process payment")
      console.error("Payment error:", err)
    } finally {
      setPaying(false)
    }
  }

  const handleMarkAsPaid = async () => {
    if (!invoice || invoice.status === "paid") return

    try {
      setUpdating(true)
      // This would be for admin/manager functionality
      // For now, we'll use the payment function
      await handlePayInvoice()
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
                <>
                  <button 
                    onClick={handlePayInvoice} 
                    className={styles.payButton} 
                    disabled={paying}
                  >
                    <CreditCard size={16} />
                    {paying ? "Processing..." : "Pay Invoice"}
                  </button>
                  <button onClick={handleMarkAsPaid} className={styles.paidButton} disabled={updating}>
                    <Check size={16} />
                    {updating ? "Updating..." : "Mark as Paid"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {paymentError && (
        <div className={styles.paymentError}>
          <p>Payment Error: {paymentError}</p>
          <button onClick={() => setPaymentError(null)} className={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

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
                <p>{typeof invoice.campaign === 'object' ? invoice.campaign.name : invoice.campaign}</p>
              </div>
            </div>

            <div className={styles.overviewCard}>
              <User size={24} />
              <div>
                <h3>Client</h3>
                <p>{typeof invoice.client === 'object' ? invoice.client.user?.name || 'N/A' : invoice.client}</p>
              </div>
            </div>

            <div className={styles.overviewCard}>
              <CreditCard size={24} />
              <div>
                <h3>Budget</h3>
                <p>${typeof invoice.budget === 'object' ? invoice.budget.totalBudget?.toLocaleString() || '0' : invoice.budget}</p>
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
                <span className={styles.referenceLabel}>Manager:</span>
                <span className={styles.referenceValue}>
                  {typeof invoice.manager === 'object' ? invoice.manager.user?.name || 'N/A' : invoice.manager}
                </span>
              </div>
              <div className={styles.referenceItem}>
                <span className={styles.referenceLabel}>Client:</span>
                <span className={styles.referenceValue}>
                  {typeof invoice.client === 'object' ? invoice.client.user?.name || 'N/A' : invoice.client}
                </span>
              </div>
              <div className={styles.referenceItem}>
                <span className={styles.referenceLabel}>Campaign:</span>
                <span className={styles.referenceValue}>
                  {typeof invoice.campaign === 'object' ? invoice.campaign.name : invoice.campaign}
                </span>
              </div>
              <div className={styles.referenceItem}>
                <span className={styles.referenceLabel}>Budget:</span>
                <span className={styles.referenceValue}>
                  ${typeof invoice.budget === 'object' ? invoice.budget.totalBudget?.toLocaleString() || '0' : invoice.budget}
                </span>
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
