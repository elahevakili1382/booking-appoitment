import { getDb } from '../../db'

export default defineEventHandler(() => {
  const db = getDb()
  const posts = db.prepare('SELECT * FROM blog_posts ORDER BY published_at DESC').all()
  return { ok: true, data: posts }
})
