"use client"

import { useState, useMemo } from "react"
import type {
  Invoice,
  Expense,
  ExpenseCategory,
  PaymentStatus,
  SummaryCard,
  BillingTab,
  FilterState,
  PaginationInfo,
} from "../../../components/billing"
import styles from "@/styling/billing.module.css"

// Sample data
const sampleInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2023-001",
    client: "ABC Corporation",
    amount: 4500.0,
    date: "Jun 1, 2023",
    dueDate: "Jun 30, 2023",
    status: "Paid",
  },
  {
    id: "2",
    invoiceNumber: "INV-2023-002",
    client: "XYZ Fashion",
    amount: 2800.0,
    date: "Jun 5, 2023",
    dueDate: "Jul 5, 2023",
    status: "Pending",
  },
  {
    id: "3",
    invoiceNumber: "INV-2023-003",
    client: "123 Industries",
    amount: 6200.0,
    date: "Jun 10, 2023",
    dueDate: "May 25, 2023",
    status: "Overdue",
  },
  {
    id: "4",
    invoiceNumber: "INV-2023-004",
    client: "Tech Solutions Inc",
    amount: 1500.0,
    date: "Jun 15, 2023",
    dueDate: "Jul 15, 2023",
    status: "Draft",
  },
  {
    id: "5",
    invoiceNumber: "INV-2023-005",
    client: "Global Marketing Co",
    amount: 3200.0,
    date: "Jun 20, 2023",
    dueDate: "Jul 20, 2023",
    status: "Pending",
  },
]

const sampleExpenses: Expense[] = [
  {
    id: "1",
    description: "Software Subscription",
    category: "Software",
    amount: 199.0,
    date: "Jun 10, 2023",
    client: "ABC Corporation",
  },
  {
    id: "2",
    description: "Marketing Campaign",
    category: "Marketing",
    amount: 850.0,
    date: "Jun 15, 2023",
    client: "XYZ Fashion",
  },
  {
    id: "3",
    description: "Office Supplies",
    category: "Office",
    amount: 125.0,
    date: "Jun 20, 2023",
    client: "123 Industries",
  },
  {
    id: "4",
    description: "Travel Expenses",
    category: "Travel",
    amount: 450.0,
    date: "Jun 25, 2023",
    client: "Tech Solutions Inc",
  },
]

const expenseCategories: ExpenseCategory[] = [
  { name: "Software", amount: 650.0, color: "#3b82f6", percentage: 40 },
  { name: "Marketing", amount: 850.0, color: "#10b981", percentage: 52 },
  { name: "Office", amount: 125.0, color: "#f59e0b", percentage: 8 },
]

const summaryCards: SummaryCard[] = [
  {
    id: "1",
    title: "Total Invoiced",
    amount: 128500.0,
    icon: "📄",
    color: "#3b82f6",
  },
  {
    id: "2",
    title: "Total Received",
    amount: 95200.0,
    icon: "✓",
    color: "#10b981",
  },
  {
    id: "3",
    title: "Outstanding",
    amount: 33300.0,
    icon: "$",
    color: "#f59e0b",
  },
]

const paymentStatusData: PaymentStatus[] = [
  {
    client: "ABC Corporation",
    total: 45000.0,
    paid: 45000.0,
    pending: 0.0,
    overdue: 0.0,
  },
  {
    client: "XYZ Fashion",
    total: 28000.0,
    paid: 20000.0,
    pending: 8000.0,
    overdue: 0.0,
  },
  {
    client: "123 Industries",
    total: 35000.0,
    paid: 15000.0,
    pending: 10000.0,
    overdue: 10000.0,
  },
  {
    client: "Tech Solutions Inc",
    total: 20500.0,
    paid: 15200.0,
    pending: 5300.0,
    overdue: 0.0,
  },
]

