import { getDb } from '../../db'
import { sendSms } from '../../utils/sms'
import { requireUser } from '../../utils/auth'

/** یادآوری دستی نوبت‌های ۲۴ ساعت آینده (dev trigger) */
export default defineEventHandler(async (event) => {
  requireUser(event, ['admin', 'receptionist'])
  const db = getDb()
  const soon = new Date(Date.now() + 24 * 3600_000).toISOString()
  const now = new Date().toISOString()
  const rows = db
    .prepare(
      `SELECT code, phone, name, starts_at FROM bookings
       WHERE status = 'confirmed' AND starts_at > ? AND starts_at < ?`,
    )
    .all(now, soon) as Array<{ code: string; phone: string; name: string; starts_at: string }>

  for (const r of rows) {
    await sendSms(r.phone, `${r.name} عزیز، یادآوری نوبت لومینا ${r.code}`)
  }
  return { ok: true, sent: rows.length }
})
