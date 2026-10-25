<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

import type {
    BookingSlot,
    CalendarDay,
    BookingWeekDay,
} from '../../types/booking'

const props = defineProps<{
    title: string
    isFa: boolean
    showCalendar: boolean
    showAllSlots: boolean
    monthLabel: string
    weekdayLabels: string[]
    calendarDays: CalendarDay[]
    weekDays: BookingWeekDay[]
    selectedDate: string
    selectedSlotId: string
    selectedSlot?: BookingSlot
    selectedDateLabel: string
    selectedEnd: string
    today: string
    weekStart: string
    canGoPreviousMonth: boolean
    visibleSlots: BookingSlot[]
    slotsCount: number
    hasFreeSlots: boolean
    loading: boolean
    hasError: boolean
    durationLabel: string
    getSlotId: (slot: BookingSlot) => string

    labels: {
        previousWeek: string
        nextWeek: string
        previousMonth: string
        nextMonth: string
        closeCalendar: string
        loading: string
        loadError: string
        retry: string
        noSlots: string
        less: string
        more: string
        duration: string
        minutes: string
    }
}>()

const emit = defineEmits<{
    'update:showCalendar': [value: boolean]
    'update:showAllSlots': [value: boolean]
    moveWeek: [direction: number]
    moveMonth: [direction: number]
    pickDate: [iso: string]
    pickSlot: [slot: BookingSlot]
    retry: []
}>()

const calendarWrapper = ref<HTMLElement | null>(null)
const calendarTrigger = ref<HTMLButtonElement | null>(null)

function closeCalendar(restoreFocus = false) {
    emit('update:showCalendar', false)

    if (restoreFocus) {
        calendarTrigger.value?.focus()
    }
}

function toggleCalendar() {
    emit('update:showCalendar', !props.showCalendar)
}

function selectCalendarDate(iso: string) {
    emit('pickDate', iso)
    closeCalendar(true)
}

function selectWeekDate(iso: string) {
    emit('pickDate', iso)
    closeCalendar()
}

onClickOutside(calendarWrapper, () => {
    if (props.showCalendar) {
        closeCalendar()
    }
})
</script>

