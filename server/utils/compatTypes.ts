export interface TimeRange {
  start: string
  end: string
}

export interface DaySchedule {
  ranges: TimeRange[]
}

export interface CalendarSlotRecord {
  id: string
  date: string
  staffId: string
  startHour: number
  startMin: number
  durationMin: number
  patientFa: string
  patientEn: string
  serviceFa: string
  serviceEn: string
  status: 'completed' | 'paid' | 'progress' | 'confirmed' | 'next' | 'buffer'
  price?: number
  unitFa?: string
  unitEn?: string
  meet?: boolean
  vip?: boolean
  fileNo?: string
  balance?: number
  allergyFa?: string
  allergyEn?: string
}

export interface BookingRecord {
  id: string
  code: string
  branch: string
  service: string
  doctor: string
  visitType: string
  when: string
  date?: string
  time?: string
  name: string
  phone: string
  notes?: string
  total: number
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show'
  createdAt: string
}

export interface ServiceRecord {
  id: string
  titleFa: string
  titleEn: string
  duration: number
  price: number
  location: 'clinic' | 'online'
  color: string
  active: boolean
  category?: string
}

export interface DoctorRecord {
  id: string
  nameFa: string
  nameEn: string
  roleFa: string
  roleEn: string
  active: boolean
}

export interface CustomerRecord {
  id: string
  name: string
  phone: string
  fileNo: string
  lastVisit: string
  tag?: string
  notes?: string
  allergy?: string
}

export interface StoreData {
  bookings: BookingRecord[]
  services: ServiceRecord[]
  doctors: DoctorRecord[]
  customers: CustomerRecord[]
  calendarSlots: CalendarSlotRecord[]
  availability: {
    timezone: string
    name: string
    nameFa: string
    days: DaySchedule[]
    overrides: { date: string; ranges: TimeRange[] }[]
  }
  stats: {
    revenueToday: number
    appointmentsToday: number
    activeRooms: number
    weekAppointments: number
  }
}
