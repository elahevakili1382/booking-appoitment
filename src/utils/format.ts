/**
 * Shared client helpers — برای مصاحبه: utils سمت فرانت
 */

export function formatToman(n: number, locale: 'fa' | 'en' = 'fa') {
  return n.toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')
}

export function apiOk<T>(res: { ok?: boolean; data?: T }): T {
  if (!res?.ok || res.data === undefined) {
    throw new Error('API response invalid')
  }
  return res.data
}
