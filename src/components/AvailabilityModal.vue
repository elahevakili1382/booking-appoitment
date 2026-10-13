<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLanguage } from '../i18n/useLanguage'
import { useAvailability } from '../composables/useAvailability'

const open = defineModel<boolean>('open', { default: false })

const { t, locale } = useLanguage()
const {
  schedule,
  enableDay,
  setDayUnavailable,
  addRange,
  removeRange,
  updateRange,
  copyDayToAllWeekdays,
  addOverride,
  updateOverride,
  removeOverride,
  setTimezone,
} = useAvailability()

const modalTab = ref<'calendar' | 'availability' | 'advanced'>('availability')
const viewMode = ref<'list' | 'calendar'>('list')
const sideNav = ref('calendar')
const toast = ref(false)
const newOverrideDate = ref('')

/** Display order: Sat→Fri for FA, Sun→Sat for EN */
const dayOrder = computed(() =>
  locale.value === 'fa' ? [6, 0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6],
)

const dayLabels = computed(() => {
  // index matches JS getDay(): 0=Sun … 6=Sat
  if (locale.value === 'fa') {
    return ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']
  }
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
})

function labelForJsDay(jsDay: number) {
  return dayLabels.value[jsDay]
}

function shortForJsDay(jsDay: number) {
  // availDayShort is Sun-first in both: [S,M,T,W,T,F,S] / [ی,د,س,چ,پ,ج,ش]
  return t.value.availDayShort[jsDay]
}

const timezones = [
  'Asia/Tehran',
  'Asia/Dubai',
  'Europe/London',
  'America/Los_Angeles',
  'America/New_York',
]

watch(open, (v) => {
  if (v) modalTab.value = 'availability'
})

function close() {
  open.value = false
}

function onBackdrop(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.backdrop === '1') close()
}

function saveToast() {
  toast.value = true
  // همگام‌سازی با API سرور — دیگر فقط localStorage نیست
  $fetch('/api/availability', {
    method: 'PUT',
    body: schedule.value,
  }).catch((err) => console.error('availability save failed', err))
  window.setTimeout(() => {
    toast.value = false
  }, 1600)
}

function toggleDay(jsDay: number) {
  if (schedule.value.days[jsDay].ranges.length) setDayUnavailable(jsDay)
  else enableDay(jsDay)
  saveToast()
}

function onAddRange(jsDay: number) {
  if (!schedule.value.days[jsDay].ranges.length) enableDay(jsDay)
  else addRange(jsDay)
  saveToast()
}

function onRemoveRange(jsDay: number, idx: number) {
  removeRange(jsDay, idx)
  saveToast()
}

function onUpdateRange(jsDay: number, idx: number, key: 'start' | 'end', value: string) {
  updateRange(jsDay, idx, { [key]: value })
  saveToast()
}

function onCopy(jsDay: number) {
  copyDayToAllWeekdays(jsDay)
  saveToast()
}

function onAddOverride() {
  const date = newOverrideDate.value || new Date().toISOString().slice(0, 10)
  addOverride(date)
  newOverrideDate.value = ''
  saveToast()
}

function onUpdateOverride(date: string, idx: number, key: 'start' | 'end', value: string) {
  updateOverride(date, idx, { [key]: value })
  saveToast()
}

function onRemoveOverride(date: string) {
  removeOverride(date)
  saveToast()
}

function onTimezone(e: Event) {
  setTimezone((e.target as HTMLSelectElement).value)
  saveToast()
}

const accountNav = computed(() => [
  { id: 'profile', label: t.value.availProfile, icon: 'person' },
  { id: 'calendar', label: t.value.availCalendarNav, icon: 'calendar_month' },
  { id: 'branding', label: t.value.availBranding, icon: 'palette' },
  { id: 'mylink', label: t.value.availMyLink, icon: 'link' },
  { id: 'privacy', label: t.value.availPrivacy, icon: 'lock' },
])

