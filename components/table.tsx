"use client"

import type React from "react"
import { useState, useMemo } from "react"
import styles from "../styling/table.module.css"

// Types for the reusable table
export interface TableColumn {
  key: string
  label: string
  type?: "string" | "number" | "date" | "boolean" | "array" | "currency" | "status" | "actions"
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableAction {
  label: string
  onClick: (row: any) => void
  className?: string
  icon?: React.ReactNode
}

export interface ReusableTableProps {
  data: any[]
  columns: TableColumn[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  actions?: TableAction[]
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  emptyMessage?: string
  className?: string
}

export default function ReusableTable({
  data = [],
  columns,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = "Search...",
  actions = [],
  onRowClick,
  onEdit,
  onDelete,
  emptyMessage = "No data available",
  className = "",
}: ReusableTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (date: string | Date) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Get status class
  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "paid":
        return styles.statusPaid
      case "approved":
        return styles.statusPaid  
      case "pending":
        return styles.statusPending
      case "pending approval":
        return styles.statusPending  
      case "overdue":
        return styles.statusOverdue
      case "rejected":
        return styles.statusOverdue  
      case "draft":
        return styles.statusDraft
      case "cancelled":
        return styles.statusCancelled
      default:
        return styles.statusDraft
    }
  }

  // Render cell value based on type
  const renderCellValue = (value: any, column: TableColumn, row: any) => {
    if (column.render) {
      return column.render(value, row)
    }

    if (value === null || value === undefined) return "—"

    switch (column.type) {
      case "currency":
        return <span className={styles.amountCell}>{formatCurrency(Number(value))}</span>
      case "date":
        return <span className={styles.dateCell}>{formatDate(value)}</span>
      case "boolean":
        return <span className={styles.statusBadge}>{value ? "Yes" : "No"}</span>
      case "array":
        return Array.isArray(value) ? value.join(", ") : String(value)
      case "status":
        return <span className={`${styles.statusBadge} ${getStatusClass(String(value))}`}>{String(value)}</span>
      case "actions":
        return (
          <div className={styles.actionLinks}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(row)
                }}
                className={styles.editLink}
                title="Edit"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(row)
                }}
                className={styles.deleteLink}
                title="Delete"
              >
                Delete
              </button>
            )}
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick(row)
                }}
                className={action.className || styles.actionLink}
                title={action.label}
              >
                {action.icon ? action.icon : action.label}
              </button>
            ))}
          </div>
        )
      default:
        return String(value)
    }
  }

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(query)
      }),
    )
  }, [data, searchQuery, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const column = columns.find((col) => col.key === sortConfig.key)

      if (column?.type === "currency" || column?.type === "number") {
        const aNum = Number(aValue)
        const bNum = Number(bValue)
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum
      }

      if (column?.type === "date") {
        const aDate = new Date(aValue).getTime()
        const bDate = new Date(bValue).getTime()
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate
      }

      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()

      if (sortConfig.direction === "asc") {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }, [filteredData, sortConfig, columns])

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  // Handle sorting
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey)
    if (!column?.sortable) return

    setSortConfig((current) => {
      if (current?.key === columnKey) {
        return current.direction === "asc" ? { key: columnKey, direction: "desc" } : null
      }
      return { key: columnKey, direction: "asc" }
    })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Render pagination buttons
  const renderPaginationButtons = () => {
    const buttons = []

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

  return (
    <div className={className}>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={column.sortable ? styles.sortableHeader : ""}
                >
                  <div className={styles.headerContent}>
                    {column.label}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className={styles.sortIndicator}>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyMessage}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`${index % 2 === 0 ? styles.evenRow : ""} ${onRowClick ? styles.clickableRow : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={`${row.id || index}-${column.key}`}>{renderCellValue(row[column.key], column, row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <span className={styles.paginationText}>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
              {sortedData.length} results
            </span>
          </div>
          <div className={styles.paginationControls}>{renderPaginationButtons()}</div>
        </div>
      )}
    </div>
  )
}