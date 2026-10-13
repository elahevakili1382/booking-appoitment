import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import jalaliday from 'jalaliday'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(jalaliday)

const TZ = 'Asia/Tehran'

/** امروز تهران به صورت YYYY-MM-DD میلادی */
export function tehranToday() {
  return dayjs().tz(TZ).format('YYYY-MM-DD')
}

export function tehranNow() {
  return dayjs().tz(TZ)
}

/** نمایش شمسی از ISO UTC یا YYYY-MM-DD */
export function toJalali(isoOrDate: string, format = 'YYYY/MM/DD') {
  return (dayjs(isoOrDate) as dayjs.Dayjs & { calendar: (c: string) => dayjs.Dayjs })
    .calendar('jalali')
    .format(format)
}

/** تبدیل تاریخ شمسی YYYY/MM/DD به میلادی YYYY-MM-DD */
export function fromJalali(jalaliDate: string) {
  const normalized = jalaliDate.replace(/-/g, '/')
  return (dayjs(normalized, { jalali: true } as never) as dayjs.Dayjs).format('YYYY-MM-DD')
}

export function formatMoneyFa(n: number) {
  return `${n.toLocaleString('fa-IR')} تومان`
}

export function formatMoneyEn(n: number) {
  return `${n.toLocaleString('en-US')} Toman`
}

export { dayjs, TZ }
