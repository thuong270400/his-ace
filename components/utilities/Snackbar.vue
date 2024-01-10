<template>
  <v-snackbar
    :timeout="store.state.snackbar.timeout"
    :variant="store.state.snackbar.variant"
    :color="store.state.snackbar.color_text"
    v-model="store.state.snackbar.state"
    multi-line
  >
    <b>{{ store.state.snackbar.text }}</b>

    <template v-slot:actions>
      <v-btn
        :color="store.state.snackbar.color_close"
        variant="text"
        @click="store.state.snackbar.state = false"
      >
        <b>Close</b>
      </v-btn>
    </template>
  </v-snackbar>
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

<style>
</style>