/**
 * Security tests for the stateless, read-only demo session.
 *
 * It needs several running servers built from the same code, started with different environment variables:
 *   ON       NUXT_DEMO_ENABLED=true  NUXT_DEMO_SESSION_SECRET=<S>  NUXT_PUBLIC_DEMO=true
 *   OFF      NUXT_DEMO_SESSION_SECRET=<S>                           (flag off, same secret)
 *   NOSECRET NUXT_DEMO_ENABLED=true                                 (no secret)
 *   SHORT    NUXT_DEMO_ENABLED=true  NUXT_DEMO_SESSION_SECRET=short (secret shorter than 32 characters)
 *   NODB     like ON, plus NUXT_DB_PATH pointing to an unusable path (proves the session does not need the database)
 *
 * Usage:  DEMO_SECRET=... ON=http://127.0.0.1:5190 OFF=... NOSECRET=... SHORT=... NODB=... node scripts/demo-security-tests.mjs
 * The secret is only read from the environment; it is never printed. Local tests only: this does not prove
 * how a deployment behaves behind a CDN or across several serverless instances.
 */
import * as iron from 'iron-webcrypto'

const { DEMO_SECRET, ON, OFF, NOSECRET, SHORT, NODB } = process.env
for (const [k, v] of Object.entries({ DEMO_SECRET, ON, OFF, NOSECRET, SHORT, NODB })) {
  if (!v) { console.error(`Missing environment variable ${k}`); process.exit(2) }
}

