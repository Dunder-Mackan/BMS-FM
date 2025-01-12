import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, date, type, category, amount, description } = await req.json()
    
    const conn = await createConnection()

    // Verify the transaction belongs to the user
    const [existing]: any = await conn.execute(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, user.id]
    )

    if (!existing || existing.length === 0) {
      await conn.end()
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update the transaction
    await conn.execute(
      'UPDATE transactions SET date = ?, type = ?, category = ?, amount = ?, description = ? WHERE id = ? AND user_id = ?',
      [date, type, category, amount, description, id, user.id]
    )

    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

