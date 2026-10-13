/**
 * لایه سازگاری — APIهای قدیمی هنوز از این توابع استفاده می‌کردند.
 * منبع حقیقت: SQLite (server/db)
 */
export type { TimeRange, DaySchedule } from './compatTypes'
export {
  readStore,
  writeStore,
  updateStore,
  buildSlotsForDate,
  newBookingCode,
  tehranToday,
  getCalendarForDate,
  liveSlotStatus,
  ensureCalendarDates,
  doctorToStaffId,
} from './compatStore'

export type {
  StoreData,
  BookingRecord,
  ServiceRecord,
  DoctorRecord,
  CustomerRecord,
  CalendarSlotRecord,
} from './compatTypes'