<template>
    <div class="min-w-0">
        <!-- عنوان سمت راست؛ کنترل تقویم سمت چپ -->
        <header dir="ltr" class="mb-5 flex items-center justify-between gap-2 sm:gap-4">
            <!-- کنترل و پاپ‌آپ تقویم -->
            <div ref="calendarWrapper" :dir="isFa ? 'rtl' : 'ltr'" class="relative shrink-0"
                @keydown.esc.stop.prevent="closeCalendar(true)">
                <button ref="calendarTrigger" type="button" aria-controls="booking-calendar-popover"
                    :aria-expanded="showCalendar"
                    class="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-2.5 py-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none sm:min-h-11 sm:gap-2 sm:px-3 sm:text-xs"
                    @click="toggleCalendar">
                    <Icon name="ph:calendar-blank" class="h-4 w-4 shrink-0" />

                    <span class="whitespace-nowrap">
                        {{ monthLabel }}
                    </span>

                    <Icon name="ph:caret-down"
                        class="h-3 w-3 shrink-0 transition-transform motion-reduce:transition-none"
                        :class="{ 'rotate-180': showCalendar }" />
                </button>

                <!-- یک تقویم، دقیقاً زیر دکمه -->
                <div v-if="showCalendar" id="booking-calendar-popover" role="region" :aria-label="monthLabel"
                    class="absolute left-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-6rem)] rounded-2xl border border-outline-variant/30 bg-white p-3 shadow-xl sm:w-72 sm:max-w-none">
                    <!-- کنترل ماه -->
                    <div class="mb-2 flex items-center justify-between gap-2">
                        <button type="button" :disabled="!canGoPreviousMonth" :aria-label="labels.previousMonth"
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-30"
                            @click="emit('moveMonth', -1)">
                            <Icon :name="isFa ? 'ph:caret-right' : 'ph:caret-left'" class="h-4 w-4" />
                        </button>

                        <p aria-live="polite"
                            class="min-w-0 text-center text-xs font-bold leading-6 text-on-surface sm:text-sm">
                            {{ monthLabel }}
                        </p>

                        <button type="button" :aria-label="labels.nextMonth"
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
                            @click="emit('moveMonth', 1)">
                            <Icon :name="isFa ? 'ph:caret-left' : 'ph:caret-right'" class="h-4 w-4" />
                        </button>
                    </div>

                    <!-- روزهای هفته و ماه -->
                    <div class="grid grid-cols-7 gap-1">
                        <span v-for="label in weekdayLabels" :key="label"
                            class="py-1.5 text-center text-[10px] font-medium text-on-surface-variant sm:text-xs">
                            {{ label }}
                        </span>

                        <button v-for="day in calendarDays" :key="day.iso" type="button" :disabled="day.disabled"
                            :aria-label="day.iso" :aria-pressed="selectedDate === day.iso"
                            :aria-current="day.iso === today ? 'date' : undefined"
                            class="flex h-8 min-w-0 items-center justify-center rounded-lg text-xs transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-25 motion-reduce:transition-none sm:h-9"
                            :class="{
                                'bg-primary font-bold text-on-primary':
                                    selectedDate === day.iso,

                                'text-on-surface hover:bg-primary/10':
                                    selectedDate !== day.iso && day.inMonth,

                                'text-on-surface-variant/40 hover:bg-primary/5':
                                    selectedDate !== day.iso && !day.inMonth,

                                'ring-1 ring-inset ring-primary/40':
                                    day.iso === today && selectedDate !== day.iso,
                            }" @click="selectCalendarDate(day.iso)">
                            {{ day.label }}
                        </button>
                    </div>

                    <button type="button"
                        class="mt-3 min-h-10 w-full rounded-lg bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
                        @click="closeCalendar(true)">
                        {{ labels.closeCalendar }}
                    </button>
                </div>
            </div>

            <!-- عنوان این مرحله فقط اینجا نمایش داده شود -->
            <h1 :dir="isFa ? 'rtl' : 'ltr'"
                class="min-w-0 break-words text-right text-lg font-bold leading-8 text-on-surface sm:text-2xl sm:leading-9">
                {{ title }}
            </h1>
        </header>

        <!-- کنترل هفته؛ زیر عنوان -->
        <div :dir="isFa ? 'rtl' : 'ltr'" class="mb-3 flex items-center justify-start gap-1">
            <button type="button" :disabled="weekStart <= today" :aria-label="labels.previousWeek"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-30"
                @click="emit('moveWeek', -1)">
                <Icon :name="isFa ? 'ph:caret-right' : 'ph:caret-left'" class="h-4 w-4" />
            </button>

            <button type="button" :aria-label="labels.nextWeek"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary"
                @click="emit('moveWeek', 1)">
                <Icon :name="isFa ? 'ph:caret-left' : 'ph:caret-right'" class="h-4 w-4" />
            </button>
        </div>

        <!-- انتخاب سریع روز -->
        <div class="flex gap-2 overflow-x-auto pb-2">
            <button v-for="day in weekDays" :key="day.iso" type="button" :disabled="day.iso < today"
                :aria-pressed="selectedDate === day.iso"
                class="flex min-w-[64px] shrink-0 flex-col items-center rounded-xl px-2 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-30 motion-reduce:transition-none sm:min-w-[70px]"
                :class="selectedDate === day.iso
                        ? 'bg-primary text-on-primary'
                        : 'bg-primary/5 text-on-surface-variant hover:bg-primary/10'
                    " @click="selectWeekDate(day.iso)">
                <span class="text-[11px]">
                    {{ day.name }}
                </span>

                <span class="mt-2 text-lg font-bold">
                    {{ day.number }}
                </span>
            </button>
        </div>

        <!-- بارگذاری -->
        <p v-if="loading" role="status" class="py-8 text-center text-sm text-on-surface-variant">
            {{ labels.loading }}
        </p>

        <!-- خطا -->
        <div v-else-if="hasError" role="alert" class="mt-4 rounded-xl bg-red-50 p-4 text-sm">
            <p>{{ labels.loadError }}</p>

            <button type="button" class="mt-2 min-h-11 px-3 font-semibold text-primary" @click="emit('retry')">
                {{ labels.retry }}
            </button>
        </div>

        <!-- ساعت‌ها -->
        <template v-else>
            <p v-if="!hasFreeSlots"
                class="mt-4 rounded-xl border border-dashed border-outline-variant/40 p-5 text-center text-sm leading-7 text-on-surface-variant">
                {{ labels.noSlots }}
            </p>

            <div class="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                <button v-for="slot in visibleSlots" :key="getSlotId(slot)" type="button" :disabled="slot.taken"
                    :aria-pressed="selectedSlotId === getSlotId(slot)"
                    class="min-h-11 rounded-xl px-2 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                    :class="slot.taken
                            ? 'bg-primary/5 text-on-surface-variant line-through'
                            : selectedSlotId === getSlotId(slot)
                                ? 'bg-primary text-on-primary'
                                : 'bg-primary/5 text-on-surface hover:bg-primary/10'
                        " @click="emit('pickSlot', slot)">
                    {{ slot.time }}
                </button>
            </div>

            <button v-if="slotsCount > 12" type="button" class="mt-3 min-h-11 text-sm font-semibold text-primary"
                @click="emit('update:showAllSlots', !showAllSlots)">
                {{ showAllSlots ? labels.less : labels.more }}
            </button>
        </template>

        <!-- خلاصه انتخاب -->
        <div v-if="selectedSlot && !loading && !hasError"
            class="mt-4 rounded-xl border border-primary/15 bg-primary/10 p-4 text-sm leading-8">
            <p>{{ selectedDateLabel }}</p>

            <p class="font-semibold text-on-surface">
                {{ selectedSlot.time }} — {{ selectedEnd }}
            </p>

            <p class="text-xs text-on-surface-variant">
                {{ labels.duration }}:
                {{ durationLabel }}
                {{ labels.minutes }}
            </p>
        </div>
    </div>
</template>