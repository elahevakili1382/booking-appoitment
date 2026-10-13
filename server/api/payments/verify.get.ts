import { verifyDepositPayment } from '../../utils/payment'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const authority = String(query.authority || '')
  const bookingId = String(query.bookingId || '')
  const result = await verifyDepositPayment(authority, bookingId)
  return sendRedirect(event, `/book?paid=1&bookingId=${bookingId}`)
})
