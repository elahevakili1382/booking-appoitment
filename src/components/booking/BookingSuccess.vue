<script setup lang="ts">
import type { BookingLabels } from '../../i18n/booking'

defineProps<{
    code: string
    summary: {
        service: string
        doctor: string
        branch: string
        date: string
        time: string
    }
    labels: BookingLabels
    canPay: boolean
    payableLabel: string
    paying: boolean
    paymentError: string
}>()

const emit = defineEmits<{
    pay: []
}>()
</script>

<template>
    <div class="p-5 sm:p-8">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name="ph:check-circle" class="h-9 w-9" />
        </div>

        <h1 class="mt-5 text-center text-2xl font-bold text-on-surface">
            {{ labels.success }}
        </h1>

        <p class="mt-3 text-center text-sm leading-7 text-on-surface-variant">
            {{ labels.successHelp }}
        </p>

        <p class="mt-4 text-center font-latin text-lg font-bold text-primary">
            {{ code }}
        </p>

        <dl class="mt-6 space-y-4 rounded-2xl bg-primary/5 p-4 text-sm leading-7">
            <div>
                <dt class="text-on-surface-variant">{{ labels.service }}</dt>
                <dd>{{ summary.service }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.selectedDoctor }}</dt>
                <dd>{{ summary.doctor }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.appointment }}</dt>
                <dd>{{ summary.date }} — {{ summary.time }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.branch }}</dt>
                <dd>{{ summary.branch }}</dd>
            </div>
        </dl>

        <button v-if="canPay" type="button" :disabled="paying"
            class="mt-5 min-h-12 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary disabled:opacity-50"
            @click="emit('pay')">
            <span v-if="paying">{{ labels.paying }}</span>
            <span v-else>{{ labels.pay }} — {{ payableLabel }}</span>
        </button>

        <p v-if="paymentError" role="alert" class="mt-4 text-sm leading-7 text-red-700">
            {{ paymentError }}
        </p>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <NuxtLink to="/dashboard"
                class="flex min-h-12 items-center justify-center rounded-xl border border-primary/30 px-4 text-sm font-semibold text-primary">
                {{ labels.tracking }}
            </NuxtLink>

            <NuxtLink to="/"
                class="flex min-h-12 items-center justify-center rounded-xl bg-primary/5 px-4 text-sm text-primary">
                {{ labels.home }}
            </NuxtLink>
        </div>
    </div>
</template>