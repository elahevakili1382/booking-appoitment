<script setup lang="ts">
const route = useRoute()
const isDashboard = computed(() => route.path.startsWith('/dashboard'))
const isBook = computed(() => route.path.startsWith('/book'))
const isHome = computed(() => route.path === '/')
const showFooter = computed(() => !isBook.value && !isDashboard.value)
const showHeader = computed(() => !isDashboard.value && !isBook.value)
</script>

<template>
  <div
    id="top"
    class="w-full max-w-[100vw] overflow-x-clip bg-surface text-on-surface antialiased"
    :class="isDashboard || isBook ? 'min-h-dvh' : 'h-dvh-screen'"
  >
    <AppHeader v-if="showHeader" />
    <PegasusRail v-if="isHome" />
    <main
      class="w-full min-w-0 overflow-x-clip"
      :class="isDashboard ? 'bg-[#f6f3f3]' : isBook ? 'bg-transparent' : 'bg-surface'"
    >
      <NuxtPage />
    </main>
    <AppFooter v-if="showFooter" />
  </div>
</template>
