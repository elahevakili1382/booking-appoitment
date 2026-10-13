import { getDb } from '../../db'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const post = getDb().prepare('SELECT * FROM blog_posts WHERE slug = ?').get(slug) as Record<string, unknown> | undefined
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return { ok: true, data: post }
})
