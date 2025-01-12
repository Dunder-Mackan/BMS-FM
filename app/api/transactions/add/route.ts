import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date, type, category, amount, description } = await req.json()
    
    // Validate required fields
    if (!date || !type || !category || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const conn = await createConnection()

    try {
      await conn.execute(
        'INSERT INTO transactions (user_id, date, type, category, amount, description) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, date, type, category, amount, description]
      )

      await conn.end()
      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database error', details: dbError }, { status: 500 })
    }
  } catch (error) {
    console.error('Error adding transaction:', error)
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

