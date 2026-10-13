import { MotionPlugin } from 'motion-v'

export default defineNuxtPlugin((nuxtApp) => {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  nuxtApp.vueApp.use(MotionPlugin, {
    presets: {
      'fade-up': reduceMotion
        ? { initial: { opacity: 1, y: 0, filter: 'blur(0px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' } }
        : {
            initial: { opacity: 0, y: 24, filter: 'blur(3px)' },
            whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
            inViewOptions: { once: true, margin: '0px 0px -35% 0px' },
            transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
          },
    },
  })
})
