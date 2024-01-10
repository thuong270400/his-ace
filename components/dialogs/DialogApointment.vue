<template>
  <!-- Dialog đặt lịch khám cho gói -->
  <v-dialog
    v-model="store.state.dialogAppointment"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar dark color="white">
        <v-btn icon light @click="store.state.dialogAppointment = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Sửa lịch gói khám</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <Calendar v-if="store.state.isShowSchedule" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Calendar from "../time_manage/Calendar.vue";
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
export default {
  components: {
    Calendar,
  },
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
    };
  },
  mounted() {
    this.store.state.isManageSchedule = false;
  },
};
</script>

<style>
</style>