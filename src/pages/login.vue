<script setup lang="ts">
const phone = ref('')
const code = ref('')
const step = ref<'phone' | 'code'>('phone')
const mockCode = ref('')
const error = ref('')

async function requestOtp() {
  error.value = ''
  try {
    const res = await $fetch<{ ok: boolean; mockCode?: string }>('/api/auth/otp/request', {
      method: 'POST',
      body: { phone: phone.value },
    })
    mockCode.value = res.mockCode || ''
    step.value = 'code'
  } catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'خطا'
  }
}

async function verify() {
  error.value = ''
  try {
    const res = await $fetch<{ user?: { role?: string } }>('/api/auth/otp/verify', {
      method: 'POST',
      body: { phone: phone.value, code: code.value },
    })
    const isStaff = ['admin', 'receptionist', 'staff'].includes(String(res.user?.role))
    await navigateTo(isStaff ? '/dashboard' : '/account')
  } catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'کد نامعتبر'
  }
}

// ورود نمایشی فقط‌خواندنی؛ فقط وقتی NUXT_PUBLIC_DEMO=true باشد دکمه‌اش دیده می‌شود
const demoEnabled = useRuntimeConfig().public.demo === true

async function demoLogin() {
  error.value = ''
  try {
    await $fetch('/api/auth/demo', { method: 'POST' })
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'خطا'
  }
}

useSeoMeta({ title: 'ورود | Lumina Clinic' })
</script>

<template>
  <div class="mx-auto max-w-md px-page py-20">
    <h1 class="font-hero text-3xl text-primary">ورود با موبایل</h1>
    <p class="mt-2 text-sm text-on-surface-variant">کد تأیید پیامک می‌شود (در حالت توسعه در صفحه نمایش داده می‌شود).</p>

    <form v-if="step === 'phone'" class="mt-8 space-y-3" @submit.prevent="requestOtp">
      <input v-model="phone" required pattern="09[0-9]{9}" class="h-12 w-full rounded-xl border px-3" placeholder="09xxxxxxxxx" />
      <button type="submit" class="h-12 w-full rounded-full bg-primary font-bold text-on-primary">دریافت کد</button>
    </form>

    <form v-else class="mt-8 space-y-3" @submit.prevent="verify">
      <p v-if="mockCode" class="rounded-xl bg-primary/10 px-3 py-2 text-sm">کد تست: <strong>{{ mockCode }}</strong></p>
      <input v-model="code" required class="h-12 w-full rounded-xl border px-3" placeholder="کد ۶ رقمی" />
      <button type="submit" class="h-12 w-full rounded-full bg-primary font-bold text-on-primary">ورود</button>
    </form>
    <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>

    <div v-if="demoEnabled" class="mt-8 rounded-2xl border border-outline-variant/40 bg-white p-4">
      <p class="text-sm font-bold text-on-surface">فقط می‌خواهید داشبورد را ببینید؟</p>
      <p class="mt-1 text-[13px] text-on-surface-variant">
        بدون شماره و کد وارد شوید. نسخهٔ نمایشی است، با دادهٔ ساختگی و فقط برای مشاهده (چیزی را نمی‌توانید تغییر دهید).
      </p>
      <button type="button" class="mt-3 h-12 w-full cursor-pointer rounded-full border border-primary font-bold text-primary hover:bg-primary/10"
        @click="demoLogin">
        مشاهدهٔ نمایشی داشبورد
      </button>
    </div>
  </div>
</template>
