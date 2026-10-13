<script setup lang="ts">
import DashboardPage from '~/components/DashboardPage.vue'

definePageMeta({
  middleware: ['dashboard'],
})
</script>

<template>
  <DashboardPage />
</template>
