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
    
    // Get the 5 most recent transactions
    const [rows]: any = await conn.execute(`
      SELECT 
        id,
        type,
        amount,
        description,
        created_at
      FROM transactions 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [user.id])

    await conn.end()
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

