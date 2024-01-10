<template>
  <v-dialog persistent v-model="store.state.circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(255, 255, 255, 0.6)"
    >
      <div>
        <v-progress-circular :size="70" :width="7" color="green" indeterminate>
          <v-icon v-if="store.state.circle_loader.icon">{{
            store.state.circle_loader.icon
          }}</v-icon>
        </v-progress-circular>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
export default {
  data: () => ({
    store: storeToRefs(useFiltersStore()),
  }),
};
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>