const billingTabs: BillingTab[] = ["Invoices", "Expenses", "Reports"]
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>("Invoices")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: "All Statuses",
    client: "All Clients",
    fromDate: "",
    toDate: "",
  })

  const itemsPerPage = 5

  const paginationInfo: PaginationInfo = useMemo(() => {
    const totalItems = sampleInvoices.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    }
  }, [currentPage])

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sampleInvoices.slice(startIndex, endIndex)
  }, [currentPage])

  const getStatusClass = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return styles.statusPaid
      case "Pending":
        return styles.statusPending
      case "Overdue":
        return styles.statusOverdue
      case "Draft":
        return styles.statusDraft
      case "Cancelled":
        return styles.statusCancelled
      default:
        return styles.statusDraft
    }
  }

  const getDueDateClass = (status: Invoice["status"]) => {
    return status === "Pending" || status === "Overdue" ? styles.dueDateWarning : ""
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page)
    }
  }

  const handleFilterToggle = () => {
    if (activeTab === "Reports") {
      setShowFilters(!showFilters)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      status: "All Statuses",
      client: "All Clients",
      fromDate: "",
      toDate: "",
    })
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const { currentPage, totalPages } = paginationInfo

    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ""}`}
      >
        Previous
      </button>,
    )

    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage || i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`${styles.paginationButton} ${i === currentPage ? styles.active : ""}`}
          >
            {i}
          </button>,
        )
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        buttons.push(
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>
            ...
          </span>,
        )
      }
    }

    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ""}`}
      >
        Next
      </button>,
    )

    return buttons
  }

  const renderInvoicesTab = () => (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>INVOICE #</th>
              <th>CLIENT</th>
              <th>AMOUNT</th>
              <th>DATE</th>
              <th>DUE DATE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((invoice, index) => (
              <tr key={invoice.id} className={index % 2 === 0 ? styles.evenRow : ""}>
                <td>
                  <a href="#" className={styles.invoiceLink}>
                    {invoice.invoiceNumber}
                  </a>
                </td>
                <td className={styles.clientCell}>{invoice.client}</td>
                <td className={styles.amountCell}>{formatCurrency(invoice.amount)}</td>
                <td className={styles.dateCell}>{invoice.date}</td>
                <td className={`${styles.dueDateCell} ${getDueDateClass(invoice.status)}`}>{invoice.dueDate}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(invoice.status)}`}>{invoice.status}</span>
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionLinks}>
                    <a href="#" className={styles.actionLink}>
                      View
                    </a>
                    <a href="#" className={styles.actionLink}>
                      Edit
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          <span className={styles.paginationText}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, paginationInfo.totalItems)} of {paginationInfo.totalItems} invoices
          </span>
        </div>
        <div className={styles.paginationControls}>{renderPaginationButtons()}</div>
      </div>
    </>
  )

  const renderExpensesTab = () => (
    <>
      <div className={styles.expensesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Expenses</h2>
          <button className={styles.addButton}>
            <span className={styles.plusIcon}>+</span>
            Add Expense
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>CATEGORY</th>
                <th>AMOUNT</th>
                <th>DATE</th>
                <th>CLIENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sampleExpenses.map((expense, index) => (
                <tr key={expense.id} className={index % 2 === 0 ? styles.evenRow : ""}>
                  <td className={styles.descriptionCell}>{expense.description}</td>
                  <td className={styles.categoryCell}>{expense.category}</td>
                  <td className={styles.amountCell}>{formatCurrency(expense.amount)}</td>
                  <td className={styles.dateCell}>{expense.date}</td>
                  <td className={styles.clientCell}>{expense.client}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actionLinks}>
                      <a href="#" className={styles.actionLink}>
                        Edit
                      </a>
                      <a href="#" className={styles.deleteLink}>
                        Delete
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>Expense Categories</h2>
        <div className={styles.categoriesList}>
          {expenseCategories.map((category) => (
            <div key={category.name} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryAmount}>{formatCurrency(category.amount)}</span>
              </div>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderReportsTab = () => (
    <>
      {showFilters && (
        <div className={styles.filtersSection}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className={styles.filterSelect}
              >
                <option>All Statuses</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
                <option>Draft</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Client</label>
              <select
                value={filters.client}
                onChange={(e) => handleFilterChange("client", e.target.value)}
                className={styles.filterSelect}
              >
                <option>All Clients</option>
                <option>ABC Corporation</option>
                <option>XYZ Fashion</option>
                <option>123 Industries</option>
                <option>Tech Solutions Inc</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>From Date</label>
              <div className={styles.dateInputWrapper}>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                  className={styles.dateInput}
                  placeholder="mm/dd/yyyy"
                />
                <span className={styles.calendarIcon}>📅</span>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>To Date</label>
              <div className={styles.dateInputWrapper}>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange("toDate", e.target.value)}
                  className={styles.dateInput}
                  placeholder="mm/dd/yyyy"
                />
                <span className={styles.calendarIcon}>📅</span>
              </div>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button onClick={resetFilters} className={styles.resetButton}>
              Reset
            </button>
            <button className={styles.applyButton}>Apply Filters</button>
          </div>
        </div>
      )}

      <div className={styles.summaryCards}>
        {summaryCards.map((card) => (
          <div key={card.id} className={styles.summaryCard}>
            <div className={styles.cardIcon} style={{ backgroundColor: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className={styles.cardAmount}>{formatCurrency(card.amount)}</div>
            <div className={styles.cardTitle}>{card.title}</div>
          </div>
        ))}
      </div>

      <div className={styles.revenueSection}>
        <h2 className={styles.sectionTitle}>Monthly Revenue</h2>
        <div className={styles.chartPlaceholder}>
          <div className={styles.chartArea}>
            <div className={styles.chartContent}>
              {months.map((month, index) => (
                <div key={month} className={styles.chartBar} style={{ height: `${Math.random() * 80 + 20}%` }}></div>
              ))}
            </div>
            <div className={styles.chartAxis}>
              {months.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.paymentStatusSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Payment Status</h2>
          <div className={styles.statusLegend}>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: "#10b981" }}></span>
              <span>Paid</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: "#3b82f6" }}></span>
              <span>Pending</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendDot} style={{ backgroundColor: "#ef4444" }}></span>
              <span>Overdue</span>
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>PENDING</th>
                <th>OVERDUE</th>
              </tr>
            </thead>
            <tbody>
              {paymentStatusData.map((status, index) => (
                <tr key={status.client} className={index % 2 === 0 ? styles.evenRow : ""}>
                  <td className={styles.clientCell}>{status.client}</td>
                  <td className={styles.amountCell}>{formatCurrency(status.total)}</td>
                  <td className={styles.paidAmount}>{formatCurrency(status.paid)}</td>
                  <td className={styles.pendingAmount}>{formatCurrency(status.pending)}</td>
                  <td className={styles.overdueAmount}>{formatCurrency(status.overdue)}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td className={styles.totalLabel}>Total</td>
                <td className={styles.totalAmount}>
                  {formatCurrency(paymentStatusData.reduce((sum, item) => sum + item.total, 0))}
                </td>
                <td className={styles.totalPaid}>
                  {formatCurrency(paymentStatusData.reduce((sum, item) => sum + item.paid, 0))}
                </td>
                <td className={styles.totalPending}>
                  {formatCurrency(paymentStatusData.reduce((sum, item) => sum + item.pending, 0))}
                </td>
                <td className={styles.totalOverdue}>
                  {formatCurrency(paymentStatusData.reduce((sum, item) => sum + item.overdue, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  return (
    <div className={styles.layout}>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Billing & Invoices</h1>

          <div className={styles.headerContent}>
            <div className={styles.tabs}>
              {billingTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.createButton}>
                <span className={styles.plusIcon}>+</span>
                Create Invoice
              </button>
              <button className={styles.actionButton} onClick={handleFilterToggle}>
                <span className={styles.actionIcon}>⚙</span>
                Filter
              </button>
              <button className={styles.actionButton}>
                <span className={styles.actionIcon}>📤</span>
                Export
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "Invoices" && renderInvoicesTab()}
          {activeTab === "Expenses" && renderExpensesTab()}
          {activeTab === "Reports" && renderReportsTab()}
        </div>
      </main>
    </div>
  )
}
