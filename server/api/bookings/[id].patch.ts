import { getDb } from '../../db'
import { canCancelBooking, getCancelBeforeHours, hasConflict } from '../../utils/bookingEngine'
import { toUtcIso } from '../../db'
import { requireUser, ownStaffIds, userOwnsBooking } from '../../utils/auth'

const STATUSES = ['confirmed', 'pending', 'completed', 'cancelled', 'no_show']
const STAFF_FIELDS = ['status', 'notes']
const CUSTOMER_FIELDS = ['status']

/**
 * PATCH /api/bookings/:id
 * - admin / receptionist: همه تغییرات (وضعیت، جابجایی، یادداشت)
 * - staff (پزشک): فقط رزروهای خودش و فقط وضعیت/یادداشت (بدون جابجایی یا تغییر پزشک)
 * - customer: فقط لغو رزرو متعلق به خودش، طبق سیاست لغو
 * مالکیت فقط از داده‌ی سمت سرور (نشست و اتصال customers.user_id) بررسی می‌شود.
 */
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const role = String(user.role)
  const isOps = role === 'admin' || role === 'receptionist'
  const isStaff = role === 'staff'
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const body =
    (await readBody<{
      status?: string
      staffId?: string
      date?: string
      time?: string
      startsAt?: string
      endsAt?: string
      notes?: string
    }>(event)) || {}

  if (body.status !== undefined && !STATUSES.includes(String(body.status))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status' })
  }

  const db = getDb()
  const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Booking not found' })

  const keys = Object.keys(body).filter((k) => (body as Record<string, unknown>)[k] !== undefined)

  if (!isOps) {
    if (isStaff) {
      if (!ownStaffIds(user.id).includes(String(row.staff_id)) || keys.some((k) => !STAFF_FIELDS.includes(k))) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
      }
    } else if (
      role !== 'customer' ||
      !userOwnsBooking(user.id, row) ||
      body.status !== 'cancelled' ||
      keys.some((k) => !CUSTOMER_FIELDS.includes(k))
    ) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
  }

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
    const [hh = 0, mm = 0] = body.time.split(':').map(Number)
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
