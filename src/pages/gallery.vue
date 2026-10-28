<script setup lang="ts">
import { galleryCases, galleryCategories, type GalleryCase } from '~/data/galleryCases'

useSeoMeta({
  title: 'گالری قبل و بعد',
  description: 'نمونه نتایج درمان‌های زیبایی و پوست در کلینیک لومینا، منتشرشده با رضایت مراجعین.',
  ogTitle: 'گالری قبل و بعد | Lumina Clinic',
  ogDescription: 'نمونه نتایج درمان‌های زیبایی و پوست در کلینیک لومینا.',
})

const active = ref<string>('all')
const selected = ref<GalleryCase | null>(null)

const filtered = computed(() =>
  active.value === 'all' ? galleryCases : galleryCases.filter((c) => c.category === active.value),
)
</script>

<template>
  <div class="mx-auto max-w-5xl px-page pb-16 pt-28 sm:pt-32">
    <header class="text-center">
      <p class="font-latin text-xs font-semibold tracking-[0.4em] text-primary">RESULTS</p>
      <h1 class="section-title mt-3 text-ink">گالری قبل و بعد</h1>
      <p class="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
        نمونه نتایج درمان‌های کلینیک لومینا، با رضایت مراجعین منتشر شده است.
      </p>
    </header>

    <div class="mt-8 flex flex-wrap justify-center gap-2" role="tablist">
      <button v-for="c in galleryCategories" :key="c.key" type="button" role="tab" :aria-selected="active === c.key"
        class="rounded-full border px-4 py-1.5 text-sm transition-colors"
        :class="active === c.key
          ? 'border-primary bg-primary text-white'
          : 'border-outline-variant/40 text-ink hover:bg-surface-container-low'" @click="active = c.key">
        {{ c.label }}
      </button>
    </div>

    <div v-if="filtered.length" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <button v-for="c in filtered" :key="c.id" type="button"
        class="group overflow-hidden rounded-2xl border border-outline-variant/20 text-start transition-shadow hover:shadow-md"
        @click="selected = c">
        <div class="relative aspect-[4/3] overflow-hidden">
          <img :src="c.img" :alt="`قبل و بعد ${c.treatment}`" width="800" height="600" loading="lazy"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span class="absolute bottom-2 start-2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white">
            قبل و بعد
          </span>
        </div>
        <div class="p-4">
          <p class="text-[11px] font-semibold text-primary">{{ c.treatment }} — {{ c.sessions }}</p>
          <h2 class="mt-1 text-[15px] font-bold leading-7 text-ink">{{ c.title }}</h2>
          <p class="mt-1 text-[13px] leading-7 text-muted">{{ c.description }}</p>
        </div>
      </button>
    </div>
    <p v-else class="mt-10 text-center text-sm text-muted">نمونه‌ای در این دسته ثبت نشده است.</p>

    <div class="mt-12 text-center">
      <NuxtLink to="/book"
        class="inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
        رزرو نوبت مشاوره
      </NuxtLink>
    </div>

    <p class="mt-8 text-center text-[11px] leading-6 text-muted/70">
      تصاویر این بخش جنبه‌ی نمایشی دارند؛ نتایج واقعی باید با رضایت بیمار تأمین شود.
    </p>

    <GalleryLightbox :item="selected" @close="selected = null" />
  </div>
</template>
