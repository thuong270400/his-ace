<template>
  <v-dialog
    v-model="store.state.dialogAcceptPakageSchedule"
    class="schedule_dialog"
  >
    <v-card>
      <v-card-title align="center"> Duyệt gói khám </v-card-title>
      <v-card-text>
        <TableBrowsePackages />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="store.state.dialogAcceptPakageSchedule = false"
        >
          đóng
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import TableBrowsePackages from "../data_tables/TableBrowsePackages.vue";
export default {
  components: { TableBrowsePackages },
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
    };
  },
};
</script>

<style>
</style>