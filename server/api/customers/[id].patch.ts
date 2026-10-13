import { getDb } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireUser(event, ['admin', 'receptionist'])
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ notes?: string; allergy?: string; tag?: string; name?: string }>(event)
  getDb()
    .prepare(
      `UPDATE customers SET
        notes = COALESCE(?, notes),
        allergy = COALESCE(?, allergy),
        tag = COALESCE(?, tag),
        name = COALESCE(?, name)
       WHERE id = ?`,
    )
    .run(body.notes ?? null, body.allergy ?? null, body.tag ?? null, body.name ?? null, id)
  return { ok: true }
})
