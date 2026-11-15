<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'
import type { BookingLite } from '../composables/useBookingStats'

/** نوبت‌های روز انتخاب‌شده */
const props = defineProps<{
    bookings: BookingLite[]
}>()

const { t, locale } = useLanguage()
const nf = computed(() => new Intl.NumberFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US'))

const rows = computed(() => [...props.bookings].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')))
</script>

<template>
    <section class="rounded-card border border-outline-variant/25 bg-white p-4 shadow-card sm:p-5" :aria-label="t.dashStatsToday">
        <h3 class="text-[15px] font-bold text-on-surface">{{ t.dashStatsToday }}</h3>

        <p v-if="!rows.length"
            class="mt-4 rounded-xl bg-surface-container-low p-6 text-center text-[13px] text-on-surface-variant">
            {{ t.dashOvTableEmpty }}
        </p>

        <div v-else class="mt-3 overflow-x-auto">
            <table class="w-full min-w-[28rem] text-start text-[13px]">
                <caption class="sr-only">{{ t.dashStatsToday }}</caption>
                <thead>
                    <tr class="border-b border-outline-variant/25 text-[11px] font-semibold text-on-surface-variant">
                        <th scope="col" class="py-2 pe-3 text-start font-semibold">{{ t.dashOvTblTime }}</th>
                        <th scope="col" class="py-2 pe-3 text-start font-semibold">{{ t.dashOvTblService }}</th>
                        <th scope="col" class="hidden py-2 pe-3 text-start font-semibold sm:table-cell">{{ t.dashOvTblDoctor }}</th>
                        <th scope="col" class="py-2 pe-3 text-start font-semibold">{{ t.dashOvTblStatus }}</th>
                        <th scope="col" class="hidden py-2 text-end font-semibold md:table-cell">{{ t.dashOvTblAmount }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/15">
                    <tr v-for="b in rows" :key="b.id">
                        <td class="py-3 pe-3 font-latin tabular-nums text-on-surface-variant">{{ b.time || '—' }}</td>
                        <td class="py-3 pe-3 font-semibold text-on-surface">{{ b.service || '—' }}</td>
                        <td class="hidden py-3 pe-3 text-on-surface-variant sm:table-cell">{{ b.doctor || '—' }}</td>
                        <td class="py-3 pe-3"><StatusPill :status="b.status" /></td>
                        <td class="hidden py-3 text-end tabular-nums text-on-surface md:table-cell">
                            {{ nf.format(b.total || 0) }} {{ t.dashOvCurrency }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>
