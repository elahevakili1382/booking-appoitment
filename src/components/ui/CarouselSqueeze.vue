<script setup lang="ts">
/**
 * Vue port of carousel-squeeze (React/shadcn → Nuxt).
 * One open panel + slats; click/step slides the strip.
 */
import {
  computed,
  onBeforeUnmount,
  ref,
  useId,
  watch,
  type CSSProperties,
} from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { cn } from '~/utils/cn'

export type SqueezeSlide = {
  id?: string | number
  title: string
  description?: string
  image?: string
  imageAlt?: string
  background?: string
  overlay?: string
  action?: string
  href?: string
}

type Size = number | string
type Card = { key: number; slide: number }

const props = withDefaults(
  defineProps<{
    slides: SqueezeSlide[]
    defaultIndex?: number
    height?: Size
    slatWidth?: Size
    slatGap?: Size
    gap?: Size
    radius?: Size
    duration?: number
    hoverGrow?: boolean
    autoplay?: boolean
    interval?: number
    controls?: boolean
    accent?: string
    accentForeground?: string
    label?: string
    panelClassName?: string
    className?: string
  }>(),
  {
    defaultIndex: 0,
    height: 'clamp(180px, 32cqi, 340px)',
    slatWidth: 8,
    slatGap: 8,
    gap: 16,
    radius: 10,
    duration: 1000,
    hoverGrow: true,
    autoplay: false,
    interval: 6000,
    controls: true,
    accent: 'var(--color-primary)',
    accentForeground: '#fff',
    label: 'Featured',
  },
)

const emit = defineEmits<{ indexChange: [index: number] }>()

const size = (value: Size) => (typeof value === 'number' ? `${value}px` : value)
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value))

const SHARES = [-0.06, 0.61, 0.3, 0.15]
const STRETCHED = [0, 0.71, 0.4, 0.25]
const SQUEEZED = [-0.12, 0.59, 0.28, 0.13]

const reduce = usePreferredReducedMotion()
const ids = useId()
const seed = ref(0)
const count = computed(() => props.slides.length)
const wrap = (i: number) => ((i % count.value) + count.value) % count.value
const slats = computed(() => clamp(count.value - 4, 1, 3))
const visible = computed(() => 4 + slats.value)
const ms = computed(() => (reduce.value ? 0 : props.duration))

function window0(): Card[] {
  return Array.from({ length: visible.value }, (_, p) => ({
    key: seed.value++,
    slide: wrap(props.defaultIndex + p),
  }))
}

const cards = ref<Card[]>(window0())
const column = ref(0)
const columnRef = ref(0)
const forward = ref(true)
const slid = ref(0)
const still = ref(false)
const hover = ref(-1)
const paused = ref(false)
const timers = ref<number[]>([])

const open = computed(() => cards.value[-column.value]?.slide ?? props.defaultIndex)

watch(open, (v) => emit('indexChange', v))

onBeforeUnmount(() => timers.value.forEach(clearTimeout))

function settle() {
  cards.value = forward.value ? cards.value.slice(-visible.value) : cards.value.slice(0, visible.value)
  columnRef.value = 0
  column.value = 0
  slid.value = 0
  still.value = true
  requestAnimationFrame(() => {
    still.value = false
  })
}

function step(by: number) {
  if (count.value < 2 || by === 0) return
  timers.value.forEach(clearTimeout)
  timers.value = []
  forward.value = by > 0

  if (by > 0) {
    const strip = cards.value
    cards.value = [
      ...strip,
      ...Array.from({ length: by }, (_, k) => ({
        key: seed.value++,
        slide: wrap(strip[strip.length - 1]!.slide + 1 + k),
      })),
    ]
    columnRef.value -= by
    column.value = columnRef.value
    slid.value -= by
  } else {
    const strip = cards.value
    cards.value = [
      ...Array.from({ length: -by }, (_, k) => ({
        key: seed.value++,
        slide: wrap(strip[0]!.slide - (-by - k)),
      })),
      ...strip,
    ]
    slid.value += by
    still.value = true
    timers.value.push(window.setTimeout(() => {
      slid.value = 0
      still.value = false
    }, 0))
  }

  timers.value.push(window.setTimeout(settle, ms.value + 20))
}

watch(
  () => [props.autoplay, paused.value, reduce.value, count.value, open.value, props.interval] as const,
  () => {
    // handled below via effect-like interval
  },
)

let autoTimer: number | undefined
watch(
  [() => props.autoplay, paused, reduce, count, open, () => props.interval],
  () => {
    if (autoTimer) clearTimeout(autoTimer)
    if (!props.autoplay || paused.value || reduce.value || count.value < 2) return
    autoTimer = window.setTimeout(() => step(1), props.interval)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (autoTimer) clearTimeout(autoTimer)
})

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
  }
}

const sharesActive = computed(
  () => !(props.hoverGrow && hover.value >= 0 && hover.value <= 3 && !reduce.value),
)

function shareOf(col: number) {
  if (sharesActive.value) return SHARES[col]!
  return hover.value === col ? STRETCHED[col]! : SQUEEZED[col]!
}

function widthOf(col: number) {
  const slat = size(props.slatWidth)
  if (col < 0 || col > 3) return slat
  if (col === 0) return `calc(var(--sq-hero) + var(--sq-room) * ${shareOf(0)})`
  return `calc(var(--sq-room) * ${shareOf(col)})`
}

