import { getDb, newId } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireUser(event, ['admin', 'receptionist'])
  const body = await readBody<{
    timezone?: string
    days?: Array<{ ranges: Array<{ start: string; end: string }> }>
  }>(event)
  const db = getDb()

  if (body.timezone) {
    db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('timezone', ?)`).run(body.timezone)
  }

  if (body.days) {
    const staff = db.prepare('SELECT id FROM staff').all() as Array<{ id: string }>
    db.prepare('DELETE FROM shifts').run()
    const insert = db.prepare(
      `INSERT INTO shifts (id, staff_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?, ?)`,
    )
    body.days.forEach((day, weekday) => {
      for (const s of staff) {
        day.ranges.forEach((r, idx) => {
          insert.run(`${s.id}-${weekday}-${idx}`, s.id, weekday, r.start, r.end)
        })
      }
    })
  }

  return { ok: true }
})
