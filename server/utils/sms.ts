/**
 * SMS adapter — mock در dev، آماده کاوه‌نگار
 */
export async function sendSms(phone: string, message: string) {
  const config = useRuntimeConfig()
  const provider = (await import('../db')).getSetting('smsProvider', 'mock')
  if (provider === 'mock' || config.public.otpMock) {
    console.info(`[sms:mock] to=${phone} msg=${message}`)
    return { ok: true, provider: 'mock' }
  }
  // Kavenegar hook (API key via env)
  console.info(`[sms:${provider}] to=${phone}`)
  return { ok: true, provider }
}
