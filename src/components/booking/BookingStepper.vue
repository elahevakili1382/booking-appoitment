<script setup lang="ts">
import { assets } from '../../data/assets'

defineProps<{
    steps: string[]
    step: number
    completed: boolean
    busy: boolean
    ariaLabel: string
    formatNumber: (value: number) => string
}>()

const emit = defineEmits<{
    select: [value: number]
}>()
</script>

<template>
    <aside class="min-w-0 rounded-t-3xl bg-primary/10 p-4 lg:w-56 lg:shrink-0 lg:rounded-none lg:rounded-s-3xl lg:p-5">
        <div class="mb-5 flex items-center gap-3">
            <img :src="assets.logo" alt="" class="h-8 w-auto object-contain" />

            <p class="font-latin text-lg font-semibold text-primary">
                Lumina Clinic
            </p>
        </div>

        <nav :aria-label="ariaLabel" class="flex gap-2 overflow-x-auto pb-2 lg:flex-col">
            <button v-for="(label, index) in steps" :key="index" type="button"
                :disabled="index + 1 >= step || completed || busy"
                :aria-current="!completed && step === index + 1 ? 'step' : undefined"
                class="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-start text-xs focus-visible:outline-2 focus-visible:outline-primary lg:text-sm"
                :class="!completed && step === index + 1
                        ? 'bg-primary text-on-primary'
                        : 'bg-white/60 text-on-surface-variant'
                    " @click="emit('select', index + 1)">
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Icon v-if="completed || index + 1 < step" name="ph:check" class="h-4 w-4" />

                    <span v-else>{{ formatNumber(index + 1) }}</span>
                </span>

                {{ label }}
            </button>
        </nav>
    </aside>
</template>