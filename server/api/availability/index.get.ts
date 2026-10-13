import { getDb } from '../../db'
import { buildDurationSlots } from '../../utils/bookingEngine'
import { readStore } from '../../utils/db'
import { tehranToday } from '../../utils/dates'

/**
 * GET /api/availability?date=&serviceId=&staffId=
 */
export default defineEventHandler((event) => {
  const query = getQuery(event)
  const date = String(query.date || '')
  if (!date) {
    return { ok: true, data: readStore().availability }
  }

  const serviceId = String(query.serviceId || 'consult')
  const staffId = query.staffId ? String(query.staffId) : 'any'
  const slots = buildDurationSlots({ date, serviceId, staffId: staffId as 'any' | string })

  return {
    ok: true,
    date,
    today: tehranToday(),
    serviceId,
    staffId,
    slots: slots.map((s) => ({
      time: s.time,
      taken: s.taken,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
      staffId: s.staffId,
    })),
  }
})
