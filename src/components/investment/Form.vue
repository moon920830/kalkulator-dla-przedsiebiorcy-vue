<template>
  <q-form @submit.prevent="save">
    <div class="row justify-between">
      <div class="col-12 col-md-4 q-pr-md-sm">
        <q-input
          v-model.number="amount"
          type="number"
          min="0"
          step="0.01"
          suffix="zł"
          label="Kapitał*"
          autofocus
          color="brand"
          :rules="[validationRules.requiredAmount]"
          lazy-rules
        />
      </div>
      <div class="col-12 col-md-4 q-pl-md-sm q-pr-md-sm">
        <q-input
          v-model.number="rate"
          type="number"
          min="0"
          step="0.01"
          suffix="%"
          label="Oprocentowanie*"
          :rules="[validationRules.required]"
          lazy-rules
        />
      </div>
      <div class="col-12 col-md-4 q-pl-md-sm">
        <q-input
          v-model.number="monthCount"
          type="number"
          min="1"
          step="1"
          label="Okres lokaty* (w miesiącach)"
          color="brand"
          :rules="[validationRules.required]"
          lazy-rules
        />
      </div>
    </div>
    <div class="row q-mt-lg">
      <div class="col-12">
        <q-btn
          type="submit"
          class="full-width"
          color="brand"
          size="lg"
          label="Oblicz"
          :disable="isDisabledButton"
        />
      </div>
    </div>
  </q-form>
</template>

<script lang="ts">
import {InvestmentInputFields} from 'components/investment/interfaces/InvestmentInputFields'
import {computed, defineComponent, ref} from 'vue'
import validationRules from 'src/logic/validationRules'

export default defineComponent({
  setup(props, context) {
    const amount = ref(null)
    const rate = ref(null)
    const monthCount = ref(12)

    const isDisabledButton = computed(() => {
      return !amount.value || !rate.value || !monthCount.value
    })

    const save = () => {
      const input: InvestmentInputFields = {
        amount: Number(amount.value),
        monthCount: Number(monthCount.value),
        rate: Number(rate.value) / 100,
      }
      context.emit('save', input)
    }

    return{
      amount,
      isDisabledButton,
      monthCount,
      rate,
      save,
      validationRules,
    }
  },
})
</script>