const TTL_MS = 8 * 3600 * 1000
let failures = 0
const check = (name, ok, extra = '') => {
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + extra : ''}`)
}

/** Build a cookie value exactly like h3's useSession would (same library), with controllable content. */
async function seal({ secret = DEMO_SECRET, data, createdAt = Date.now() }) {
  return iron.seal(globalThis.crypto, { id: 'test', createdAt, data }, secret, { ...iron.defaults, ttl: TTL_MS })
}
const goodData = () => ({ purpose: 'demo', exp: Math.floor(Date.now() / 1000) + 3600 })

async function call(base, path, { method = 'GET', cookies = {}, body } = {}) {
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* not JSON */ }
  return { status: res.status, json, headers: res.headers, setCookies: res.headers.getSetCookie?.() ?? [] }
}
const demo = (v) => ({ lumina_demo: v })

// ---------------------------------------------------------------- 1. valid login and data
const login = await call(ON, '/api/auth/demo', { method: 'POST' })
const demoSetCookies = login.setCookies.filter((c) => c.startsWith('lumina_demo='))
const sc = demoSetCookies[0] ?? ''
const value = sc.split(';')[0].split('=').slice(1).join('=')
check('login succeeds (200) and sets exactly one lumina_demo cookie', login.status === 200 && demoSetCookies.length === 1)
check('login sets NO real lumina_session cookie', !login.setCookies.some((c) => c.startsWith('lumina_session=')))
check('cookie flags: HttpOnly, Secure, SameSite=Lax, Path=/', /HttpOnly/i.test(sc) && /;\s*Secure/i.test(sc) && /SameSite=Lax/i.test(sc) && /Path=\//i.test(sc), '(Secure needs a production build)')
check('cookie is sealed (no readable payload)', value.startsWith('Fe26.') && !/purpose|demo|receptionist|admin/i.test(decodeURIComponent(value)))
check('login response is not cacheable (private, no-store)', /no-store/i.test(login.headers.get('cache-control') || ''))

const jar = demo(decodeURIComponent(value))
const me = await call(ON, '/api/auth/me', { cookies: jar })
check('me: demo user, role receptionist (not admin), no phone', me.json?.demo === true && me.json?.user?.role === 'receptionist' && !me.json?.user?.phone)
const dash = await call(ON, '/api/dashboard', { cookies: jar })
check('dashboard readable with fake data', dash.status === 200 && Array.isArray(dash.json?.data?.bookings), `bookings=${dash.json?.data?.bookings?.length}`)
const fakeOnly = JSON.stringify(dash.json?.data?.customers ?? []).match(/09\d{9}/g) ?? []
check('customers in the demo are the fake 0910000xxxx numbers only', fakeOnly.length > 0 && fakeOnly.every((p) => p.startsWith('0910000')))
for (const p of ['/api/customers', '/api/bookings', '/api/reports/revenue', '/api/services', '/api/doctors', '/api/availability', '/api/blog']) {
  const r = await call(ON, p, { cookies: jar })
  check(`allowed read ${p}`, r.status === 200, String(r.status))
}
for (const p of ['/api/auth/me', '/api/dashboard', '/api/customers', '/api/bookings', '/api/reports/revenue']) {
  const r = await call(ON, p, { cookies: jar })
  check(`private response not publicly cacheable: ${p}`, /no-store/i.test(r.headers.get('cache-control') || ''), r.headers.get('cache-control') || 'none')
}

// ---------------------------------------------------------------- 2. every write is rejected (direct requests, no UI)
const bookingId = dash.json.data.bookings[0].id
const writes = [
  ['POST', '/api/bookings', { x: 1 }],
  ['PATCH', `/api/bookings/${bookingId}`, { status: 'cancelled' }],
  ['PATCH', `/api/bookings/${bookingId}`, { paymentStatus: 'paid' }],
  ['DELETE', `/api/bookings/${bookingId}`, undefined],
  ['PUT', '/api/availability', { x: 1 }],
  ['POST', '/api/customers', { name: 'x' }],
  ['PATCH', `/api/customers/${bookingId}`, { name: 'x' }],
  ['PUT', '/api/settings', { a: 'b' }],
  ['POST', '/api/admin/backup', {}],
  ['POST', '/api/admin/reminders', {}],
  ['POST', '/api/payments/deposit', { bookingId, amount: 1 }],
  ['POST', '/api/contact', { x: 1 }],
  ['POST', '/api/auth/otp/request', { phone: '09100000001' }],
  ['POST', '/api/auth/otp/verify', { phone: '09100000001', code: '1' }],
]
let blocked = 0
for (const [m, p, b] of writes) {
  const r = await call(ON, p, { method: m, cookies: jar, body: b })
  if (r.status === 403) blocked++
  else console.log(`      not blocked: ${m} ${p} -> ${r.status}`)
}
check('all direct write attempts -> 403', blocked === writes.length, `${blocked}/${writes.length}`)
const after = await call(ON, '/api/dashboard', { cookies: jar })
check('data identical after the write attempts', JSON.stringify(after.json?.data?.bookings) === JSON.stringify(dash.json?.data?.bookings))

// GET endpoints outside the allow-list (including GETs with side effects) are refused for the demo
for (const p of ['/api/payments/verify?authority=x&bookingId=y', '/api/admin/anything', '/api/account/bookings', '/api/settings']) {
  const r = await call(ON, p, { cookies: jar })
  check(`GET outside the allow-list refused: ${p.split('?')[0]}`, r.status === 403, String(r.status))
}

// ---------------------------------------------------------------- 3. tampered / forged / expired cookies
const dashStatus = async (cookies, base = ON) => (await call(base, '/api/dashboard', { cookies })).status
const tampered = value.slice(0, 40) + (value[40] === 'a' ? 'b' : 'a') + value.slice(41)
check('tampered cookie -> 401', (await dashStatus(demo(tampered))) === 401)
check('truncated cookie -> 401', (await dashStatus(demo(value.slice(0, 60)))) === 401)
check('garbage cookie -> 401', (await dashStatus(demo('abc'))) === 401)
check('sealed with a different secret -> 401', (await dashStatus(demo(await seal({ secret: 'x'.repeat(40), data: goodData() })))) === 401)
check('wrong purpose (sealed with the right secret) -> 401', (await dashStatus(demo(await seal({ data: { purpose: 'admin', exp: goodData().exp } })))) === 401)
check('missing purpose -> 401', (await dashStatus(demo(await seal({ data: { exp: goodData().exp } })))) === 401)
check('expired exp inside payload -> 401', (await dashStatus(demo(await seal({ data: { purpose: 'demo', exp: Math.floor(Date.now() / 1000) - 60 } })))) === 401)
check('seal older than the session lifetime -> 401', (await dashStatus(demo(await seal({ data: goodData(), createdAt: Date.now() - 9 * 3600 * 1000 })))) === 401)
check('a good forged-by-test cookie IS accepted (sanity: the checks above are not vacuous)', (await dashStatus(demo(await seal({ data: goodData() })))) === 200)

// the demo cookie value cannot be used as a real session
check('demo cookie value used as lumina_session -> 401', (await dashStatus({ lumina_session: decodeURIComponent(value) })) === 401)
check('no cookie -> 401', (await dashStatus({})) === 401)

// ---------------------------------------------------------------- 4. flag off / no secret / short secret
const offLogin = await call(OFF, '/api/auth/demo', { method: 'POST' })
check('flag off: login -> 404 and no cookie', offLogin.status === 404 && offLogin.setCookies.length === 0)
check('flag off: a previously valid demo cookie is inert -> 401', (await dashStatus(jar, OFF)) === 401)
check('flag off: even a correctly sealed fresh cookie is inert -> 401', (await dashStatus(demo(await seal({ data: goodData() })), OFF)) === 401)
const noSecret = await call(NOSECRET, '/api/auth/demo', { method: 'POST' })
check('no secret configured: login stays closed (404)', noSecret.status === 404 && noSecret.setCookies.length === 0)
const shortSecret = await call(SHORT, '/api/auth/demo', { method: 'POST' })
check('secret shorter than 32 characters: login stays closed (404)', shortSecret.status === 404 && shortSecret.setCookies.length === 0)
check('no default secret: the old dev default does not open a session', (await dashStatus(demo(await seal({ secret: 'lumina-dev-secret-change-me'.padEnd(40, '-'), data: goodData() })))) === 401)

// ---------------------------------------------------------------- 5. the session does not depend on the database file (/tmp on Vercel)
const nodbLogin = await call(NODB, '/api/auth/demo', { method: 'POST' })
const nodbValue = decodeURIComponent((nodbLogin.setCookies[0] || '').split(';')[0].split('=').slice(1).join('='))
const nodbMe = await call(NODB, '/api/auth/me', { cookies: demo(nodbValue) })
const nodbData = await call(NODB, '/api/doctors')
check('server whose database is unusable: demo login still works', nodbLogin.status === 200 && !!nodbValue)
check('...and the demo cookie is still valid there (me) while data routes fail', nodbMe.json?.demo === true && nodbData.status >= 500, `me=${nodbMe.status} doctors=${nodbData.status}`)
check('a cookie from server ON is accepted by another instance sharing the secret (no per-instance state)', (await call(NODB, '/api/auth/me', { cookies: jar })).json?.demo === true)

// ---------------------------------------------------------------- 6. logout only clears the cookie
const out = await call(ON, '/api/auth/logout', { method: 'POST', cookies: jar })
check('demo logout allowed and clears only lumina_demo', out.status === 200 && out.setCookies.some((c) => /^lumina_demo=;|^lumina_demo=\s*;/i.test(c) || /lumina_demo=.*(Max-Age=0|Expires=Thu, 01 Jan 1970)/i.test(c)))

console.log(failures === 0 ? '\nALL PASSED' : `\n${failures} FAILED`)
process.exit(failures === 0 ? 0 : 1)
