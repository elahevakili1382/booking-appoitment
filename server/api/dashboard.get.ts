import { getDb } from '../db'
import { getCalendarForDate, readStore } from '../utils/db'
import { tehranToday } from '../utils/dates'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const date = String(query.date || tehranToday())
  getDb()
  const store = readStore()
  const calendarSlots = getCalendarForDate(date)
  const dayBookings = store.bookings.filter((b) => b.date === date)

  const db = getDb()
  const monthPrefix = date.slice(0, 7)
  const revenueMonth = (
    db
      .prepare(
        `SELECT COALESCE(SUM(total),0) AS s FROM bookings
         WHERE status NOT IN ('cancelled','no_show') AND starts_at LIKE ?`,
      )
      .get(`${monthPrefix}%`) as { s: number }
  ).s

  const newCustomers = (
    db.prepare(`SELECT COUNT(*) AS c FROM customers WHERE created_at LIKE ?`).get(`${date}%`) as { c: number }
  ).c

  const cancelled = dayBookings.filter((b) => b.status === 'cancelled').length

  return {
    ok: true,
    data: {
      viewDate: date,
      today: tehranToday(),
      stats: {
        ...store.stats,
        appointmentsToday: calendarSlots.length,
        revenueMonth,
        newCustomers,
        cancelRate: dayBookings.length ? cancelled / dayBookings.length : 0,
      },
      bookings: store.bookings,
      dayBookings,
      services: store.services,
      doctors: store.doctors,
      customers: store.customers,
      calendarSlots,
      availability: store.availability,
      kpiSeries: buildKpiSeries(),
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
