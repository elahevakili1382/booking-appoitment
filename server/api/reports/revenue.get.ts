import { getDb } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  requireUser(event, ['admin', 'receptionist'])
  const db = getDb()
  const byService = db
    .prepare(
      `SELECT s.title_fa AS name, SUM(b.total) AS revenue, COUNT(*) AS count
       FROM bookings b JOIN services s ON s.id = b.service_id
       WHERE b.status NOT IN ('cancelled','no_show')
       GROUP BY s.id ORDER BY revenue DESC`,
    )
    .all()
  const byStaff = db
    .prepare(
      `SELECT st.name_fa AS name, SUM(b.total) AS revenue, COUNT(*) AS count
       FROM bookings b JOIN staff st ON st.id = b.staff_id
       WHERE b.status NOT IN ('cancelled','no_show')
       GROUP BY st.id ORDER BY revenue DESC`,
    )
    .all()

  const format = getQuery(event).format
  if (format === 'csv') {
    const lines = ['type,name,revenue,count']
    for (const r of byService as Array<Record<string, unknown>>) {
      lines.push(`service,${r.name},${r.revenue},${r.count}`)
    }
    for (const r of byStaff as Array<Record<string, unknown>>) {
      lines.push(`staff,${r.name},${r.revenue},${r.count}`)
    }
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', 'attachment; filename="lumina-report.csv"')
    return lines.join('\n')
  }

  return { ok: true, data: { byService, byStaff } }
})
