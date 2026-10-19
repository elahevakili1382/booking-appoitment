import VCalender from 'v-calendar'

export default defineNuxtPlugin((nuxtApp) =>{
    nuxtApp.vueApp.use(VCalender, {})
})