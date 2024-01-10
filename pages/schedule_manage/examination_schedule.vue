<template>
  <div>
    <v-skeleton-loader
      v-if="store.state.progress_circular.state"
      class="mx-auto ma-2"
      elevation="12"
      max-width="100%"
      type="actions, date-picker-options,
    table-thead,date-picker-days,
    date-picker-days, date-picker-days"
    ></v-skeleton-loader>
    <Calendar
      v-if="store.state.isShowSchedule && !store.state.progress_circular.state"
    />
    <SnackBar />
    <ProgressCircular />
    <SingleProgressCircular />
  </div>
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import Calendar from "../components/time_manage/Calendar.vue";
import SnackBar from "../components/utilities/SnackBar.vue";
import ProgressCircular from "~/components/utilities/ProgressCircular.vue";
import SingleProgressCircular from "~/components/utilities/SingleProgressCircular.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
  components: {
    Calendar,
    SnackBar,
    ProgressCircular,
    SingleProgressCircular,
  },
  async mounted() {
    this.store.state.isEditPackage = false;
    await this.fetchSchedule();
    this.store.state.isManageSchedule = true;
    console.log(
      "this.store.state.isManageSchedule",
      this.store.state.isManageSchedule
    );
    // for (
    //   let index = 0;
    //   index < this.store.data.scheduleEvents.length;
    //   index++
    // ) {
    //   this.store.data.scheduleEvents[index].backgroundColor = "#00407e";
    // }
    this.store.state.isCreatePackage = false;
  },
  watch: {
    async "store.data.fullCalendarKey"(newVal, oldVal) {
      await this.fetchSchedule();
    },
  },
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
    };
  },
  methods: {
    async fetchSchedule() {
      this.store.state.progress_circular.state = true;
      this.store.state.progress_circular.icon = "mdi-calendar-today";
      try {
        const headers = {
          authentication: localStorage.getItem("loginToken")
            ? localStorage.getItem("loginToken")
            : "",
        };
        await axios
          .get(`${useRuntimeConfig().public.DOMAIN}/select-appointments`, {
            params: {
              internal_hospital_id: localStorage.getItem(
                "internal_hospital_id"
              ),
              headers,
            },
          })
          .then(async (response) => {
            console.log(
              "response.data",
              response?.data?.his_ace_appointment_schedules
            );
            console.log(
              "response?.data?.permission",
              response?.data?.permission
            );
            if (response?.data?.permission) {
              this.store.data.user.permission = response.data.permission;
            }

            let appointmentSchedules = [];
            if (response?.data?.his_ace_appointment_schedules) {
              appointmentSchedules =
                response?.data?.his_ace_appointment_schedules;
            }
            if (appointmentSchedules?.length > 0) {
              this.store.data.scheduleEvents = [];
              for (
                let index = 0;
                index < appointmentSchedules.length;
                index++
              ) {
                // console.log(
                //   "appointmentSchedules[index]",
                //   appointmentSchedules[index]
                // );
                const cloneSessions =
                  appointmentSchedules[index]?.appointment_sessions;

                if (cloneSessions.length > 0) {
                  for (let j = 0; j < cloneSessions.length; j++) {
                    let tempEvent = {
                      title: null,
                      date: null,
                      start: null,
                      end: null,
                      extendedProps: {
                        appointment_session_id: null,
                        state: "seen",
                      },
                      backgroundColor: "#00407e",
                    };
                    // if (appointmentSchedules[index]) {
                    //   tempEvent.date = new Date(
                    //     appointmentSchedules[index].date
                    //   );
                    //   tempEvent.start = new Date(
                    //     appointmentSchedules[index].date + " 7:30 GMT+7:00"
                    //   );
                    //   tempEvent.end = new Date(
                    //     appointmentSchedules[index].date + " 9:30 GMT+7:00"
                    //   );
                    //   // tempEvent.end = "9";
                    // }
                    tempEvent.date = appointmentSchedules[index].date;
                    tempEvent.extendedProps.appointment_session_id =
                      cloneSessions[j].id;
                    if (cloneSessions[j].name) {
                      tempEvent.title = `Ca ${j + 1}\t|\t${
                        this.store.data.shift[j].time
                      }\t|\t`;
                    }

                    let totalSlots = 0;
                    const companyPacks =
                      cloneSessions[j].appointment_company_service_packs;
                    if (companyPacks) {
                      for (let k = 0; k < companyPacks.length; k++) {
                        totalSlots += Number(companyPacks[k].total_slot);
                      }
                      tempEvent.title += `\t${totalSlots}`;
                    } else {
                      tempEvent.title += `\t0`;
                    }
                    tempEvent.title += `/${cloneSessions[j].total_slot}`;

                    if (totalSlots === Number(cloneSessions[j].total_slot)) {
                      tempEvent.backgroundColor = "red";
                    }
                    this.store.data.scheduleEvents.push(tempEvent);
                  }
                }
              }
            } else if (appointmentSchedules?.length === 0) {
            }

            this.store.state.isShowSchedule = true;
          })

          .catch((e) => {
            console.log("không có data", e);
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      this.store.state.progress_circular.state = false;
      this.store.state.progress_circular.icon = "";
    },
  },
});
</script>

<style>
</style>