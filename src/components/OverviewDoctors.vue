<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'

import type { OverviewDoctor, OverviewSlot } from '../composables/useBookingStats'

const props = defineProps<{
    doctors: OverviewDoctor[]
    /** اسلات‌های روز انتخاب‌شده */
    slots: OverviewSlot[]
}>()

const { t, locale } = useLanguage()
const nf = computed(() => new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US'))

const rows = computed(() =>
    props.doctors.map((d) => {
        const mine = props.slots.filter((s) => s.staffId === d.id)
        const first = [...mine].sort((a, b) => a.startHour * 60 + a.startMin - (b.startHour * 60 + b.startMin))[0]
        const time = first
            ? `${String(first.startHour).padStart(2, '0')}:${String(first.startMin).padStart(2, '0')}`
            : ''
        return { ...d, count: mine.length, firstTime: time }
    }),
)
</script>

<template>
    <section class="rounded-card border border-outline-variant/25 bg-white p-4 shadow-card sm:p-5" :aria-label="t.dashOvDoctorsTitle">
        <h3 class="text-[15px] font-bold text-on-surface">{{ t.dashOvDoctorsTitle }}</h3>

        <p v-if="!rows.length" class="mt-4 rounded-xl bg-surface-container-low p-4 text-center text-[13px] text-on-surface-variant">
            {{ t.dashOvDoctorsEmpty }}
        </p>

        <ul v-else class="mt-3 divide-y divide-outline-variant/20">
            <li v-for="d in rows" :key="d.id" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <NuxtImg :src="d.photo" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover" format="webp"
                    loading="lazy" />
                <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-bold text-on-surface">{{ d.name }}</p>
                    <p class="truncate text-[11px] text-on-surface-variant">{{ d.role }}</p>
                </div>
                <div class="shrink-0 text-end">
                    <p class="text-[12px] font-semibold tabular-nums text-on-surface">
                        <template v-if="d.count">{{ nf.format(d.count) }} {{ t.dashOvApptUnit }}</template>
                        <template v-else>{{ t.dashOvNoAppts }}</template>
                    </p>
                    <p v-if="d.firstTime" class="font-latin text-[11px] tabular-nums text-on-surface-variant">
                        {{ t.dashOvFrom }} {{ d.firstTime }}
                    </p>
                    <p v-else class="inline-flex items-center gap-1 text-[11px] font-semibold text-positive">
                        <span class="material-symbols-outlined text-[14px]" aria-hidden="true">check_circle</span>
                        {{ t.dashOvAvailable }}
                    </p>
                </div>
            </li>
        </ul>
    </section>
</template>
