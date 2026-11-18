<script setup lang="ts">
// import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useLanguage } from '../i18n/useLanguage'
import { assets } from '../data/assets'
import AvailabilityModal from './AvailabilityModal.vue'
import { useToast } from '../composables/useToast.ts'
import { onClickOutside } from '@vueuse/core'
import { averageTicket, breakdownBy, recentBookings, revenuePoints } from '~/composables/useRevenueReport.ts'
import { periodDelta } from '~/composables/useBookingStats'

type NavId = 'overview' | 'calendar' | 'contacts' | 'services' | 'links' | 'reports' | 'automations' | 'settings'
type CalView = 'today' | 'staff' | 'day' | 'week' | 'month'
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
        staffLink?: { linked: boolean }
        stats: {
          revenueToday: number
          appointmentsToday: number
          activeRooms: number
          weekAppointments: number
          revenueMonth: number
          newCustomers: number
          cancelRate: number
        }
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
          phone?: string
          paymentStatus?: string
          createdAt?: string
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
        services: Array<{ id: string; titleFa: string; titleEn: string; category?: string; duration: number; price: number; color: string; location: string; active?: boolean }>
        doctors: Array<{ id: string; nameFa: string; nameEn: string; roleFa: string; roleEn: string; active: boolean }>
        customers: Array<{ id: string; name: string; phone: string; fileNo: string; lastVisit: string; tag?: string; notes?: string; allergy?: string }>
        calendarSlots: ApiCalendarSlot[]
        kpiSeries?: Array<{ d: string; revenue: number; count: number }>
      }
    }>(`/api/dashboard?date=${viewDate.value}`),
  { watch: [viewDate] },
)
// برای دکمه‌های پیامک و بکاپ در بخش درآمد: show همان toast(message, type) است
const { show: toast } = useToast()

// ورود نمایشی: فقط‌خواندنی (سرور هم هر درخواست نوشتن را رد می‌کند)
const { data: meRes } = useAsyncData('dash-me', () =>
  $fetch<{ user: { name?: string } | null; demo?: boolean }>('/api/auth/me').catch(() => ({ user: null, demo: false })),
)
const isDemo = computed(() => meRes.value?.demo === true)
function denyInDemo() {
  toast(t.value.dashDemoReadOnly, 'error')
}

const showAlert = (message: string) => {
  if (typeof window !== 'undefined') {
    window.alert(message)
  }
}
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const revenuePeriod = ref<7 | 14 | 30>(14)
const revenueBookings = computed(() => dashRes.value?.data.bookings ?? [])
const revenueKpis = computed(() => ({
  today: dashRes.value?.data.stats.revenueToday,
  month: dashRes.value?.data.stats.revenueMonth,
  avgTicket: averageTicket(revenueBookings.value, viewDate.value, revenuePeriod.value),
  weekDelta: periodDelta(revenueBookings.value, viewDate.value),
}))
const revenueDays = computed(() => revenuePoints(revenueBookings.value, viewDate.value, revenuePeriod.value))
const revenueByService = computed(() => breakdownBy(revenueBookings.value, viewDate.value, revenuePeriod.value, 'service'))
const revenueByDoctor = computed(() => breakdownBy(revenueBookings.value, viewDate.value, revenuePeriod.value, 'doctor'))

const revenueRecent = computed(() => recentBookings(
  dashRes.value?.data.bookings ?? []
))
const activeRoomsLabel = computed(() => {
  const n = dashRes.value?.data.stats.activeRooms
  return n === undefined ? '—' : n.toLocaleString(locale.value === 'fa' ? 'fa-IR' : 'en-US')
})
const overviewSlots = computed(() => (dashRes.value?.data.calendarSlots ?? []).filter((s) => !s.date || s.date === viewDate.value))
const activeNav = ref<NavId>('overview')
const calView = ref<CalView>('staff')
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
const showDatePicker = ref(false)

const GRID_START = 9
const GRID_END = 17

const clockNow = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null

