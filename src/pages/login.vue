<script setup lang="ts">
import clinic01 from '~/assets/hero/clinic-01.webp'
import clinic02 from '~/assets/hero/clinic-02.webp'
import clinic03 from '~/assets/hero/clinic-03.webp'
import clinic04 from '~/assets/hero/clinic-04.webp'
import { assets } from '~/data/assets'
import { useLanguage } from '~/i18n/useLanguage'

const { locale } = useLanguage()
const isFa = computed(() => locale.value === 'fa')

const phone = ref('')
const code = ref('')
const step = ref<'phone' | 'code'>('phone')
const mockCode = ref('')
const error = ref('')
const busy = ref(false)

const images = [clinic01, clinic02, clinic03, clinic04]

// متن‌های صفحه (فارسی/انگلیسی)
const tx = computed(() =>
  isFa.value
    ? {
        brand: 'کلینیک زیبایی لومینا',
        title: 'خوش آمدید',
        subPhone: 'برای دیدن نوبت‌ها و پروندهٔ خود، شمارهٔ موبایلتان را وارد کنید.',
        subCode: 'کد ارسال‌شده را وارد کنید.',
        phoneLabel: 'شمارهٔ موبایل',
        getCode: 'دریافت کد',
        codeLabel: 'کد تأیید ۶ رقمی',
        testCode: 'کد تست',
        signIn: 'ورود',
        editPhone: 'ویرایش شماره',
        demoTitle: 'فقط می‌خواهید داشبورد را ببینید؟',
        demoText: 'بدون شماره و کد وارد شوید. نسخهٔ نمایشی است، با دادهٔ ساختگی و فقط برای مشاهده (چیزی را نمی‌توانید تغییر دهید).',
        demoBtn: 'مشاهدهٔ نمایشی داشبورد',
        back: 'بازگشت به سایت',
        sliderTitle: 'زیبایی، با دقت و اطمینان',
        sliderText: 'نوبت‌هایتان را ببینید، پرونده‌تان را مدیریت کنید و برای درمان بعدی رزرو کنید.',
        generic: 'خطا',
        invalid: 'کد نامعتبر',
        wait: 'لطفاً صبر کنید…',
      }
    : {
        brand: 'Lumina Beauty Clinic',
        title: 'Welcome back',
        subPhone: 'Enter your mobile number to see your appointments and records.',
        subCode: 'Enter the code we sent you.',
        phoneLabel: 'Mobile number',
        getCode: 'Get code',
        codeLabel: '6-digit code',
        testCode: 'Test code',
        signIn: 'Sign in',
        editPhone: 'Change number',
        demoTitle: 'Just want to look at the dashboard?',
        demoText: 'Sign in without a number or code. This is a demo with fake data and view-only access (you cannot change anything).',
        demoBtn: 'View the dashboard (demo)',
        back: 'Back to the site',
        sliderTitle: 'Beauty, with care and confidence',
        sliderText: 'See your appointments, manage your records and book your next treatment.',
        generic: 'Error',
        invalid: 'Invalid code',
        wait: 'Please wait…',
      },
)

const errMsg = (e: unknown, fallback: string) =>
  (e as { data?: { statusMessage?: string } })?.data?.statusMessage || fallback

async function requestOtp() {
  error.value = ''
  busy.value = true
  try {
    const res = await $fetch<{ ok: boolean; mockCode?: string }>('/api/auth/otp/request', {
      method: 'POST',
      body: { phone: phone.value },
    })
    mockCode.value = res.mockCode || ''
    step.value = 'code'
  } catch (e: unknown) {
    error.value = errMsg(e, tx.value.generic)
  } finally {
    busy.value = false
  }
}

async function verify() {
  error.value = ''
  busy.value = true
  try {
    const res = await $fetch<{ user?: { role?: string } }>('/api/auth/otp/verify', {
      method: 'POST',
      body: { phone: phone.value, code: code.value },
    })
    const isStaff = ['admin', 'receptionist', 'staff'].includes(String(res.user?.role))
    await navigateTo(isStaff ? '/dashboard' : '/account')
  } catch (e: unknown) {
    error.value = errMsg(e, tx.value.invalid)
  } finally {
    busy.value = false
  }
}

// ورود نمایشی فقط‌خواندنی؛ فقط وقتی NUXT_PUBLIC_DEMO=true باشد دکمه‌اش دیده می‌شود
const demoEnabled = useRuntimeConfig().public.demo === true

async function demoLogin() {
  error.value = ''
  busy.value = true
  try {
    await $fetch('/api/auth/demo', { method: 'POST' })
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    error.value = errMsg(e, tx.value.generic)
  } finally {
    busy.value = false
  }
}

function editPhone() {
  step.value = 'phone'
  code.value = ''
  mockCode.value = ''
  error.value = ''
}

