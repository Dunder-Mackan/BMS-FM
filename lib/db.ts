import mysql from 'mysql2/promise'

export async function createConnection() {
  return await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '980911',
    database: 'bmseconomy'
  })
}

