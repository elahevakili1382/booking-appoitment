/**
 * تست‌های API فاز ۱ روی سرور production که روی دیتابیس آزمایشی اجرا شده است.
 * پیش‌نیاز و اجرا: docs در REPORT.md (بخش «اجرای دوباره‌ی تست‌ها»). بدون پکیج جدید.
 * متغیرها: LUMINA_TEST_DIR, NUXT_SESSION_SECRET (همان مقدار سرور), LUMINA_TEST_BASE (پیش‌فرض http://127.0.0.1:3999)
 * هیچ توکن، کد OTP یا شماره‌ی واقعی چاپ نمی‌شود؛ همه‌ی شماره‌ها ساختگی‌اند.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { randomBytes, createHmac } from 'node:crypto'
import { request as httpRequest } from 'node:http'
import { join, resolve } from 'node:path'

const require = createRequire(join(process.cwd(), 'package.json'))
const Database = require('better-sqlite3')

const dir = resolve(process.env.LUMINA_TEST_DIR || '')
const secret = process.env.NUXT_SESSION_SECRET || ''
const B = process.env.LUMINA_TEST_BASE || 'http://127.0.0.1:3999'
if (!process.env.LUMINA_TEST_DIR || secret.length < 32) { console.error('LUMINA_TEST_DIR and NUXT_SESSION_SECRET are required'); process.exit(1) }
const fx = JSON.parse(readFileSync(join(dir, 'fixtures.json'), 'utf8'))
const T = fx.tokens
const dbw = () => new Database(join(dir, 'test.sqlite'))
const hash = (p, c) => createHmac('sha256', secret).update(`${p}:${c}`).digest('hex')
const rid = () => randomBytes(8).toString('hex')

let pass = 0, fail = 0
const lines = []
function check(name, ok, detail = '') { ok ? pass++ : fail++; lines.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== '' ? '  [' + detail + ']' : ''}`) }

async function call(method, path, { token, body, headers = {} } = {}) {
  const res = await fetch(B + path, {
    method,
    headers: { ...(token ? { cookie: `lumina_session=${token}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  })
  let json = null
  try { json = await res.json() } catch {}
  return { status: res.status, json, headers: res.headers }
}
// برای هدرهایی که fetch اجازه‌ی تنظیمشان را نمی‌دهد (Origin / Sec-Fetch-Site)
function raw(method, path, headers, body) {
  return new Promise((resolveP, reject) => {
    const u = new URL(B + path)
    const req = httpRequest({ host: u.hostname, port: u.port, path: u.pathname, method, headers: { 'content-type': 'application/json', ...headers } }, (res) => {
      res.resume(); res.on('end', () => resolveP(res.statusCode))
    })
    req.on('error', reject); if (body) req.write(JSON.stringify(body)); req.end()
  })
}
const bk = (id) => { const d = dbw(); const r = d.prepare('SELECT * FROM bookings WHERE id=?').get(id); d.close(); return r }

const A = fx.ids.bookingA_staff1, Bk = fx.ids.bookingB_staff2, LG = fx.ids.bookingLegacy
const svc = fx.serviceId

// ── ناشناس
for (const [m, p] of [['GET', '/api/bookings'], ['GET', '/api/dashboard'], ['GET', '/api/customers'], ['GET', '/api/settings'], ['GET', '/api/reports/revenue'], ['POST', '/api/admin/backup'], ['POST', '/api/admin/reminders'], ['PATCH', `/api/bookings/${A}`], ['GET', '/api/account/bookings']]) {
  const r = await call(m, p, { body: m === 'PATCH' ? { status: 'cancelled' } : undefined })
  check(`anonymous ${m} ${p.replace(A, ':id')} rejected (also with LUMINA_DEV_AUTH_BYPASS if set)`, r.status === 401, r.status)
}
check('anonymous /api/auth/me returns no user', (await call('GET', '/api/auth/me')).json?.user === null)

// ── مشتری
let r = await call('PATCH', `/api/bookings/${A}`, { token: T.custB, body: { status: 'cancelled' } })
check('customer B cannot cancel customer A booking', r.status === 403, r.status)
check('customer A booking unchanged after B attempt', bk(A).status === 'confirmed')
r = await call('GET', '/api/bookings', { token: T.custA }); check('customer cannot list all bookings', r.status === 403, r.status)
r = await call('GET', '/api/dashboard', { token: T.custA }); check('customer cannot open dashboard API', r.status === 403, r.status)
r = await call('GET', '/api/customers', { token: T.custA }); check('customer cannot list customers', r.status === 403, r.status)
// رزرو قدیمی بدون customer_id: مشتری نمی‌تواند لغو کند (بدون اتصال داده، دسترسی داده نمی‌شود)
r = await call('PATCH', `/api/bookings/${LG}`, { token: T.custA, body: { status: 'cancelled' } })
check('legacy booking without customer_id is NOT cancellable by customer', r.status === 403 && bk(LG).status === 'confirmed', r.status)

const before = bk(A)
for (const [n, body] of [
  ['status+notes', { status: 'cancelled', notes: 'x' }],
  ['status+staffId', { status: 'cancelled', staffId: fx.staffIds[1] }],
  ['status+startsAt', { status: 'cancelled', startsAt: '2030-01-01T10:00:00.000Z' }],
  ['status+date/time', { status: 'cancelled', date: '2030-01-01', time: '10:00' }],
  ['status completed', { status: 'completed' }],
  ['notes only', { notes: 'x' }],
  ['reschedule only', { date: '2030-01-01', time: '10:00' }],
  ['total/phone fields', { status: 'cancelled', total: 1, phone: '09999999999' }],
]) {
  r = await call('PATCH', `/api/bookings/${A}`, { token: T.custA, body }); check(`customer forbidden change rejected: ${n}`, r.status === 403, r.status)
}
check('customer booking fields unchanged after forbidden attempts', JSON.stringify(before) === JSON.stringify(bk(A)))

// ── staff
r = await call('GET', '/api/bookings', { token: T.staff })
const sIds = (r.json?.data || []).map((b) => b.id)
let d = dbw(); const own = new Set(d.prepare('SELECT id FROM bookings WHERE staff_id=?').all(fx.staffIds[0]).map((x) => x.id)); d.close()
check('staff sees own bookings only (list)', r.status === 200 && sIds.includes(A) && !sIds.includes(Bk) && sIds.every((i) => own.has(i)), `${sIds.length} items`)
r = await call('GET', '/api/dashboard', { token: T.staff })
const dIds = (r.json?.data?.bookings || []).map((b) => b.id)
check('staff dashboard shows own bookings only', r.status === 200 && dIds.includes(A) && !dIds.includes(Bk) && dIds.every((i) => own.has(i)))
check('staff dashboard hides revenue/kpi', r.json?.data?.stats?.revenueMonth === 0 && (r.json?.data?.kpiSeries || []).length === 0)
check('linked staff: staffLink.linked === true', r.json?.data?.staffLink?.linked === true)
const ownPhones = new Set((r.json?.data?.bookings || []).map((b) => b.phone))
check('staff dashboard customers limited to own patients', (r.json?.data?.customers || []).every((c) => ownPhones.has(c.phone)))
r = await call('PATCH', `/api/bookings/${A}`, { token: T.staff, body: { notes: 'test note' } }); check('staff can edit notes of own booking', r.status === 200, r.status)
r = await call('PATCH', `/api/bookings/${A}`, { token: T.staff, body: { status: 'completed' } }); check('staff can set status of own booking', r.status === 200, r.status)
r = await call('PATCH', `/api/bookings/${A}`, { token: T.staff, body: { staffId: fx.staffIds[1] } }); check('staff cannot move own booking to another doctor', r.status === 403, r.status)
r = await call('PATCH', `/api/bookings/${A}`, { token: T.staff, body: { date: '2030-01-01', time: '10:00' } }); check('staff cannot reschedule', r.status === 403, r.status)
r = await call('PATCH', `/api/bookings/${Bk}`, { token: T.staff, body: { status: 'completed' } }); check('staff cannot modify other doctor booking', r.status === 403, r.status)
check('other doctor booking unchanged by staff', bk(Bk).status === 'confirmed')
for (const [m, p] of [['GET', '/api/customers'], ['GET', '/api/settings'], ['GET', '/api/reports/revenue'], ['POST', '/api/admin/reminders']]) {
  r = await call(m, p, { token: T.staff }); check(`staff blocked from ${m} ${p}`, r.status === 403, r.status)
}
r = await call('GET', '/api/bookings', { token: T.unlinked }); check('unlinked staff sees no bookings', r.status === 200 && (r.json?.data || []).length === 0)
r = await call('GET', '/api/dashboard', { token: T.unlinked })
check('unlinked staff dashboard empty', r.status === 200 && (r.json?.data?.bookings || []).length === 0 && (r.json?.data?.customers || []).length === 0 && (r.json?.data?.calendarSlots || []).length === 0)
check('unlinked staff: staffLink.linked === false (UI shows clear message)', r.json?.data?.staffLink?.linked === false)
r = await call('PATCH', `/api/bookings/${A}`, { token: T.unlinked, body: { status: 'completed' } }); check('unlinked staff cannot modify bookings', r.status === 403, r.status)

// ── receptionist و admin
r = await call('GET', '/api/bookings', { token: T.recep }); const rIds = (r.json?.data || []).map((b) => b.id)
check('receptionist sees all bookings', r.status === 200 && rIds.includes(A) && rIds.includes(Bk))
r = await call('GET', '/api/dashboard', { token: T.recep }); check('receptionist dashboard works (no staffLink field)', r.status === 200 && (r.json?.data?.bookings || []).length >= 2 && r.json?.data?.staffLink === undefined)
r = await call('GET', '/api/customers', { token: T.recep }); check('receptionist can list customers', r.status === 200, r.status)
r = await call('PATCH', `/api/bookings/${Bk}`, { token: T.recep, body: { notes: 'ops note' } }); check('receptionist can edit any booking', r.status === 200, r.status)
r = await call('GET', '/api/settings', { token: T.recep }); check('receptionist blocked from admin settings', r.status === 403, r.status)
r = await call('POST', '/api/admin/backup', { token: T.recep }); check('receptionist blocked from backup', r.status === 403, r.status)
r = await call('GET', '/api/bookings', { token: T.admin }); check('admin sees all bookings', r.status === 200 && (r.json?.data || []).length >= 2)
r = await call('GET', '/api/dashboard', { token: T.admin }); check('admin dashboard works', r.status === 200 && r.json?.data?.stats?.revenueMonth !== undefined)
r = await call('GET', '/api/settings', { token: T.admin }); check('admin can read settings', r.status === 200, r.status)
r = await call('PATCH', `/api/bookings/${Bk}`, { token: T.admin, body: { status: 'completed' } }); check('admin can change booking status', r.status === 200, r.status)
r = await call('PATCH', `/api/bookings/${Bk}`, { token: T.admin, body: { status: 'weird' } }); check('invalid status rejected (400)', r.status === 400, r.status)

// ── مشتری: لغو رزرو خودش
r = await call('PATCH', `/api/bookings/${A}`, { token: T.custA, body: { status: 'cancelled' } })
check('customer can cancel own booking (policy ok)', r.status === 200 && bk(A).status === 'cancelled', r.status)

// ── CSRF
const origin = new URL(B).origin
let s = await raw('PATCH', `/api/bookings/${Bk}`, { cookie: `lumina_session=${T.admin}`, origin: 'http://evil.example' }, { notes: 'csrf' })
check('CSRF: cross-origin PATCH with valid cookie blocked', s === 403, s)
s = await raw('PATCH', `/api/bookings/${Bk}`, { cookie: `lumina_session=${T.admin}`, 'sec-fetch-site': 'cross-site' }, { notes: 'csrf' })
check('CSRF: Sec-Fetch-Site cross-site blocked', s === 403, s)
s = await raw('PATCH', `/api/bookings/${Bk}`, { cookie: `lumina_session=${T.admin}`, 'sec-fetch-site': 'same-site' }, { notes: 'csrf' })
check('CSRF: Sec-Fetch-Site same-site (subdomain) blocked', s === 403, s)
s = await raw('POST', '/api/auth/logout', { cookie: `lumina_session=${T.custB}`, origin: 'http://evil.example' })
check('CSRF: cross-origin logout blocked', s === 403, s)
check('CSRF: blocked request did not change data', bk(Bk).notes !== 'csrf')
s = await raw('PATCH', `/api/bookings/${Bk}`, { cookie: `lumina_session=${T.admin}`, origin, 'sec-fetch-site': 'same-origin' }, { notes: 'same-origin ok' })
check('CSRF: same-origin PATCH allowed', s === 200, s)
r = await call('GET', '/api/bookings', { token: T.admin, headers: { 'sec-fetch-site': 'cross-site' } }); check('CSRF: safe GET not blocked by middleware', r.status === 200, r.status)

// ── OTP
r = await call('POST', '/api/auth/otp/request', { body: { phone: '09000000005' } })
check('otp request: no mockCode in production', r.json?.mockCode === undefined, `status ${r.status}`)
check('otp request: controlled 503 when no real SMS provider', r.status === 503, r.status)
d = dbw(); check('otp request: nothing stored when SMS unavailable', !d.prepare('SELECT 1 x FROM otp_codes WHERE phone=?').get('09000000005')); d.close()
r = await call('POST', '/api/auth/otp/request', { body: { phone: '09000000005' } }); check('otp request: per-phone rate limit 429', r.status === 429, r.status)
r = await call('POST', '/api/auth/otp/request', { body: { phone: '123' } }); check('otp request: invalid phone 400', r.status === 400, r.status)
{
  const db = dbw(); const ins = (p, c, exp) => db.prepare('INSERT OR REPLACE INTO otp_codes (phone,code,expires_at,attempts) VALUES (?,?,?,0)').run(p, hash(p, c), exp)
  ins('09000000004', '123456', new Date(Date.now() + 300_000).toISOString())
  for (let i = 1; i <= 5; i++) { r = await call('POST', '/api/auth/otp/verify', { body: { phone: '09000000004', code: '000000' } }); if (i === 5) check('otp verify: wrong code rejected (5 attempts)', r.status === 400, r.status) }
  r = await call('POST', '/api/auth/otp/verify', { body: { phone: '09000000004', code: '123456' } }); check('otp verify: locked after 5 attempts even with right code', r.status === 429, r.status)
  r = await call('POST', '/api/auth/otp/verify', { body: { phone: '09000000004', code: '123456' } }); check('otp verify: code invalidated after lockout', r.status === 400, r.status)
  ins('09000000006', '654321', new Date(Date.now() + 300_000).toISOString())
  r = await call('POST', '/api/auth/otp/verify', { body: { phone: '09000000006', code: '654321' } })
  const cookie = r.headers.get('set-cookie') || ''
  check('otp verify: correct code logs in as customer', r.status === 200 && r.json?.user?.role === 'customer', r.status)
  check('otp verify: cookie HttpOnly + Secure + SameSite=Lax', /httponly/i.test(cookie) && /secure/i.test(cookie) && /samesite=lax/i.test(cookie))
  r = await call('POST', '/api/auth/otp/verify', { body: { phone: '09000000006', code: '654321' } }); check('otp verify: code is single-use', r.status === 400, r.status)
  ins('09000000007', '111111', new Date(Date.now() - 1000).toISOString())
  r = await call('POST', '/api/auth/otp/verify', { body: { phone: '09000000007', code: '111111' } }); check('otp verify: expired code rejected', r.status === 400, r.status)
  db.prepare('INSERT OR REPLACE INTO otp_codes (phone,code,expires_at,attempts) VALUES (?,?,?,0)').run('09000000011', '222222', new Date(Date.now() + 300_000).toISOString())
  r = await call('POST', '/api/auth/otp/verify', { body: { phone: '09000000011', code: '222222' } }); check('otp verify: plaintext-stored code not accepted', r.status === 400, r.status)
  // یک‌بار هش بدون کلید (SHA-256 ساده) هم پذیرفته نمی‌شود
  const { createHash } = await import('node:crypto')
  db.prepare('INSERT OR REPLACE INTO otp_codes (phone,code,expires_at,attempts) VALUES (?,?,?,0)').run('09000000012', createHash('sha256').update('09000000012:333333').digest('hex'), new Date(Date.now() + 300_000).toISOString())
  r = await call('POST', '/api/auth/otp/verify', { body: { phone: '09000000012', code: '333333' } }); check('otp verify: unkeyed SHA-256 hash not accepted', r.status === 400, r.status)
  db.close()
}
// خروج: ردیف نشست پاک شود و توکن بعد از آن بی‌اثر باشد
{
  const db = dbw(); const tok = randomBytes(16).toString('hex')
  const u = db.prepare("SELECT id FROM users WHERE phone='09000000003'").get().id
  db.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').run(tok, u, new Date(Date.now() + 3600_000).toISOString()); db.close()
  r = await call('GET', '/api/auth/me', { token: tok }); check('logout: session valid before logout', r.json?.user?.role === 'customer')
  r = await call('POST', '/api/auth/logout', { token: tok }); check('logout: endpoint ok', r.status === 200, r.status)
  r = await call('GET', '/api/auth/me', { token: tok }); check('logout: token no longer valid server-side', r.json?.user === null)
}

// ── مسیرهای عمومی و رزرو مهمان
for (const p of ['/api/availability', '/api/services', '/api/doctors', '/api/blog']) { r = await call('GET', p); check(`public GET ${p} works`, r.status === 200, r.status) }
// مشتری موجود: نام و پروفایل با رزرو مهمان تغییر نکند
{
  d = dbw(); const beforeC = d.prepare("SELECT name,last_visit,notes,allergy,user_id FROM customers WHERE phone='09000000020'").get(); d.close()
  let created = null
  for (const h of [10, 11, 12, 13, 14, 15, 16, 17]) {
    const day = new Date(Date.now() + 50 * 86_400_000).toISOString().slice(0, 10)
    r = await call('POST', '/api/bookings', { body: { name: 'Attacker Name', phone: '۰۹۰۰۰۰۰۰۰۲۰', serviceId: svc, staffId: fx.staffIds[0], date: day, time: `${h}:00`, notes: 'attacker note' } })
    if (r.status === 200) { created = r.json.data; break }
  }
  check('guest booking for existing customer phone works', Boolean(created), created ? 'created' : `last status ${r.status}`)
  d = dbw(); const afterC = d.prepare("SELECT name,last_visit,notes,allergy,user_id FROM customers WHERE phone='09000000020'").get(); d.close()
  check('guest booking does NOT change existing customer profile (name/last_visit/notes/allergy/user_id)', JSON.stringify(beforeC) === JSON.stringify(afterC))
}
// رزرو مهمان معتبر؛ مبلغ از سرور
let created = null
for (const h of [10, 11, 12, 13, 14, 15, 16, 17]) {
  const day = new Date(Date.now() + 55 * 86_400_000).toISOString().slice(0, 10)
  r = await call('POST', '/api/bookings', { body: { name: 'TEST guest', phone: '۰۹۰۰۰۰۰۰۰۰۸', serviceId: svc, staffId: 'any', date: day, time: `${h}:00`, total: 1, deposit: 999999999 } })
  if (r.status === 200) { created = { day, h, data: r.json.data }; break }
}
check('public guest booking works with "any doctor" (Persian digits accepted)', Boolean(created), created ? 'created' : `last status ${r.status}`)
if (created) {
  const row = bk(created.data.id); d = dbw(); const price = d.prepare('SELECT price FROM services WHERE id=?').get(svc).price; d.close()
  check('booking total comes from server price, not client', row.total === price && row.total !== 1, `total=${row.total}`)
  check('booking deposit clamped to total', row.deposit <= row.total, `deposit=${row.deposit}`)
  r = await call('POST', '/api/bookings', { body: { name: 'TEST guest', phone: '09000000008', serviceId: svc, staffId: 'any', date: created.day, time: `${created.h}:00` } })
  check('duplicate/conflicting booking rejected (409)', r.status === 409, r.status)
}
// پزشک ناشناس/نامعتبر: هرگز به پزشک دیگری نسبت داده نمی‌شود
r = await call('POST', '/api/bookings', { body: { name: 'TEST doc', phone: '09000000014', serviceId: svc, doctor: 'Dr Nobody', date: '2031-01-01', time: '10:00' } })
check('unknown doctor name -> 400 (no silent fallback to another doctor)', r.status === 400, r.status)
r = await call('POST', '/api/bookings', { body: { name: 'TEST doc', phone: '09000000015', serviceId: svc, staffId: 'does-not-exist', date: '2031-01-01', time: '10:00' } })
check('unknown staffId -> 400', r.status === 400, r.status)
d = dbw(); check('no booking created for unknown doctor', !d.prepare("SELECT 1 x FROM bookings WHERE phone IN ('09000000014','09000000015')").get()); d.close()
r = await call('POST', '/api/bookings', { body: { name: 'TEST', phone: '12345', serviceId: svc } }); check('booking: invalid phone 400', r.status === 400, r.status)
r = await call('POST', '/api/bookings', { body: { name: 'A', phone: '09000000016', serviceId: svc } }); check('booking: too-short name 400', r.status === 400, r.status)
let statuses = []
for (let i = 0; i < 6; i++) { r = await call('POST', '/api/bookings', { body: { name: 'TEST limit', phone: '09000000013', service: 'nonexistent-service' } }); statuses.push(r.status) }
check('booking per-phone rate limit returns 429 on 6th', statuses.slice(0, 5).every((x) => x === 400) && statuses[5] === 429, statuses.join(','))
let got429 = false, hdr = null
for (let i = 0; i < 40; i++) { r = await call('POST', '/api/bookings', { body: {} }); if (r.status === 429) { got429 = true; hdr = r.headers.get('retry-after'); break } }
check('booking per-IP rate limit returns 429 with Retry-After', got429 && Number(hdr) > 0, `retry-after=${hdr}`)

console.log(lines.join('\n'))
console.log(`\nTOTAL pass=${pass} fail=${fail}`)
process.exit(fail ? 1 : 0)
