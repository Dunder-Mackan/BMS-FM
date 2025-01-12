import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

export async function GET() {
  try {
    const admin = await getCurrentUser()
    if (!admin?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conn = await createConnection()
    
    // Get system statistics
    const [userStats]: any = await conn.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_30d,
        SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) as admin_count
      FROM users
    `)

    const [transactionStats]: any = await conn.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as transactions_24h,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income
      FROM transactions
    `)

    await conn.end()

    return NextResponse.json({
      users: userStats[0],
      transactions: transactionStats[0]
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

