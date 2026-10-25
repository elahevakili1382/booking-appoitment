export interface BookingService {
  id: string
  titleFa: string
    category?: string
  titleEn?: string
  duration: number
  price: number
  deposit?: number
  
}

export interface BookingDoctor {
  id: string
  nameFa: string
  nameEn?: string
  serviceIds?: string[]
}

export interface BookingSlot {
  time: string
  taken: boolean
  startsAt?: string
  staffId?: string
}

export interface CalendarDay {
  iso: string
  label: string
  disabled: boolean
  inMonth: boolean
}

export interface BookingWeekDay {
  iso: string
  name: string
  number: string
}