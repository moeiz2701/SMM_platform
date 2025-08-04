"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import styles from "../../../../styling/budgetDetails.module.css"
import { ArrowLeft, TrendingUp, DollarSign, Calendar } from "lucide-react"
import API_ROUTES from "@/app/apiRoutes"
import type { AdBudget } from "@/types/adBudget"

const BudgetDetailPage = () => {
  const params = useParams()
  const [budget, setBudget] = useState<AdBudget | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const BudgetId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined

  useEffect(() => {
    if (BudgetId) {
      fetchBudget()
    }
  }, [BudgetId])

const fetchBudget = async () => {
  try {
    setLoading(true)

    const response = await fetch(API_ROUTES.AD_BUDGET.GET(BudgetId!), {
      method: 'GET',
      credentials: 'include', // Important for cookies/session-based auth
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch budget')
    }

    setBudget(data.data || data)
  } catch (err: any) {
    setError(err.message || 'Failed to fetch budget')
    console.error('Error fetching budget:', err)
  } finally {
    setLoading(false)
  }
}


  if (loading) {
    return <div className={styles.loading}>Loading budget...</div>
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={fetchBudget} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  if (!budget) {
    return <div className={styles.loading}>Budget not found</div>
  }

  const totalSpent = budget.budgetAllocation.reduce((sum, allocation) => sum + allocation.spentAmount, 0)
  const remaining = budget.totalBudget - totalSpent
  const utilization = budget.totalBudget > 0 ? Math.round((totalSpent / budget.totalBudget) * 100) : 0

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "#ef4444"
    if (utilization >= 70) return "#f59e0b"
    return "#10b981"
  }

  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[month - 1] || `Month ${month}`
  }

  return (
    <div className={styles.budgetDetailPage}>
      <div className={styles.header}>
        <Link href="/manager/budgets" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Budgets
        </Link>
        <div className={styles.titleSection}>
          <h1>Budget Details</h1>
          <span className={styles.currency}>{budget.currency}</span>
        </div>
      </div>

      <div className={styles.overview}>
        <div className={styles.overviewCard}>
          <DollarSign size={24} />
          <div>
            <h3>Total Budget</h3>
            <p>${budget.totalBudget.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <TrendingUp size={24} />
          <div>
            <h3>Spent</h3>
            <p>${totalSpent.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <DollarSign size={24} />
          <div>
            <h3>Remaining</h3>
            <p>${remaining.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <Calendar size={24} />
          <div>
            <h3>Utilization</h3>
            <p style={{ color: getUtilizationColor(utilization) }}>{utilization}%</p>
          </div>
        </div>
      </div>

      <div className={styles.utilizationSection}>
        <h2>Budget Utilization</h2>
        <div className={styles.utilizationBar}>
          <div
            className={styles.utilizationFill}
            style={{
              width: `${utilization}%`,
              backgroundColor: getUtilizationColor(utilization),
            }}
          ></div>
        </div>
        <div className={styles.utilizationLabels}>
          <span>Spent: ${totalSpent.toLocaleString()}</span>
          <span>Remaining: ${remaining.toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Platform Allocation</h2>
          <div className={styles.platformTable}>
            <div className={styles.tableHeader}>
              <span>Platform</span>
              <span>Allocated</span>
              <span>Spent</span>
              <span>Daily Limit</span>
              <span>Utilization</span>
            </div>
            {budget.budgetAllocation.map((allocation) => {
              const platformUtilization =
                allocation.allocatedAmount > 0
                  ? Math.round((allocation.spentAmount / allocation.allocatedAmount) * 100)
                  : 0

              return (
                <div key={allocation._id} className={styles.tableRow}>
                  <span className={styles.platformName}>{allocation.platform}</span>
                  <span>${allocation.allocatedAmount.toLocaleString()}</span>
                  <span>${allocation.spentAmount.toLocaleString()}</span>
                  <span>${allocation.dailyLimit.toLocaleString()}</span>
                  <span style={{ color: getUtilizationColor(platformUtilization) }}>{platformUtilization}%</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Monthly Breakdown</h2>
          <div className={styles.monthlyChart}>
            {budget.monthlyBreakdown.map((month) => {
              const monthUtilization =
                month.allocatedAmount > 0 ? Math.round((month.spentAmount / month.allocatedAmount) * 100) : 0

              return (
                <div key={month._id} className={styles.monthItem}>
                  <div className={styles.monthHeader}>
                    <span className={styles.monthName}>
                      {getMonthName(month.month)} {month.year}
                    </span>
                    <span className={styles.monthAmount}>
                      ${month.spentAmount.toLocaleString()} / ${month.allocatedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.monthBar}>
                    <div className={styles.monthBarFill} style={{ width: `${monthUtilization}%` }}></div>
                  </div>
                  <div className={styles.monthUtilization}>{monthUtilization}% utilized</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Weekly Spending</h2>
          <div className={styles.weeklyChart}>
            {budget.weeklyBreakdown.map((week) => (
              <div key={week._id} className={styles.weekItem}>
                <span className={styles.weekName}>
                  Week {week.week}, {week.year}
                </span>
                <div className={styles.weekBar}>
                  <div
                    className={styles.weekBarFill}
                    style={{
                      height: `${
                        budget.weeklyBreakdown.length > 0
                          ? (week.spentAmount / Math.max(...budget.weeklyBreakdown.map((w) => w.spentAmount))) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className={styles.weekAmount}>${week.spentAmount}</span>
                <span className={styles.weekAllocated}>/ ${week.allocatedAmount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Budget Information</h2>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
  <span className={styles.infoLabel}>Campaign Name:</span>
  <span className={styles.infoValue}>{budget.campaign?.name}</span>
            </div>

            <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Objective:</span>
            <span className={styles.infoValue}>{budget.campaign?.objective}</span>
            </div>

            <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Start Date:</span>
            <span className={styles.infoValue}>
                {new Date(budget.campaign?.startDate).toLocaleDateString()}
            </span>
            </div>

            <div className={styles.infoRow}>
            <span className={styles.infoLabel}>End Date:</span>
            <span className={styles.infoValue}>
                {new Date(budget.campaign?.endDate).toLocaleDateString()}
            </span>
            </div>

            <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Status:</span>
            <span className={styles.infoValue}>{budget.campaign?.status}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Client ID:</span>
              <span className={styles.infoValue}>{budget.client}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Manager ID:</span>
              <span className={styles.infoValue}>{budget.manager}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Created:</span>
              <span className={styles.infoValue}>{new Date(budget.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Last Updated:</span>
              <span className={styles.infoValue}>{new Date(budget.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetDetailPage
