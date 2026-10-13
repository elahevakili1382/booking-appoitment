<script setup lang="ts">
const name = ref('')
const phone = ref('')
const message = ref('')
const ok = ref(false)

async function submit() {
  await $fetch('/api/contact', { method: 'POST', body: { name: name.value, phone: phone.value, message: message.value } })
  ok.value = true
  name.value = ''
  phone.value = ''
  message.value = ''
}

useSeoMeta({ title: 'تماس | Lumina Clinic' })
</script>

<template>
  <div class="mx-auto grid max-w-5xl gap-10 px-page py-16 lg:grid-cols-2">
    <div>
      <h1 class="font-hero text-3xl text-primary">تماس و آدرس</h1>
      <p class="mt-3 text-on-surface-variant">زعفرانیه، تهران · ۰۲۱-۹۱۰۰۰۰۰۰</p>
      <div class="mt-6 overflow-hidden rounded-2xl border border-outline-variant/20">
        <iframe
          title="map"
          class="h-64 w-full"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.openstreetmap.org/export/embed.html?bbox=51.40%2C35.79%2C51.43%2C35.81&layer=mapnik"
        />
      </div>
    </div>
    <form class="space-y-3 rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-sm" @submit.prevent="submit">
      <h2 class="font-bold">پیام به کلینیک</h2>
      <input v-model="name" required class="h-11 w-full rounded-xl border px-3" placeholder="نام" />
      <input v-model="phone" required class="h-11 w-full rounded-xl border px-3" placeholder="موبایل ۰۹..." pattern="09[0-9]{9}" />
      <textarea v-model="message" required rows="4" class="w-full rounded-xl border px-3 py-2" placeholder="پیام" />
      <button type="submit" class="h-11 w-full rounded-full bg-primary font-bold text-on-primary">ارسال</button>
      <p v-if="ok" class="text-sm text-primary">پیام ثبت شد.</p>
    </form>
  </div>
</template>