const clockLabel = computed(() => {
  const d = clockNow.value
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

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

function onPickDate(iso: string) {
  viewDate.value = iso
  showDatePicker.value = false
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
    .map((b): CalBlock | null => {
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
      }
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

const moreOpen = ref(false)
const moreRoot = ref<HTMLElement | null>(null)
onClickOutside(moreRoot, () => (moreOpen.value = false))

/** لینک رزرو هر خدمت فعال؛ همان خدماتی که پایگاه‌داده دارد (شناسهٔ خدمت در ?service= می‌رود). */
const eventTypes = computed(() =>
  (dashRes.value?.data?.services ?? [])
    .filter((s) => s.active !== false)
    .map((s) => ({
      id: s.id,
      title: locale.value === 'fa' ? s.titleFa : s.titleEn,
      duration: s.duration,
      location: s.location,
      color: s.color,
    })),
)

const autoBusy = ref<'remind' | 'backup' | null>(null)

async function sendReminders() {
  if (isDemo.value) return denyInDemo()
  if (!window.confirm(t.value.dashAutoRemindConfirm)) return
  autoBusy.value = 'remind'
  try {
    const r = await $fetch<{ ok: boolean; sent: number }>('/api/admin/reminders', { method: 'POST' })
    toast(`${t.value.dashAutoRemindDone}: ${r.sent}`)
  } catch {
    toast(t.value.dashAutoError, 'error')
  } finally {
    autoBusy.value = null
  }
}

async function runBackup() {
  if (isDemo.value) return denyInDemo()
  autoBusy.value = 'backup'
  try {
    await $fetch('/api/admin/backup', { method: 'POST' })
    toast(t.value.dashAutoBackupDone)
  } catch {
    toast(t.value.dashAutoError, 'error')
  } finally {
    autoBusy.value = null
  }
}

const reception = computed(() => {
  const progress = calendarBlocks.value.find((b) => b.status === 'progress')
  if (!progress) return null
  return {
    patient: progress.patient,
    code: progress.fileNo || '—',
    balance: progress.balance ?? '',
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

function openAvailability() {
  if (isDemo.value) return denyInDemo()
  availOpen.value = true
}

function openCreate(prefill?: { staffId?: string; startsAt?: string }) {
  if (isDemo.value) return denyInDemo()
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

/** شناسهٔ رویداد تقویم برای نوبت‌های ساخته‌شده از bookings با `bk-` شروع می‌شود؛ API شناسهٔ خام می‌خواهد. */
const rawBookingId = (id: string) => id.replace(/^bk-/, '')

const selectedBooking = computed(() => {
  const id = selectedBookingId.value
  return id ? (dashRes.value?.data?.bookings ?? []).find((b) => b.id === rawBookingId(id)) : undefined
})

async function patchBooking(id: string, body: { status?: string; paymentStatus?: 'paid' | 'unpaid' }, okMessage: string) {
  if (isDemo.value) return denyInDemo()
  try {
    await $fetch(`/api/bookings/${rawBookingId(id)}`, { method: 'PATCH', body })
    await refreshDash()
    selectedBookingId.value = null
    toast(okMessage)
  } catch (e: unknown) {
    toast((e as { data?: { statusMessage?: string } })?.data?.statusMessage || t.value.dashAutoError, 'error')
  }
}

const setBookingStatus = (id: string, status: string) => patchBooking(id, { status }, t.value.dashStatusUpdated)

/** تسویه: پول دریافت شد و نوبت در درآمد حساب می‌شود؛ «لغو تسویه» برعکس. */
function toggleSettled(id: string) {
  const settled = selectedBooking.value?.paymentStatus === 'paid'
  return patchBooking(
    id,
    { paymentStatus: settled ? 'unpaid' : 'paid' },
    settled ? t.value.dashUnsettleDone : t.value.dashSettleDone,
  )
}

const fcEvents = computed(() => {
  const q = search.value.trim().toLowerCase()
  return calendarBlocks.value
    .filter((b) => b.status !== 'buffer')
    .filter(
      (b) =>
        !q ||
        b.patient.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q),
    )
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
    })
})

const publicBookUrl = computed(() => {
  if (typeof window === 'undefined') return '/book'
  return `${window.location.origin}/book`
})

const navItems = computed(() => [
  { id: 'overview' as const, label: t.value.dashNavOverview, icon: 'dashboard' },
  { id: 'calendar' as const, label: t.value.dashNavCalendar, icon: 'calendar_month' },
  { id: 'contacts' as const, label: t.value.dashNavContacts, icon: 'folder_shared' },
  { id: 'services' as const, label: t.value.dashNavServices, icon: 'spa' },
  { id: 'links' as const, label: t.value.dashNavLinks, icon: 'link' },
  { id: 'reports' as const, label: t.value.dashNavReports, icon: 'payments' },
  { id: 'automations' as const, label: t.value.dashNavAutomations, icon: 'bolt' },
  { id: 'settings' as const, label: t.value.dashNavSettings, icon: 'settings' },
])

/** نوار پایین موبایل: بخش‌های پرکاربرد؛ بقیه در کشوی سایدبار */
const dockItems = computed(() => [
  { id: 'overview' as const, label: t.value.dashMobHome, icon: 'home' },
  { id: 'calendar' as const, label: t.value.dashMobAppts, icon: 'calendar_month' },
  { id: 'links' as const, label: t.value.dashMobBooking, icon: 'event_available' },
])

/** موبایل: کشوی سایدبار؛ دسکتاپ: جمع/باز کردن سایدبار */
function toggleSidebar() {
  if (window.matchMedia('(min-width: 1024px)').matches) sidebarCollapsed.value = !sidebarCollapsed.value
  else sidebarOpen.value = true
}

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
  <div class="flex min-h-dvh w-full dash-wash text-on-surface">
    <button v-if="sidebarOpen" type="button" class="fixed inset-0 z-40 bg-on-surface/35 backdrop-blur-[2px] lg:hidden"
      :aria-label="t.dashMenu" @click="sidebarOpen = false" />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 z-50 flex w-68 flex-col glass-sidebar transition-transform duration-300 motion-reduce:transition-none lg:static lg:z-auto lg:translate-x-0"
      :class="[
        'inset-s-0',
        sidebarCollapsed ? 'lg:hidden' : '',
        sidebarOpen
          ? 'translate-x-0'
          : locale === 'fa'
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0',
      ]">
      <div class="border-b border-outline-variant/20 px-4 py-4">
        <div class="flex items-center gap-2.5">
          <img :src="assets.logo" alt="" class="h-8 w-auto object-contain" loading="lazy" />
          <div class="min-w-0">
            <p class="font-latin truncate text-[15px] font-semibold text-primary">{{ t.dashClinicName }}</p>
            <p class="truncate text-[10px] text-on-surface-variant">{{ t.dashClinicSub }}</p>
          </div>
          <button type="button"
            class="ms-auto inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full hover:bg-white/60 lg:hidden"
            @click="sidebarOpen = false">
            <Icon name="ph:x" />
          </button>
        </div>
      </div>

      <nav class="flex flex-col gap-0.5 p-3" aria-label="Dashboard">
        <button v-for="item in navItems" :key="item.id" type="button"
          class="relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-start text-[12.5px] font-semibold transition-colors"
          :class="activeNav === item.id
            ? 'bg-primary text-on-primary shadow-sm'
            : 'text-on-surface-variant hover:bg-white/55 hover:text-on-surface'
            " @click="selectNav(item.id)">
          <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span> <span
            class="min-w-0 leading-snug">{{ item.label }}</span>
        </button>
      </nav>

      <div v-if="dashRes?.data.staffLink?.linked !== false"
        class="mx-3 mt-1 rounded-2xl border border-outline-variant/20 bg-white/50 p-3">
        <p class="mb-2 text-[11px] font-bold text-on-surface">{{ t.dashActiveCalendars }}</p>
        <label v-for="s in staffList" :key="s.id"
          class="mb-1.5 flex cursor-pointer items-center gap-2 text-[12px] last:mb-0">
          <input type="checkbox" class="accent-primary" :checked="s.active" @change="toggleStaff(s.id)" />
          <span class="min-w-0 truncate font-medium">{{ s.name }}</span>
        </label>
      </div>

      <div class="mt-auto space-y-2 border-t border-outline-variant/20 p-3">
        <button type="button"
          class="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-outline-variant/30 bg-white/70 px-3 text-start text-[12px] font-semibold text-on-surface hover:bg-white"
          @click="openAvailability()">
          <Icon name="ph:calendar-check" />
          {{ t.dashConnectCalendar }}
        </button>

        <div class="rounded-2xl bg-primary p-3 text-on-primary shadow-sm">
          <p class="text-[11px] font-bold">{{ t.dashShareBooking }}</p>
          <p class="mt-0.5 text-[10px] opacity-80">{{ t.dashShareBookingHint }}</p>
          <div class="mt-2 flex items-center gap-2">
            <code class="min-w-0 flex-1 truncate rounded-lg bg-white/15 px-2 py-1.5 font-latin text-[11px]">
              lumina.clinic/book
            </code>
            <button type="button"
              class="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-lg bg-white px-2.5 text-[11px] font-bold text-primary"
              @click="copyText(publicBookUrl)">
              {{ bookingUrlCopied ? t.dashCopied : t.dashShare }}
            </button>
          </div>
        </div>

        <RouterLink to="/"
          class="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-[12px] font-semibold text-on-surface-variant hover:bg-white/55">
          <Icon name="ph:house" />
          {{ t.dashBackSite }}
        </RouterLink>
      </div>
    </aside>

    <!-- نوار ناوبری پایین (فقط موبایل و تبلت) -->
    <nav class="glass-dock fixed inset-x-0 bottom-0 z-30 lg:hidden" :aria-label="t.dashMobNav">
      <ul class="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <li v-for="item in dockItems" :key="item.id">
          <button type="button" :aria-current="activeNav === item.id ? 'page' : undefined"
            class="flex min-h-14 w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[10.5px] font-semibold transition-colors"
            :class="activeNav === item.id ? 'bg-primary/15 text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'"
            @click="selectNav(item.id)">
            <span class="material-symbols-outlined block h-6 w-6 overflow-hidden text-[24px]"
              :class="activeNav === item.id ? 'icon-fill' : ''" aria-hidden="true">{{ item.icon }}</span>
            <span class="max-w-full truncate">{{ item.label }}</span>
          </button>
        </li>
        <li>
          <NuxtLink to="/account"
            class="flex min-h-14 w-full cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[10.5px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low">
            <span class="material-symbols-outlined block h-6 w-6 overflow-hidden text-[24px]"
              aria-hidden="true">account_circle</span>
            <span class="max-w-full truncate">{{ t.dashMobAccount }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Main -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 glass-bar">
        <div class="flex flex-wrap items-center gap-2 px-3 py-3 sm:gap-3 sm:px-5 lg:px-6">
          <button type="button"
            class="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm"
            :aria-label="t.dashMenu" @click="toggleSidebar">
            <Icon name="ph:list" />
          </button>

          <div class="relative min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-md">
            <span
              class="material-symbols-outlined pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
            <input v-model="search" type="search" :aria-label="t.dashSearchPlaceholder"
              class="h-11 w-full rounded-full border border-outline-variant/25 bg-white pe-3 ps-10 text-[13px] outline-none focus:ring-2 focus:ring-primary/15"
              :placeholder="t.dashSearchPlaceholder" />
          </div>

          <div class="ms-auto flex flex-wrap items-center gap-2">
            <div class="flex h-10 items-center rounded-full bg-white p-0.5 shadow-sm" role="group">
              <button type="button"
                class="h-9 min-w-9 cursor-pointer rounded-full px-2.5 font-latin text-[11px] font-bold"
                :class="locale === 'fa' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
                @click="setLocale('fa')">
                FA
              </button>
              <button type="button"
                class="h-9 min-w-9 cursor-pointer rounded-full px-2.5 font-latin text-[11px] font-bold"
                :class="locale === 'en' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
                @click="setLocale('en')">
                EN
              </button>
            </div>
            <!--  -->
            <div ref="moreRoot" class="relative">
              <button type="button" aria-label="بیشتر" :aria-expanded="moreOpen" @click="moreOpen = !moreOpen"
                class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-outline-variant/30 bg-white">
                <span class="material-symbols-outlined">more_horiz</span>
              </button>
              <div v-if="moreOpen" class="absolute inset-e-0 top-full z-50 mt-2 w-56 rounded-2xl glass-strong p-1.5">
                <button type="button"
                  class="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-start text-[12px] font-semibold hover:bg-surface-container-low"
                  @click="openAvailability(); moreOpen = false">

                  <Icon name="ph:clock" />
                  {{ t.dashManageAvailability }}
                </button>
                <button type="button"
                  class="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-start text-[12px] font-semibold hover:bg-surface-container-low"
                  @click="copyText(publicBookUrl); toast(t.dashCopied); moreOpen = false">

                  <Icon name="ph:share-network" />
                  {{ t.dashShareCalendar }}
                </button>
              </div>
            </div>

            <button v-if="!isDemo" type="button"
              class="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-bold text-on-primary shadow-sm sm:px-4"
              @click="openCreate()">
              <Icon name="ph:plus" />
              {{ t.dashNewAppt }}
            </button>
          </div>
        </div>

        <!-- Branch + clock strip (KPIs live in DashboardKpiCards) -->
        <div
          class="flex gap-3 overflow-x-auto border-t border-outline-variant/15 px-3 py-2.5 text-[11px] sm:px-5 lg:px-6 scrollbar-none">
          <span class="shrink-0 font-semibold text-primary">{{ t.dashBranchLabel }}</span>
          <span class="shrink-0 text-on-surface-variant">{{ t.dashStatsRooms }}: <strong class="text-on-surface">{{ activeRoomsLabel }}</strong></span>
          <span class="ms-auto shrink-0 font-latin text-on-surface-variant">{{ t.dashTimezone }} · {{ clockLabel
          }}</span>
        </div>
      </header>

      <div class="relative flex-1 p-3 pb-24 sm:p-5 sm:pb-24 lg:p-6">
        <!-- حساب پرسنل بدون اتصال به پزشک -->
        <p v-if="isDemo" role="status"
          class="mb-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-[13px] font-semibold text-on-surface">
          {{ t.dashDemoBanner }}
        </p>

        <section v-if="dashRes?.data.staffLink?.linked === false" class="mx-auto max-w-xl space-y-3 py-10 text-center"
          role="status">
          <h2 class="text-lg font-bold text-on-surface">
            {{ locale === 'fa' ? 'حساب شما به پزشک متصل نیست' : 'Your account is not linked to a doctor' }}
          </h2>
          <p class="text-sm text-on-surface-variant">
            {{ locale === 'fa'
              ? 'برای دیدن نوبت‌ها، مدیر کلینیک باید حساب شما را به پروفایل پزشک وصل کند.'
              : 'To see appointments, a clinic admin must link your account to your doctor profile.' }}
          </p>
        </section>

        <!-- OVERVIEW -->
        <section v-else-if="activeNav === 'overview'" class="min-w-0">
          <DashboardOverview :stats="dashRes?.data.stats" :bookings="dashRes?.data.bookings ?? []"
            :day-bookings="dashRes?.data.dayBookings ?? []" :doctors="activeStaff" :slots="overviewSlots"
            :view-date="viewDate" :date-label="dateLabel" :loading="!dashRes" @select-date="onPickDate" />
        </section>

        <!-- CALENDAR -->
        <section v-else-if="activeNav === 'calendar'" class="min-w-0 space-y-4">
          <div>
            <h2 class="text-[18px] font-bold">{{ t.dashNavCalendar }}</h2>
            <p class="text-[12px] text-on-surface-variant">{{ dateLabel }}</p>
          </div>

          <!-- Calendar toolbar: date navigation + view switcher -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative flex items-center gap-1 rounded-full bg-white px-1 py-1 shadow-sm">
              <button type="button" :aria-label="locale === 'fa' ? 'قبلی' : 'Previous'"
                class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container-low"
                @click="shiftViewDate(-1)">
                <span class="material-symbols-outlined text-[18px]">{{ locale === 'fa' ? 'chevron_right' :
                  'chevron_left' }}</span>
              </button>
              <button type="button" class="px-2 text-[12px] font-bold sm:text-[13px]"
                @click="showDatePicker = !showDatePicker">
                {{ dateLabel }}
              </button>
              <JalaliCalendarPopover v-if="showDatePicker" class="absolute top-full z-50 mt-2" :model-iso="viewDate"
                min-iso="2020-01-01" @select="onPickDate" @close="showDatePicker = false" />
              <button type="button" :aria-label="locale === 'fa' ? 'بعدی' : 'Next'"
                class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container-low"
                @click="shiftViewDate(1)">
                <span class="material-symbols-outlined text-[18px]">{{ locale === 'fa' ? 'chevron_left' :
                  'chevron_right' }}</span>
              </button>
            </div>

            <button type="button"
              class="min-h-9 cursor-pointer rounded-full bg-white px-3 text-[12px] font-bold text-on-surface-variant shadow-sm hover:bg-surface-container-low"
              @click="goToday">
              {{ t.dashViewToday }}
            </button>

            <div class="flex items-center rounded-full bg-white p-0.5 shadow-sm" role="group"
              :aria-label="t.dashNavCalendar">
              <button v-for="v in (['staff', 'day', 'week', 'month'] as CalView[])" :key="v" type="button"
                class="min-h-9 cursor-pointer rounded-full px-2.5 text-[11px] font-bold sm:px-3 sm:text-[12px]"
                :class="calView === v ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'"
                :aria-pressed="calView === v" @click="calView = v">
                {{
                  v === 'staff'
                    ? t.dashViewStaff
                    : v === 'day'
                      ? t.dashViewDay
                      : v === 'week'
                        ? t.dashViewWeek
                        : t.dashViewMonth
                }}
              </button>
            </div>
          </div>

          <!-- فیلتر پزشک‌ها (همان وضعیت چک‌باکس‌های سایدبار) -->
          <div class="flex flex-wrap items-center gap-2" role="group" :aria-label="t.dashActiveCalendars">
            <button v-for="s in staffList" :key="s.id" type="button" :aria-pressed="s.active"
              class="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border py-1 pe-3 ps-1 text-[12px] font-semibold transition-colors"
              :class="s.active ? 'border-primary/40 bg-primary/15 text-on-surface' : 'border-outline-variant/30 bg-white text-on-surface-variant opacity-70 hover:opacity-100'"
              @click="toggleStaff(s.id)">
              <NuxtImg :src="s.photo" alt="" class="h-7 w-7 rounded-full object-cover" format="webp" width="56" loading="lazy" />
              <span lang="fa" dir="auto">{{ s.name }}</span>
            </button>
          </div>

          <StaffCalendar :view-date="viewDate" :cal-view="calView"
            :staff="activeStaff.map((s) => ({ id: s.id, name: s.name }))" :events="fcEvents" :readonly="isDemo" @moved="refreshDash()"
            @select="selectedBookingId = $event" @create="openCreate($event)" />

          <div v-if="selectedBookingId"
            class="flex flex-wrap items-center gap-2 rounded-2xl border border-outline-variant/20 bg-white p-3 text-[12px]">
            <span class="font-bold">{{ t.dashSelBooking }}</span>
            <code class="font-latin text-primary">{{ selectedBooking?.code ?? selectedBookingId }}</code>
            <span v-if="selectedBooking"
              class="rounded-full px-2 py-0.5 font-semibold"
              :class="selectedBooking.paymentStatus === 'paid' ? 'bg-sage/60 text-on-surface' : 'bg-surface-container text-on-surface-variant'">
              {{ selectedBooking.paymentStatus === 'paid' ? t.dashPaySettled : t.dashPayUnsettled }}
            </span>
            <template v-if="!isDemo">
            <button type="button" class="rounded-full bg-primary/10 px-3 py-1.5 font-bold"
              @click="setBookingStatus(selectedBookingId, 'completed')">{{ t.dashActDone }}</button>
            <button v-if="selectedBooking && selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'no_show'"
              type="button" class="rounded-full bg-primary px-3 py-1.5 font-bold text-on-primary"
              @click="toggleSettled(selectedBookingId)">
              {{ selectedBooking.paymentStatus === 'paid' ? t.dashActUnsettle : t.dashActSettle }}
            </button>
            <button type="button" class="rounded-full bg-primary/10 px-3 py-1.5 font-bold"
              @click="setBookingStatus(selectedBookingId, 'confirmed')">{{ t.dashActConfirm }}</button>
            <button type="button" class="rounded-full border px-3 py-1.5 font-bold"
              @click="setBookingStatus(selectedBookingId, 'no_show')">{{ t.dashActNoShow }}</button>
            <button type="button" class="rounded-full border px-3 py-1.5 font-bold text-primary"
              @click="setBookingStatus(selectedBookingId, 'cancelled')">{{ t.dashActCancel }}</button>
            </template>
            <button type="button" class="ms-auto text-on-surface-variant"
              @click="selectedBookingId = null">{{ t.dashActClose }}</button>
          </div>

          <p v-if="liveBooking" class="mt-3 text-[12px] text-on-surface-variant">
            {{ t.dashApptTitle }} · {{ liveBooking.name }} — {{ liveBooking.service }}
            <span class="font-latin font-bold text-primary">({{ liveBooking.code }})</span>
          </p>
        </section>

        <!-- CONTACTS -->
        <section v-else-if="activeNav === 'contacts'" class="min-w-0">
          <PatientsPanel :customers="dashRes?.data.customers ?? []" :bookings="dashRes?.data.bookings ?? []"
            :loading="!dashRes" />
        </section>

        <!-- SERVICES -->
        <section v-else-if="activeNav === 'services'" class="min-w-0">
          <ServicesPanel :services="dashRes?.data.services ?? []" :loading="!dashRes" />
        </section>

        <!-- BOOKING LINKS (Calendly event types) -->
        <section v-else-if="activeNav === 'links'" class="space-y-4">
          <h2 class="text-[20px] font-bold">{{ t.dashNavLinks }}</h2>

          <p v-if="!eventTypes.length"
            class="rounded-card border border-dashed border-outline-variant/40 bg-white p-8 text-center text-[13px] text-on-surface-variant">
            {{ t.dashLinksEmpty }}
          </p>

          <div v-else class="space-y-3">
            <article v-for="ev in eventTypes" :key="ev.id"
              class="overflow-hidden rounded-card border border-outline-variant/25 bg-white shadow-card">
              <div class="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-0">
                <div class="flex min-w-0 flex-1 items-stretch gap-3 sm:gap-0">
                  <div class="hidden w-1.5 self-stretch sm:block" :style="{ background: ev.color }" />
                  <div class="mt-1 h-10 w-1.5 rounded-full sm:hidden" :style="{ background: ev.color }" />
                  <div class="min-w-0 flex-1 py-1 sm:px-4 sm:py-4">
                    <h3 lang="fa" dir="auto" class="text-[15px] font-bold">{{ ev.title }}</h3>
                    <p class="mt-1 text-[12px] text-on-surface-variant">
                      {{ ev.duration }} {{ t.dashMinutes }} ·
                      {{ ev.location === 'clinic' ? t.dashClinicMeet : t.dashVideoMeet }}
                    </p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2 sm:pe-4">
                  <button type="button"
                    class="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full border border-outline-variant/30 px-3 text-[12px] font-bold hover:bg-surface-container-low"
                    @click="copyText(`${publicBookUrl}?service=${encodeURIComponent(ev.id)}`, ev.id)">
                    <Icon name="ph:link" />
                    {{ copiedId === ev.id ? t.dashCopied : t.dashCopyLink }}
                  </button>
                  <RouterLink :to="{ name: 'book', query: { service: ev.id } }"
                    class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-outline-variant/30">
                    <Icon name="ph:arrow-square-out" />
                  </RouterLink>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- REPORTS -->
        <section v-else-if="activeNav === 'reports'" class="space-y-4">
          <RevenuePanel v-model:period="revenuePeriod" :kpis="revenueKpis" :points="revenueDays" :by-service="revenueByService" :by-doctor="revenueByDoctor"
            :recent="revenueRecent" :loading="!dashRes" />
        </section>

        <!-- OPERATIONS (real tools: reminders + backup) -->
        <section v-else-if="activeNav === 'automations'" class="mx-auto max-w-xl space-y-4">
          <div>
            <h2 class="text-[20px] font-bold">{{ t.dashAutomationsTitle }}</h2>
            <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.dashAutomationsDesc }}</p>
          </div>
          <div class="divide-y divide-outline-variant/15 rounded-card border border-outline-variant/25 bg-white shadow-card">
            <div class="flex flex-wrap items-center justify-between gap-3 p-4">
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold">{{ t.dashAutoRemindTitle }}</p>
                <p class="mt-0.5 text-[12px] text-on-surface-variant">{{ t.dashAutoRemindDesc }}</p>
              </div>
              <button type="button" :disabled="autoBusy !== null || isDemo"
                class="min-h-10 cursor-pointer rounded-full bg-primary px-4 text-[12px] font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
                @click="sendReminders">
                {{ t.dashAutoRun }}
              </button>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 p-4">
              <div class="min-w-0 flex-1">
                <p class="text-[14px] font-bold">{{ t.dashAutoBackupTitle }}</p>
                <p class="mt-0.5 text-[12px] text-on-surface-variant">{{ t.dashAutoBackupDesc }}</p>
              </div>
              <button type="button" :disabled="autoBusy !== null || isDemo"
                class="min-h-10 cursor-pointer rounded-full border border-outline-variant/30 px-4 text-[12px] font-bold hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
                @click="runBackup">
                {{ t.dashAutoRun }}
              </button>
            </div>
          </div>
        </section>

        <!-- SETTINGS / AVAILABILITY -->
        <section v-else class="mx-auto max-w-xl space-y-4">
          <div>
            <h2 class="text-[20px] font-bold">{{ t.dashSettingsTitle }}</h2>
            <p class="mt-1 text-[13px] text-on-surface-variant">{{ t.dashAvailDesc }}</p>
          </div>
          <button type="button"
            class="flex min-h-12 w-full cursor-pointer items-center justify-between rounded-card border border-outline-variant/25 bg-white px-4 text-start shadow-card hover:bg-surface-container-low"
            @click="openAvailability()">
            <span class="flex items-center gap-3 text-[14px] font-bold">
              <Icon name="ph:calendar_month" />
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
        <aside v-if="reception && activeNav === 'calendar'"
          class="fixed bottom-4 inset-e-4 z-40 w-[min(100%-2rem,20rem)] overflow-hidden rounded-2xl border border-outline-variant/25 bg-white shadow-xl">
          <div class="bg-primary px-4 py-3 text-on-primary">
            <p class="text-[11px] font-bold opacity-90">{{ t.dashReceptionTitle }}</p>
            <p class="mt-0.5 text-[15px] font-bold">{{ reception.patient }}</p>
            <p class="font-latin text-[11px] opacity-80">{{ reception.code }}</p>
          </div>
          <div class="space-y-3 p-4">
            <div v-if="reception.balance" class="flex items-center justify-between text-[13px]">
              <span class="text-on-surface-variant">{{ t.dashReceptionBalance }}</span>
              <strong class="text-primary">{{ reception.balance }}</strong>
            </div>
            <div v-if="reception.allergy"
              class="rounded-xl bg-sand px-3 py-2 text-[11px] font-semibold text-primary">
              {{ t.dashReceptionAllergy }}: {{ reception.allergy }}
            </div>
            <textarea v-model="receptionNote" rows="2"
              class="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-primary/15"
              :placeholder="t.dashReceptionNote" />
          </div>
        </aside>
      </div>
    </div>

    <AvailabilityModal v-model:open="availOpen" />

    <!-- Create appointment (Calendly-style quick create) -->
    <div v-if="createOpen"
      class="fixed inset-0 z-70 flex items-end justify-center bg-on-surface/40 p-4 backdrop-blur-[2px] sm:items-center"
      data-backdrop="1" @click="(e) => (e.target as HTMLElement).dataset.backdrop === '1' && (createOpen = false)">
      <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" @click.stop>
        <div class="flex items-center justify-between">
          <h3 class="text-[16px] font-bold">{{ t.dashNewAppt }}</h3>
          <button type="button" class="rounded-full p-2 hover:bg-surface-container-low" @click="createOpen = false">
            <Icon name="ph:x" />
          </button>
        </div>
        <form class="mt-4 space-y-3" @submit.prevent="submitCreate">
          <input v-model="createForm.name" required class="h-11 w-full rounded-xl border px-3 text-[13px]"
            :placeholder="t.dashApptPatient" />
          <input v-model="createForm.phone" required pattern="09[0-9]{9}"
            class="h-11 w-full rounded-xl border px-3 text-[13px]" placeholder="09xxxxxxxxx" />
          <select v-model="createForm.serviceId" class="h-11 w-full rounded-xl border px-3 text-[13px]">
            <option v-for="s in dashRes?.data?.services || []" :key="s.id" :value="s.id">{{ locale === 'fa' ? s.titleFa
              :
              s.titleEn }}</option>
          </select>
          <select v-model="createForm.staffId" class="h-11 w-full rounded-xl border px-3 text-[13px]">
            <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <div class="grid grid-cols-2 gap-2">
            <input v-model="createForm.date" type="date" required class="h-11 rounded-xl border px-3 text-[13px]" />
            <input v-model="createForm.time" type="time" required class="h-11 rounded-xl border px-3 text-[13px]" />
          </div>
          <textarea v-model="createForm.notes" rows="2" class="w-full rounded-xl border px-3 py-2 text-[13px]"
            :placeholder="t.dashReceptionNote" />
          <p v-if="createError" class="text-[12px] text-primary">{{ createError }}</p>
          <button type="submit"
            class="flex h-11 w-full items-center justify-center rounded-full bg-primary text-[13px] font-bold text-on-primary disabled:opacity-60"
            :disabled="createBusy">
            {{ createBusy ? '…' : t.dashNewAppt }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