const featureNav = computed(() => [
  { id: 'ai', label: t.value.availAi, icon: 'auto_awesome' },
  { id: 'contacts', label: t.value.availContactsSettings, icon: 'contacts' },
])

const adminNav = computed(() => [
  { id: 'workspace', label: t.value.availWorkspace, icon: 'apartment' },
  { id: 'dashboard', label: t.value.availDashboard, icon: 'dashboard' },
  { id: 'people', label: t.value.availPeople, icon: 'group' },
  { id: 'access', label: t.value.availAccess, icon: 'key' },
  { id: 'security', label: t.value.availSecurity, icon: 'shield' },
  { id: 'billing', label: t.value.availBilling, icon: 'credit_card' },
  { id: 'managed', label: t.value.availManagedEvents, icon: 'event_note' },
])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      data-backdrop="1"
      class="fixed inset-0 z-[80] flex items-end justify-center bg-on-surface/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      @click="onBackdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-label="t.availModalTitle"
        class="relative flex max-h-[min(92dvh,52rem)] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-start justify-between gap-3 border-b border-outline-variant/20 px-4 py-3 sm:px-5">
          <div>
            <h2 class="text-[18px] font-bold text-on-surface sm:text-[20px]">{{ t.availModalTitle }}</h2>
            <div class="mt-2 flex gap-1">
              <button
                v-for="tab in ([
                  ['calendar', t.availTabCalendar],
                  ['availability', t.availTabAvailability],
                  ['advanced', t.availTabAdvanced],
                ] as const)"
                :key="tab[0]"
                type="button"
                class="cursor-pointer border-b-2 px-2.5 py-1.5 text-[12px] font-semibold sm:text-[13px]"
                :class="
                  modalTab === tab[0]
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                "
                @click="modalTab = tab[0]"
              >
                {{ tab[1] }}
              </button>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container-low"
            :aria-label="t.availClose"
            @click="close"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
          <!-- Side nav (Calendly-like) -->
          <aside class="hidden w-52 shrink-0 overflow-y-auto border-e border-outline-variant/20 bg-[#faf7f7] p-3 lg:block">
            <p class="mb-1 px-2 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
              {{ t.availMyAccount }}
            </p>
            <button
              v-for="item in accountNav"
              :key="item.id"
              type="button"
              class="mb-0.5 flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-start text-[12px] font-semibold"
              :class="sideNav === item.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-white'"
              @click="sideNav = item.id; modalTab = item.id === 'calendar' ? 'availability' : modalTab"
            >
              <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
              {{ item.label }}
            </button>

            <p class="mb-1 mt-4 px-2 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
              {{ t.availFeatures }}
            </p>
            <button
              v-for="item in featureNav"
              :key="item.id"
              type="button"
              class="mb-0.5 flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-start text-[12px] font-semibold text-on-surface-variant hover:bg-white"
              @click="sideNav = item.id"
            >
              <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
              {{ item.label }}
            </button>

            <p class="mb-1 mt-4 px-2 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
              {{ t.availAdmin }}
            </p>
            <button
              v-for="item in adminNav"
              :key="item.id"
              type="button"
              class="mb-0.5 flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-start text-[12px] font-semibold text-on-surface-variant hover:bg-white"
              @click="sideNav = item.id"
            >
              <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
              {{ item.label }}
            </button>
          </aside>

          <!-- Content -->
          <div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            <template v-if="modalTab === 'availability'">
              <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div
                    class="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-[13px] font-semibold"
                  >
                    <span class="material-symbols-outlined text-[18px] text-primary">schedule</span>
                    {{ locale === 'fa' ? schedule.nameFa : schedule.name }}
                  </div>
                  <p class="mt-2 text-[12px] text-on-surface-variant">
                    {{ t.availActiveOn }}:
                    <strong class="text-primary">{{ schedule.linkedEventTypes }}</strong>
                    {{ t.availEventTypesCount }}
                  </p>
                </div>
                <div class="flex items-center gap-1 rounded-full bg-surface-container-low p-0.5">
                  <button
                    type="button"
                    class="min-h-9 cursor-pointer rounded-full px-3 text-[12px] font-bold"
                    :class="viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'"
                    @click="viewMode = 'list'"
                  >
                    {{ t.availListView }}
                  </button>
                  <button
                    type="button"
                    class="min-h-9 cursor-pointer rounded-full px-3 text-[12px] font-bold"
                    :class="viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'"
                    @click="viewMode = 'calendar'"
                  >
                    {{ t.availCalendarView }}
                  </button>
                </div>
              </div>

              <div class="grid gap-5 lg:grid-cols-2">
                <!-- Weekly hours -->
                <div>
                  <h3 class="mb-3 text-[14px] font-bold">{{ t.availWeeklyHours }}</h3>
                  <div class="space-y-2">
                    <div
                      v-for="jsDay in dayOrder"
                      :key="jsDay"
                      class="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-2.5 sm:p-3"
                    >
                      <div class="flex flex-wrap items-start gap-2">
                        <button
                          type="button"
                          class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[12px] font-bold"
                          :class="
                            schedule.days[jsDay].ranges.length
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-high text-on-surface-variant'
                          "
                          :title="labelForJsDay(jsDay)"
                          @click="toggleDay(jsDay)"
                        >
                          {{ shortForJsDay(jsDay) }}
                        </button>

                        <div class="min-w-0 flex-1 space-y-2">
                          <p class="text-[12px] font-semibold text-on-surface sm:hidden">{{ labelForJsDay(jsDay) }}</p>

                          <template v-if="schedule.days[jsDay].ranges.length">
                            <div
                              v-for="(range, ri) in schedule.days[jsDay].ranges"
                              :key="ri"
                              class="flex flex-wrap items-center gap-1.5"
                              dir="ltr"
                            >
                              <input
                                type="time"
                                class="h-9 rounded-lg border border-outline-variant/30 bg-surface-container-low px-2 text-[12px]"
                                :value="range.start"
                                @change="onUpdateRange(jsDay, ri, 'start', ($event.target as HTMLInputElement).value)"
                              />
                              <span class="text-on-surface-variant">–</span>
                              <input
                                type="time"
                                class="h-9 rounded-lg border border-outline-variant/30 bg-surface-container-low px-2 text-[12px]"
                                :value="range.end"
                                @change="onUpdateRange(jsDay, ri, 'end', ($event.target as HTMLInputElement).value)"
                              />
                              <button
                                type="button"
                                class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
                                @click="onRemoveRange(jsDay, ri)"
                              >
                                <span class="material-symbols-outlined text-[18px]">close</span>
                              </button>
                            </div>
                          </template>
                          <p v-else class="text-[12px] text-on-surface-variant">{{ t.availUnavailable }}</p>
                        </div>

                        <div class="flex shrink-0 gap-0.5">
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container"
                            :title="t.availAddHours"
                            @click="onAddRange(jsDay)"
                          >
                            <span class="material-symbols-outlined text-[18px]">add</span>
                          </button>
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container"
                            :title="t.availCopyToDays"
                            @click="onCopy(jsDay)"
                          >
                            <span class="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-3 flex items-center gap-2 text-[12px]">
                    <span class="text-on-surface-variant">{{ t.availTimezone }}</span>
                    <select
                      class="h-9 min-w-0 flex-1 cursor-pointer rounded-lg border border-outline-variant/30 bg-surface-container-low px-2 text-[12px]"
                      :value="schedule.timezone"
                      @change="onTimezone"
                    >
                      <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
                    </select>
                  </div>
                </div>

                <!-- Date-specific -->
                <div>
                  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-[14px] font-bold">{{ t.availDateSpecific }}</h3>
                    <div class="flex items-center gap-2">
                      <input
                        v-model="newOverrideDate"
                        type="date"
                        class="h-9 rounded-lg border border-outline-variant/30 bg-surface-container-low px-2 text-[12px]"
                      />
                      <button
                        type="button"
                        class="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-bold text-on-primary"
                        @click="onAddOverride"
                      >
                        <span class="material-symbols-outlined text-[16px]">add</span>
                        {{ t.availAddHours }}
                      </button>
                    </div>
                  </div>

                  <div v-if="!schedule.overrides.length" class="rounded-xl border border-dashed border-outline-variant/40 p-6 text-center text-[12px] text-on-surface-variant">
                    —
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="o in schedule.overrides"
                      :key="o.date"
                      class="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-3"
                    >
                      <div class="mb-2 flex items-center justify-between gap-2">
                        <span class="font-latin text-[13px] font-bold">{{ o.date }}</span>
                        <button
                          type="button"
                          class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface-container"
                          @click="onRemoveOverride(o.date)"
                        >
                          <span class="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                      <div v-if="o.ranges.length" class="space-y-2" dir="ltr">
                        <div v-for="(r, ri) in o.ranges" :key="ri" class="flex flex-wrap items-center gap-1.5">
                          <input
                            type="time"
                            class="h-9 rounded-lg border border-outline-variant/30 bg-surface-container-low px-2 text-[12px]"
                            :value="r.start"
                            @change="onUpdateOverride(o.date, ri, 'start', ($event.target as HTMLInputElement).value)"
                          />
                          <span>–</span>
                          <input
                            type="time"
                            class="h-9 rounded-lg border border-outline-variant/30 bg-surface-container-low px-2 text-[12px]"
                            :value="r.end"
                            @change="onUpdateOverride(o.date, ri, 'end', ($event.target as HTMLInputElement).value)"
                          />
                        </div>
                      </div>
                      <p v-else class="text-[12px] text-on-surface-variant">{{ t.availUnavailable }}</p>
                    </div>
                  </div>

                  <!-- Mini week preview when calendar view -->
                  <div v-if="viewMode === 'calendar'" class="mt-4 grid grid-cols-7 gap-1">
                    <div
                      v-for="jsDay in dayOrder"
                      :key="`cal-${jsDay}`"
                      class="rounded-lg p-2 text-center"
                      :class="
                        schedule.days[jsDay].ranges.length
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      "
                    >
                      <p class="text-[10px] font-bold">{{ shortForJsDay(jsDay) }}</p>
                      <p class="mt-1 font-latin text-[9px] leading-tight">
                        <template v-if="schedule.days[jsDay].ranges[0]">
                          {{ schedule.days[jsDay].ranges[0].start }}
                          <br />
                          {{ schedule.days[jsDay].ranges[0].end }}
                        </template>
                        <template v-else>—</template>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="modalTab === 'calendar'">
              <p class="text-[14px] text-on-surface-variant">
                {{ t.dashConnectCalendar }}
              </p>
              <button
                type="button"
                class="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-outline-variant/30 px-4 text-[13px] font-semibold"
              >
                <span class="material-symbols-outlined">event_available</span>
                Google Calendar / Outlook
              </button>
            </template>

            <template v-else>
              <p class="text-[14px] font-semibold">{{ t.availTabAdvanced }}</p>
              <p class="mt-2 text-[13px] text-on-surface-variant">{{ t.dashAutoBuffer }} · {{ t.dashAutoSync }}</p>
              <label class="mt-4 flex min-h-11 cursor-pointer items-center justify-between rounded-xl bg-surface-container-low px-3 text-[13px] font-semibold">
                {{ t.dashAutoBuffer }}
                <input type="checkbox" checked class="accent-primary" />
              </label>
            </template>
          </div>
        </div>

        <div
          v-if="toast"
          class="pointer-events-none absolute bottom-4 start-1/2 z-10 -translate-x-1/2 rounded-full bg-on-surface px-4 py-2 text-[12px] font-bold text-white shadow-lg"
        >
          {{ t.availSavedToast }}
        </div>
      </div>
    </div>
  </Teleport>
</template>
