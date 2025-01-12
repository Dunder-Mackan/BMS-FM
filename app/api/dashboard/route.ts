import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conn = await createConnection()

    // Get current month's data
    const [currentMonthData]: any = await conn.execute(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as total_balance,
        SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END) as savings
      FROM transactions 
      WHERE user_id = ? 
      AND MONTH(date) = MONTH(CURRENT_DATE()) 
      AND YEAR(date) = YEAR(CURRENT_DATE())`,
      [user.id]
    )

    // Get previous month's data
    const [previousMonthData]: any = await conn.execute(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as total_balance,
        SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END) as savings
      FROM transactions 
      WHERE user_id = ? 
      AND MONTH(date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND YEAR(date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))`,
      [user.id]
    )

    // Calculate current month values
    const currentIncome = currentMonthData[0].income || 0
    const currentExpenses = currentMonthData[0].expenses || 0
    const currentBalance = currentMonthData[0].total_balance || 0
    const currentSavings = currentMonthData[0].savings || 0

    // Calculate previous month values
    const previousIncome = previousMonthData[0].income || 0
    const previousExpenses = previousMonthData[0].expenses || 0
    const previousBalance = previousMonthData[0].total_balance || 0
    const previousSavings = previousMonthData[0].savings || 0

    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / Math.abs(previous)) * 100
    }

    const balanceChange = calculatePercentageChange(currentBalance, previousBalance)
    const incomeChange = calculatePercentageChange(currentIncome, previousIncome)
    const expensesChange = calculatePercentageChange(currentExpenses, previousExpenses)
    const savingsChange = calculatePercentageChange(currentSavings, previousSavings)

    await conn.end()

    return NextResponse.json({
      totalBalance: currentBalance,
      monthlyIncome: currentIncome,
      monthlyExpenses: currentExpenses,
      netSavings: currentSavings,
      changes: {
        balance: balanceChange,
        income: incomeChange,
        expenses: expensesChange,
        savings: savingsChange
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

