<script setup lang="ts">
import { useLanguage } from '../i18n/useLanguage'
import { groupOf } from '../composables/useBookingStats'

/** وضعیت نوبت به‌صورت pill با آیکون و متن (فقط رنگ حامل معنی نیست). */
const props = defineProps<{ status: string }>()

const { t } = useLanguage()

const meta = computed(() => {
    const table = {
        completed: { label: t.value.dashOvStCompleted, icon: 'task_alt', cls: 'bg-sage/50 text-on-surface' },
        confirmed: { label: t.value.dashOvStConfirmed, icon: 'event_available', cls: 'bg-primary/15 text-on-surface' },
        pending: { label: t.value.dashOvStPending, icon: 'schedule', cls: 'bg-secondary-container text-on-secondary-container' },
        missed: { label: t.value.dashOvStMissed, icon: 'event_busy', cls: 'bg-surface-container text-on-surface-variant' },
    }
    return table[groupOf(props.status)]
})
</script>

<template>
    <span class="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold"
        :class="meta.cls">
        <span class="material-symbols-outlined text-[14px]" aria-hidden="true">{{ meta.icon }}</span>
        {{ meta.label }}
    </span>
</template>
