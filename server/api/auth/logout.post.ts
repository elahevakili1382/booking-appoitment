import { getDb } from '../../db'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'lumina_session')
  if (token) {
    getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token)
  }
  deleteCookie(event, 'lumina_session', { path: '/' })
  return { ok: true }
})
