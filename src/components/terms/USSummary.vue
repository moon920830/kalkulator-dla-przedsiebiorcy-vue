<template>
  <div>
    <ListRow
      name="Wpłata zaliczki na podatek dochodowy"
      value="do 20. dnia miesiąca"
      :inline="false"
    />
    <ListRow
      class="bg-teal-1"
      name="Wpłata podatku VAT"
      value="do 25. dnia miesiąca"
      :inline="false"
    />
    <ListRow
      name="Zmiana formy opodatkowania"
      value="do 20 dnia miesiąca następującego po miesiącu, w którym został osiągnięty pierwszy przychód w danym roku podatkowym"
      :inline="false"
    />
    <ListRow
      class="bg-teal-1"
      name="Rozliczenie PIT"
      value="do 30. kwietnia. W przypadku, gdy termin nie jest dniem roboczym termin zostaje przeniesiony na najbliższy dzień roboczy"
      :inline="false"
    />
    <ListRow
      name="Termin składania formularza VAT-26"
      value="do 25. dnia następnego miesiąca, w którym zostanie poniesiony pierwszy wydatek związany z pojazdem, nie później jednak niż w dniu przesłania ewidencji JPK_V7"
      :inline="false"
    />
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import ListRow from 'components/partials/ListRow.vue'

export default defineComponent({
  components: {
    ListRow,
  },
})
</script>
