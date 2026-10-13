import { getDb, newId } from '../db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string; phone: string; message: string }>(event)
  if (!body?.name || !body?.phone || !body?.message) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }
  getDb()
    .prepare(`INSERT INTO contact_messages (id, name, phone, message, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(newId(), body.name, body.phone, body.message, new Date().toISOString())
  return { ok: true }
})
