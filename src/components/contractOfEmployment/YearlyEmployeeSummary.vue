<template>
  <YearlySummaryTable
    title="Podsumowanie dla pracownika"
    :columns="columns"
    :rows="totalResult"
    @grossAmountUpdated="updateGrossAmounts"
  />
</template>

<script lang="ts">
import {ContractOfEmploymentEmployeeSingleResult} from 'components/contractOfEmployment/interfaces/ContractOfEmploymentEmployeeSingleResult'
import {ContractOfEmploymentInputFields} from 'components/contractOfEmployment/interfaces/ContractOfEmploymentInputFields'
import {PropType, Ref, computed, defineComponent, ref, watch} from 'vue'
import {pln} from 'src/use/currencyFormat'
import {useQuasar} from 'quasar'
import YearlySummaryTable from 'components/partials/YearlySummaryTable.vue'
import constants from 'src/logic/constants'
import employeeContractOfEmployment from 'components/contractOfEmployment/employeeContractOfEmployment'

const columns = [
  {
    align: 'left',
    field: () => '',
    format: (val: string) => `${val}`,
    name: 'month',
    required: true,
  },
  {
    align: 'left',
    field: (row: ContractOfEmploymentEmployeeSingleResult) => row.grossAmount,
    format: (val: number) => `${pln(val)}`,
    label: 'Wynagrodzenie brutto',
    name: 'gross',
    required: true,
  },
  {
    align: 'left',
    field: (row: ContractOfEmploymentEmployeeSingleResult) => row.sickContribution,
    format: (val: number) => `${pln(val)}`,
    label: 'Skł. chorobowa',
    name: 'sick',
    required: true,
  },
  {
    align: 'left',
    field: (row: ContractOfEmploymentEmployeeSingleResult) => row.disabilityContribution,
    format: (val: number) => `${pln(val)}`,
    label: 'Skł. rentowa',
    name: 'disability',
    required: true,
  },
  {
    align: 'left',
    field: (row: ContractOfEmploymentEmployeeSingleResult) => row.pensionContribution,
    format: (val: number) => `${pln(val)}`,
    label: 'Skł. emerytalna',
    name: 'pension',
    required: true,
  },
  {
    align: 'left',
    field: (row: ContractOfEmploymentEmployeeSingleResult) => row.healthContribution,
    format: (val: number) => `${pln(val)}`,
    label: 'Skł. zdrowotna',
    name: 'health',
    required: true,
  },
  {
    align: 'left',
    field: (row: ContractOfEmploymentEmployeeSingleResult) => row.ppkContribution,
    format: (val: number) => `${pln(val)}`,
    label: 'Skł. PPK',
    name: 'ppk',
    required: true,
  },
  {
    align: 'left',
    field: (row: ContractOfEmploymentEmployeeSingleResult) => row.taxAmount,
    format: (val: number) => `${pln(val)}`,
    label: 'Zaliczka na podatek',
    name: 'taxAmount',
    required: true,
  },
  {
    align: 'left',
    field: (row: ContractOfEmploymentEmployeeSingleResult) => row.netAmount,
    format: (val: number) => `${pln(val)}`,
    label: 'Wynagrodzenie netto',
    name: 'net',
    required: true,
  },
]

export default defineComponent({
  components: {
    YearlySummaryTable,
  },
  props: {
    input: {
      required: true,
      type: Object as PropType<ContractOfEmploymentInputFields>,
    },
  },
  setup(props) {
    const $q = useQuasar()

    const monthlyInputs: Ref<ContractOfEmploymentInputFields[]> = ref([])

    for (let i = 0; i < 12; i++) {
      monthlyInputs.value.push(JSON.parse(JSON.stringify(props.input)))
    }

    const updateGrossAmounts = (grossAmounts: number[]) => {
      grossAmounts.forEach((grossAmount, index) => {
        monthlyInputs.value[index].grossAmount = grossAmount
      })
    }

    const result = computed(() => {
      employeeContractOfEmployment.setParams(props.input.year)
      return employeeContractOfEmployment.getYearlyResult(monthlyInputs.value)
    })

    watch(result, () => {
        if (result.value.yearlyResult.basisForTax > constants.PARAMS[props.input.year].AMOUNT_OF_TAX_THRESHOLD) {
          $q.notify({
            message: `Podstawa opodatkowania przekroczyła granicę progu podatkowego (${pln(constants.PARAMS[props.input.year].AMOUNT_OF_TAX_THRESHOLD)}). Dla kwoty powyżej progu stawka podatku wynosi ${constants.TAX_RATES.SECOND_RATE}%.`,
          })
        }
        if (result.value.yearlyResult.basisForRentAndPensionContributions >= constants.PARAMS[props.input.year].LIMIT_BASIC_AMOUNT_FOR_ZUS) {
          $q.notify({
            message: `Osiągnięto limit 30-krotności składek ZUS (${pln(constants.PARAMS[props.input.year].LIMIT_BASIC_AMOUNT_FOR_ZUS)}). Powyżej limitu nie ma obowiązku opłacania składki emerytalnej i rentowej.`,
          })
        }
        if (props.input.isReliefForYoung && result.value.yearlyResult.grossAmount > constants.PARAMS[props.input.year].AMOUNT_OF_TAX_THRESHOLD) {
          $q.notify({
            message: `Przekroczono próg podatkowy (${pln(constants.PARAMS[props.input.year].AMOUNT_OF_TAX_THRESHOLD)}). Od nadwyżki oblicza się ${constants.TAX_RATES.FIRST_RATE}% podatku.`,
          })
        }
        if (props.input.employerPpkContributionRate) {
          $q.notify({
            message: 'Od lutego do podstawy opodatkowania doliczana jest składka PPK wpłacana przez pracodawcę.',
          })
        }
      },
      {
        immediate: true,
      },
    )

    const totalResult = computed(() => {
      return result.value.monthlyResults.concat([result.value.yearlyResult])
    })

    return {
      columns,
      constants,
      pln,
      totalResult,
      updateGrossAmounts,
    }
  },
})
</script>
