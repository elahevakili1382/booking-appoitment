<script setup lang="ts">
const { data } = await useAsyncData('blog', () =>
  $fetch<{ ok: boolean; data: Array<Record<string, unknown>> }>('/api/blog'),
)
useSeoMeta({ title: 'وبلاگ | Lumina Clinic' })
</script>

<template>
  <div class="mx-auto max-w-4xl px-page py-16">
    <h1 class="font-hero text-3xl text-primary">وبلاگ</h1>
    <div class="mt-8 space-y-4">
      <NuxtLink
        v-for="p in data?.data || []"
        :key="String(p.id)"
        :to="`/blog/${p.slug}`"
        class="block rounded-2xl border border-outline-variant/20 bg-white p-5 hover:border-primary/40"
      >
        <h2 class="font-bold">{{ p.title_fa }}</h2>
        <p class="mt-1 text-sm text-on-surface-variant">{{ p.excerpt_fa }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
