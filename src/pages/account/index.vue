<script setup lang="ts">
definePageMeta({ middleware: ['account'] })

const { data: me, refresh: refreshMe } = await useAsyncData('me', () =>
  $fetch<{ ok: boolean; user: { id: string; phone: string; name: string; role: string } | null }>('/api/auth/me'),
)

if (!me.value?.user) {
  await navigateTo('/login')
}

const { data: bookings, refresh } = await useAsyncData('my-bookings', () =>
  $fetch<{ ok: boolean; data: Array<Record<string, unknown>> }>('/api/account/bookings'),
)

async function cancelBooking(id: string) {
  try {
    await $fetch(`/api/bookings/${id}`, { method: 'PATCH', body: { status: 'cancelled' } })
    await refresh()
  } catch (e: unknown) {
    window.alert((e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'لغو ممکن نیست')
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}

useSeoMeta({ title: 'پنل کاربری | Lumina' })
</script>

<template>
  <div class="mx-auto max-w-3xl px-page py-16">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-hero text-3xl text-primary">نوبت‌های من</h1>
        <p class="text-sm text-on-surface-variant">{{ me?.user?.phone }}</p>
      </div>
      <button type="button" class="text-sm font-bold text-primary" @click="logout">خروج</button>
    </div>

    <div class="mt-8 space-y-3">
      <article
        v-for="b in bookings?.data || []"
        :key="String(b.id)"
        class="rounded-2xl border border-outline-variant/20 bg-white p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="font-bold">{{ b.service_title }}</p>
            <p class="text-sm text-on-surface-variant">{{ b.staff_name }} · {{ b.code }}</p>
            <p class="font-latin text-xs">{{ b.starts_at }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold">{{ b.status }}</span>
            <button
              v-if="b.status === 'confirmed'"
              type="button"
              class="rounded-full border px-3 py-1 text-[12px] font-bold"
              @click="cancelBooking(String(b.id))"
            >
              لغو
            </button>
          </div>
        </div>
      </article>
      <p v-if="!(bookings?.data || []).length" class="text-sm text-on-surface-variant">نوبتی ثبت نشده.</p>
    </div>
  </div>
</template>
