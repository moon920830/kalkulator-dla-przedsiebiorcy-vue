<template>
  <q-form @submit.prevent="save">
    <div class="row justify-between">
      <div class="col-12 col-md-6 q-pr-md-sm">
        <q-input
          v-model.number="amount"
          type="number"
          min="0"
          step="0.01"
          suffix="zł"
          label="Kwota*"
          autofocus
          color="brand"
          :rules="[validationRules.requiredAmount]"
          lazy-rules
        />
        <div class="q-mt-sm block">
          <q-radio
            v-model="amountType"
            :val="constants.AMOUNT_TYPES.NET"
            label="netto"
          />
          <q-radio
            v-model="amountType"
            :val="constants.AMOUNT_TYPES.GROSS"
            label="brutto"
          />
        </div>
      </div>
      <div class="col-12 col-md-6 q-pl-md-sm">
        <q-select
          v-model="taxRate"
          :options="vatTaxRates"
          label="Stawka podatku VAT*"
          color="brand"
          required
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
import {AmountType} from 'src/types/AmountType'
import { InvoiceInputFields } from './interfaces/InvoiceInputFields'
import {VatTaxRate} from 'src/types/VatTaxRate'
import {computed, defineComponent, ref} from 'vue'
import constants from 'src/logic/constants'
import validationRules from 'src/logic/validationRules'

export default defineComponent({
  setup(props, context) {
    const vatTaxRates = [
      {
        label: '0%',
        value: 0,
      },
      {
        label: '5%',
        value: 0.05,
      },
      {
        label: '8%',
        value: 0.08,
      },
      {
        label: '23%',
        value: 0.23,
      },
    ]

    const amount = ref(null)
    const amountType = ref(constants.AMOUNT_TYPES.NET)
    const taxRate = ref(vatTaxRates[vatTaxRates.length - 1])

    const isDisabledButton = computed(() => {
      return !amount.value || taxRate.value === null
    })

    const save = () => {
      const input: InvoiceInputFields = {
        amount: Number(amount.value),
        amountType: amountType.value as AmountType,
        taxRate: taxRate.value.value as VatTaxRate,
      }
      context.emit('save', input)
    }

    return {
      amount,
      amountType,
      constants,
      isDisabledButton,
      save,
      taxRate,
      validationRules,
      vatTaxRates,
    }
  },
})
</script>
