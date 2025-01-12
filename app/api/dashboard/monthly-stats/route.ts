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

    // Get monthly totals for the current year
    const [rows]: any = await conn.execute(`
      SELECT 
        DATE_FORMAT(date, '%b') as month,
        DATE_FORMAT(date, '%m') as month_num,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses
      FROM transactions 
      WHERE user_id = ? 
        AND YEAR(date) = YEAR(CURRENT_DATE())
      GROUP BY DATE_FORMAT(date, '%b'), DATE_FORMAT(date, '%m')
      ORDER BY month_num`,
      [user.id]
    )

    // Create an array of all months with default values
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    // Fill in the data for each month
    const monthlyData = months.map(month => {
      const monthData = rows.find((row: any) => row.month === month) || {
        income: 0,
        expenses: 0
      }
      return {
        name: month,
        income: Number(monthData.income) || 0,
        expenses: Number(monthData.expenses) || 0
      }
    })

    await conn.end()
    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

