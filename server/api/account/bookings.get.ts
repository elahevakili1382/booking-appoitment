import { getDb } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  const user = requireUser(event)
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT b.*, s.title_fa AS service_title, st.name_fa AS staff_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN staff st ON st.id = b.staff_id
       WHERE b.phone = ?
       ORDER BY b.starts_at DESC`,
    )
    .all(user.phone) as Array<Record<string, unknown>>

  return { ok: true, data: rows }
})
