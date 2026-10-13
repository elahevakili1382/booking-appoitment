import { getDb } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  requireUser(event, ['admin'])
  const rows = getDb().prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>
  return { ok: true, data: Object.fromEntries(rows.map((r) => [r.key, r.value])) }
})
