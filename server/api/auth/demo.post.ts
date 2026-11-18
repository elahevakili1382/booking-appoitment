import { getDb, newId } from '../../db'
import { clientIp, rateLimit } from '../../utils/rateLimit'
import { DEMO_PHONE, DEMO_SESSION_HOURS, DEMO_USER_ID, isDemoEnabled } from '../../utils/demo'

/**
 * POST /api/auth/demo — ورود نمایشی فقط‌خواندنی (فقط با NUXT_PUBLIC_DEMO=true).
 * کاربر نمایشی نقش receptionist دارد (برای خواندن داشبورد)، ولی middleware/demo-readonly.ts
 * هر درخواست نوشتن را برای او رد می‌کند.
 */
export default defineEventHandler((event) => {
  if (!isDemoEnabled()) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  rateLimit(event, `demo-login-ip:${clientIp(event)}`, 30, 10 * 60_000)

  const db = getDb()
  const now = new Date().toISOString()

  db.prepare(
    `INSERT OR IGNORE INTO users (id, phone, name, role, created_at) VALUES (?, ?, 'Demo', 'receptionist', ?)`,
  ).run(DEMO_USER_ID, DEMO_PHONE, now)
  // اگر نقش دستکاری شده بود، به مقدار ثابت برگردد
  db.prepare(`UPDATE users SET role = 'receptionist' WHERE id = ?`).run(DEMO_USER_ID)
  db.prepare(`DELETE FROM sessions WHERE user_id = ? AND expires_at < ?`).run(DEMO_USER_ID, now)

  const token = newId()
  const maxAge = DEMO_SESSION_HOURS * 3600
  db.prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)`).run(
    token,
    DEMO_USER_ID,
    new Date(Date.now() + maxAge * 1000).toISOString(),
  )

  setCookie(event, 'lumina_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge,
  })

  return { ok: true, user: { id: DEMO_USER_ID, name: 'Demo', role: 'receptionist', demo: true } }
})
