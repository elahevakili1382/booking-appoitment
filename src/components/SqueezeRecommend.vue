<script setup lang="ts">
import { computed } from 'vue'
import CarouselSqueeze, { type SqueezeSlide } from './ui/CarouselSqueeze.vue'
import { assets } from '../data/assets'
import { homeEn, homeFa } from '../data/homeContent'
import { useLanguage } from '../i18n/useLanguage'

const { t, locale } = useLanguage()
const h = computed(() => (locale.value === 'fa' ? homeFa : homeEn))

/** Reliable Unsplash + local clinic assets for squeeze panels */
const images = [
  'https://images.unsplash.com/photo-1570172613284-da78bd5aff29?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1400&q=80',
  assets.services[0],
  assets.services[1],
  assets.gallery[1].after,
  assets.doctors[0],
]

const slides = computed<SqueezeSlide[]>(() => {
  const rec = h.value.recommend.items
  const services = t.value.services
  const base = [
    ...rec.map((item, i) => ({
      id: item.n,
      title: item.title,
      description: item.desc,
      overlay: item.n,
      action: item.detail,
      href: '/services',
      image: images[i],
      imageAlt: item.title,
    })),
    ...services.slice(0, 4).map((s, i) => ({
      id: `svc-${i}`,
      title: s.title,
      description: s.desc,
      overlay: s.tag,
      action: t.value.heroCtaPrimary,
      href: '/book',
      image: images[i + 3] ?? images[0],
      imageAlt: s.title,
    })),
  ]
  return base
})
</script>

<template>
  <section class="w-full bg-white py-14 sm:py-20">
    <div class="mx-auto max-w-[1400px] px-page">
      <div v-fade-up class="mb-8 max-w-2xl">
        <p class="font-latin text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          {{ h.recommend.eyebrow }}
        </p>
        <h2 class="mt-3 font-hero text-[clamp(1.6rem,3.5vw,2.4rem)] text-on-surface">
          {{ h.recommend.title }}
        </h2>
        <p class="mt-3 text-[15px] leading-7 text-on-surface-variant">{{ h.recommend.lead }}</p>
      </div>

      <CarouselSqueeze
        :slides="slides"
        :height="300"
        :gap="14"
        :radius="12"
        :duration="900"
        :hover-grow="true"
        :controls="true"
        :label="h.recommend.eyebrow"
        accent="var(--color-primary)"
        accent-foreground="#ffffff"
      />
    </div>
  </section>
</template>
