<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useLanguage } from '../i18n/useLanguage'
import { assets } from '../data/assets'
import AvailabilityModal from './AvailabilityModal.vue'
import StaffCalendar from './StaffCalendar.vue'

type NavId = 'calendar' | 'contacts' | 'services' | 'links' | 'reports' | 'automations' | 'settings'
type CalView = 'today' | 'staff' | 'day' | 'week' | 'month'
type LinkTab = 'events' | 'single' | 'polls' | 'routing'
type ApptStatus = 'completed' | 'paid' | 'progress' | 'confirmed' | 'next' | 'buffer'

interface Staff {
  id: string
  name: string
  role: string
  photo: string
  active: boolean
}

interface CalBlock {
  id: string
  staffId: string
  startHour: number
  startMin: number
  durationMin: number
  patient: string
  service: string
  status: ApptStatus
  price?: string
  unit?: string
  meet?: boolean
  vip?: boolean
  fileNo?: string
  balance?: string
  allergy?: string
}

interface ApiCalendarSlot {
  id: string
  date?: string
  staffId: string
  startHour: number
  startMin: number
  durationMin: number
  patientFa: string
  patientEn: string
  serviceFa: string
  serviceEn: string
  status: ApptStatus
  price?: number
  unitFa?: string
  unitEn?: string
  meet?: boolean
  vip?: boolean
  fileNo?: string
  balance?: number
  allergyFa?: string
  allergyEn?: string
}

interface StoredBooking {
  code: string
  service: string
  doctor: string
  when: string
  name: string
  phone: string
  total: number
}

const { t, locale, setLocale } = useLanguage()

/** دیتای داینامیک داشبورد از Nitro API ← data/store.json (روز واقعی) */
function tehranTodayClient() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

const viewDate = ref(tehranTodayClient())

const { data: dashRes, refresh: refreshDash } = useAsyncData(
  () => `dashboard-${viewDate.value}`,
  () =>
    $fetch<{
      ok: boolean
      data: {
        viewDate: string
        today: string
        stats: { revenueToday: number; appointmentsToday: number; activeRooms: number; weekAppointments: number }
        bookings: Array<{
          id: string
          code: string
          name: string
          service: string
          doctor: string
          when: string
          date?: string
          time?: string
          status: string
          total: number
        }>
        dayBookings?: Array<{
          id: string
          code: string
          name: string
          service: string
          doctor: string
          when: string
          date?: string
          time?: string
          status: string
          total: number
        }>
        services: Array<{ id: string; titleFa: string; titleEn: string; duration: number; price: number; color: string; location: string }>
        doctors: Array<{ id: string; nameFa: string; nameEn: string; roleFa: string; roleEn: string; active: boolean }>
        customers: Array<{ id: string; name: string; phone: string; fileNo: string; lastVisit: string; tag?: string }>
        calendarSlots: ApiCalendarSlot[]
      }
    }>(`/api/dashboard?date=${viewDate.value}`),
  { watch: [viewDate] },
)

const sidebarOpen = ref(false)
const activeNav = ref<NavId>('calendar')
const calView = ref<CalView>('staff')
const linkTab = ref<LinkTab>('events')
const search = ref('')
const copiedId = ref<string | null>(null)
const bookingUrlCopied = ref(false)
const receptionNote = ref('')
const liveBooking = ref<StoredBooking | null>(null)
const availOpen = ref(false)
const createOpen = ref(false)
const createForm = ref({
  name: '',
  phone: '',
  serviceId: 'consult',
  staffId: 'rostami',
  date: tehranTodayClient(),
  time: '10:00',
  notes: '',
})
const createBusy = ref(false)
const createError = ref('')
const selectedBookingId = ref<string | null>(null)

const hours = [9, 10, 11, 12, 13, 14, 15, 16]
const HOUR_ROW_REM = 4.5
const GRID_START = 9
const GRID_END = 17

const clockNow = ref(new Date())
const mouseLineTop = ref<number | null>(null)
const guideTimeLabel = ref('')
let clockTimer: ReturnType<typeof setInterval> | null = null

function minutesToTop(totalMin: number) {
  return (totalMin / 60) * HOUR_ROW_REM
}

function clampGuideTop(topRem: number) {
  const max = (GRID_END - GRID_START) * HOUR_ROW_REM
  return Math.min(Math.max(topRem, 0), max)
}

