/**
 * Customers CRUD-ish list for dashboard
 */
import { getDb } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  requireUser(event, ['admin', 'receptionist'])
  const rows = getDb().prepare('SELECT * FROM customers ORDER BY created_at DESC').all()
  return { ok: true, data: rows }
})
