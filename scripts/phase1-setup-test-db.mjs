/**
 * ساخت دیتابیس آزمایشی جدا (کپی از دیتابیس توسعه + حساب‌ها و رزروهای ساختگی).
 * اجرا از ریشه‌ی پروژه:  LUMINA_TEST_DIR=<پوشه‌ی موقت بیرون از پروژه> node scripts/phase1-setup-test-db.mjs
 * دیتابیس اصلی فقط خوانده می‌شود (backup API) و هرگز تغییر نمی‌کند. migration و seed اجرا نمی‌شود.
 */
import { createRequire } from 'node:module'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { randomBytes, createHmac } from 'node:crypto'
import { resolve, join } from 'node:path'

const root = process.cwd()
const require = createRequire(join(root, 'package.json'))
const Database = require('better-sqlite3')

const dir = process.env.LUMINA_TEST_DIR && resolve(process.env.LUMINA_TEST_DIR)
const secret = process.env.NUXT_SESSION_SECRET
if (!dir || !secret || secret.length < 32) {
  console.error('LUMINA_TEST_DIR and NUXT_SESSION_SECRET (>=32 chars) are required'); process.exit(1)
}
const norm = (p) => p.replace(/\\/g, '/').toLowerCase()
if (norm(dir).startsWith(norm(join(root, 'data')))) { console.error('refusing: test dir must not be inside data/'); process.exit(1) }

const src = join(root, 'data', 'lumina.sqlite')
const dest = join(dir, 'test.sqlite')
if (existsSync(dest)) { console.error('refusing: test.sqlite already exists'); process.exit(1) }
mkdirSync(dir, { recursive: true })

const real = new Database(src, { readonly: true })
await real.backup(dest)
real.close()

const db = new Database(dest)
const now = new Date().toISOString()
const exp = new Date(Date.now() + 86_400_000).toISOString()
const tok = () => randomBytes(16).toString('hex')
const id = () => randomBytes(8).toString('hex')

const admin = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get()
const recep = db.prepare("SELECT id FROM users WHERE role='receptionist' LIMIT 1").get()
const staffRows = db.prepare('SELECT id FROM staff ORDER BY id').all().map((r) => r.id)
const service = db.prepare('SELECT id, duration, price FROM services WHERE active=1 AND price>0 ORDER BY id LIMIT 1').get()

const mkUser = (phone, role, name) => { const u = id(); db.prepare('INSERT INTO users (id,phone,name,role,created_at) VALUES (?,?,?,?,?)').run(u, phone, name, role, now); return u }
const mkCustomer = (userId, phone, name) => { const c = id(); db.prepare('INSERT INTO customers (id,user_id,name,phone,file_no,last_visit,tag,notes,allergy,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(c, userId, name, phone, 'T', null, '', '', '', now); return c }

const staffUser = mkUser('09000000001', 'staff', 'TEST staff')
const custA = mkUser('09000000002', 'customer', 'TEST customer A')
const custB = mkUser('09000000003', 'customer', 'TEST customer B')
const unlinkedStaff = mkUser('09000000010', 'staff', 'TEST staff unlinked')
const cA = mkCustomer(custA, '09000000002', 'TEST customer A')
const cB = mkCustomer(custB, '09000000003', 'TEST customer B')
// مشتری موجود بدون حساب (برای تست «مهمان نام او را بازنویسی نکند»)
mkCustomer(null, '09000000020', 'TEST existing customer')

db.prepare('UPDATE staff SET user_id = ? WHERE id = ?').run(staffUser, staffRows[0])

const tokens = {}
for (const [name, uid] of Object.entries({ admin: admin.id, recep: recep.id, staff: staffUser, custA, custB, unlinked: unlinkedStaff })) {
  tokens[name] = tok()
  db.prepare('INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)').run(tokens[name], uid, exp)
}

const future = (days, h) => { const d = new Date(Date.now() + days * 86_400_000); d.setUTCHours(h, 0, 0, 0); return d }
const mkBooking = (staffId, customerId, phone, name, days, h) => {
  const b = id(); const s = future(days, h); const e = new Date(s.getTime() + service.duration * 60_000)
  db.prepare(`INSERT INTO bookings (id,code,customer_id,staff_id,service_id,branch,visit_type,starts_at,ends_at,status,name,phone,notes,total,deposit,payment_status,created_at)
              VALUES (?,?,?,?,?,?,?,?,?,'confirmed',?,?,?,?,?,'unpaid',?)`).run(b, 'T' + b.slice(0, 6), customerId, staffId, service.id, '', 'clinic', s.toISOString(), e.toISOString(), name, phone, '', service.price, 0, now)
  return b
}
const ids = {
  bookingA_staff1: mkBooking(staffRows[0], cA, '09000000002', 'TEST customer A', 30, 6),
  bookingB_staff2: mkBooking(staffRows[1], cB, '09000000003', 'TEST customer B', 31, 6),
  // رزرو قدیمی بدون customer_id (شبیه داده‌ی seed)
  bookingLegacy: mkBooking(staffRows[0], null, '09000000002', 'TEST legacy', 32, 6),
}

db.close()
writeFileSync(join(dir, 'fixtures.json'), JSON.stringify({ tokens, ids, staffIds: staffRows, serviceId: service.id }))
console.log('test db ready')
