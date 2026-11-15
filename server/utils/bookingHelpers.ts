/** نگاشت نام پزشک به شناسه‌ی پرسنل. نام ناشناس => null (هرگز به پزشک دیگری نسبت داده نمی‌شود). */
export function doctorToStaffId(doctor: string): string | null {
  const d = String(doctor || '').toLowerCase()
  if (d.includes('rostami') || d.includes('رستمی')) return 'rostami'
  if (d.includes('bahrami') || d.includes('بهرامی')) return 'bahrami'
  if (d.includes('kaviani') || d.includes('کاویانی')) return 'kaviani'
  return null
}
