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
    
    // Get investment totals for the last 5 business days
    const [rows]: any = await conn.execute(`
      SELECT 
        DAYNAME(date) as name,
        SUM(amount) as value
      FROM transactions 
      WHERE user_id = ? 
        AND type = 'investment'
        AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        AND DAYOFWEEK(date) NOT IN (1, 7) -- Exclude weekends
      GROUP BY DATE(date), DAYNAME(date)
      ORDER BY DATE(date) DESC
      LIMIT 5
    `, [user.id])

    await conn.end()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching investment performance:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

