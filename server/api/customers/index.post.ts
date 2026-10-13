import { getDb, newId } from '../../db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireUser(event, ['admin', 'receptionist'])
  const body = await readBody<{
    name: string
    phone: string
    tag?: string
    notes?: string
    allergy?: string
  }>(event)
  const id = newId()
  getDb()
    .prepare(
      `INSERT INTO customers (id, name, phone, file_no, last_visit, tag, notes, allergy, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      body.name,
      body.phone,
      `LM-${Math.floor(1000 + Math.random() * 9000)}`,
      null,
      body.tag || '',
      body.notes || '',
      body.allergy || '',
      new Date().toISOString(),
    )
  return { ok: true, id }
})
