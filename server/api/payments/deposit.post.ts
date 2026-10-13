import { getDb } from '../../db'
import { createDepositPayment, verifyDepositPayment } from '../../utils/payment'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ bookingId: string; amount: number }>(event)
  if (!body?.bookingId || !body?.amount) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }
  return createDepositPayment(body.bookingId, body.amount)
})
