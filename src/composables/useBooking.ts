import { computed, reactive, ref, watch } from 'vue'
import { useLanguage } from '../i18n/useLanguage'
import { getBookingLabels } from '../i18n/booking'
import { bookingImages } from '../data/bookingImages'
import { useBookingCalendar } from './useBookingCalendar'

import type {
  BookingService as Service,
  BookingDoctor as Doctor,
  BookingSlot as Slot,
} from '../types/booking'

interface BookingResult {
  id: string
  code: string
  status?: string
  total?: number
  deposit?: number
}

export function useBooking() {
  const route = useRoute()
  const { t, locale } = useLanguage()

  const isFa = computed(() => locale.value === 'fa')
  const labels = computed(() => getBookingLabels(isFa.value))
  const calendar = reactive(useBookingCalendar(isFa))

  function number(value: number) {
    return Number(value).toLocaleString(
      isFa.value ? 'fa-IR' : 'en-US',
    )
  }

  const step = ref(1)
  const serviceId = ref('')
  const staffId = ref('')
  const branch = ref('')
  const visitType = ref<'clinic' | 'online'>('clinic')

  const fullName = ref('')
  const phone = ref('')
  const notes = ref('')

  const showAllSlots = ref(false)
  const selectedSlotId = ref('')
  const submitting = ref(false)
  const bookingError = ref('')
  const booking = ref<BookingResult | null>(null)
  const requestId = ref('')

  const paying = ref(false)
  const paymentError = ref('')

  const savedSummary = ref({
    service: '',
    doctor: '',
    branch: '',
    date: '',
    time: '',
  })

  // Services and doctors
  const {
    data: servicesResponse,
    status: servicesStatus,
    error: servicesError,
    refresh: refreshServices,
  } = useAsyncData('book-services', () =>
    $fetch<{ ok: boolean; data: Service[] }>('/api/services'),
  )

  const {
    data: doctorsResponse,
    status: doctorsStatus,
    error: doctorsError,
    refresh: refreshDoctors,
  } = useAsyncData('book-doctors', () =>
    $fetch<{ ok: boolean; data: Doctor[] }>('/api/doctors'),
  )

  const services = computed(() => servicesResponse.value?.data || [])
  const doctors = computed(() => doctorsResponse.value?.data || [])
  const branches = computed(() => t.value.branches)

  const dataLoading = computed(() =>
    servicesStatus.value === 'pending' ||
    doctorsStatus.value === 'pending',
  )

  const dataHasError = computed(() =>
    Boolean(servicesError.value || doctorsError.value),
  )

  const selectedService = computed(() =>
    services.value.find((item) => item.id === serviceId.value),
  )

  const availableDoctors = computed(() =>
    doctors.value.filter((item) =>
      Array.isArray(item.serviceIds)
        ? item.serviceIds.includes(serviceId.value)
        : true,
    ),
  )

  const selectedDoctor = computed(() =>
    availableDoctors.value.find((item) => item.id === staffId.value),
  )

  function serviceName(item?: Service) {
    if (!item) return ''
    return isFa.value ? item.titleFa : item.titleEn || item.titleFa
  }

  function doctorName(item?: Doctor) {
    if (!item) return ''
    return isFa.value ? item.nameFa : item.nameEn || item.nameFa
  }

  const currentServiceName = computed(() =>
    serviceName(selectedService.value),
  )

  const currentDoctorName = computed(() =>
    doctorName(selectedDoctor.value),
  )

  const visitLabel = computed(() =>
    visitType.value === 'clinic'
      ? labels.value.clinic
      : labels.value.online,
  )

  
watch(
  [services, () => route.query.service],
  ([list, query]) => {
    const requestedId = typeof query === 'string'
      ? query
      : ''

    const requestedService = list.find(
      (item) => item.id === requestedId,
    )

    // ورود از دکمه رزرو یک خدمت مشخص
    if (requestedService) {
      serviceId.value = requestedService.id
      return
    }

    // اگر انتخاب فعلی دیگر معتبر نیست، آن را پاک کن.
    // ورود مستقیم به /book هم بدون انتخاب اولیه باقی می‌ماند.
    const currentSelectionExists = list.some(
      (item) => item.id === serviceId.value,
    )

    if (!currentSelectionExists) {
      serviceId.value = ''
    }
  },
  { immediate: true },
)

  watch(
    availableDoctors,
    (list) => {
      if (list.some((item) => item.id === staffId.value)) return

      const query = typeof route.query.doctor === 'string'
        ? route.query.doctor
        : ''

      staffId.value =
        list.find((item) => item.id === query)?.id ||
        list[0]?.id ||
        ''
    },
    { immediate: true },
  )

  watch(
    branches,
    (list) => {
      if (list.includes(branch.value)) return

      const query = typeof route.query.branch === 'string'
        ? route.query.branch
        : ''

      branch.value = list.includes(query) ? query : list[0] || ''
    },
    { immediate: true },
  )

  async function retryData() {
    await Promise.all([refreshServices(), refreshDoctors()])
  }

  // Availability
  const availabilityKey = computed(() =>
    JSON.stringify([
      calendar.selectedDate,
      serviceId.value,
      staffId.value,
      branch.value,
      visitType.value,
    ]),
  )

  const {
    data: slotsResponse,
    status: slotsStatus,
    error: slotsError,
    refresh: refreshSlots,
  } = useAsyncData(
    'book-slots',
    async () => {
      const context = availabilityKey.value

      if (!serviceId.value || !staffId.value) {
        return { context, slots: [] as Slot[] }
      }

      const response = await $fetch<{
        ok: boolean
        slots: Slot[]
      }>('/api/availability', {
        query: {
          date: calendar.selectedDate,
          serviceId: serviceId.value,
          staffId: staffId.value,
          branch: branch.value,
          visitType: visitType.value,
        },
      })

      if (!response.ok) throw new Error('Availability failed')

      return { context, slots: response.slots || [] }
    },
    { watch: [availabilityKey] },
  )

  function slotId(slot: Slot) {
    return `${slot.startsAt || slot.time}|${slot.staffId || staffId.value}`
  }

  function slotStartsAt(slot: Slot) {
    return slot.startsAt ||
      `${calendar.selectedDate}T${slot.time}:00+03:30`
  }

  const slots = computed(() => {
    if (slotsResponse.value?.context !== availabilityKey.value) {
      return []
    }

    return (slotsResponse.value?.slots || []).filter((slot) => {
      const timestamp = Date.parse(slotStartsAt(slot))

      return Number.isFinite(timestamp) &&
        timestamp > calendar.now + 5 * 60_000
    })
  })

  const visibleSlots = computed(() =>
    showAllSlots.value ? slots.value : slots.value.slice(0, 12),
  )

  const hasFreeSlots = computed(() =>
    slots.value.some((slot) => !slot.taken),
  )

  const selectedSlot = computed(() =>
    slots.value.find(
      (slot) => slotId(slot) === selectedSlotId.value && !slot.taken,
    ),
  )

  const slotsLoading = computed(() =>
    slotsStatus.value === 'pending',
  )

  const slotsHasError = computed(() => Boolean(slotsError.value))

  watch(
    availabilityKey,
    () => {
      selectedSlotId.value = ''
      showAllSlots.value = false
      requestId.value = ''
    },
    { flush: 'sync' },
  )

  watch(
    [fullName, phone, notes, selectedSlotId],
    () => {
      requestId.value = ''
    },
  )

  function pickSlot(slot: Slot) {
    if (slot.taken) return

    const timestamp = Date.parse(slotStartsAt(slot))

    if (
      Number.isFinite(timestamp) &&
      timestamp > calendar.now + 5 * 60_000
    ) {
      selectedSlotId.value = slotId(slot)
    }
  }

  const duration = computed(() => {
    const value = Number(selectedService.value?.duration)
    return Number.isFinite(value) && value > 0 ? value : 30
  })

  const durationLabel = computed(() => number(duration.value))

  const selectedEnd = computed(() => {
    if (!selectedSlot.value) return ''

    const timestamp =
      Date.parse(slotStartsAt(selectedSlot.value)) +
      duration.value * 60_000

    return new Intl.DateTimeFormat(
      isFa.value ? 'fa-IR' : 'en-GB',
      {
        timeZone: 'Asia/Tehran',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      },
    ).format(timestamp)
  })

  const selectedTimeLabel = computed(() =>
    selectedSlot.value?.time || '',
  )

  // Pricing
  const serviceCost = computed<number | null>(() => {
    const value = Number(selectedService.value?.price)
    return Number.isFinite(value) && value > 0 ? value : null
  })

  const estimatedDeposit = computed(() => {
    if (serviceCost.value === null) return 0

    const configured = Number(selectedService.value?.deposit)

    // مقدار پیش‌فرض دموی قبلی پروژه.
    const requested =
      Number.isFinite(configured) && configured >= 0
        ? configured
        : 500000

    return Math.min(requested, serviceCost.value)
  })

  const balance = computed(() =>
    serviceCost.value === null
      ? 0
      : Math.max(0, serviceCost.value - estimatedDeposit.value),
  )

  const hasPrice = computed(() => serviceCost.value !== null)

  const costLabel = computed(() =>
    serviceCost.value === null
      ? labels.value.consultationPrice
      : `${number(serviceCost.value)} ${labels.value.currency}`,
  )

  const depositLabel = computed(() =>
    `${number(estimatedDeposit.value)} ${labels.value.currency}`,
  )

  const balanceLabel = computed(() =>
    `${number(balance.value)} ${labels.value.currency}`,
  )

  // Validation
  function normalizeDigits(value: string) {
    return value
      .replace(/[۰-۹]/g, (digit) =>
        String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
      )
      .replace(/[٠-٩]/g, (digit) =>
        String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)),
      )
  }

  const normalizedPhone = computed(() => {
    let value = normalizeDigits(phone.value).replace(/[\s()-]/g, '')

    if (value.startsWith('+98')) value = `0${value.slice(3)}`
    else if (value.startsWith('0098')) value = `0${value.slice(4)}`

    return value
  })

  const phoneValid = computed(() =>
    /^09\d{9}$/.test(normalizedPhone.value),
  )

  const timeValid = computed(() =>
    Boolean(selectedSlot.value) &&
    slotsStatus.value === 'success' &&
    !slotsError.value &&
    calendar.selectedDate >= calendar.today,
  )

  const validSteps = computed(() => [
    Boolean(selectedService.value && selectedDoctor.value),
    fullName.value.trim().length >= 2 && phoneValid.value,
    Boolean(branch.value && visitType.value),
    timeValid.value,
    true,
  ])

  const canContinue = computed(() =>
    Boolean(validSteps.value[step.value - 1]) && !submitting.value,
  )

  const canConfirm = computed(() =>
    validSteps.value.every(Boolean) && !submitting.value,
  )

  const heading = computed(() =>
    labels.value.steps[step.value - 1] || '',
  )

  function nextStep() {
    if (step.value < 6 && canContinue.value) step.value += 1
  }

  function previousStep() {
    if (step.value > 1 && !submitting.value) step.value -= 1
  }

  function goStep(value: number) {
    if (
      value >= 1 &&
      value < step.value &&
      !booking.value &&
      !submitting.value
    ) {
      step.value = value
    }
  }

  // Submit
  async function confirmBooking() {
    if (!canConfirm.value || !selectedSlot.value) return

    submitting.value = true
    bookingError.value = ''

    try {
      if (!requestId.value) requestId.value = crypto.randomUUID()

      const slot = selectedSlot.value
      const summary = {
        service: currentServiceName.value,
        doctor: currentDoctorName.value,
        branch: branch.value,
        date: calendar.selectedDateLabel,
        time: slot.time,
      }

      const response = await $fetch<{
        ok: boolean
        data: BookingResult
      }>('/api/bookings', {
        method: 'POST',
        body: {
          requestId: requestId.value,
          branch: branch.value,
          service: summary.service,
          serviceId: serviceId.value,
          doctor: summary.doctor,
          staffId: staffId.value,
          visitType: visitType.value,
          when: slotStartsAt(slot),
          startsAt: slotStartsAt(slot),
          date: calendar.selectedDate,
          time: slot.time,
          name: fullName.value.trim(),
          phone: normalizedPhone.value,
          notes: notes.value.trim(),
          total: serviceCost.value ?? 0,
          deposit: estimatedDeposit.value,
        },
      })

      if (!response.ok || !response.data?.id) {
        throw new Error('Booking failed')
      }

      savedSummary.value = summary
      booking.value = response.data
      calendar.showCalendar = false
      notes.value = ''
    } catch (error: unknown) {
      const err = error as {
        statusCode?: number
        status?: number
      }

      if (err.statusCode === 409 || err.status === 409) {
        bookingError.value = labels.value.slotConflict
        selectedSlotId.value = ''
        step.value = 4

        try {
          await refreshSlots()
        } catch {
          // خطای ظرفیت در رابط نمایش داده می‌شود.
        }
      } else {
        bookingError.value = labels.value.bookingFailed
      }
    } finally {
      submitting.value = false
    }
  }

  // Payment
  const payableDeposit = computed(() => {
    const value = Number(booking.value?.deposit)
    return Number.isFinite(value) && value > 0 ? value : 0
  })

  const payableDepositLabel = computed(() =>
    `${number(payableDeposit.value)} ${labels.value.currency}`,
  )

  async function startPayment() {
    if (!booking.value || !payableDeposit.value || paying.value) return

    paying.value = true
    paymentError.value = ''

    try {
      const response = await $fetch<{
        ok: boolean
        redirectUrl: string
      }>('/api/payments/deposit', {
        method: 'POST',
        body: {
          bookingId: booking.value.id,
          amount: payableDeposit.value,
        },
      })

      if (!response.ok || !response.redirectUrl) {
        throw new Error('Payment failed')
      }

      const url = new URL(
        response.redirectUrl,
        window.location.origin,
      )

      if (!['https:', 'http:'].includes(url.protocol)) {
        throw new Error('Invalid payment URL')
      }

      window.location.assign(url.href)
    } catch {
      paymentError.value = labels.value.paymentFailed
    } finally {
      paying.value = false
    }
  }

  return {
    isFa,
    labels,
    images: bookingImages,
    calendar,
    step,
    serviceId,
    staffId,
    branch,
    visitType,
    fullName,
    phone,
    notes,
    showAllSlots,
    selectedSlotId,
    submitting,
    bookingError,
    booking,
    paying,
    paymentError,
    savedSummary,
    services,
    availableDoctors,
    branches,
    dataLoading,
    dataHasError,
    currentServiceName,
    currentDoctorName,
    visitLabel,
    slots,
    visibleSlots,
    hasFreeSlots,
    selectedSlot,
    slotsLoading,
    slotsHasError,
    selectedEnd,
    selectedTimeLabel,
    durationLabel,
    hasPrice,
    costLabel,
    depositLabel,
    balanceLabel,
    normalizedPhone,
    phoneValid,
    timeValid,
    canContinue,
    canConfirm,
    heading,
    payableDeposit,
    payableDepositLabel,
    number,
    retryData,
    refreshSlots,
    slotId,
    pickSlot,
    nextStep,
    previousStep,
    goStep,
    confirmBooking,
    startPayment,
  }
}