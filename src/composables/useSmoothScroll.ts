import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useSmoothScroll() {
  let lenis: Lenis | null = null
  let tick: ((time: number) => void) | null = null

  onMounted(() => {
    gsap.registerPlugin(ScrollTrigger)

    // کاربری که «کاهش حرکت» رو روشن کرده، اسکرول عادی می‌بینه
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)

    tick = (time) => lenis?.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  })

  onBeforeUnmount(() => {
    if (tick) gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  })
}