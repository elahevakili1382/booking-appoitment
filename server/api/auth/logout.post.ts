import { getDb } from '../../db'
import { endDemoSession } from '../../utils/demo'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'lumina_session')
  if (token) {
    getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token)
  }
  deleteCookie(event, 'lumina_session', { path: '/' })
  // خروج از نشست نمایشی: فقط کوکی دمو پاک می‌شود
  endDemoSession(event)
  return { ok: true }
})
