import { getDb } from '../db'

export function getSessionUser(event: Parameters<typeof getCookie>[0]) {
  const token = getCookie(event, 'lumina_session')
  if (!token) return null
  const db = getDb()
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, new Date().toISOString()) as Record<string, unknown> | undefined
  return row || null
}

export function requireUser(event: Parameters<typeof getCookie>[0], roles?: string[]) {
  const user = getSessionUser(event)
  if (!user) {
    // در توسعه برای داشبورد/گزارش بدون لاگین
    if (import.meta.dev) {
      return { id: 'dev-admin', phone: '09120000000', name: 'Dev Admin', role: 'admin' }
    }
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (roles && !roles.includes(String(user.role))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}
