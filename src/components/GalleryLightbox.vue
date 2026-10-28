<script setup lang="ts">
import type { GalleryCase } from '~/data/galleryCases'

defineProps<{ item: GalleryCase | null }>()
const emit = defineEmits<{ close: [] }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="item" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog"
        aria-modal="true" :aria-label="item.title" @click.self="emit('close')">
        <figure class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white">
          <img :src="item.img" :alt="`قبل و بعد ${item.treatment}`" class="max-h-[70vh] w-full object-contain" />
          <figcaption class="p-4 text-sm leading-7">
            <p class="text-[11px] font-semibold text-primary">{{ item.treatment }} — {{ item.sessions }}</p>
            <p class="mt-1 font-bold text-ink">{{ item.title }}</p>
            <p class="mt-1 text-muted">{{ item.description }}</p>
          </figcaption>
        </figure>
        <button type="button" aria-label="بستن"
          class="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink"
          @click="emit('close')">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
