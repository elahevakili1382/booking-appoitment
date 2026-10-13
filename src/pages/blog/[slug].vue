<script setup lang="ts">
const route = useRoute()
const { data } = await useAsyncData(() => `blog-${route.params.slug}`, () =>
  $fetch<{ ok: boolean; data: Record<string, unknown> }>(`/api/blog/${route.params.slug}`),
)
useSeoMeta({
  title: () => `${data.value?.data?.title_fa || 'مقاله'} | Lumina`,
  description: () => String(data.value?.data?.excerpt_fa || ''),
})
</script>

<template>
  <article class="mx-auto max-w-3xl px-page py-16">
    <NuxtLink to="/blog" class="text-sm text-primary">← وبلاگ</NuxtLink>
    <h1 class="mt-4 font-hero text-3xl text-primary">{{ data?.data?.title_fa }}</h1>
    <p class="mt-6 leading-8 text-on-surface">{{ data?.data?.body_fa }}</p>
  </article>
</template>
