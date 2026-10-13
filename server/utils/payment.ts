/**
 * Payment adapter — زرین‌پال sandbox / mock
 */
import { getDb, newId } from '../db'

export async function createDepositPayment(bookingId: string, amount: number) {
  const db = getDb()
  const id = newId()
  const createdAt = new Date().toISOString()
  const authority = `SANDBOX-${id.slice(0, 8)}`
  db.prepare(
    `INSERT INTO payments (id, booking_id, amount, method, status, ref_id, created_at)
     VALUES (?, ?, ?, 'zarinpal', 'pending', ?, ?)`,
  ).run(id, bookingId, amount, authority, createdAt)

  return {
    ok: true,
    paymentId: id,
    authority,
    redirectUrl: `/api/payments/verify?authority=${authority}&bookingId=${bookingId}`,
  }
}

export async function verifyDepositPayment(authority: string, bookingId: string) {
  const db = getDb()
  const pay = db.prepare(`SELECT * FROM payments WHERE ref_id = ? AND booking_id = ?`).get(authority, bookingId) as
    | Record<string, unknown>
    | undefined
  if (!pay) throw createError({ statusCode: 404, statusMessage: 'Payment not found' })

  db.prepare(`UPDATE payments SET status = 'paid' WHERE id = ?`).run(pay.id)
  db.prepare(`UPDATE bookings SET payment_status = 'deposit_paid', deposit = ? WHERE id = ?`).run(
    pay.amount,
    bookingId,
  )
  return { ok: true, refId: authority, status: 'paid' }
}
