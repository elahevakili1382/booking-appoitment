// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
   future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  srcDir: 'src',
  serverDir: 'server',
  ssr: false, // SPA mode — داشبورد + بدون دردسر localStorage در SSR

  // With srcDir:'src', dir.public is resolved from srcDir → use src/public
  dir: {
    public: 'public',
  },

  css: ['~/assets/css/main.css'],

  modules: ['@vueuse/nuxt', '@nuxt/icon'],
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
    head: {
      title: 'Lumina Clinic | کلینیک لومینا',
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'Lumina Clinic — کلینیک بین‌المللی پوست، مو و زیبایی | International aesthetics & dermatology',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Vazirmatn:wght@300;400;500;600;700;800&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
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
