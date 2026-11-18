<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'
import type { BookingLite } from '../composables/useBookingStats'

const props = defineProps<{
    bookings: BookingLite[]
}>()

const { t, locale } = useLanguage()
const MAX = 5

const rtf = computed(() => new Intl.RelativeTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', { numeric: 'auto' }))

function ago(iso: string): string {
    const diffMs = new Date(iso).getTime() - Date.now()
    const min = Math.round(diffMs / 60_000)
    if (Math.abs(min) < 60) return rtf.value.format(min, 'minute')
    const hr = Math.round(min / 60)
    if (Math.abs(hr) < 24) return rtf.value.format(hr, 'hour')
    return rtf.value.format(Math.round(hr / 24), 'day')
}

const statusText = computed<Record<string, string>>(() => ({
    confirmed: t.value.dashOvStConfirmed,
    pending: t.value.dashOvStPending,
    completed: t.value.dashOvStCompleted,
    cancelled: t.value.dashOvStMissed,
    no_show: t.value.dashOvStMissed,
}))

const icons: Record<string, string> = {
    confirmed: 'event_available',
    pending: 'schedule',
    completed: 'task_alt',
    cancelled: 'event_busy',
    no_show: 'event_busy',
}

/** جدیدترین نوبت‌های ثبت‌شده. نام مراجع نمایش داده نمی‌شود (حریم خصوصی). */
const items = computed(() =>
    props.bookings
        .filter((b) => b.createdAt && !Number.isNaN(new Date(b.createdAt).getTime()))
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, MAX)
        .map((b) => ({
            id: b.id,
            icon: icons[b.status] ?? 'event',
            title: [b.service, b.doctor].filter(Boolean).join(' · '),
            status: statusText.value[b.status] ?? b.status,
            when: ago(b.createdAt!),
        })),
)
</script>

<template>
    <section class="rounded-card border border-outline-variant/25 bg-white p-4 shadow-card" :aria-label="t.dashOvActivity">
        <h3 class="text-[14px] font-bold text-on-surface">{{ t.dashOvActivity }}</h3>

        <p v-if="!items.length" class="mt-3 rounded-xl bg-surface-container-low p-4 text-center text-[12px] text-on-surface-variant">
            {{ t.dashOvActivityEmpty }}
        </p>

        <ol v-else class="mt-3 space-y-3">
            <li v-for="it in items" :key="it.id" class="flex items-start gap-3">
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage/45 text-on-surface" aria-hidden="true">
                    <span class="material-symbols-outlined text-[18px]">{{ it.icon }}</span>
                </span>
                <div class="min-w-0 flex-1">
                    <p lang="fa" dir="auto" class="truncate text-[12px] font-semibold text-on-surface">{{ it.title }}</p>
                    <p class="text-[11px] text-on-surface-variant">{{ it.status }} · {{ it.when }}</p>
                </div>
            </li>
        </ol>
    </section>
</template>
