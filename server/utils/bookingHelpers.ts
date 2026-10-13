export function doctorToStaffId(doctor: string) {
  const d = doctor.toLowerCase()
  if (d.includes('rostami') || d.includes('رستمی')) return 'rostami'
  if (d.includes('bahrami') || d.includes('بهرامی')) return 'bahrami'
  if (d.includes('kaviani') || d.includes('کاویانی')) return 'kaviani'
  return 'rostami'
}
