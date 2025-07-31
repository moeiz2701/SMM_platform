"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import styles from "../../../styling/budgets.module.css"
import { Eye, TrendingUp, DollarSign } from "lucide-react"
import API_ROUTES from "@/app/apiRoutes"
import type { AdBudget } from "@/types/adBudget"

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState<AdBudget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBudgets()
  }, [])

 const fetchBudgets = async () => {
  try {
    setLoading(true)
    const response = await fetch(API_ROUTES.AD_BUDGET.GET_ALL, {
      method: 'GET',
      credentials: 'include', // Send cookies
    })

    const data = await response.json()
    setBudgets(data.data || data)
  } catch (err: any) {
    setError(err.message || "Failed to fetch budgets")
    console.error("Error fetching budgets:", err)
  } finally {
    setLoading(false)
  }
}

  const calculateUtilization = (budget: AdBudget) => {
    const totalSpent = budget.budgetAllocation.reduce((sum, allocation) => sum + allocation.spentAmount, 0)
    return budget.totalBudget > 0 ? Math.round((totalSpent / budget.totalBudget) * 100) : 0
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "#ef4444"
    if (utilization >= 70) return "#f59e0b"
    return "#10b981"
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.totalBudget, 0)
  const totalSpent = budgets.reduce(
    (sum, budget) =>
      sum + budget.budgetAllocation.reduce((allocSum, allocation) => allocSum + allocation.spentAmount, 0),
    0,
  )
  const totalRemaining = totalBudget - totalSpent

  if (loading) {
    return (
      <div className={styles.budgetsPage}>
        <div className={styles.loading}>Loading budgets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.budgetsPage}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchBudgets} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.budgetsPage}>
      <div className={styles.header}>
        <h1>Budget Management</h1>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <DollarSign size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Budget</h3>
            <p>${totalBudget.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Spent</h3>
            <p>${totalSpent.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <DollarSign size={24} />
          </div>
          <div className={styles.cardContent}>
            <h3>Remaining</h3>
            <p>${totalRemaining.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className={styles.budgetsList}>
        {budgets.map((budget) => {
          const utilization = calculateUtilization(budget)
          const totalSpent = budget.budgetAllocation.reduce((sum, allocation) => sum + allocation.spentAmount, 0)
          const remaining = budget.totalBudget - totalSpent

          return (
            <div key={budget._id} className={styles.budgetCard}>
              <div className={styles.budgetHeader}>
                <div>
                  <h3>Campaign Budget</h3>
                  <p className={styles.budgetId}>Campaign: {budget.campaign.name}</p>
                  <span className={styles.currency}>{budget.currency}</span>
                </div>
                <Link href={`/manager/budgets/${budget._id}`} className={styles.viewButton}>
                  <Eye size={16} />
                  View Details
                </Link>
              </div>

              <div className={styles.budgetOverview}>
                <div className={styles.budgetStat}>
                  <span className={styles.statLabel}>Total Budget</span>
                  <span className={styles.statValue}>${budget.totalBudget.toLocaleString()}</span>
                </div>
                <div className={styles.budgetStat}>
                  <span className={styles.statLabel}>Spent</span>
                  <span className={styles.statValue}>${totalSpent.toLocaleString()}</span>
                </div>
                <div className={styles.budgetStat}>
                  <span className={styles.statLabel}>Remaining</span>
                  <span className={styles.statValue}>${remaining.toLocaleString()}</span>
                </div>
                <div className={styles.budgetStat}>
                  <span className={styles.statLabel}>Utilization</span>
                  <span className={styles.statValue} style={{ color: getUtilizationColor(utilization) }}>
                    {utilization}%
                  </span>
                </div>
              </div>

              <div className={styles.utilizationBar}>
                <div
                  className={styles.utilizationFill}
                  style={{
                    width: `${utilization}%`,
                    backgroundColor: getUtilizationColor(utilization),
                  }}
                ></div>
              </div>

              <div className={styles.platformBreakdown}>
                <h4>Platform Breakdown</h4>
                <div className={styles.platforms}>
                  {budget.budgetAllocation.map((allocation) => (
                    <div key={allocation._id} className={styles.platformItem}>
                      <div className={styles.platformInfo}>
                        <span className={styles.platformName}>{allocation.platform}</span>
                        <span className={styles.platformBudget}>
                          ${allocation.spentAmount.toLocaleString()} / ${allocation.allocatedAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.platformProgress}>
                        <div
                          className={styles.platformProgressFill}
                          style={{
                            width: `${allocation.allocatedAmount > 0 ? (allocation.spentAmount / allocation.allocatedAmount) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <div className={styles.dailyLimit}>Daily Limit: ${allocation.dailyLimit.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {budgets.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No budgets found</p>
        </div>
      )}
    </div>
  )
}

export default BudgetsPage
