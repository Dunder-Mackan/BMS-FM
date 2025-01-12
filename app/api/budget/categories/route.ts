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
    
    // Get budget categories with their limits and current spending
    const [rows]: any = await conn.execute(`
      SELECT 
        t.category,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as spent,
        COALESCE(MAX(b.limit), 0) as budget_limit
      FROM transactions t
      LEFT JOIN budget_limits b ON t.category = b.category AND b.user_id = ?
      WHERE t.user_id = ?
      AND MONTH(t.date) = MONTH(CURRENT_DATE())
      AND YEAR(t.date) = YEAR(CURRENT_DATE())
      GROUP BY t.category`,
      [user.id, user.id]
    )

    await conn.end()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching budget categories:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