useSeoMeta({ title: 'ورود | Lumina Clinic' })
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center px-4 pb-16 pt-28 sm:pt-32">
    <div
      class="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_80px_-30px_rgba(61,52,38,0.35)] backdrop-blur lg:min-h-[640px] lg:grid-cols-2">
      <!-- فرم (در فارسی سمت راست) -->
      <div class="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
        <div class="mx-auto w-full max-w-sm">
          <div class="flex items-center gap-3">
            <span class="grid h-12 w-12 place-items-center rounded-2xl bg-sage/50">
              <img :src="assets.logo" alt="" class="h-7 w-auto object-contain" />
            </span>
            <span class="text-[15px] font-extrabold text-on-surface">{{ tx.brand }}</span>
          </div>

          <h1 class="mt-8 text-[28px] font-extrabold leading-tight text-on-surface sm:text-[32px]">{{ tx.title }}</h1>
          <p class="mt-2 text-[14px] leading-6 text-on-surface-variant">
            {{ step === 'phone' ? tx.subPhone : tx.subCode }}
          </p>

          <!-- مرحلهٔ ۱: شماره -->
          <form v-if="step === 'phone'" class="mt-7 space-y-4" @submit.prevent="requestOtp">
            <div>
              <label for="login-phone" class="mb-1.5 block text-[13px] font-bold text-on-surface">{{ tx.phoneLabel }}</label>
              <input id="login-phone" v-model="phone" required type="tel" inputmode="tel" autocomplete="tel" dir="ltr"
                pattern="09[0-9]{9}" placeholder="09xxxxxxxxx"
                class="h-12 w-full rounded-xl border border-outline-variant/60 bg-white px-4 text-start text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
            </div>
            <button type="submit" :disabled="busy"
              class="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-primary text-[15px] font-bold text-on-primary shadow-[0_12px_26px_-14px_rgba(176,122,69,0.9)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70">
              {{ busy ? tx.wait : tx.getCode }}
            </button>
          </form>

          <!-- مرحلهٔ ۲: کد -->
          <form v-else class="mt-7 space-y-4" @submit.prevent="verify">
            <p v-if="mockCode" class="rounded-xl bg-primary/10 px-3 py-2 text-[13px] text-on-surface">
              {{ tx.testCode }}: <strong class="font-latin tracking-widest">{{ mockCode }}</strong>
            </p>
            <div>
              <label for="login-code" class="mb-1.5 block text-[13px] font-bold text-on-surface">{{ tx.codeLabel }}</label>
              <input id="login-code" v-model="code" required inputmode="numeric" autocomplete="one-time-code" dir="ltr"
                maxlength="6" placeholder="••••••"
                class="h-12 w-full rounded-xl border border-outline-variant/60 bg-white px-4 text-center font-latin text-[20px] tracking-[0.5em] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" />
            </div>
            <button type="submit" :disabled="busy"
              class="flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-primary text-[15px] font-bold text-on-primary shadow-[0_12px_26px_-14px_rgba(176,122,69,0.9)] transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70">
              {{ busy ? tx.wait : tx.signIn }}
            </button>
            <button type="button"
              class="w-full cursor-pointer text-center text-[13px] font-semibold text-on-surface-variant transition hover:text-primary"
              @click="editPhone">
              {{ tx.editPhone }}
            </button>
          </form>

          <p v-if="error" role="alert" class="mt-4 rounded-xl bg-error/10 px-3 py-2 text-[13px] font-semibold text-error">
            {{ error }}
          </p>

          <!-- ورود نمایشی (فقط وقتی فعال است) -->
          <div v-if="demoEnabled" class="mt-8 rounded-2xl border border-outline-variant/40 bg-sage/25 p-4">
            <p class="text-[14px] font-bold text-on-surface">{{ tx.demoTitle }}</p>
            <p class="mt-1 text-[12.5px] leading-6 text-on-surface-variant">{{ tx.demoText }}</p>
            <button type="button" :disabled="busy"
              class="mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-primary bg-white font-bold text-primary transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
              @click="demoLogin">
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">visibility</span>
              {{ tx.demoBtn }}
            </button>
          </div>

          <NuxtLink to="/"
            class="mt-8 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-on-surface-variant transition hover:text-primary">
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{ isFa ? 'arrow_forward' : 'arrow_back' }}</span>
            {{ tx.back }}
          </NuxtLink>
        </div>
      </div>

      <!-- اسلایدر (فقط دسکتاپ) -->
      <div class="relative hidden lg:block">
        <AuthImageSlider :images="images" :interval="4500">
          <h2 class="text-[26px] font-extrabold leading-tight">{{ tx.sliderTitle }}</h2>
          <p class="mt-2 max-w-sm text-[14px] leading-6 text-white/85">{{ tx.sliderText }}</p>
        </AuthImageSlider>
      </div>
    </div>
  </div>
</template>
