import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

const expenseCategories = [
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'housing', label: 'Housing' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other_expense', label: 'Other Expense' }
]

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conn = await createConnection()
    
    // Get current month's transactions grouped by category with budget limits
    // Only include expense categories
    const [rows]: any = await conn.execute(`
      SELECT 
        COALESCE(t.category, bl.category) as category,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as spent,
        COALESCE(bl.limit_amount, 0) as budget_limit
      FROM budget_limits bl
      LEFT JOIN transactions t ON bl.category = t.category 
        AND t.user_id = bl.user_id
        AND MONTH(t.date) = MONTH(CURRENT_DATE())
        AND YEAR(t.date) = YEAR(CURRENT_DATE())
      WHERE bl.user_id = ?
        AND bl.category IN (${expenseCategories.map(cat => `'${cat.value}'`).join(',')})
      GROUP BY COALESCE(t.category, bl.category)`,
      [user.id]
    )

    // Calculate totals
    const totalSpent = rows.reduce((sum: number, row: any) => sum + Number(row.spent), 0)
    const totalBudget = rows.reduce((sum: number, row: any) => sum + Number(row.budget_limit), 0)

    await conn.end()

    return NextResponse.json({
      categories: rows,
      totals: {
        spent: totalSpent,
        budget: totalBudget
      }
    })
  } catch (error) {
    console.error('Error fetching budget overview:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

