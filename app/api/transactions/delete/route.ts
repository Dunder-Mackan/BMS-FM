import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()
    
    const conn = await createConnection()

    // Verify the transaction belongs to the user before deleting
    const [existing]: any = await conn.execute(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [id, user.id]
    )

    if (!existing || existing.length === 0) {
      await conn.end()
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Delete the transaction
    await conn.execute(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, user.id]
    )

    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

