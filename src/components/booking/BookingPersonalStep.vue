<script setup lang="ts">
defineProps<{
    fullName: string
    phone: string
    notes: string
    phoneValid: boolean
    labels: {
        name: string
        phone: string
        phoneHelp: string
        invalidPhone: string
        notes: string
        notesHelp: string
    }
}>()

const emit = defineEmits<{
    'update:fullName': [value: string]
    'update:phone': [value: string]
    'update:notes': [value: string]
}>()

function inputValue(event: Event) {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value
}
</script>

<template>
    <div class="space-y-5">
        <div>
            <label for="booking-name" class="mb-2 block text-sm font-semibold">
                {{ labels.name }}
            </label>

            <input id="booking-name" :value="fullName" type="text" autocomplete="name" maxlength="100"
                class="min-h-12 w-full rounded-xl border border-outline-variant/30 bg-primary/5 px-3 text-base outline-none focus:ring-2 focus:ring-primary/25"
                @input="emit('update:fullName', inputValue($event))">
        </div>

        <div>
            <label for="booking-phone" class="mb-2 block text-sm font-semibold">
                {{ labels.phone }}
            </label>

            <input id="booking-phone" :value="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr"
                placeholder="09123456789" :aria-invalid="phone.length > 0 && !phoneValid"
                aria-describedby="booking-phone-help booking-phone-error"
                class="min-h-12 w-full rounded-xl border border-outline-variant/30 bg-primary/5 px-3 text-base outline-none focus:ring-2 focus:ring-primary/25"
                @input="emit('update:phone', inputValue($event))">

            <p id="booking-phone-help" class="mt-2 text-xs leading-6 text-on-surface-variant">
                {{ labels.phoneHelp }}
            </p>

            <p id="booking-phone-error" class="mt-1 text-xs leading-6 text-red-700">
                {{ phone.length > 0 && !phoneValid ? labels.invalidPhone : '' }}
            </p>
        </div>

        <div>
            <label for="booking-notes" class="mb-2 block text-sm font-semibold">
                {{ labels.notes }}
            </label>

            <textarea id="booking-notes" :value="notes" rows="3" maxlength="1000"
                class="w-full rounded-xl border border-outline-variant/30 bg-primary/5 p-3 text-base outline-none focus:ring-2 focus:ring-primary/25"
                @input="emit('update:notes', inputValue($event))" />

            <p class="mt-2 text-xs leading-6 text-on-surface-variant">
                {{ labels.notesHelp }}
            </p>
        </div>
    </div>
</template>