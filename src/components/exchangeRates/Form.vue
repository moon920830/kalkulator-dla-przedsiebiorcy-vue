<template>
  <q-form @submit.prevent="loadData">
    <div class="row justify-between">
      <div class="col-12 col-md-6 q-pr-md-sm">
        <q-input
          v-model="startDate"
          color="brand"
          mask="##.##.####"
          label="Data początkowa*"
          :rules="[
            validationRules.todayOrPast,
            validationRules.required,
          ]">
          <template v-slot:append>
            <q-icon
              name="event"
              class="cursor-pointer"/>
          </template>
          <DatePopup
            v-model="startDate"
            only-past-or-today/>
        </q-input>
      </div>
      <div class="col-12 col-md-6 q-pl-md-sm">
        <q-input
          v-model="endDate"
          class="q-pb-none"
          color="brand"
          mask="##.##.####"
          label="Data końcowa*"
          :rules="[
            validationRules.todayOrPast,
            validationRules.required,
          ]">
          <template v-slot:append>
            <q-icon
              name="event"
              class="cursor-pointer"/>
          </template>
          <DatePopup
            v-model="endDate"
            only-past-or-today/>
        </q-input>
      </div>
    </div>
    <div class="row q-mt-lg">
      <div class="col-12">
        <q-btn
          type="submit"
          class="full-width"
          color="brand"
          size="lg"
          label="Pokaż"
          :disable="isDisabledButton"
        />
      </div>
    </div>
  </q-form>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import {format, isFuture, parse, subMonths} from 'date-fns'
import {useCurrencyRateStore} from 'stores/currency-rate-store'
import {useQuasar} from 'quasar'
import {useRoute} from 'vue-router'
import DatePopup from 'components/partials/DatePopup.vue'
import npb from 'src/api/nbp'
import validationRules from 'src/logic/validationRules'

const $q = useQuasar()
const currencyRateStore = useCurrencyRateStore()
const route = useRoute()

const now = new Date()
const monthAgo = subMonths(now, 1)
const startDate = ref(format(monthAgo, 'dd.MM.y'))
const endDate = ref(format(now, 'dd.MM.y'))

const formattedStartDate = computed(() => {
  return parse(
    startDate.value,
    'dd.MM.y',
    new Date(),
  )
})

const formattedEndDate = computed(() => {
  return parse(
    endDate.value,
    'dd.MM.y',
    new Date(),
  )
})

const isDisabledButton = computed(() => {
  if (!startDate.value || !endDate.value) {
    return true
  }
  if (isFuture(formattedStartDate.value) || isFuture(formattedEndDate.value)) {
    return true
  }
  return formattedStartDate.value >= formattedEndDate.value
})

const loadData = () => {
  currencyRateStore.isLoading = true

  npb.loadExchangeRateCurrency(
    route.params.currency as string,
    format(formattedStartDate.value, 'y-MM-dd'),
    format(formattedEndDate.value, 'y-MM-dd'),
  ).then(response => {
    currencyRateStore.currencyRate = response.data
    $q.notify({
      message: 'Źródło danych: Narodowy Bank Polski',
    })
  }).catch((error) => {
    let message = 'Nie udało się połączyć z serwerem NBP. Spróbuj ponownie'
    if (error.response) {
      message = error.response.data
    }
    $q.notify({
      message: message,
    })
    currencyRateStore.currencyRate = null
  }).finally(() => {
    currencyRateStore.isLoading = false
  })
}

loadData()
</script>
