import { getDb } from '../../db'
import { canCancelBooking, getCancelBeforeHours, hasConflict } from '../../utils/bookingEngine'
import { toUtcIso } from '../../db'

/**
 * PATCH /api/bookings/:id — تغییر وضعیت / جابجایی با چک تداخل و سیاست لغو
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const body = await readBody<{
    status?: string
    staffId?: string
    date?: string
    time?: string
    startsAt?: string
    endsAt?: string
    notes?: string
  }>(event)

  const db = getDb()
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Booking not found' })

  if (body.status === 'cancelled') {
    const hours = getCancelBeforeHours()
    if (!canCancelBooking(String(row.starts_at), hours)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cancel only allowed until ${hours}h before appointment`,
      })
    }
    db.prepare(`UPDATE bookings SET status = 'cancelled', cancelled_at = ? WHERE id = ?`).run(
      new Date().toISOString(),
      id,
    )
    return { ok: true, data: { id, status: 'cancelled' } }
  }

  const staffId = body.staffId || String(row.staff_id)
  let startsAt = body.startsAt || String(row.starts_at)
  let endsAt = body.endsAt || String(row.ends_at)

  if (body.date && body.time) {
    const svc = db.prepare('SELECT duration FROM services WHERE id = ?').get(row.service_id) as { duration: number }
    const [hh, mm] = body.time.split(':').map(Number)
    startsAt = toUtcIso(body.date, hh, mm)
    endsAt = toUtcIso(body.date, hh, mm, svc.duration)
  }

  if (hasConflict(staffId, startsAt, endsAt, id)) {
    throw createError({ statusCode: 409, statusMessage: 'Time slot conflict' })
  }

  db.prepare(
    `UPDATE bookings SET staff_id = ?, starts_at = ?, ends_at = ?, status = COALESCE(?, status), notes = COALESCE(?, notes)
     WHERE id = ?`,
  ).run(staffId, startsAt, endsAt, body.status ?? null, body.notes ?? null, id)

  return { ok: true, data: { id, staffId, startsAt, endsAt, status: body.status || row.status } }
})
