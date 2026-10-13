<script setup lang="ts">
const { data } = await useAsyncData('doctors-page', () =>
  $fetch<{ ok: boolean; data: Array<Record<string, unknown>> }>('/api/doctors'),
)
useSeoMeta({ title: 'پزشکان | Lumina Clinic' })
</script>

<template>
  <div class="mx-auto max-w-5xl px-page py-16">
    <h1 class="font-hero text-3xl text-primary">پزشکان و پرسنل</h1>
    <div class="mt-10 grid gap-4 sm:grid-cols-3">
      <article
        v-for="d in data?.data || []"
        :key="String(d.id)"
        class="rounded-2xl border border-outline-variant/20 bg-white p-5 text-center shadow-sm"
      >
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {{ String(d.nameFa).slice(0, 1) }}
        </div>
        <h2 class="mt-3 font-bold">{{ d.nameFa }}</h2>
        <p class="text-sm text-on-surface-variant">{{ d.roleFa }}</p>
        <NuxtLink :to="`/book?doctor=${d.id}`" class="mt-4 inline-block text-sm font-bold text-primary">مشاهده تقویم</NuxtLink>
      </article>
    </div>
  </div>
</template>
