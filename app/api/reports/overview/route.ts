import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const conn = await createConnection()
    
    // Get financial overview for the specified period
    const [rows]: any = await conn.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as period,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses,
        SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END) as savings
      FROM transactions 
      WHERE user_id = ?
        AND date BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY period`,
      [user.id, startDate, endDate]
    )

    await conn.end()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching report overview:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

