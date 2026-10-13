import { computed, ref, watch } from 'vue'

export interface TimeRange {
  start: string
  end: string
}

export interface DaySchedule {
  /** JS getDay(): 0 Sun … 6 Sat */
  ranges: TimeRange[]
}

export interface DateOverride {
  date: string // YYYY-MM-DD
  ranges: TimeRange[] // empty = unavailable that day
}

export interface AvailabilitySchedule {
  id: string
  name: string
  nameFa: string
  timezone: string
  days: DaySchedule[] // length 7, index = getDay()
  overrides: DateOverride[]
  linkedEventTypes: number
}

const STORAGE_KEY = 'lumina-availability-v1'

function defaultDays(): DaySchedule[] {
  return Array.from({ length: 7 }, (_, d) => {
    // Sun(0) & Sat(6) closed; Mon–Fri 08:30–16:30; for clinic also open Sat optionally
    // Lumina: Sat–Thu open, Fri closed (Iranian week) — Sat=6, Sun=0, Fri=5
    if (d === 5) return { ranges: [] } // Friday closed
    if (d === 0) return { ranges: [{ start: '10:00', end: '14:00' }] } // Sunday light
    return { ranges: [{ start: '09:00', end: '21:00' }] }
  })
}

function defaultSchedule(): AvailabilitySchedule {
  return {
    id: 'working-hours',
    name: 'Working hours (default)',
    nameFa: 'ساعات کاری (پیش‌فرض)',
    timezone: 'Asia/Tehran',
    days: defaultDays(),
    overrides: [{ date: '2026-07-27', ranges: [{ start: '10:00', end: '15:00' }] }],
    linkedEventTypes: 5,
  }
}

function load(): AvailabilitySchedule {
  if (!import.meta.client) return defaultSchedule()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSchedule()
    const parsed = JSON.parse(raw) as AvailabilitySchedule
    if (!parsed.days || parsed.days.length !== 7) return defaultSchedule()
    return parsed
  } catch {
    return defaultSchedule()
  }
}

const schedule = ref<AvailabilitySchedule>(defaultSchedule())

if (import.meta.client) {
  schedule.value = load()
}

watch(
  schedule,
  (v) => {
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
  },
  { deep: true },
)

function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function fromMinutes(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Generate 15-min slots for a calendar date string YYYY-MM-DD */
export function slotsForDate(dateStr: string, intervalMin = 15): { time: string; taken: boolean }[] {
  const d = new Date(`${dateStr}T12:00:00`)
  if (Number.isNaN(d.getTime())) return []

  const override = schedule.value.overrides.find((o) => o.date === dateStr)
  const ranges = override ? override.ranges : schedule.value.days[d.getDay()]?.ranges ?? []

  if (!ranges.length) return []

  const slots: { time: string; taken: boolean }[] = []
  for (const range of ranges) {
    let cur = toMinutes(range.start)
    const end = toMinutes(range.end)
    while (cur + intervalMin <= end) {
      slots.push({ time: fromMinutes(cur), taken: false })
      cur += intervalMin
    }
  }
  return slots
}

export function isDayAvailable(dayIndex: number) {
  return (schedule.value.days[dayIndex]?.ranges.length ?? 0) > 0
}

export function useAvailability() {
  const scheduleName = computed(() => schedule.value.name)
  const scheduleNameFa = computed(() => schedule.value.nameFa)

  function resetToDefault() {
    schedule.value = defaultSchedule()
  }

  function setDayUnavailable(dayIndex: number) {
    schedule.value.days[dayIndex] = { ranges: [] }
  }

  function enableDay(dayIndex: number, start = '09:00', end = '17:00') {
    if (!schedule.value.days[dayIndex].ranges.length) {
      schedule.value.days[dayIndex] = { ranges: [{ start, end }] }
    }
  }

  function addRange(dayIndex: number) {
    const day = schedule.value.days[dayIndex]
    const last = day.ranges[day.ranges.length - 1]
    const start = last ? fromMinutes(Math.min(toMinutes(last.end) + 60, 20 * 60)) : '09:00'
    const end = fromMinutes(Math.min(toMinutes(start) + 120, 21 * 60))
    day.ranges.push({ start, end })
  }

  function removeRange(dayIndex: number, rangeIndex: number) {
    const day = schedule.value.days[dayIndex]
    day.ranges.splice(rangeIndex, 1)
  }

  function updateRange(dayIndex: number, rangeIndex: number, patch: Partial<TimeRange>) {
    const r = schedule.value.days[dayIndex].ranges[rangeIndex]
    if (!r) return
    Object.assign(r, patch)
    if (toMinutes(r.start) >= toMinutes(r.end)) {
      r.end = fromMinutes(toMinutes(r.start) + 30)
    }
  }

  function copyDayToAllWeekdays(fromDay: number) {
    const source = JSON.parse(JSON.stringify(schedule.value.days[fromDay])) as DaySchedule
    for (let i = 0; i < 7; i++) {
      if (i === fromDay) continue
      // copy to Mon–Thu (1-4) and Sat (6); skip Fri(5) if source empty logic - copy all except keep Fri if user wants
      schedule.value.days[i] = JSON.parse(JSON.stringify(source)) as DaySchedule
    }
  }

  function addOverride(date: string, start = '10:00', end = '15:00') {
    const existing = schedule.value.overrides.find((o) => o.date === date)
    if (existing) {
      existing.ranges = [{ start, end }]
      return
    }
    schedule.value.overrides.push({ date, ranges: [{ start, end }] })
    schedule.value.overrides.sort((a, b) => a.date.localeCompare(b.date))
  }

  function updateOverride(date: string, rangeIndex: number, patch: Partial<TimeRange>) {
    const o = schedule.value.overrides.find((x) => x.date === date)
    if (!o?.ranges[rangeIndex]) return
    Object.assign(o.ranges[rangeIndex], patch)
  }

  function removeOverride(date: string) {
    schedule.value.overrides = schedule.value.overrides.filter((o) => o.date !== date)
  }

  function setOverrideUnavailable(date: string) {
    const o = schedule.value.overrides.find((x) => x.date === date)
    if (o) o.ranges = []
    else schedule.value.overrides.push({ date, ranges: [] })
  }

  function setTimezone(tz: string) {
    schedule.value.timezone = tz
  }

  function setScheduleName(name: string, nameFa?: string) {
    schedule.value.name = name
    if (nameFa) schedule.value.nameFa = nameFa
  }

  return {
    schedule,
    scheduleName,
    scheduleNameFa,
    resetToDefault,
    setDayUnavailable,
    enableDay,
    addRange,
    removeRange,
    updateRange,
    copyDayToAllWeekdays,
    addOverride,
    updateOverride,
    removeOverride,
    setOverrideUnavailable,
    setTimezone,
    setScheduleName,
    slotsForDate,
    isDayAvailable,
  }
}
