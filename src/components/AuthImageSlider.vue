<script setup lang="ts">
/**
 * اسلایدر تصویر برای صفحهٔ ورود: محو شدن نرم بین تصاویر، نقطه‌های قابل کلیک.
 * بدون کتابخانه؛ با prefers-reduced-motion خودکار عوض نمی‌شود.
 */
const props = withDefaults(defineProps<{ images: string[]; interval?: number }>(), { interval: 5000 })

const index = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function stop() {
  if (timer) clearInterval(timer)
  timer = null
}
function start() {
  stop()
  if (props.images.length < 2) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => {
    index.value = (index.value + 1) % props.images.length
  }, props.interval)
}
function go(i: number) {
  index.value = i
  start() // بعد از انتخاب دستی، شمارش از نو
}

onMounted(start)
onUnmounted(stop)
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-sage/40" @mouseenter="stop" @mouseleave="start"
    @focusin="stop" @focusout="start">
    <img v-for="(src, i) in images" :key="src" :src="src" alt="" aria-hidden="true"
      :loading="i === 0 ? 'eager' : 'lazy'" decoding="async"
      class="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1400ms] ease-out motion-reduce:transition-none"
      :class="index === i ? 'scale-100 opacity-100' : 'scale-105 opacity-0'" />

    <!-- لایهٔ تیره برای خوانایی متن -->
    <div class="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-on-surface/10 to-transparent" aria-hidden="true" />

    <div class="absolute inset-x-0 bottom-0 p-8 text-white">
      <slot />
      <div v-if="images.length > 1" class="mt-5 flex items-center gap-2" role="group">
        <button v-for="(_, i) in images" :key="i" type="button" :aria-current="index === i"
          :aria-label="`${i + 1} / ${images.length}`"
          class="h-2 cursor-pointer rounded-full transition-all duration-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          :class="index === i ? 'w-7 bg-white' : 'w-2 bg-white/50'" @click="go(i)" />
      </div>
    </div>
  </div>
</template>
