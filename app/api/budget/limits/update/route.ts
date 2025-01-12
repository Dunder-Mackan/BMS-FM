import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, limit } = await req.json()
    
    if (!category || !limit || limit <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const conn = await createConnection()

    // Upsert budget limit
    await conn.execute(`
      INSERT INTO budget_limits (user_id, category, limit_amount)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      limit_amount = VALUES(limit_amount)`,
      [user.id, category, limit]
    )

    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating budget limit:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

