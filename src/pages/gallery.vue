<script setup lang="ts">
import { assets } from '~/data/assets'
useSeoMeta({ title: 'گالری قبل و بعد | Lumina Clinic' })
</script>

<template>
  <div class="mx-auto max-w-5xl px-page py-16">
    <h1 class="font-hero text-3xl text-primary">گالری قبل و بعد</h1>
    <p class="mt-2 text-sm text-on-surface-variant">با رضایت مراجعین منتشر شده است.</p>
    <div class="mt-10 grid gap-6 sm:grid-cols-3">
      <div v-for="(g, i) in assets.gallery" :key="i" class="overflow-hidden rounded-2xl border border-outline-variant/20">
        <img :src="g.before" alt="قبل" class="h-40 w-full object-cover" />
        <img :src="g.after" alt="بعد" class="h-40 w-full object-cover" />
      </div>
    </div>
  </div>
</template>
