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

    // Get current month's spending by category with better category handling
    const [rows]: any = await conn.execute(`
      SELECT 
        category,
        ABS(SUM(amount)) as total_amount
      FROM transactions 
      WHERE user_id = ? 
        AND type = 'expense'
        AND MONTH(date) = MONTH(CURRENT_DATE()) 
        AND YEAR(date) = YEAR(CURRENT_DATE())
      GROUP BY category
      HAVING total_amount > 0
      ORDER BY total_amount DESC`,
      [user.id]
    )

    // Calculate total expenses
    const totalExpenses = rows.reduce((sum: number, row: any) => sum + Number(row.total_amount), 0)

    // Calculate percentages and format response
    const categories = rows.map((row: any) => ({
      name: row.category,
      value: Number(((row.total_amount / totalExpenses) * 100).toFixed(1)),
      amount: row.total_amount
    }))

    await conn.end()

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching spending categories:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

