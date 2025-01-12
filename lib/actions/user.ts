'use server'

import { createConnection } from '@/lib/db'
import { cookies } from 'next/headers'

export type User = {
  id: number
  username: string
  full_name: string
  email: string
  created_at: string
  profile_picture: string | null
  is_admin: boolean
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get('auth_token')

    if (!userId) {
      return null
    }

    const conn = await createConnection()
    const [rows]: any = await conn.execute(
      'SELECT id, username, full_name, email, created_at, profile_picture, is_admin FROM users WHERE id = ?',
      [userId.value]
    )

    await conn.end()

    if (rows.length === 0) {
      return null
    }

    return rows[0] as User
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function updateProfilePicture(userId: number, pictureUrl: string): Promise<boolean> {
  try {
    const conn = await createConnection()
    await conn.execute(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [pictureUrl, userId]
    )
    await conn.end()
    return true
  } catch (error) {
    console.error('Error updating profile picture:', error)
    return false
  }
}

