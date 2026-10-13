import { setSetting } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireUser(event, ['admin'])
  const body = await readBody<Record<string, string>>(event)
  for (const [k, v] of Object.entries(body || {})) {
    setSetting(k, String(v))
  }
  return { ok: true }
})
