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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const conn = await createConnection()
    
    // Get system logs with pagination
    const [logs]: any = await conn.execute(`
      SELECT 
        l.id,
        l.user_id,
        u.username,
        l.action,
        l.details,
        l.created_at
      FROM system_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset])

    const [total]: any = await conn.execute('SELECT COUNT(*) as count FROM system_logs')

    await conn.end()

    return NextResponse.json({
      logs,
      total: total[0].count,
      pages: Math.ceil(total[0].count / limit)
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

