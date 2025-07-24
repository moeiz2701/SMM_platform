"use client"

import { useState } from "react"
import ReusableTable, { type TableColumn, type TableAction } from "../../../components/table"
import type {
  Invoice,
  Expense,
  ExpenseCategory,
  PaymentStatus,
  SummaryCard,
  BillingTab,
  FilterState,
} from "../../../components/billing"
import styles from "@/styling/billing.module.css"

// Sample data (keep existing data)
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
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: "All Statuses",
    client: "All Clients",
    fromDate: "",
    toDate: "",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
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

  // Define columns for invoices table
const invoiceColumns: TableColumn[] = [
  {
    key: "invoiceNumber",
    label: "INVOICE #",
    type: "string",
    sortable: true,
    render: (value) => (
      <a href="#" className={styles.invoiceLink}>
        {value}
      </a>
    ),
  },
  { key: "client", label: "CLIENT", type: "string", sortable: true },
  { 
    key: "amount", 
    label: "AMOUNT", 
    type: "currency", 
    sortable: true,
    render: (value, row) => (
      <span className={row.status === 'Paid' ? styles.paidAmount : 
                      row.status === 'Pending' ? styles.pendingAmount : 
                      row.status === 'Overdue' ? styles.overdueAmount : ''}>
        {formatCurrency(value)}
      </span>
    )
  },
  { key: "date", label: "DATE", type: "date", sortable: true },
  { key: "dueDate", label: "DUE DATE", type: "date", sortable: true },
  { 
    key: "status", 
    label: "STATUS", 
    type: "status", 
    sortable: true,
    render: (value) => (
      <span className={value === 'Paid' ? styles.statusPaid : 
                      value === 'Pending' ? styles.statusPending : 
                      value === 'Overdue' ? styles.statusOverdue : 
                      value === 'Draft' ? styles.statusDraft : ''}>
        {value}
      </span>
    )
  },
  { key: "actions", label: "ACTIONS", type: "actions", sortable: false },
]

  // Define actions for invoices
  const invoiceActions: TableAction[] = [
    { label: "View", onClick: (row) => console.log("View", row) },
    { label: "Edit", onClick: (row) => console.log("Edit", row) },
  ]

  // Define columns for expenses table
  const expenseColumns: TableColumn[] = [
    { key: "description", label: "DESCRIPTION", type: "string", sortable: true },
    { key: "category", label: "CATEGORY", type: "string", sortable: true },
    { key: "amount", label: "AMOUNT", type: "currency", sortable: true },
    { key: "date", label: "DATE", type: "date", sortable: true },
    { key: "client", label: "CLIENT", type: "string", sortable: true },
    { key: "actions", label: "ACTIONS", type: "actions", sortable: false },
  ]

  // Define actions for expenses
  const expenseActions: TableAction[] = [
    { label: "Edit", onClick: (row) => console.log("Edit", row) },
    { label: "Delete", onClick: (row) => console.log("Delete", row), className: styles.deleteLink },
  ]

  // Define columns for payment status table
 const paymentStatusColumns: TableColumn[] = [
  { key: "client", label: "CLIENT", type: "string", sortable: true },
  { 
    key: "total", 
    label: "TOTAL", 
    type: "currency", 
    sortable: true,
    render: (value) => <span className={styles.totalAmount}>{formatCurrency(value)}</span>
  },
  { 
    key: "paid", 
    label: "PAID", 
    type: "currency", 
    sortable: true,
    render: (value) => <span className={styles.paidAmount}>{formatCurrency(value)}</span>
  },
  { 
    key: "pending", 
    label: "PENDING", 
    type: "currency", 
    sortable: true,
    render: (value) => <span className={styles.pendingAmount}>{formatCurrency(value)}</span>
  },
  { 
    key: "overdue", 
    label: "OVERDUE", 
    type: "currency", 
    sortable: true,
    render: (value) => <span className={styles.overdueAmount}>{formatCurrency(value)}</span>
  },
]

  const renderInvoicesTab = () => (
    <ReusableTable
      data={sampleInvoices}
      columns={invoiceColumns}
      actions={invoiceActions}
      pageSize={5}
      searchPlaceholder="Search invoices..."
    />
  )

  const renderExpensesTab = () => (
    <>
    <div className={styles.expenseSection}>
      <div className={styles.expensesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Expenses</h2>
          <button className={styles.addButton}>
            <span className={styles.plusIcon}>+</span>
            Add Expense
          </button>
        </div>
        <ReusableTable
          data={sampleExpenses}
          columns={expenseColumns}
          actions={expenseActions}
          pageSize={5}
          searchPlaceholder="Search expenses..."
        />
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
        <ReusableTable data={paymentStatusData} columns={paymentStatusColumns} pageSize={10} searchable={false} />
      </div>
    </>
  )

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Billing & Invoices</h1>
          <div className={styles.headerActions}>
            <button className={styles.createButton}>
              <span className={styles.plusIcon}>+</span>
              Create Invoice
            </button>
            <div className={styles.rightActions}>
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
          <div className={styles.tabsContainer}>
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
            <div className={styles.divider}></div>
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