<template>
  <q-page
    class="q-py-md full-width c-app"
    style="max-width:800px;"
  >
    <div class="full-width bg-white">
      <SectionHeader>
        <q-icon name="list"/>
        Historia zmian
      </SectionHeader>
      <Advert/>
      <div
        v-for="log in logItems"
        :key="log.version">
        <ChangeLog
          :log="log"
        />
        <q-separator v-if="log !== logItems[logItems.length - 1]"/>
      </div>

      <div class="text-center">
        <q-btn
          v-if="!showAll"
          v-model="showAll"
          class="q-mb-md"
          color="brand"
          size="md"
          label="Pokaż wszystko"
          @click="showAll = true"
        />
      </div>
    </div>
    <Footer/>
  </q-page>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue'
import {useBreadcrumbStore} from 'stores/breadcrumbStore'
import Advert from 'components/partials/Advert.vue'
import ChangeLog from 'components/changeLogs/ChangeLog.vue'
import Footer from 'components/partials/Footer.vue'
import SectionHeader from 'components/partials/SectionHeader.vue'
import logs from 'components/changeLogs/logs'

const breadcrumbStore = useBreadcrumbStore()
breadcrumbStore.items = [
  {
    name: 'Historia zmian',
  },
]

const showAll = ref(false)

const logItems = computed(() => {
  if (!showAll.value) {
    return logs.slice(0, 5)
  }
  return logs
})
</script>
