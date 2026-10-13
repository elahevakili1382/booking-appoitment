import { readStore } from '../../utils/db'

export default defineEventHandler(() => {
  const store = readStore()
  return { ok: true, data: store.bookings }
})
