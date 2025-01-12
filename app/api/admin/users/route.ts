import { NextResponse } from 'next/server'
import { createConnection } from '@/lib/db'
import { getCurrentUser } from '@/lib/actions/user'

export async function GET(request: Request) {
  try {
    const admin = await getCurrentUser()
    if (!admin?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    const conn = await createConnection()
    
    // Get total count for pagination
    const [countResult]: any = await conn.execute(
      `SELECT COUNT(*) as total FROM users 
       WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`]
    )
    
    // Get users with pagination and search
    const [users]: any = await conn.execute(
      `SELECT id, username, email, full_name, created_at, is_admin, 
       (SELECT COUNT(*) FROM transactions WHERE user_id = users.id) as transaction_count
       FROM users 
       WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`, limit, offset]
    )

    await conn.end()

    return NextResponse.json({
      users,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getCurrentUser()
    if (!admin?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, isAdmin, isActive } = await request.json()
    
    const conn = await createConnection()
    
    await conn.execute(
      'UPDATE users SET is_admin = ?, is_active = ? WHERE id = ?',
      [isAdmin, isActive, userId]
    )

    await conn.end()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

