import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import jalaliday from 'jalaliday'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(jalaliday)

const TZ = 'Asia/Tehran'

export function tehranToday() {
  return dayjs().tz(TZ).format('YYYY-MM-DD')
}

export function toJalali(isoOrDate: string, format = 'YYYY/MM/DD') {
  try {
    const d = dayjs(isoOrDate)
    if (format.includes('MMMM') || format === 'monthYear') {
      return new Date(isoOrDate.includes('T') ? isoOrDate : `${isoOrDate}T12:00:00`).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
      })
    }
    const j = (d as dayjs.Dayjs & { calendar: (c: string) => dayjs.Dayjs }).calendar('jalali')
    return j.format(format)
  } catch {
    return new Date(isoOrDate.includes('T') ? isoOrDate : `${isoOrDate}T12:00:00`).toLocaleDateString('fa-IR')
  }
}

/** برچسب ماه/سال برای نوار انتخاب تاریخ — همیشه از تاریخ واقعی */
export function monthYearLabel(isoDate: string, locale: 'fa' | 'en') {
  const d = new Date(`${isoDate}T12:00:00`)
  return d.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
  })
}

export function fromJalali(jalaliDate: string) {
  const normalized = jalaliDate.replace(/-/g, '/')
  return (dayjs(normalized, { jalali: true } as never) as dayjs.Dayjs).format('YYYY-MM-DD')
}

export function formatMoney(n: number, locale: 'fa' | 'en' = 'fa') {
  if (locale === 'fa') return `${n.toLocaleString('fa-IR')} ت`
  return `${n.toLocaleString('en-US')} T`
}

export { dayjs, TZ }
