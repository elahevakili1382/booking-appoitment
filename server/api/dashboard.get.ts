import { getDb } from '../db'
import { getCalendarForDate, readStore } from '../utils/compatStore'
import { tehranToday } from '../utils/dates'
import { requireUser, ownStaffIds, STAFF_ROLES } from '../utils/auth'

export default defineEventHandler((event) => {
  const user = requireUser(event, STAFF_ROLES)
  const isStaff = user.role === 'staff'

  const query = getQuery(event)
  const date = String(query.date || tehranToday())
  getDb()
  const store = readStore()
  let calendarSlots = getCalendarForDate(date)
  let allBookings = store.bookings
  let customers = store.customers
  let staffLinked = true

  // پزشک/پرسنل: فقط داده‌های مرتبط با خودش؛ بدون اتصال حساب به پرسنل، هیچ‌چیز
  if (isStaff) {
    const mine = ownStaffIds(user.id)
    staffLinked = mine.length > 0
    const db = getDb()
    const ids = mine.length
      ? new Set(
          (
            db
              .prepare(`SELECT id FROM bookings WHERE staff_id IN (${mine.map(() => '?').join(',')})`)
              .all(...mine) as Array<{ id: string }>
          ).map((r) => r.id),
        )
      : new Set<string>()
    allBookings = allBookings.filter((b) => ids.has(b.id))
    calendarSlots = calendarSlots.filter((s) => mine.includes(s.staffId))
    const phones = new Set(allBookings.map((b) => b.phone))
    customers = customers.filter((c) => phones.has(c.phone))
  }

  const dayBookings = allBookings.filter((b) => b.date === date)

  const db = getDb()
  const monthPrefix = date.slice(0, 7)
  const revenueMonth = isStaff
    ? 0
    : (
        db
          .prepare(
            `SELECT COALESCE(SUM(total),0) AS s FROM bookings
         WHERE status NOT IN ('cancelled','no_show') AND starts_at LIKE ?`,
          )
          .get(`${monthPrefix}%`) as { s: number }
      ).s

  const newCustomers = isStaff
    ? 0
    : (db.prepare(`SELECT COUNT(*) AS c FROM customers WHERE created_at LIKE ?`).get(`${date}%`) as { c: number }).c

  const cancelled = dayBookings.filter((b) => b.status === 'cancelled').length

  return {
    ok: true,
    data: {
      viewDate: date,
      today: tehranToday(),
      // فقط برای نقش staff: آیا حساب به یک پزشک/پرسنل متصل است؟
      ...(isStaff ? { staffLink: { linked: staffLinked } } : {}),
      stats: {
        ...store.stats,
        ...(isStaff
          ? { revenueToday: 0, weekAppointments: allBookings.filter((b) => b.status !== 'cancelled').length }
          : {}),
        appointmentsToday: calendarSlots.length,
        revenueMonth,
        newCustomers,
        cancelRate: dayBookings.length ? cancelled / dayBookings.length : 0,
      },
      bookings: allBookings,
      dayBookings,
      services: store.services,
      doctors: store.doctors,
      customers,
      calendarSlots,
      availability: store.availability,
      kpiSeries: isStaff ? [] : buildKpiSeries(),
    },
  }
})

function buildKpiSeries() {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT substr(starts_at, 1, 10) AS d, SUM(total) AS revenue, COUNT(*) AS count
       FROM bookings WHERE status NOT IN ('cancelled','no_show')
       GROUP BY substr(starts_at, 1, 10)
       ORDER BY d DESC LIMIT 14`,
    )
    .all() as Array<{ d: string; revenue: number; count: number }>
  return rows.reverse()
}
