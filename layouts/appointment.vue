<template>
  <main class="login-background">
    <slot />
    <Snackbar />
    <ProgressCircular />
    <SingleProgressCircular />
  </main>
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import Snackbar from "~/components/utilities/Snackbar.vue";
import ProgressCircular from "~/components/utilities/ProgressCircular.vue";
import SingleProgressCircular from "~/components/utilities/SingleProgressCircular.vue";
export default {
  components: {
    Snackbar,
    ProgressCircular,
    SingleProgressCircular,
  },
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
    };
  },
  async mounted() {
    await this.fetchFirstData();
  },
  methods: {
    async fetchFirstData() {
      this.store.state.progress_circular.icon = "mdi-account-box";
      this.store.state.progress_circular.state = true;
      console.log("query", this.$route.query);
      const headers = {
        authentication: this.$route.query.token,
      };
      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/auth-email-patient`, {
          headers,
        })
        .then((response) => {
          // this.posts = response.data;
          if (response.data) {
            console.log("✨authenticated!✨");
            console.log(this.store.state);
            console.log("response.data", response.data);
            if (response.data.data?.his_ace_patients[0]) {
              const tempPatient = response.data.data.his_ace_patients[0];
              if (tempPatient.id) {
                console.log("tempPatient.id", tempPatient.id);
                console.log("this.store.data", this.store.data);
                this.store.data.patientAppointment.id = tempPatient.id;
              }
              if (tempPatient.fullname) {
                this.store.data.patientAppointment.fullname =
                  tempPatient.fullname;
              }
              if (tempPatient.birthday) {
                this.store.data.patientAppointment.birthday =
                  tempPatient.birthday;
              }
              if (tempPatient.phone_number) {
                this.store.data.patientAppointment.phone_number =
                  tempPatient.phone_number;
              }
              if (tempPatient.email) {
                this.store.data.patientAppointment.email = tempPatient.email;
              }
              if (tempPatient.company_service_pack_id) {
                this.store.data.patientAppointment.company_pack_id =
                  tempPatient.company_service_pack_id;
              }
              if (tempPatient.appointment_session_id) {
                this.store.data.patientAppointment.session_id =
                  tempPatient.appointment_session_id;
              }
              console.log(
                "this.store.data.patientAppointment",
                this.store.data.patientAppointment
              );
              if (
                tempPatient.company_service_pack
                  ?.appointment_company_service_packs
              ) {
                const tempSessionPacks =
                  tempPatient.company_service_pack
                    ?.appointment_company_service_packs;
                for (let index = 0; index < tempSessionPacks.length; index++) {
                  const tempSessionPack = {
                    session_id: null,
                    total_slot: 0,
                    total_patient: 0,
                    session_name: null,
                    date: null,
                  };
                  if (tempSessionPacks[index].appointment_session?.id) {
                    tempSessionPack.session_id =
                      tempSessionPacks[index].appointment_session.id;
                  }
                  if (tempSessionPacks[index].total_slot) {
                    tempSessionPack.total_slot =
                      tempSessionPacks[index].total_slot;
                  }
                  if (tempSessionPacks[index].appointment_session?.name) {
                    tempSessionPack.session_name =
                      tempSessionPacks[index].appointment_session.name;
                  }
                  if (
                    tempSessionPacks[index].appointment_session
                      ?.appointment_schedule?.date
                  ) {
                    tempSessionPack.date =
                      tempSessionPacks[
                        index
                      ].appointment_session.appointment_schedule.date;
                  }
                  if (response.data.data_count?.length > 0) {
                    for (
                      let index2 = 0;
                      index2 < response.data.data_count.length;
                      index2++
                    ) {
                      if (
                        response.data.data_count[index2].session_id ===
                        tempSessionPacks[index].appointment_session.id
                      ) {
                        tempSessionPack.total_patient =
                          response.data.data_count[index2].total_patient;
                      }
                    }
                  }
                  this.store.data.sessionPacks.push(tempSessionPack);
                }
                console.log(
                  "store.data.sessionPacks",
                  this.store.data.sessionPacks
                );
              }
            }
            this.store.state.isChooseAppointment = true;
            this.store.state.isNoneAppointment = false;
          }
          this.overlay = false;
        })
        .catch((e) => {
          console.log(e);
          console.log("không có data");
          this.store.state.isNoneAppointment = true;
          this.store.state.isChooseAppointment = false;
        });
      this.store.state.progress_circular.state = false;
      this.store.state.progress_circular.icon = "";
    },
  },
};
</script>
<style scoped>
.login-background {
  background: linear-gradient(
      to left,
      transparent,
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.6)
    ),
    url("https://firebasestorage.googleapis.com/v0/b/tfbvn-3755f.appspot.com/o/app_icon%2Fcompany-examination-admin-web%2Fpackground_appointment.jpg?alt=media&token=58591df8-116d-4e64-a702-6ee445f88add");
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  height: auto;
  width: 100%;
}

.card_style {
  display: flex;
  border-radius: 0;
  /* min-height: 100vh; */
  /* margin-bottom: 3vw; */
}
</style>