function formatGuideClock(totalMinFromStart: number) {
  const absolute = GRID_START * 60 + totalMinFromStart
  const h = Math.floor(absolute / 60)
  const m = absolute % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** خط زمان واقعی — هر ثانیه آپدیت */
const nowLineTop = computed(() => {
  const d = clockNow.value
  const mins = (d.getHours() - GRID_START) * 60 + d.getMinutes() + d.getSeconds() / 60
  if (mins < 0 || mins > (GRID_END - GRID_START) * 60) return null
  return minutesToTop(mins)
})

/** خط راهنما: موس روی گرید → موس؛ وگرنه ساعت فعلی */
const guideLineTop = computed(() => {
  if (mouseLineTop.value != null) return mouseLineTop.value
  return nowLineTop.value
})

const clockLabel = computed(() => {
  const d = clockNow.value
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

function onGridMouseMove(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement | null
  if (!el) return
  const rect = el.getBoundingClientRect()
  const y = e.clientY - rect.top
  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const topRem = clampGuideTop(y / remPx)
  mouseLineTop.value = topRem
  const mins = (topRem / HOUR_ROW_REM) * 60
  guideTimeLabel.value = formatGuideClock(Math.round(mins))
}

function onGridMouseLeave() {
  mouseLineTop.value = null
  guideTimeLabel.value = ''
}

function formatMoney(n: number) {
  if (locale.value === 'fa') {
    return `${n.toLocaleString('fa-IR')} ت`
  }
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M T`
  return `${n.toLocaleString('en-US')} T`
}

function doctorToStaffId(doctor: string) {
  const d = doctor.toLowerCase()
  if (d.includes('rostami') || d.includes('رستمی')) return 'rostami'
  if (d.includes('bahrami') || d.includes('بهرامی')) return 'bahrami'
  if (d.includes('kaviani') || d.includes('کاویانی')) return 'kaviani'
  return 'rostami'
}

function parseBookingTime(when: string): { startHour: number; startMin: number } | null {
  const m = when.match(/(\d{1,2}):(\d{2})/)
  if (!m) return null
  return { startHour: Number(m[1]), startMin: Number(m[2]) }
}

const staff = ref<Staff[]>([
  {
    id: 'rostami',
    name: '',
    role: '',
    photo: assets.doctors[0],
    active: true,
  },
  {
    id: 'bahrami',
    name: '',
    role: '',
    photo: assets.doctors[1],
    active: true,
  },
  {
    id: 'kaviani',
    name: '',
    role: '',
    photo: assets.doctors[2],
    active: true,
  },
])

const staffLabels = computed(() =>
  locale.value === 'fa'
    ? [
        { id: 'rostami', name: 'دکتر النا رستمی', role: 'درماتولوژی' },
        { id: 'bahrami', name: 'دکتر سامان بهرامی', role: 'کانتورینگ' },
        { id: 'kaviani', name: 'دکتر نیکی کاویانی', role: 'درماتوسرجری' },
      ]
    : [
        { id: 'rostami', name: 'Dr. Elena Rostami', role: 'Dermatology' },
        { id: 'bahrami', name: 'Dr. Saman Bahrami', role: 'Contouring' },
        { id: 'kaviani', name: 'Dr. Niki Kaviani', role: 'Dermatosurgery' },
      ],
)

const staffList = computed(() =>
  staff.value.map((s) => {
    const label = staffLabels.value.find((l) => l.id === s.id)!
    return { ...s, name: label.name, role: label.role }
  }),
)

const activeStaff = computed(() => staffList.value.filter((s) => s.active))

const calendarBlocks = computed<CalBlock[]>(() => {
  const fa = locale.value === 'fa'
  const day = viewDate.value
  const slots = (dashRes.value?.data?.calendarSlots ?? []).filter((s) => !s.date || s.date === day)
  const fromStore: CalBlock[] = slots.map((s) => ({
    id: s.id,
    staffId: s.staffId,
    startHour: s.startHour,
    startMin: s.startMin,
    durationMin: s.durationMin,
    patient: fa ? s.patientFa : s.patientEn,
    service: s.status === 'buffer' ? t.value.dashRestBuffer : fa ? s.serviceFa : s.serviceEn,
    status: s.status,
    price: s.price != null ? formatMoney(s.price) : undefined,
    unit: fa ? s.unitFa : s.unitEn,
    meet: s.meet,
    vip: s.vip,
    fileNo: s.fileNo,
    balance: s.balance != null ? formatMoney(s.balance) : undefined,
    allergy: fa ? s.allergyFa : s.allergyEn,
  }))

  const apiBookings = dashRes.value?.data?.dayBookings ?? dashRes.value?.data?.bookings ?? []
  const fromBookings: CalBlock[] = apiBookings
    .filter((b) => b.status !== 'cancelled' && (!b.date || b.date === day))
    .map((b) => {
      const time = b.time ? parseBookingTime(b.time) : parseBookingTime(b.when)
      if (!time || time.startHour < GRID_START || time.startHour >= GRID_END) return null
      const svc = dashRes.value?.data?.services.find(
        (s) => s.titleFa === b.service || s.titleEn === b.service,
      )
      return {
        id: `bk-${b.id}`,
        staffId: doctorToStaffId(b.doctor),
        startHour: time.startHour,
        startMin: time.startMin,
        durationMin: svc?.duration ?? 45,
        patient: b.name,
        service: b.service,
        status: (b.status === 'completed' ? 'completed' : 'confirmed') as ApptStatus,
        price: formatMoney(b.total),
        fileNo: b.code,
      } satisfies CalBlock
    })
    .filter((b): b is CalBlock => b != null)

  const seen = new Set(fromStore.map((b) => `${b.staffId}-${b.startHour}:${b.startMin}-${b.patient}`))
  for (const b of fromBookings) {
    const key = `${b.staffId}-${b.startHour}:${b.startMin}-${b.patient}`
    if (!seen.has(key)) {
      fromStore.push(b)
      seen.add(key)
    }
  }
  return fromStore
})

const filteredBlocks = computed(() => {
  const q = search.value.trim().toLowerCase()
  return calendarBlocks.value.filter((b) => {
    if (!activeStaff.value.some((s) => s.id === b.staffId)) return false
    if (!q) return true
    return (
      b.patient.toLowerCase().includes(q) ||
      b.service.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    )
  })
})

function blocksForStaff(staffId: string) {
  return filteredBlocks.value.filter((b) => b.staffId === staffId)
}

function blockStyle(b: CalBlock) {
  const top = ((b.startHour - GRID_START) * 60 + b.startMin) / 60 * HOUR_ROW_REM
  const height = Math.max((b.durationMin / 60) * HOUR_ROW_REM, 1.75)
  return { top: `${top}rem`, height: `${height}rem` }
}

function statusLabel(s: ApptStatus) {
  const map: Record<ApptStatus, string> = {
    completed: t.value.dashStatusCompleted,
    paid: t.value.dashStatusPaid,
    progress: t.value.dashStatusProgress,
    confirmed: t.value.dashStatusConfirmed,
    next: t.value.dashStatusNext,
    buffer: t.value.dashRestBuffer,
  }
  return map[s]
}

function statusClass(s: ApptStatus) {
  return {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    paid: 'bg-sky-50 text-sky-700 border-sky-100',
    progress: 'bg-amber-50 text-amber-800 border-amber-100',
    confirmed: 'bg-primary/10 text-primary border-primary/15',
    next: 'bg-violet-50 text-violet-700 border-violet-100',
    buffer: 'bg-surface-container text-on-surface-variant border-outline-variant/20 border-dashed',
  }[s]
}

const eventTypes = computed(() =>
  locale.value === 'fa'
    ? [
        { id: 'hifu', title: 'هایفوتراپی سه‌بعدی و لیفت SMAS', duration: 75, location: 'clinic' as const, kind: 'one' as const, color: '#d4a373' },
        { id: 'profhilo', title: 'مزوژل جوانساز (پروفایلو)', duration: 45, location: 'clinic' as const, kind: 'one' as const, color: '#c47a5a' },
        { id: 'filler', title: 'فیلر طبیعی و کانتورینگ لب', duration: 60, location: 'clinic' as const, kind: 'one' as const, color: '#7a5c8a' },
        { id: 'consult', title: 'ویزیت تخصصی پوست و مو', duration: 30, location: 'online' as const, kind: 'one' as const, color: '#4f7d6a', shared: true },
        { id: 'bridal', title: 'پکیج عروس VIP Glow', duration: 90, location: 'clinic' as const, kind: 'group' as const, color: '#b76e79' },
      ]
    : [
        { id: 'hifu', title: '3D HIFU & SMAS lift', duration: 75, location: 'clinic' as const, kind: 'one' as const, color: '#d4a373' },
        { id: 'profhilo', title: 'Profhilo mesogel', duration: 45, location: 'clinic' as const, kind: 'one' as const, color: '#c47a5a' },
        { id: 'filler', title: 'Natural filler & lip contour', duration: 60, location: 'clinic' as const, kind: 'one' as const, color: '#7a5c8a' },
        { id: 'consult', title: 'Dermatology consult', duration: 30, location: 'online' as const, kind: 'one' as const, color: '#4f7d6a', shared: true },
        { id: 'bridal', title: 'Bridal VIP Glow package', duration: 90, location: 'clinic' as const, kind: 'group' as const, color: '#b76e79' },
      ],
)

const customers = computed(() =>
  locale.value === 'fa'
    ? [
        { name: 'سحر داوودی', file: 'LM-7703', phone: '0912***4412', last: 'امروز', tag: 'VIP' },
        { name: 'مینا کریمی', file: 'LM-7691', phone: '0935***2281', last: 'دیروز', tag: '' },
        { name: 'نیلوفر احمدی', file: 'LM-7680', phone: '0910***1190', last: '۳ روز پیش', tag: '' },
        { name: 'مریم حسینی', file: 'LM-7655', phone: '0912***8801', last: 'هفته پیش', tag: 'VIP' },
      ]
    : [
        { name: 'Sahar Davoudi', file: 'LM-7703', phone: '0912***4412', last: 'Today', tag: 'VIP' },
        { name: 'Mina Karimi', file: 'LM-7691', phone: '0935***2281', last: 'Yesterday', tag: '' },
        { name: 'Niloufar Ahmadi', file: 'LM-7680', phone: '0910***1190', last: '3 days ago', tag: '' },
        { name: 'Maryam Hosseini', file: 'LM-7655', phone: '0912***8801', last: 'Last week', tag: 'VIP' },
      ],
)

const servicesCatalog = computed(() =>
  locale.value === 'fa'
    ? [
        { title: 'هایفوتراپی ۳ بعدی', duration: '۷۵ دقیقه', price: 'از ۱۸,۵۰۰,۰۰۰' },
        { title: 'مزوژل پروفایلو', duration: '۴۵ دقیقه', price: 'از ۱۲,۰۰۰,۰۰۰' },
        { title: 'کانتورینگ لب', duration: '۶۰ دقیقه', price: 'از ۲۲,۰۰۰,۰۰۰' },
        { title: 'فیشیال VIP', duration: '۹۰ دقیقه', price: 'از ۸,۹۰۰,۰۰۰' },
      ]
    : [
        { title: '3D HIFU', duration: '75 min', price: 'from 18.5M' },
        { title: 'Profhilo', duration: '45 min', price: 'from 12M' },
        { title: 'Lip contour', duration: '60 min', price: 'from 22M' },
        { title: 'VIP facial', duration: '90 min', price: 'from 8.9M' },
      ],
)

const reportRows = computed(() =>
  locale.value === 'fa'
    ? [
        { label: 'هایفو و لیفت', amount: '۷۴,۰۰۰,۰۰۰' },
        { label: 'تزریقات و فیلر', amount: '۵۸,۵۰۰,۰۰۰' },
        { label: 'ویزیت و مشاوره', amount: '۱۲,۰۰۰,۰۰۰' },
        { label: 'فیشیال و مراقبت', amount: '۹,۸۰۰,۰۰۰' },
      ]
    : [
        { label: 'HIFU & lift', amount: '74,000,000' },
        { label: 'Injectables', amount: '58,500,000' },
        { label: 'Consults', amount: '12,000,000' },
        { label: 'Facials', amount: '9,800,000' },
      ],
)

const automations = ref([
  { id: 'sms', on: true },
  { id: 'email', on: true },
  { id: 'buffer', on: true },
  { id: 'sync', on: false },
])

try {
  const rawAuto = localStorage.getItem('lumina-automations')
  if (rawAuto) automations.value = JSON.parse(rawAuto) as typeof automations.value
} catch {
  /* ignore */
}

watch(
  automations,
  (v) => localStorage.setItem('lumina-automations', JSON.stringify(v)),
  { deep: true },
)

const reception = computed(() => {
  const progress = calendarBlocks.value.find((b) => b.status === 'progress')
  if (!progress) return null
  return {
    patient: progress.patient,
    code: progress.fileNo || '—',
    balance: progress.balance || (locale.value === 'fa' ? '۰ ت' : '0 T'),
    allergy: progress.allergy || '',
  }
})

const dateLabel = computed(() => {
  const d = new Date(`${viewDate.value}T12:00:00`)
  return d.toLocaleDateString(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function shiftViewDate(delta: number) {
  const d = new Date(`${viewDate.value}T12:00:00`)
  d.setDate(d.getDate() + delta)
  viewDate.value = d.toISOString().slice(0, 10)
}

function goToday() {
  viewDate.value = tehranTodayClient()
  calView.value = 'today'
  activeNav.value = 'calendar'
}

function openCreate(prefill?: { staffId?: string; startsAt?: string }) {
  createError.value = ''
  createForm.value = {
    name: '',
    phone: '',
    serviceId: dashRes.value?.data?.services?.[0]?.id || 'consult',
    staffId: prefill?.staffId || activeStaff.value[0]?.id || 'rostami',
    date: viewDate.value,
    time: '10:00',
    notes: '',
  }
  if (prefill?.startsAt) {
    const d = new Date(prefill.startsAt)
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(d)
    const get = (t: string) => parts.find((p) => p.type === t)?.value || ''
    createForm.value.date = `${get('year')}-${get('month')}-${get('day')}`
    createForm.value.time = `${get('hour')}:${get('minute')}`
  }
  createOpen.value = true
  activeNav.value = 'calendar'
}

async function submitCreate() {
  createBusy.value = true
  createError.value = ''
  try {
    await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        name: createForm.value.name,
        phone: createForm.value.phone,
        serviceId: createForm.value.serviceId,
        staffId: createForm.value.staffId,
        date: createForm.value.date,
        time: createForm.value.time,
        visitType: 'clinic',
        notes: createForm.value.notes,
        branch: t.value.dashBranchLabel,
      },
    })
    createOpen.value = false
    viewDate.value = createForm.value.date
    await refreshDash()
  } catch (e: unknown) {
    const err = e as { statusCode?: number; data?: { statusMessage?: string } }
    createError.value =
      err?.statusCode === 409
        ? locale.value === 'fa'
          ? 'تداخل ساعت — نوبت دیگری در این زمان هست'
          : 'Time conflict'
        : err?.data?.statusMessage || (locale.value === 'fa' ? 'ثبت ناموفق' : 'Failed')
  } finally {
    createBusy.value = false
  }
}

async function setBookingStatus(id: string, status: string) {
  try {
    await $fetch(`/api/bookings/${id}`, { method: 'PATCH', body: { status } })
    await refreshDash()
  } catch (e: unknown) {
    window.alert((e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'خطا')
  }
}

const fcEvents = computed(() =>
  calendarBlocks.value
    .filter((b) => b.status !== 'buffer')
    .map((b) => {
      const start = new Date(
        `${viewDate.value}T${String(b.startHour).padStart(2, '0')}:${String(b.startMin).padStart(2, '0')}:00+03:30`,
      )
      const end = new Date(start.getTime() + b.durationMin * 60_000)
      return {
        id: b.id,
        staffId: b.staffId,
        title: `${b.patient} · ${b.service}`,
        start: start.toISOString(),
        end: end.toISOString(),
        status: b.status,
      }
    }),
)

const publicBookUrl = computed(() => {
  if (typeof window === 'undefined') return '/book'
  return `${window.location.origin}/book`
})

const navItems = computed(() => [
  { id: 'calendar' as const, label: t.value.dashNavCalendar, icon: 'calendar_month' },
  { id: 'contacts' as const, label: t.value.dashNavContacts, icon: 'folder_shared' },
  { id: 'services' as const, label: t.value.dashNavServices, icon: 'spa' },
  { id: 'links' as const, label: t.value.dashNavLinks, icon: 'link' },
  { id: 'reports' as const, label: t.value.dashNavReports, icon: 'payments' },
  { id: 'automations' as const, label: t.value.dashNavAutomations, icon: 'bolt' },
  { id: 'settings' as const, label: t.value.dashNavSettings, icon: 'settings' },
])

function selectNav(id: NavId) {
  activeNav.value = id
  sidebarOpen.value = false
}

function toggleStaff(id: string) {
  const s = staff.value.find((x) => x.id === id)
  if (s) s.active = !s.active
}

async function copyText(text: string, id?: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* ignore */
  }
  if (id) {
    copiedId.value = id
    window.setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null
    }, 1600)
  } else {
    bookingUrlCopied.value = true
    window.setTimeout(() => {
      bookingUrlCopied.value = false
    }, 1600)
  }
}

function formatHour(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM'
  const display = h > 12 ? h - 12 : h
  return locale.value === 'fa' ? `${String(h).padStart(2, '0')}:00` : `${display}:00 ${suffix}`
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') sidebarOpen.value = false
}

onMounted(() => {
  try {
    const raw = localStorage.getItem('lumina-last-booking')
    liveBooking.value = raw ? (JSON.parse(raw) as StoredBooking) : null
  } catch {
    liveBooking.value = null
  }
  window.addEventListener('keydown', onKey)
  clockNow.value = new Date()
  clockTimer = setInterval(() => {
    clockNow.value = new Date()
  }, 1000)
  void refreshDash()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <div class="flex min-h-dvh w-full bg-[#fefae0] text-on-surface">
    <button
      v-if="sidebarOpen"
      type="button"
      class="fixed inset-0 z-40 bg-on-surface/35 backdrop-blur-[2px] lg:hidden"
      :aria-label="t.dashMenu"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 z-50 flex w-[17rem] flex-col border-e border-outline-variant/20 bg-[#f3eaea] transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0"
      :class="[
        locale === 'fa' ? 'end-0 start-auto' : 'start-0',
        sidebarOpen
          ? 'translate-x-0'
          : locale === 'fa'
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="border-b border-outline-variant/20 px-4 py-4">
        <div class="flex items-center gap-2.5">
          <img :src="assets.logo" alt="" class="h-8 w-auto object-contain" />
          <div class="min-w-0">
            <p class="font-latin truncate text-[15px] font-semibold text-primary">{{ t.dashClinicName }}</p>
            <p class="truncate text-[10px] text-on-surface-variant">{{ t.dashClinicSub }}</p>
          </div>
          <button
            type="button"
            class="ms-auto inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full hover:bg-white/60 lg:hidden"
            @click="sidebarOpen = false"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      <nav class="flex flex-col gap-0.5 p-3" aria-label="Dashboard">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          class="relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[12.5px] font-semibold transition-colors"
          :class="
            activeNav === item.id
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-white/55 hover:text-on-surface'
          "
          @click="selectNav(item.id)"
        >
          <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
          <span class="min-w-0 leading-snug">{{ item.label }}</span>
        </button>
      </nav>

      <div class="mx-3 mt-1 rounded-2xl border border-outline-variant/20 bg-white/50 p-3">
        <p class="mb-2 text-[11px] font-bold text-on-surface">{{ t.dashActiveCalendars }}</p>
        <label
          v-for="s in staffList"
          :key="s.id"
          class="mb-1.5 flex cursor-pointer items-center gap-2 text-[12px] last:mb-0"
        >
          <input
            type="checkbox"
            class="accent-primary"
            :checked="s.active"
            @change="toggleStaff(s.id)"
          />
          <span class="min-w-0 truncate font-medium">{{ s.name }}</span>
        </label>
      </div>

      <div class="mt-auto space-y-2 border-t border-outline-variant/20 p-3">
        <button
          type="button"
          class="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-outline-variant/30 bg-white/70 px-3 text-start text-[12px] font-semibold text-on-surface hover:bg-white"
          @click="availOpen = true"
        >
          <span class="material-symbols-outlined text-[18px] text-primary">event_available</span>
          {{ t.dashConnectCalendar }}
        </button>

        <div class="rounded-2xl bg-primary p-3 text-on-primary shadow-sm">
          <p class="text-[11px] font-bold">{{ t.dashShareBooking }}</p>
          <p class="mt-0.5 text-[10px] opacity-80">{{ t.dashShareBookingHint }}</p>
          <div class="mt-2 flex items-center gap-2">
            <code class="min-w-0 flex-1 truncate rounded-lg bg-white/15 px-2 py-1.5 font-latin text-[11px]">
              lumina.clinic/book
            </code>
            <button
              type="button"
              class="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-lg bg-white px-2.5 text-[11px] font-bold text-primary"
              @click="copyText(publicBookUrl)"
            >
              {{ bookingUrlCopied ? t.dashCopied : t.dashShare }}
            </button>
          </div>
        </div>

        <RouterLink
          to="/"
          class="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-[12px] font-semibold text-on-surface-variant hover:bg-white/55"
        >
          <span class="material-symbols-outlined text-[18px]">home</span>
          {{ t.dashBackSite }}
        </RouterLink>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 border-b border-outline-variant/20 bg-[#fefae0]/95 backdrop-blur-xl">
        <div class="flex flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5 lg:px-6">
          <button
            type="button"
            class="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm lg:hidden"
            :aria-label="t.dashMenu"
            @click="sidebarOpen = true"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>

          <div class="relative min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-md">
            <span class="material-symbols-outlined pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
            <input
              v-model="search"
              type="search"
              class="h-11 w-full rounded-full border border-outline-variant/25 bg-white pe-3 ps-10 text-[13px] outline-none focus:ring-2 focus:ring-primary/15"
              :placeholder="t.dashSearchPlaceholder"
            />
          </div>

          <div class="flex items-center gap-1 rounded-full bg-white px-1 py-1 shadow-sm">
            <button
              type="button"
              class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container-low"
              @click="shiftViewDate(-1)"
            >
              <span class="material-symbols-outlined text-[18px]">{{ locale === 'fa' ? 'chevron_right' : 'chevron_left' }}</span>
            </button>
            <button type="button" class="px-2 text-[12px] font-bold sm:text-[13px]" @click="goToday">
              {{ dateLabel }}
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container-low"
              @click="shiftViewDate(1)"
            >
              <span class="material-symbols-outlined text-[18px]">{{ locale === 'fa' ? 'chevron_left' : 'chevron_right' }}</span>
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-1">
            <button
              v-for="v in (['today', 'staff', 'day', 'week', 'month'] as CalView[])"
              :key="v"
              type="button"
              class="min-h-9 cursor-pointer rounded-full px-2.5 text-[11px] font-bold sm:px-3 sm:text-[12px]"
              :class="calView === v ? 'bg-primary text-on-primary' : 'bg-white text-on-surface-variant hover:bg-surface-container-low'"
              @click="v === 'today' ? goToday() : ((calView = v), (activeNav = 'calendar'))"
            >
              {{
                v === 'today'
                  ? t.dashViewToday
                  : v === 'staff'
                    ? t.dashViewStaff
                    : v === 'day'
                      ? t.dashViewDay
                      : v === 'week'
                        ? t.dashViewWeek
                        : t.dashViewMonth
              }}
            </button>
          </div>

          <div class="ms-auto flex flex-wrap items-center gap-2">
            <div class="flex h-10 items-center rounded-full bg-white p-0.5 shadow-sm" role="group">
              <button
                type="button"
                class="h-9 min-w-9 cursor-pointer rounded-full px-2.5 font-latin text-[11px] font-bold"
                :class="locale === 'fa' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
                @click="setLocale('fa')"
              >
                FA
              </button>
              <button
                type="button"
                class="h-9 min-w-9 cursor-pointer rounded-full px-2.5 font-latin text-[11px] font-bold"
                :class="locale === 'en' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
                @click="setLocale('en')"
              >
                EN
              </button>
            </div>
            <button
              type="button"
              class="hidden min-h-10 cursor-pointer items-center gap-1 rounded-full border border-outline-variant/30 bg-white px-3 text-[12px] font-semibold md:inline-flex"
              @click="availOpen = true"
            >
              <span class="material-symbols-outlined text-[16px]">schedule</span>
              {{ t.dashManageAvailability }}
            </button>
            <button
              type="button"
              class="hidden min-h-10 cursor-pointer items-center gap-1 rounded-full border border-outline-variant/30 bg-white px-3 text-[12px] font-semibold lg:inline-flex"
            >
              <span class="material-symbols-outlined text-[16px]">ios_share</span>
              {{ t.dashShareCalendar }}
            </button>
            <button
              type="button"
              class="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-bold text-on-primary shadow-sm sm:px-4"
              @click="openCreate()"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              {{ t.dashNewAppt }}
            </button>
          </div>
        </div>

        <!-- Stats strip -->
        <div class="flex gap-3 overflow-x-auto border-t border-outline-variant/15 px-3 py-2.5 text-[11px] sm:px-5 lg:px-6 scrollbar-none">
          <span class="shrink-0 font-semibold text-primary">{{ t.dashBranchLabel }}</span>
          <span class="shrink-0 text-outline-variant">|</span>
          <span class="shrink-0 text-on-surface-variant">
            {{ t.dashStatsRevenue }}:
            <strong class="text-on-surface">{{
              (dashRes?.data.stats.revenueToday ?? 42500000).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US')
            }} {{ locale === 'fa' ? 'ت' : 'T' }}</strong>
          </span>
          <span class="shrink-0 text-outline-variant">|</span>
          <span class="shrink-0 text-on-surface-variant">
            {{ t.dashStatsRooms }}:
            <strong class="text-on-surface">{{ dashRes?.data.stats.activeRooms ?? 4 }}</strong>
          </span>
          <span class="shrink-0 text-outline-variant">|</span>
          <span class="shrink-0 text-on-surface-variant">
            {{ t.dashStatsToday }}:
            <strong class="text-on-surface">{{ dashRes?.data.stats.appointmentsToday ?? 18 }}</strong>
          </span>
          <span class="ms-auto shrink-0 font-latin text-on-surface-variant">{{ t.dashTimezone }} · {{ clockLabel }}</span>
        </div>
      </header>

      <div class="relative flex-1 p-3 sm:p-5 lg:p-6">
        <!-- CALENDAR -->
        <section v-if="activeNav === 'calendar'" class="min-w-0 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="text-[18px] font-bold">{{ t.dashNavCalendar }}</h2>
              <p class="text-[12px] text-on-surface-variant">{{ dateLabel }}</p>
            </div>
            <button
              type="button"
              class="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full bg-primary px-4 text-[12px] font-bold text-on-primary"
              @click="openCreate()"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              {{ t.dashNewAppt }}
            </button>
          </div>

          <StaffCalendar
            :view-date="viewDate"
            :cal-view="calView"
            :staff="activeStaff.map((s) => ({ id: s.id, name: s.name }))"
            :events="fcEvents"
            @moved="refreshDash()"
            @select="selectedBookingId = $event"
            @create="openCreate($event)"
          />

          <div
            v-if="selectedBookingId"
            class="flex flex-wrap items-center gap-2 rounded-2xl border border-outline-variant/20 bg-white p-3 text-[12px]"
          >
            <span class="font-bold">نوبت انتخاب‌شده:</span>
            <code class="font-latin text-primary">{{ selectedBookingId }}</code>
            <button type="button" class="rounded-full bg-primary/10 px-3 py-1.5 font-bold" @click="setBookingStatus(selectedBookingId, 'completed')">انجام‌شده</button>
            <button type="button" class="rounded-full bg-primary/10 px-3 py-1.5 font-bold" @click="setBookingStatus(selectedBookingId, 'confirmed')">تأیید</button>
            <button type="button" class="rounded-full border px-3 py-1.5 font-bold" @click="setBookingStatus(selectedBookingId, 'no_show')">غیبت</button>
            <button type="button" class="rounded-full border px-3 py-1.5 font-bold text-primary" @click="setBookingStatus(selectedBookingId, 'cancelled')">لغو</button>
            <button type="button" class="ms-auto text-on-surface-variant" @click="selectedBookingId = null">بستن</button>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-white shadow-sm">
            <div class="min-w-[720px]">
              <!-- header row -->
              <div
                class="grid sticky top-0 z-10 border-b border-outline-variant/15 bg-[#fefae0]"
                :style="{ gridTemplateColumns: `3.5rem repeat(${Math.max(activeStaff.length, 1)}, minmax(12rem, 1fr))` }"
              >
                <div />
                <div
                  v-for="s in activeStaff"
                  :key="s.id"
                  class="flex items-center gap-2 border-s border-outline-variant/15 px-3 py-3"
                >
                  <img :src="s.photo" alt="" class="h-9 w-9 rounded-full object-cover" />
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-bold">{{ s.name }}</p>
                    <p class="truncate text-[10px] text-on-surface-variant">{{ s.role }}</p>
                  </div>
                </div>
              </div>

              <!-- body: mouse moves the guide line -->
              <div
                class="relative cursor-crosshair"
                @mousemove="onGridMouseMove"
                @mouseleave="onGridMouseLeave"
              >
                <div
                  class="grid"
                  :style="{ gridTemplateColumns: `3.5rem repeat(${Math.max(activeStaff.length, 1)}, minmax(12rem, 1fr))` }"
                >
                  <div class="relative border-e border-outline-variant/10">
                    <div v-for="h in hours" :key="h" class="flex h-[4.5rem] items-start justify-end pe-2 pt-1">
                      <span class="font-latin text-[10px] text-on-surface-variant">{{ formatHour(h) }}</span>
                    </div>
                  </div>

                  <div
                    v-for="s in activeStaff"
                    :key="`col-${s.id}`"
                    class="relative border-s border-outline-variant/10"
                    :style="{ height: `${hours.length * HOUR_ROW_REM}rem` }"
                  >
                    <div
                      v-for="h in hours"
                      :key="`${s.id}-${h}`"
                      class="absolute inset-x-0 border-b border-outline-variant/10"
                      :style="{ top: `${(h - GRID_START) * HOUR_ROW_REM}rem`, height: `${HOUR_ROW_REM}rem` }"
                    />

                    <article
                      v-for="b in blocksForStaff(s.id)"
                      :key="b.id"
                      class="absolute inset-x-1 z-10 overflow-hidden rounded-xl border px-2 py-1.5 shadow-sm"
                      :class="statusClass(b.status)"
                      :style="blockStyle(b)"
                    >
                      <template v-if="b.status === 'buffer'">
                        <p class="text-[10px] font-semibold opacity-80">{{ b.service }}</p>
                      </template>
                      <template v-else>
                        <div class="flex items-start justify-between gap-1">
                          <p class="truncate text-[11px] font-bold leading-tight">
                            {{ b.patient }}
                            <span v-if="b.vip" class="text-primary">VIP</span>
                          </p>
                          <span v-if="b.meet" class="material-symbols-outlined shrink-0 text-[14px]">videocam</span>
                        </div>
                        <p class="mt-0.5 line-clamp-2 text-[10px] leading-snug opacity-90">{{ b.service }}</p>
                        <div class="mt-1 flex flex-wrap gap-1">
                          <span class="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-bold">{{ statusLabel(b.status) }}</span>
                          <span v-if="b.unit" class="rounded-full bg-white/50 px-1.5 py-0.5 text-[9px]">{{ b.unit }}</span>
                          <span v-if="b.price" class="rounded-full bg-white/50 px-1.5 py-0.5 text-[9px] font-semibold">{{ b.price }}</span>
                        </div>
                      </template>
                    </article>
                  </div>
                </div>

                <!-- current time (subtle) -->
                <div
                  v-if="nowLineTop != null && mouseLineTop == null"
                  class="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-primary"
                  :style="{ top: `${nowLineTop}rem` }"
                >
                  <span class="absolute -top-1.5 start-0 h-3 w-3 rounded-full bg-primary" />
                  <span class="absolute -top-2.5 start-4 rounded bg-primary px-1.5 py-0.5 font-latin text-[9px] font-bold text-on-primary">{{ clockLabel }}</span>
                </div>

                <!-- mouse guide line -->
                <div
                  v-if="guideLineTop != null && mouseLineTop != null"
                  class="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-primary"
                  :style="{ top: `${guideLineTop}rem` }"
                >
                  <span class="absolute -top-1.5 start-0 h-3 w-3 rounded-full bg-primary shadow" />
                  <span class="absolute -top-2.5 start-4 rounded bg-primary px-1.5 py-0.5 font-latin text-[9px] font-bold text-on-primary">{{ guideTimeLabel }}</span>
                </div>
              </div>
            </div>
          </div>

          <p v-if="liveBooking" class="mt-3 text-[12px] text-on-surface-variant">
            {{ t.dashApptTitle }} · {{ liveBooking.name }} — {{ liveBooking.service }}
            <span class="font-latin font-bold text-primary">({{ liveBooking.code }})</span>
          </p>
        </section>

        <!-- CONTACTS -->
        <section v-else-if="activeNav === 'contacts'" class="space-y-3">
          <h2 class="text-[20px] font-bold">{{ t.dashCustomersTitle }}</h2>
          <div class="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm">
            <div class="hidden grid-cols-5 gap-2 border-b border-outline-variant/15 bg-[#fefae0] px-4 py-2.5 text-[11px] font-bold text-on-surface-variant md:grid">
              <span>{{ t.dashApptPatient }}</span>
              <span>{{ t.dashFileNo }}</span>
              <span>{{ t.dashPhone }}</span>
              <span>{{ t.dashLastVisit }}</span>
              <span>{{ t.dashApptStatus }}</span>
            </div>
            <div
              v-for="c in customers"
              :key="c.file"
              class="grid gap-1 border-b border-outline-variant/10 px-4 py-3 text-[13px] last:border-0 md:grid-cols-5 md:items-center md:gap-2"
            >
              <span class="font-bold">{{ c.name }}</span>
              <span class="font-latin text-[12px] text-primary">{{ c.file }}</span>
              <span dir="ltr" class="text-on-surface-variant">{{ c.phone }}</span>
              <span class="text-on-surface-variant">{{ c.last }}</span>
              <span v-if="c.tag" class="w-fit rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-bold text-on-secondary-fixed">{{ c.tag }}</span>
              <span v-else class="text-[11px] text-on-surface-variant">—</span>
            </div>
          </div>
        </section>

        <!-- SERVICES -->
        <section v-else-if="activeNav === 'services'" class="space-y-3">
          <h2 class="text-[20px] font-bold">{{ t.dashServicesTitle }}</h2>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article
              v-for="svc in servicesCatalog"
              :key="svc.title"
              class="rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-sm"
            >
              <h3 class="text-[15px] font-bold">{{ svc.title }}</h3>
              <p class="mt-2 text-[12px] text-on-surface-variant">{{ svc.duration }}</p>
              <p class="mt-3 text-[14px] font-bold text-primary">{{ svc.price }} {{ t.toman }}</p>
            </article>
          </div>
        </section>

        <!-- BOOKING LINKS (Calendly event types) -->
        <section v-else-if="activeNav === 'links'" class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-[20px] font-bold">{{ t.dashNavLinks }}</h2>
            <button type="button" class="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full bg-on-surface px-4 text-[12px] font-bold text-white">
              <span class="material-symbols-outlined text-[18px]">add</span>
              {{ t.dashCreate }}
            </button>
          </div>

          <div class="flex gap-1 overflow-x-auto border-b border-outline-variant/20 scrollbar-none">
            <button
              v-for="tab in ([
                ['events', t.dashTabEventTypes],
                ['single', t.dashTabSingle],
                ['polls', t.dashTabPolls],
                ['routing', t.dashTabRouting],
              ] as const)"
              :key="tab[0]"
              type="button"
              class="shrink-0 cursor-pointer border-b-2 px-3 py-2 text-[12px] font-semibold"
              :class="linkTab === tab[0] ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'"
              @click="linkTab = tab[0]"
            >
              {{ tab[1] }}
            </button>
          </div>

          <div v-if="linkTab === 'events'" class="space-y-3">
            <article
              v-for="ev in eventTypes"
              :key="ev.id"
              class="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm"
            >
              <div class="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-0">
                <div class="flex min-w-0 flex-1 items-stretch gap-3 sm:gap-0">
                  <div class="hidden w-1.5 self-stretch sm:block" :style="{ background: ev.color }" />
                  <div class="mt-1 h-10 w-1.5 rounded-full sm:hidden" :style="{ background: ev.color }" />
                  <div class="min-w-0 flex-1 py-1 sm:px-4 sm:py-4">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-[15px] font-bold">{{ ev.title }}</h3>
                      <span v-if="ev.shared" class="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-bold">{{ t.dashShared }}</span>
                    </div>
                    <p class="mt-1 text-[12px] text-on-surface-variant">
                      {{ ev.duration }} {{ t.dashMinutes }} ·
                      {{ ev.location === 'clinic' ? t.dashClinicMeet : t.dashVideoMeet }} ·
                      {{ ev.kind === 'one' ? t.dashOneOnOne : t.dashGroup }}
                    </p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2 sm:pe-4">
                  <button
                    type="button"
                    class="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full border border-outline-variant/30 px-3 text-[12px] font-semibold"
                    @click="copyText(`${publicBookUrl}?service=${encodeURIComponent(ev.title)}`, ev.id)"
                  >
                    <span class="material-symbols-outlined text-[16px]">link</span>
                    {{ copiedId === ev.id ? t.dashCopied : t.dashCopyLink }}
                  </button>
                  <RouterLink
                    :to="{ name: 'book', query: { service: ev.title } }"
                    class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-outline-variant/30"
                  >
                    <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                  </RouterLink>
                </div>
              </div>
            </article>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-outline-variant/40 bg-white p-8 text-center text-[13px] text-on-surface-variant">
            {{ linkTab === 'single' ? t.dashTabSingle : linkTab === 'polls' ? t.dashTabPolls : t.dashTabRouting }}
            — Calendly-style
          </div>
        </section>

        <!-- REPORTS -->
        <section v-else-if="activeNav === 'reports'" class="space-y-4">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="text-[20px] font-bold">{{ t.dashReportsTitle }}</h2>
              <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.dashReportsSubtitle }}</p>
            </div>
            <a
              href="/api/reports/revenue?format=csv"
              class="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-[12px] font-bold text-on-primary"
            >
              خروجی Excel/CSV
            </a>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-sm">
              <p class="text-[11px] text-on-surface-variant">{{ t.dashStatsRevenue }}</p>
              <p class="mt-1 text-[22px] font-bold">
                {{ (dashRes?.data.stats.revenueToday ?? 0).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') }}
              </p>
            </div>
            <div class="rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-sm">
              <p class="text-[11px] text-on-surface-variant">{{ t.dashStatsToday }}</p>
              <p class="mt-1 text-[22px] font-bold">{{ dashRes?.data.stats.appointmentsToday ?? 0 }}</p>
            </div>
            <div class="rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-sm">
              <p class="text-[11px] text-on-surface-variant">ماه</p>
              <p class="mt-1 text-[22px] font-bold">
                {{ Number((dashRes?.data.stats as { revenueMonth?: number })?.revenueMonth || 0).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US') }}
              </p>
            </div>
          </div>
          <div class="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm">
            <div
              v-for="row in reportRows"
              :key="row.label"
              class="flex items-center justify-between border-b border-outline-variant/10 px-4 py-3 text-[13px] last:border-0"
            >
              <span class="font-semibold">{{ row.label }}</span>
              <span class="font-bold text-primary">{{ row.amount }} {{ t.toman }}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full border px-4 py-2 text-[12px] font-bold"
              @click="$fetch('/api/admin/reminders', { method: 'POST' }).then((r: any) => alert('SMS: ' + r.sent))"
            >
              ارسال یادآوری پیامک
            </button>
            <button
              type="button"
              class="rounded-full border px-4 py-2 text-[12px] font-bold"
              @click="$fetch('/api/admin/backup', { method: 'POST' }).then((r: any) => alert(r.path))"
            >
              بکاپ SQLite
            </button>
          </div>
        </section>

        <!-- AUTOMATIONS -->
        <section v-else-if="activeNav === 'automations'" class="mx-auto max-w-xl space-y-4">
          <div>
            <h2 class="text-[20px] font-bold">{{ t.dashAutomationsTitle }}</h2>
            <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.dashAutomationsDesc }}</p>
          </div>
          <div class="space-y-2 rounded-2xl border border-outline-variant/20 bg-white p-3 shadow-sm">
            <label
              v-for="(auto, i) in automations"
              :key="auto.id"
              class="flex min-h-12 cursor-pointer items-center justify-between rounded-xl px-3 hover:bg-surface-container-low"
            >
              <span class="text-[13px] font-semibold">
                {{
                  auto.id === 'sms'
                    ? t.dashAutoSms
                    : auto.id === 'email'
                      ? t.dashAutoEmail
                      : auto.id === 'buffer'
                        ? t.dashAutoBuffer
                        : t.dashAutoSync
                }}
              </span>
              <input v-model="automations[i].on" type="checkbox" class="h-4 w-4 accent-primary" />
            </label>
          </div>
        </section>

        <!-- SETTINGS / AVAILABILITY -->
        <section v-else class="mx-auto max-w-xl space-y-4">
          <div>
            <h2 class="text-[20px] font-bold">{{ t.dashSettingsTitle }}</h2>
            <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.dashAvailDesc }}</p>
          </div>
          <button
            type="button"
            class="flex min-h-12 w-full cursor-pointer items-center justify-between rounded-2xl border border-outline-variant/20 bg-white px-4 text-start shadow-sm hover:bg-surface-container-low"
            @click="availOpen = true"
          >
            <span class="flex items-center gap-3 text-[14px] font-bold">
              <span class="material-symbols-outlined text-primary">calendar_month</span>
              {{ t.dashManageAvailability }}
            </span>
            <span class="material-symbols-outlined text-on-surface-variant">{{
              locale === 'fa' ? 'chevron_left' : 'chevron_right'
            }}</span>
          </button>
          <p class="text-[12px] text-on-surface-variant">
            {{ t.availWorkingHours }} · {{ t.availTimezone }}: Asia/Tehran
          </p>
        </section>

        <!-- Smart reception widget -->
        <aside
          v-if="reception && activeNav === 'calendar'"
          class="fixed bottom-4 end-4 z-40 w-[min(100%-2rem,20rem)] overflow-hidden rounded-2xl border border-outline-variant/25 bg-white shadow-[0_20px_50px_-20px_rgba(138,72,83,0.45)]"
        >
          <div class="bg-primary px-4 py-3 text-on-primary">
            <p class="text-[11px] font-bold opacity-90">{{ t.dashReceptionTitle }}</p>
            <p class="mt-0.5 text-[15px] font-bold">{{ reception.patient }}</p>
            <p class="font-latin text-[11px] opacity-80">{{ reception.code }}</p>
          </div>
          <div class="space-y-3 p-4">
            <div class="flex items-center justify-between text-[13px]">
              <span class="text-on-surface-variant">{{ t.dashReceptionBalance }}</span>
              <strong class="text-primary">{{ reception.balance }}</strong>
            </div>
            <div
              v-if="reception.allergy"
              class="rounded-xl bg-[#faedcd] px-3 py-2 text-[11px] font-semibold text-primary"
            >
              {{ t.dashReceptionAllergy }}: {{ reception.allergy }}
            </div>
            <button
              type="button"
              class="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-primary text-[13px] font-bold text-on-primary"
            >
              {{ t.dashReceptionSettle }}
            </button>
            <textarea
              v-model="receptionNote"
              rows="2"
              class="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-primary/15"
              :placeholder="t.dashReceptionNote"
            />
          </div>
        </aside>
      </div>
    </div>

    <AvailabilityModal v-model:open="availOpen" />

    <!-- Create appointment (Calendly-style quick create) -->
    <div
      v-if="createOpen"
      class="fixed inset-0 z-[70] flex items-end justify-center bg-on-surface/40 p-4 backdrop-blur-[2px] sm:items-center"
      data-backdrop="1"
      @click="(e) => (e.target as HTMLElement).dataset.backdrop === '1' && (createOpen = false)"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" @click.stop>
        <div class="flex items-center justify-between">
          <h3 class="text-[16px] font-bold">{{ t.dashNewAppt }}</h3>
          <button type="button" class="rounded-full p-2 hover:bg-surface-container-low" @click="createOpen = false">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form class="mt-4 space-y-3" @submit.prevent="submitCreate">
          <input v-model="createForm.name" required class="h-11 w-full rounded-xl border px-3 text-[13px]" :placeholder="t.dashApptPatient" />
          <input v-model="createForm.phone" required pattern="09[0-9]{9}" class="h-11 w-full rounded-xl border px-3 text-[13px]" placeholder="09xxxxxxxxx" />
          <select v-model="createForm.serviceId" class="h-11 w-full rounded-xl border px-3 text-[13px]">
            <option v-for="s in dashRes?.data?.services || []" :key="s.id" :value="s.id">{{ locale === 'fa' ? s.titleFa : s.titleEn }}</option>
          </select>
          <select v-model="createForm.staffId" class="h-11 w-full rounded-xl border px-3 text-[13px]">
            <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <div class="grid grid-cols-2 gap-2">
            <input v-model="createForm.date" type="date" required class="h-11 rounded-xl border px-3 text-[13px]" />
            <input v-model="createForm.time" type="time" required class="h-11 rounded-xl border px-3 text-[13px]" />
          </div>
          <textarea v-model="createForm.notes" rows="2" class="w-full rounded-xl border px-3 py-2 text-[13px]" :placeholder="t.dashReceptionNote" />
          <p v-if="createError" class="text-[12px] text-primary">{{ createError }}</p>
          <button
            type="submit"
            class="flex h-11 w-full items-center justify-center rounded-full bg-primary text-[13px] font-bold text-on-primary disabled:opacity-60"
            :disabled="createBusy"
          >
            {{ createBusy ? '…' : t.dashNewAppt }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
