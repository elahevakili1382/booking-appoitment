import { getDb } from '../db'

export const STAFF_ROLES = ['admin', 'receptionist', 'staff']
export const OPS_ROLES = ['admin', 'receptionist']

export function getSessionUser(event: Parameters<typeof getCookie>[0]) {
  const token = getCookie(event, 'lumina_session')
  if (token) {
    const db = getDb()
    const row = db
      .prepare(
        `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
      )
      .get(token, new Date().toISOString()) as Record<string, unknown> | undefined
    if (row) return row
  }
  // فقط اگر کاربر واقعی نبود: نشست نمایشی فقط‌خواندنی که middleware/demo-session.ts تأیید کرده است.
  return (event.context as { demoUser?: Record<string, unknown> }).demoUser ?? null
}

export function requireUser(event: Parameters<typeof getCookie>[0], roles?: string[]) {
  const user = getSessionUser(event)
  if (!user) {
    // دور زدن لاگین فقط در dev و فقط با فعال‌سازی صریح؛ در production هرگز
    if (import.meta.dev && process.env.LUMINA_DEV_AUTH_BYPASS === '1') {
      return { id: 'dev-admin', phone: '09120000000', name: 'Dev Admin', role: 'admin' }
    }
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (roles && !roles.includes(String(user.role))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return user
}

/** شناسه‌ی پرسنلی که به این حساب وصل‌اند (staff.user_id). بدون اتصال: لیست خالی = بدون دسترسی. */
export function ownStaffIds(userId: unknown): string[] {
  const rows = getDb().prepare('SELECT id FROM staff WHERE user_id = ?').all(String(userId)) as Array<{ id: string }>
  return rows.map((r) => r.id)
}

/** مالکیت رزرو فقط از اتصال سمت سرور: bookings.customer_id → customers.user_id */
export function userOwnsBooking(userId: unknown, booking: Record<string, unknown>) {
  if (!booking.customer_id) return false
  const row = getDb()
    .prepare('SELECT 1 AS ok FROM customers WHERE id = ? AND user_id = ?')
    .get(String(booking.customer_id), String(userId))
  return Boolean(row)
}
