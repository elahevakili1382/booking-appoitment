import { readStore } from '../../utils/db'
import { getDb } from '../../db'
import { requireUser, ownStaffIds, STAFF_ROLES } from '../../utils/auth'

export default defineEventHandler((event) => {
  // شامل نام و تلفن بیماران است؛ فقط برای کارکنان
  const user = requireUser(event, STAFF_ROLES)
  const store = readStore()

  if (user.role !== 'staff') {
    return { ok: true, data: store.bookings }
  }

  // پزشک/پرسنل: فقط رزروهای خودش؛ بدون اتصال حساب به پرسنل، هیچ‌چیز
  const mine = ownStaffIds(user.id)
  if (!mine.length) return { ok: true, data: [] }
  const placeholders = mine.map(() => '?').join(',')
  const ids = new Set(
    (getDb().prepare(`SELECT id FROM bookings WHERE staff_id IN (${placeholders})`).all(...mine) as Array<{ id: string }>).map(
      (r) => r.id,
    ),
  )
  return { ok: true, data: store.bookings.filter((b) => ids.has(b.id)) }
})
