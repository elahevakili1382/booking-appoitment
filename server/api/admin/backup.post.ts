import { getDb, newId } from '../../db'
import { requireUser } from '../../utils/auth'
import { existsSync, copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler((event) => {
  requireUser(event, ['admin'])
  const db = getDb()
  const dir = join(process.cwd(), 'data', 'backups')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const config = useRuntimeConfig()
  const src = config.dbPath || join(process.cwd(), 'data', 'lumina.sqlite')
  const dest = join(dir, `lumina-${Date.now()}.sqlite`)
  if (existsSync(String(src))) copyFileSync(String(src), dest)
  db.prepare(`INSERT INTO audit_logs (id, actor_id, action, meta, created_at) VALUES (?, ?, ?, ?, ?)`).run(
    newId(),
    null,
    'backup',
    dest,
    new Date().toISOString(),
  )
  return { ok: true, path: dest }
})
