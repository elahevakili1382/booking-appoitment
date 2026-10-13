<script setup lang="ts">
const { data } = await useAsyncData('services-page', () =>
  $fetch<{ ok: boolean; data: Array<Record<string, unknown>> }>('/api/services'),
)
const locale = useCookie('lumina-locale', { default: () => 'fa' })
const cats: Record<string, string> = {
  skin: 'پوست',
  injectables: 'تزریقات',
  packages: 'پکیج',
  hair: 'مو',
  laser: 'لیزر',
}
useSeoMeta({ title: 'خدمات | Lumina Clinic' })
</script>

<template>
  <div class="mx-auto max-w-5xl px-page py-16">
    <h1 class="font-hero text-3xl text-primary">خدمات کلینیک</h1>
    <p class="mt-2 text-on-surface-variant">دسته‌بندی خدمات با قیمت شروع از و مدت زمان</p>
    <div class="mt-10 grid gap-4 sm:grid-cols-2">
      <article
        v-for="s in data?.data || []"
        :key="String(s.id)"
        class="rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-sm"
      >
        <p class="text-[11px] font-bold text-primary">{{ cats[String(s.category)] || s.category }}</p>
        <h2 class="mt-1 text-lg font-bold">{{ locale === 'fa' ? s.titleFa : s.titleEn }}</h2>
        <p class="mt-2 text-sm text-on-surface-variant">{{ s.descriptionFa }}</p>
        <div class="mt-4 flex items-center justify-between text-sm">
          <span>شروع از {{ Number(s.price).toLocaleString('fa-IR') }} ت</span>
          <span>{{ s.duration }} دقیقه</span>
        </div>
        <NuxtLink :to="`/book?service=${s.id}`" class="mt-4 inline-flex text-sm font-bold text-primary">رزرو نوبت →</NuxtLink>
      </article>
    </div>
  </div>
</template>
