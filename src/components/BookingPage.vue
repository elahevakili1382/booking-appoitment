<script setup lang="ts">
import { reactive } from 'vue'
import { motion } from 'motion-v'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useBooking } from '../composables/useBooking'

import BookingStepper from './booking/BookingStepper.vue'
import BookingSuccess from './booking/BookingSuccess.vue'
import BookingNavigation from './booking/BookingNavigation.vue'
import BookingServiceStep from './booking/BookingServiceStep.vue'
import BookingPersonalStep from './booking/BookingPersonalStep.vue'
import BookingLocationStep from './booking/BookingLocationStep.vue'
import BookingAppointmentStep from './booking/BookingAppointmentStep.vue'
import BookingCostStep from './booking/BookingCostStep.vue'
import BookingReviewStep from './booking/BookingReviewStep.vue'

const b = reactive(useBooking())
const reducedMotion = usePreferredReducedMotion()
</script>

<template>
  <section :dir="b.isFa ? 'rtl' : 'ltr'"
    class="min-h-dvh bg-[linear-gradient(160deg,#fefae0_0%,#e9edc9_45%,#faedcd_100%)] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
    <motion.div :initial="reducedMotion === 'reduce' ? false : { opacity: 0, y: 12 }" :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.35 }"
      class="mx-auto flex w-full max-w-5xl flex-col rounded-3xl border border-white/70 bg-white shadow-xl lg:flex-row">
      <BookingStepper :steps="b.labels.steps" :step="b.step" :completed="!!b.booking" :busy="b.submitting"
        :aria-label="b.labels.step" :format-number="b.number" @select="b.goStep" />

      <div class="flex min-w-0 flex-1 flex-col">
        <BookingSuccess v-if="b.booking" :code="b.booking.code" :summary="b.savedSummary" :labels="b.labels"
          :can-pay="b.payableDeposit > 0" :payable-label="b.payableDepositLabel" :paying="b.paying"
          :payment-error="b.paymentError" @pay="b.startPayment" />

        <template v-else>
          <div class="flex-1 p-4 sm:p-6 lg:p-8">
            <p class="text-xs text-on-surface-variant">
              {{ b.labels.step }} {{ b.number(b.step) }}
              {{ b.labels.of }} {{ b.number(b.labels.steps.length) }}
            </p>

            <h1 v-if="b.step !== 4" class="mt-2 text-xl font-bold leading-9 text-on-surface sm:text-2xl">
              {{ b.heading }}
            </h1>

            <div :class="b.step === 4 ? 'mt-2' : 'mt-5'">
              <BookingServiceStep v-if="b.step === 1" v-model:service-id="b.serviceId" v-model:staff-id="b.staffId"
                :services="b.services" :doctors="b.availableDoctors" :is-fa="b.isFa" :images="b.images"
                :labels="b.labels" :loading="b.dataLoading" :has-error="b.dataHasError" @retry="b.retryData" />

              <BookingPersonalStep v-else-if="b.step === 2" v-model:full-name="b.fullName" v-model:phone="b.phone"
                v-model:notes="b.notes" :phone-valid="b.phoneValid" :labels="b.labels" />

              <BookingLocationStep v-else-if="b.step === 3" v-model:branch="b.branch" v-model:visit-type="b.visitType"
                :branches="b.branches" :labels="b.labels" />

              <BookingAppointmentStep v-else-if="b.step === 4" :title="b.heading"
                v-model:show-calendar="b.calendar.showCalendar" v-model:show-all-slots="b.showAllSlots" :is-fa="b.isFa"
                :month-label="b.calendar.monthLabel" :weekday-labels="b.calendar.weekdayLabels"
                :calendar-days="b.calendar.calendarDays" :week-days="b.calendar.weekDays"
                :selected-date="b.calendar.selectedDate" :selected-slot-id="b.selectedSlotId"
                :selected-slot="b.selectedSlot" :selected-date-label="b.calendar.selectedDateLabel"
                :selected-end="b.selectedEnd" :today="b.calendar.today" :week-start="b.calendar.weekStart"
                :can-go-previous-month="b.calendar.canGoPreviousMonth" :visible-slots="b.visibleSlots"
                :slots-count="b.slots.length" :has-free-slots="b.hasFreeSlots" :loading="b.slotsLoading"
                :has-error="b.slotsHasError" :duration-label="b.durationLabel" :get-slot-id="b.slotId"
                :labels="b.labels" @move-week="b.calendar.moveWeek" @move-month="b.calendar.moveMonth"
                @pick-date="b.calendar.pickDate" @pick-slot="b.pickSlot" @retry="b.refreshSlots()" />

              <BookingCostStep v-else-if="b.step === 5" :has-price="b.hasPrice" :cost-label="b.costLabel"
                :deposit-label="b.depositLabel" :balance-label="b.balanceLabel" :labels="b.labels" />

              <BookingReviewStep v-else :service-name="b.currentServiceName" :doctor-name="b.currentDoctorName"
                :branch="b.branch" :visit-label="b.visitLabel" :date-label="b.calendar.selectedDateLabel"
                :time-label="b.selectedTimeLabel" :full-name="b.fullName" :phone="b.normalizedPhone"
                :cost-label="b.costLabel" :time-valid="b.timeValid" :labels="b.labels" />
            </div>

            <p v-if="b.bookingError" role="alert" class="mt-5 rounded-xl bg-red-50 p-4 text-sm leading-7 text-red-700">
              {{ b.bookingError }}
            </p>
          </div>

          <BookingNavigation :step="b.step" :total-steps="b.labels.steps.length" :submitting="b.submitting"
            :can-continue="b.canContinue" :can-confirm="b.canConfirm" :labels="b.labels" @back="b.previousStep"
            @next="b.nextStep" @confirm="b.confirmBooking" />
        </template>
      </div>
    </motion.div>
  </section>
</template>