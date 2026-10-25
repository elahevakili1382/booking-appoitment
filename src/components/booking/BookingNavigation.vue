<script setup lang="ts">
defineProps<{
    step: number
    totalSteps: number
    submitting: boolean
    canContinue: boolean
    canConfirm: boolean
    labels: {
        home: string
        back: string
        continue: string
        submit: string
        submitting: string
    }
}>()

const emit = defineEmits<{
    back: []
    next: []
    confirm: []
}>()
</script>

<template>
    <footer
        class="flex flex-col gap-4 border-t border-outline-variant/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <NuxtLink to="/" class="order-2 text-center text-xs text-on-surface-variant sm:order-1">
            {{ labels.home }}
        </NuxtLink>

        <div class="order-1 flex gap-2 sm:order-2">
            <button v-if="step > 1" type="button" :disabled="submitting"
                class="min-h-12 flex-1 rounded-xl border border-outline-variant/30 px-5 text-sm disabled:opacity-40 sm:flex-none"
                @click="emit('back')">
                {{ labels.back }}
            </button>

            <button v-if="step < totalSteps" type="button" :disabled="!canContinue"
                class="min-h-12 flex-1 rounded-xl bg-primary px-6 text-sm font-bold text-on-primary disabled:opacity-40 sm:flex-none"
                @click="emit('next')">
                {{ labels.continue }}
            </button>

            <button v-else type="button" :disabled="!canConfirm"
                class="min-h-12 flex-1 rounded-xl bg-primary px-6 text-sm font-bold text-on-primary disabled:opacity-40 sm:flex-none"
                @click="emit('confirm')">
                {{ submitting ? labels.submitting : labels.submit }}
            </button>
        </div>
    </footer>
</template>