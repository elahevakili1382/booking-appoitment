<script setup lang="ts">
const { toasts } = useToast()
</script>

<template>
    <div
        class="pointer-events-none fixed bottom-4 start-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 rtl:translate-x-1/2">
        <TransitionGroup name="toast">
            <div v-for="t in toasts" :key="t.id"
                class="pointer-events-auto rounded-xl px-4 py-3 text-[13px] font-semibold shadow-lg"
                :class="t.type === 'error' ? 'bg-red-600 text-white' : 'bg-primary text-on-primary'">
                {{ t.message }}
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>