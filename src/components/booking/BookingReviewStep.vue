<script setup lang="ts">
defineProps<{
    serviceName: string
    doctorName: string
    branch: string
    visitLabel: string
    dateLabel: string
    timeLabel: string
    fullName: string
    phone: string
    costLabel: string
    timeValid: boolean
    labels: {
        service: string
        selectedDoctor: string
        branch: string
        visitType: string
        appointment: string
        name: string
        phone: string
        total: string
        invalidTime: string
    }
}>()
</script>

<template>
    <div>
        <dl class="space-y-4 rounded-2xl bg-primary/5 p-4 text-sm leading-7">
            <div>
                <dt class="text-on-surface-variant">{{ labels.service }}</dt>
                <dd>{{ serviceName }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.selectedDoctor }}</dt>
                <dd>{{ doctorName }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.branch }}</dt>
                <dd>{{ branch }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.visitType }}</dt>
                <dd>{{ visitLabel }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.appointment }}</dt>
                <dd>{{ dateLabel }} — {{ timeLabel }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.name }}</dt>
                <dd>{{ fullName }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.phone }}</dt>
                <dd dir="ltr" class="text-start">{{ phone }}</dd>
            </div>

            <div>
                <dt class="text-on-surface-variant">{{ labels.total }}</dt>
                <dd>{{ costLabel }}</dd>
            </div>
        </dl>

        <p v-if="!timeValid" class="mt-4 text-sm leading-7 text-red-700">
            {{ labels.invalidTime }}
        </p>
    </div>
</template>