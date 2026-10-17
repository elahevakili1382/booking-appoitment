// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  srcDir: 'src',
  serverDir: 'server',
  ssr: false, // SPA mode — داشبورد + بدون دردسر localStorage در SSR

  // With srcDir:'src', dir.public is resolved from srcDir → use src/public
  dir: {
    public: 'public',
  },

  css: ['~/assets/css/main.css'],

  modules: ['@vueuse/nuxt', '@nuxt/icon',  '@nuxt/image'],
   icon: {
    customCollections: [
      {
        prefix: 'my-icons',
        dir: './src/assets/icons'
      }
    ]
  },

  vite: {
    plugins: [tailwindcss()],
  },
app: {
   pageTransition: { name: 'page', mode: 'out-in' },
  layoutTransition: { name: 'layout', mode: 'out-in' },
  head: {
    title: 'کلینیک لومینا | Lumina Clinic',
    titleTemplate: '%s | کلینیک لومینا',  // ← فقط رشته ساده
    
    htmlAttrs: {
      lang: 'fa',
      dir: 'rtl',
    },
    
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#8a4853' },
      {
        name: 'description',
        content:
          'کلینیک بین‌المللی پوست، مو و زیبایی لومینا | خدمات تخصصی، تیمی باتجربه، تجهیزات نسل جدید',
      },
      {
        name: 'keywords',
        content:
          'کلینیک زیبایی, پوست و مو, لیزر موهای زائد, بوتاکس, فیلر, هایفوتراپی, جوانسازی پوست, کلینیک لومینا',
      },
      { name: 'author', content: 'Lumina Clinic' },
      { name: 'robots', content: 'index, follow' },

      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Lumina Clinic' },
      { property: 'og:title', content: 'کلینیک زیبایی لومینا' },
      { property: 'og:description', content: 'کلینیک بین‌المللی پوست، مو و زیبایی لومینا' },
      { property: 'og:image', content: 'https://lumina.clinic/og-image.jpg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:url', content: 'https://lumina.clinic' },
      { property: 'og:locale', content: 'fa_IR' },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'کلینیک زیبایی لومینا' },
      { name: 'twitter:description', content: 'کلینیک بین‌المللی پوست، مو و زیبایی' },
      { name: 'twitter:image', content: 'https://lumina.clinic/og-image.jpg' },
    ],

    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'canonical', href: 'https://lumina.clinic' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Vazirmatn:wght@300;400;500;600;700;800&display=swap',
      },
    ],
  },
},

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    dataPath: '',
    dbPath: '',
    sessionSecret: 'lumina-dev-secret-change-me',
    zarinpalMerchantId: 'test',
    public: {
      appName: 'Lumina Clinic',
      otpMock: true,
    },
  },

  nitro: {
    externals: {
      inline: [],
    },
    moduleSideEffects: ['better-sqlite3'],
    rollupConfig: {
      external: ['better-sqlite3'],
    },
  },
})
