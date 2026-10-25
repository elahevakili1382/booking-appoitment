import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import type { Ref } from 'vue'

export function useBookingCalendar(isFa: Readonly<Ref<boolean>>) {
  const initialTimestamp = useState<number>(
    'booking-initial-timestamp',
    () => Date.now(),
  )

  const now = ref(initialTimestamp.value)
  let timer: ReturnType<typeof setInterval> | undefined

  function formatNumber(value: number) {
    return value.toLocaleString(
      isFa.value ? 'fa-IR' : 'en-US',
    )
  }

  function tehranDate(timestamp: number) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(timestamp)

    const part = (type: string) =>
      parts.find((item) => item.type === type)?.value || ''

    return `${part('year')}-${part('month')}-${part('day')}`
  }

  function asDate(iso: string) {
    return new Date(`${iso}T12:00:00Z`)
  }

  function addDays(iso: string, amount: number) {
    const date = asDate(iso)
    date.setUTCDate(date.getUTCDate() + amount)

    return date.toISOString().slice(0, 10)
  }

  const today = computed(() => tehranDate(now.value))
  const selectedDate = ref(tehranDate(initialTimestamp.value))
  const weekStart = ref(selectedDate.value)
  const calendarAnchor = ref(selectedDate.value)
  const showCalendar = ref(false)

  const calendarLocale = computed(() =>
    isFa.value
      ? 'fa-IR-u-ca-persian-nu-latn'
      : 'en-US-u-ca-gregory-nu-latn',
  )

  function datePart(
    iso: string,
    type: 'day' | 'month' | 'year',
  ) {
    const parts = new Intl.DateTimeFormat(calendarLocale.value, {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(asDate(iso))

    return Number(
      parts.find((item) => item.type === type)?.value || 0,
    )
  }

  function startOfMonth(iso: string) {
    return addDays(iso, 1 - datePart(iso, 'day'))
  }

  const monthStart = computed(() =>
    startOfMonth(calendarAnchor.value),
  )

  const monthLabel = computed(() =>
    new Intl.DateTimeFormat(
      isFa.value ? 'fa-IR-u-ca-persian' : 'en-US',
      {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
      },
    ).format(asDate(calendarAnchor.value)),
  )

  const weekdayLabels = computed(() =>
    isFa.value
      ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
      : ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'],
  )

  const calendarDays = computed(() => {
    const start = monthStart.value
    const offset = (asDate(start).getUTCDay() + 1) % 7
    const first = addDays(start, -offset)
    const month = datePart(start, 'month')
    const year = datePart(start, 'year')

    return Array.from({ length: 42 }, (_, index) => {
      const iso = addDays(first, index)

      return {
        iso,
        label: formatNumber(datePart(iso, 'day')),
        disabled: iso < today.value,
        inMonth:
          datePart(iso, 'month') === month &&
          datePart(iso, 'year') === year,
      }
    })
  })

  const canGoPreviousMonth = computed(() =>
    monthStart.value > startOfMonth(today.value),
  )

  function moveMonth(direction: number) {
    if (direction < 0 && !canGoPreviousMonth.value) return

    calendarAnchor.value = direction > 0
      ? startOfMonth(addDays(monthStart.value, 32))
      : startOfMonth(addDays(monthStart.value, -1))
  }

  function pickDate(iso: string) {
    if (iso < today.value) return

    selectedDate.value = iso
    weekStart.value = iso
    calendarAnchor.value = iso
    showCalendar.value = false
  }

  function moveWeek(direction: number) {
    const target = addDays(weekStart.value, direction * 7)
    pickDate(target < today.value ? today.value : target)
  }

  const weekDays = computed(() =>
    Array.from({ length: 7 }, (_, index) => {
      const iso = addDays(weekStart.value, index)

      return {
        iso,
        name: iso === today.value
          ? (isFa.value ? 'امروز' : 'Today')
          : new Intl.DateTimeFormat(
              isFa.value ? 'fa-IR' : 'en-US',
              {
                timeZone: 'UTC',
                weekday: 'short',
              },
            ).format(asDate(iso)),

        number: new Intl.DateTimeFormat(
          isFa.value ? 'fa-IR' : 'en-US',
          {
            timeZone: 'UTC',
            day: 'numeric',
          },
        ).format(asDate(iso)),
      }
    }),
  )

  const selectedDateLabel = computed(() =>
    new Intl.DateTimeFormat(
      isFa.value ? 'fa-IR' : 'en-US',
      {
        timeZone: 'UTC',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    ).format(asDate(selectedDate.value)),
  )

  onMounted(() => {
    now.value = Date.now()

    timer = setInterval(() => {
      now.value = Date.now()
    }, 30_000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    now,
    today,
    selectedDate,
    weekStart,
    showCalendar,
    monthLabel,
    weekdayLabels,
    calendarDays,
    weekDays,
    canGoPreviousMonth,
    selectedDateLabel,
    moveMonth,
    moveWeek,
    pickDate,
  }
}