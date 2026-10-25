<script setup lang="ts">
defineProps<{
    branch: string
    visitType: 'clinic' | 'online'
    branches: readonly string[]
    labels: {
        visitType: string
        clinic: string
        online: string
        branch: string
        locationHelp: string
    }
}>()

const emit = defineEmits<{
    'update:branch': [value: string]
    'update:visitType': [value: 'clinic' | 'online']
}>()
</script>

<template>
    <div>
        <fieldset>
            <legend class="mb-3 text-sm font-semibold">
                {{ labels.visitType }}
            </legend>

            <div class="grid gap-3 sm:grid-cols-2">
                <button type="button" :aria-pressed="visitType === 'clinic'"
                    class="min-h-12 rounded-xl border p-3 text-sm" :class="visitType === 'clinic'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant/30'
                        " @click="emit('update:visitType', 'clinic')">
                    {{ labels.clinic }}
                </button>

                <button type="button" :aria-pressed="visitType === 'online'"
                    class="min-h-12 rounded-xl border p-3 text-sm" :class="visitType === 'online'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant/30'
                        " @click="emit('update:visitType', 'online')">
                    {{ labels.online }}
                </button>
            </div>
        </fieldset>

        <fieldset class="mt-6">
            <legend class="mb-3 text-sm font-semibold">
                {{ labels.branch }}
            </legend>

            <div class="grid gap-2">
                <button v-for="item in branches" :key="item" type="button" :aria-pressed="branch === item"
                    class="min-h-12 rounded-xl border px-4 py-3 text-start text-sm" :class="branch === item
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant/30'
                        " @click="emit('update:branch', item)">
                    {{ item }}
                </button>
            </div>
        </fieldset>

        <p class="mt-4 text-xs leading-6 text-on-surface-variant">
            {{ labels.locationHelp }}
        </p>
    </div>
</template>