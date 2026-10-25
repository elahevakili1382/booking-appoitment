export function getBookingLabels(isFa: boolean) {
  const text = (fa: string, en: string) => isFa ? fa : en

  return {
    steps: isFa
      ? [
          'خدمت و پزشک',
          'اطلاعات شما',
          'محل مراجعه',
          'زمان نوبت',
          'هزینه',
          'بررسی نهایی',
        ]
      : [
          'Service and doctor',
          'Your details',
          'Location',
          'Appointment',
          'Cost',
          'Review',
        ],

    step: text('مرحله', 'Step'),
    of: text('از', 'of'),
    loading: text('در حال دریافت اطلاعات…', 'Loading information…'),
    loadError: text('دریافت اطلاعات انجام نشد.', 'Unable to load information.'),
    retry: text('تلاش دوباره', 'Try again'),

    noServices: text('خدمتی برای نمایش وجود ندارد.', 'No services are available.'),
    doctor: text('انتخاب پزشک', 'Choose a doctor'),
    noDoctor: text(
      'پزشک قابل انتخابی برای این خدمت یافت نشد.',
      'No selectable doctor was found.',
    ),

    name: text('نام و نام خانوادگی', 'Full name'),
    phone: text('شماره موبایل ایران', 'Iranian mobile number'),
    phoneHelp: text(
      'شماره را با ۰۹ یا +98 وارد کنید.',
      'Enter a number starting with 09 or +98.',
    ),
    invalidPhone: text(
      'شماره موبایل معتبر نیست.',
      'Enter a valid mobile number.',
    ),

    notes: text('توضیح اختیاری', 'Optional note'),
    notesHelp: text(
      'اطلاعات حساس پزشکی را فقط از مسیر مورد تأیید کلینیک ارائه کنید.',
      'Share sensitive medical information through a clinic-approved channel.',
    ),

    visitType: text('نوع مراجعه', 'Visit type'),
    clinic: text('حضوری', 'In clinic'),
    online: text('مشاوره آنلاین', 'Online consultation'),
    branch: text('شعبه', 'Branch'),
    locationHelp: text(
      'مجازبودن نوع مراجعه و شعبه برای خدمت انتخابی باید توسط سرور بررسی شود.',
      'Visit type and branch eligibility must be checked by the server.',
    ),

    previousWeek: text('هفته قبل', 'Previous week'),
    nextWeek: text('هفته بعد', 'Next week'),
    previousMonth: text('ماه قبل', 'Previous month'),
    nextMonth: text('ماه بعد', 'Next month'),
    closeCalendar: text('بستن تقویم', 'Close calendar'),

    noSlots: text(
      'زمان آزادی پیدا نشد؛ تاریخ یا پزشک دیگری انتخاب کنید.',
      'No times are available. Choose another date or doctor.',
    ),
    more: text('نمایش همه ساعت‌ها', 'Show all times'),
    less: text('نمایش کمتر', 'Show less'),
    duration: text('مدت تقریبی جلسه', 'Estimated duration'),
    minutes: text('دقیقه', 'min'),

    total: text('هزینه کل خدمت', 'Service total'),
    deposit: text('بیعانه', 'Deposit'),
    remaining: text(
      'مانده پس از پرداخت بیعانه',
      'Balance after deposit',
    ),
    consultationPrice: text('پس از مشاوره', 'After consultation'),
    currency: text('تومان', 'toman'),
    priceHelp: text(
      'بیعانه بخشی از هزینه کل است. مبلغ نهایی و قابل پرداخت باید توسط سرور تأیید شود.',
      'The deposit is part of the total. The server must confirm the final payable amount.',
    ),

    service: text('خدمت', 'Service'),
    selectedDoctor: text('پزشک انتخاب‌شده', 'Selected doctor'),
    appointment: text('تاریخ و ساعت', 'Appointment'),
    invalidTime: text(
      'زمان انتخاب‌شده معتبر نیست؛ دوباره زمان را انتخاب کنید.',
      'Select an available appointment time again.',
    ),

    back: text('قبلی', 'Back'),
    continue: text('ادامه', 'Continue'),
    submit: text('ثبت نوبت', 'Create booking'),
    submitting: text('در حال ثبت…', 'Submitting…'),
    home: text('بازگشت به خانه', 'Back home'),

    success: text('نوبت شما ثبت شد', 'Your booking was created'),
    successHelp: text(
      'ثبت نوبت به معنی پرداخت موفق نیست. وضعیت نهایی را از بخش پیگیری بررسی کنید.',
      'Booking creation does not confirm payment. Check the dashboard for the latest status.',
    ),

    tracking: text('پیگیری نوبت', 'Booking dashboard'),
    pay: text('پرداخت بیعانه', 'Pay deposit'),
    paying: text('در حال اتصال…', 'Connecting…'),

    slotConflict: text(
      'این زمان دیگر آزاد نیست. زمان دیگری انتخاب کنید.',
      'This time is no longer available. Choose another time.',
    ),
    bookingFailed: text(
      'ثبت نوبت تأیید نشد. پیش از ارسال دوباره، وضعیت نوبت را بررسی کنید.',
      'Booking could not be confirmed. Check its status before retrying.',
    ),
    paymentFailed: text(
      'دریافت لینک پرداخت انجام نشد. نوبت را دوباره ثبت نکنید؛ از بخش پیگیری اقدام کنید.',
      'Unable to start payment. Use the dashboard instead of creating another booking.',
    ),
  }
}

export type BookingLabels = ReturnType<typeof getBookingLabels>