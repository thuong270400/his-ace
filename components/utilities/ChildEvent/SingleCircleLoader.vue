<template>
  <v-dialog persistent v-model="store.state.single_circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(112, 171, 78, 0.85)"
    >
      <div>
        <v-row justify="center" style="margin: 1rem">
          <v-col
            v-if="store.state.single_circle_loader.title"
            cols="12"
            style="text-align: center; color: white"
            >{{ store.state.single_circle_loader.title }}</v-col
          >
          <v-col cols="12" style="text-align: center">
            <v-progress-circular
              :size="70"
              :width="7"
              color="white"
              indeterminate
            >
              <v-icon v-if="store.state.circle_loader.icon">{{
                store.state.single_circle_loader.icon
              }}</v-icon>
            </v-progress-circular>
          </v-col>
        </v-row>
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