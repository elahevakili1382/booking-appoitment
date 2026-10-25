<script setup lang="ts">
defineProps<{
  hasPrice: boolean
  costLabel: string
  depositLabel: string
  balanceLabel: string
  labels: {
    total: string
    deposit: string
    remaining: string
    priceHelp: string
  }
}>()
</script>

<template>
  <div>
    <div
      class="space-y-4 rounded-2xl bg-primary/5 p-4 text-sm leading-7"
    >
      <div class="flex flex-wrap justify-between gap-2">
        <span>{{ labels.total }}</span>
        <span class="font-bold">{{ costLabel }}</span>
      </div>

      <template v-if="hasPrice">
        <div class="flex flex-wrap justify-between gap-2">
          <span>{{ labels.deposit }}</span>
          <span>{{ depositLabel }}</span>
        </div>

        <div
          class="flex flex-wrap justify-between gap-2 border-t border-primary/15 pt-4"
        >
          <span>{{ labels.remaining }}</span>
          <span>{{ balanceLabel }}</span>
        </div>
      </template>
    </div>

    <p class="mt-4 text-xs leading-7 text-on-surface-variant">
      {{ labels.priceHelp }}
    </p>
  </div>
</template>