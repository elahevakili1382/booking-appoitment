<script setup lang="ts">
import { computed, onErrorCaptured, ref, shallowRef, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import resourcePlugin from '@fullcalendar/resource'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventDropArg } from '@fullcalendar/core'
import { useLanguage } from '../i18n/useLanguage'

const props = defineProps<{
  viewDate: string
  calView: 'today' | 'staff' | 'day' | 'week' | 'month'
  staff: Array<{ id: string; name: string }>
  events: Array<{
    id: string
    staffId: string
    title: string
    start: string
    end: string
    status: string
  }>
}>()

const emit = defineEmits<{
  moved: [payload: { id: string; staffId: string; startsAt: string; endsAt: string }]
  select: [id: string]
  create: [payload: { staffId: string; startsAt: string }]
}>()

const { locale } = useLanguage()
const calRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const failed = shallowRef(false)
const failMsg = shallowRef('')

onErrorCaptured((err) => {
  failed.value = true
  failMsg.value = err instanceof Error ? err.message : String(err)
  return false
})

const fcView = computed(() => {
  if (props.calView === 'week') return 'resourceTimeGridWeek'
  if (props.calView === 'month') return 'dayGridMonth'
  return 'resourceTimeGridDay'
})

const options = computed<CalendarOptions>(() => ({
  plugins: [resourcePlugin, resourceTimeGridPlugin, dayGridPlugin, timeGridPlugin, interactionPlugin],
  schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
  initialView: fcView.value,
  initialDate: props.viewDate,
  direction: locale.value === 'fa' ? 'rtl' : 'ltr',
  headerToolbar: false,
  height: 'auto',
  slotMinTime: '08:00:00',
  slotMaxTime: '21:00:00',
  allDaySlot: false,
  nowIndicator: true,
  editable: true,
  selectable: true,
  selectMirror: true,
  resources: props.staff.map((s) => ({ id: s.id, title: s.name })),
  events: props.events.map((e) => ({
    id: e.id,
    resourceId: e.staffId,
    title: e.title,
    start: e.start,
    end: e.end,
    backgroundColor: e.status === 'cancelled' ? '#c4b5b5' : '#d4a373',
    borderColor: 'transparent',
  })),
  eventClick: (info) => emit('select', info.event.id),
  select: (info) => {
    const staffId = info.resource?.id || props.staff[0]?.id
    if (!staffId || !info.start) return
    emit('create', { staffId, startsAt: info.start.toISOString() })
  },
  eventDrop: async (info: EventDropArg) => {
    const staffId = info.event.getResources()[0]?.id || props.staff[0]?.id || ''
    const startsAt = info.event.start?.toISOString()
    const endsAt = info.event.end?.toISOString()
    if (!startsAt || !endsAt || !staffId) {
      info.revert()
      return
    }
    try {
      await $fetch(`/api/bookings/${info.event.id}`, {
        method: 'PATCH',
        body: { staffId, startsAt, endsAt },
      })
      emit('moved', { id: info.event.id, staffId, startsAt, endsAt })
    } catch {
      info.revert()
      window.alert(locale.value === 'fa' ? 'تداخل نوبت — جابجایی لغو شد' : 'Conflict — move reverted')
    }
  },
}))

watch(
  () => [props.viewDate, props.calView] as const,
  ([d, v]) => {
    const api = calRef.value?.getApi?.()
    if (!api) return
    if (d) api.gotoDate(d)
    const map: Record<string, string> = {
      week: 'resourceTimeGridWeek',
      month: 'dayGridMonth',
      day: 'resourceTimeGridDay',
      today: 'resourceTimeGridDay',
      staff: 'resourceTimeGridDay',
    }
    api.changeView(map[v] || 'resourceTimeGridDay')
  },
)

watch(
  () => [props.events, props.staff] as const,
  () => {
    const api = calRef.value?.getApi?.()
    if (!api) return
    api.setOption(
      'resources',
      props.staff.map((s) => ({ id: s.id, title: s.name })),
    )
    api.removeAllEvents()
    for (const e of props.events) {
      api.addEvent({
        id: e.id,
        resourceId: e.staffId,
        title: e.title,
        start: e.start,
        end: e.end,
        backgroundColor: e.status === 'cancelled' ? '#c4b5b5' : '#d4a373',
      })
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white p-2 shadow-sm">
    <div v-if="failed" class="rounded-xl bg-[#faedcd] p-4 text-[13px] text-primary">
      تقویم پیشرفته لود نشد — نمای ساده پایین صفحه فعال است.
      <span class="mt-1 block font-latin text-[11px] opacity-70">{{ failMsg }}</span>
    </div>
    <ClientOnly v-else>
      <FullCalendar ref="calRef" :options="options" />
      <template #fallback>
        <p class="p-6 text-center text-[13px] text-on-surface-variant">در حال بارگذاری تقویم…</p>
      </template>
    </ClientOnly>
  </div>
</template>