const vars = computed(
  () =>
    ({
      '--sq-h': size(props.height),
      '--sq-gap': size(props.gap),
      '--sq-slat-gap': size(props.slatGap),
      '--sq-radius': size(props.radius),
      '--sq-ms': `${ms.value}ms`,
      '--sq-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
      '--sq-fill': props.accent,
      '--sq-on-fill': props.accentForeground,
      '--sq-hero': 'calc(var(--sq-h) * 16 / 9)',
      '--sq-room': `calc(100cqi - var(--sq-hero) - ${slats.value} * var(--sq-slat-gap) - 3 * var(--sq-gap) - ${slats.value} * ${size(props.slatWidth)})`,
    }) as CSSProperties,
)

const move = computed(() => `translateX(calc(${slid.value} * (${size(props.slatWidth)} + var(--sq-gap))))`)
</script>

<template>
  <div v-if="count" :class="cn('flex w-full flex-col', className)" :style="{ containerType: 'inline-size', ...vars }"
    @mouseenter="paused = true" @mouseleave="paused = false; hover = -1" @focusin="paused = true"
    @focusout="paused = false">
    <div v-if="controls && count > 1" class="mb-4 flex justify-end gap-2">
      <button type="button"
        class="grid size-9 cursor-pointer place-items-center rounded-md bg-[var(--sq-fill)] text-[var(--sq-on-fill)] transition-opacity hover:opacity-85"
        aria-label="Previous" @click="step(-1)">
        <Icon name="ph:caret-right" />
      </button>
      <button type="button"
        class="grid size-9 cursor-pointer place-items-center rounded-md bg-[var(--sq-fill)] text-[var(--sq-on-fill)] transition-opacity hover:opacity-85"
        aria-label="Next" @click="step(1)">
        <Icon name="ph:caret-left" />
      </button>
    </div>

    <div class="w-full overflow-hidden" style="height: var(--sq-h)">
      <div role="tablist" :aria-label="label" aria-orientation="horizontal" class="flex h-full w-max" :style="{
        transform: move,
        transition: still ? 'none' : 'transform var(--sq-ms) var(--sq-ease)',
      }" @keydown="onKeyDown">
        <button v-for="(card, place) in cards" :key="card.key" type="button" role="tab" :id="`${ids}-tab-${card.key}`"
          :aria-selected="place + column === 0" :aria-controls="`${ids}-panel`" :aria-label="slides[card.slide]?.title"
          :tabindex="place + column === 0 ? 0 : -1" :class="cn(
            'relative isolate h-full shrink-0 cursor-pointer overflow-hidden bg-[#f4dde1] p-0 outline-none',
            'focus-visible:ring-2 focus-visible:ring-[var(--sq-fill)] focus-visible:ring-offset-2',
            panelClassName,
          )
            " :style="{
              width: widthOf(place + column),
              marginLeft:
                place === 0
                  ? '0'
                  : place + column < 4
                    ? 'var(--sq-gap)'
                    : 'var(--sq-slat-gap)',
              borderRadius: `min(var(--sq-radius), calc(${widthOf(place + column)} / 2))`,
              transitionProperty: 'width, margin-left',
              transitionDuration: still ? '0s' : 'var(--sq-ms)',
              transitionTimingFunction: 'var(--sq-ease)',
            }" @mousemove="hoverGrow && (hover = place + column)" @click="place + column > 0 && step(place + column)">
          <img v-if="slides[card.slide]?.image" :src="slides[card.slide]!.image"
            :alt="slides[card.slide]!.imageAlt ?? ''" draggable="false"
            class="absolute inset-y-0 left-1/2 h-full max-w-none -translate-x-1/2 object-cover"
            :style="{ width: 'var(--sq-hero)', minWidth: '100%' }" />
          <span v-else aria-hidden="true" class="absolute inset-y-0 left-1/2 -translate-x-1/2" :style="{
            background: slides[card.slide]?.background || '#8a4853',
            width: 'var(--sq-hero)',
            minWidth: '100%',
          }" />

          <span v-if="slides[card.slide]?.overlay" aria-hidden="true"
            class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/55 to-transparent p-4 pt-16"
            :style="{
              opacity: place + column === 0 ? 1 : 0,
              transition: 'opacity var(--sq-ms) var(--sq-ease)',
            }">
            <span class="text-sm font-medium tracking-tight text-white">{{ slides[card.slide]!.overlay }}</span>
          </span>
        </button>
      </div>
    </div>

    <div :id="`${ids}-panel`" role="tabpanel" aria-live="polite" class="mt-6 grid">
      <div v-for="(slide, i) in slides" :key="slide.id ?? i" :aria-hidden="i !== open"
        class="col-start-1 row-start-1 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10"
        :style="{
          opacity: i === open ? 1 : 0,
          visibility: i === open ? 'visible' : 'hidden',
          pointerEvents: i === open ? 'auto' : 'none',
          transition: 'opacity var(--sq-ms) var(--sq-ease), visibility var(--sq-ms)',
        }">
        <p class="max-w-[46rem] text-[15px] leading-[1.6] text-balance sm:text-[17px]">
          <span class="text-on-surface">{{ slide.title }}</span>
          <template v-if="slide.description">
            {{ ' ' }}
            <span class="text-on-surface-variant">{{ slide.description }}</span>
          </template>
        </p>
        <NuxtLink v-if="slide.action && slide.href" :to="slide.href" :tabindex="i === open ? 0 : -1"
          class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[var(--sq-fill)] px-5 py-2.5 text-sm font-medium text-[var(--sq-on-fill)] transition-opacity hover:opacity-85">
          {{ slide.action }}
          <Icon name="ph:arrow_back" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
