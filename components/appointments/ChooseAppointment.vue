<template>
  <v-container class="d-flex align-center justify-center" style="height: 100vh">
    <v-card
      :style="isDisplay()"
      class="mx-auto appointment_card"
      style="vertical-align: middle"
      width="30vw"
    >
      <v-row justify="center">
        <v-col style="text-align: center">
          <h3 style="color: #9b735e">Sửa thông tin bệnh nhân</h3>
        </v-col>
      </v-row>
      <v-row class="ma-2" justify="center">
        <v-col cols="12">
          <v-text-field
            v-model="store.data.patientAppointment.fullname"
            variant="outlined"
            color="#9b735e"
            label="Tên bệnh nhân"
            readonly
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="col-style">
          <v-text-field
            v-model="store.data.patientAppointment.birthday"
            variant="outlined"
            color="#9b735e"
            label="Ngày sinh"
            readonly
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="col-style">
          <v-text-field
            v-model="store.data.patientAppointment.phone_number"
            variant="outlined"
            color="#9b735e"
            label="Số điện thoại"
            readonly
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="col-style">
          <v-text-field
            v-model="store.data.patientAppointment.email"
            variant="outlined"
            color="#9b735e"
            label="Email"
            readonly
          ></v-text-field>
        </v-col>
        <v-col cols="12" class="check-box-col">
          <v-radio-group
            v-model="store.data.patientAppointment.session_id"
            style="margin-top: -30px"
          >
            <span v-for="(item, i) in store.data.sessionPacks" :key="i">
              <v-radio
                :disabled="item.total_patient >= item.total_slot"
                :label="`${filtersStore.DataDateToValDate(
                  item.date
                )}&ensp;-&ensp;Ca&nbsp;${item.session_name}(${
                  store.data.shift[Number(item.session_name) - 1].time
                })&ensp;-&ensp;${item.total_patient}/${item.total_slot}`"
                :value="item.session_id"
                style="font-weight: bold"
              ></v-radio>
            </span>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row class="ma-2" justify="center">
        <v-btn @click="acceptChangeSession()">Xác nhận</v-btn>
      </v-row>
    </v-card>
    <v-card
      :style="isNoneAppointment()"
      class="mx-auto none-email-card"
      style="vertical-align: middle"
      width="70vw"
    >
      <v-card-text style="text-align: center; font-weight: bold">
        Email truy cập không có trong danh sách đặt hẹn hoặc đã hết hạn đăng ký,
        vui lòng liên hệ
        <span style="color: brown">công ty/nơi làm việc</span> của quý khách để
        được kiểm tra lại danh sách
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
export default {
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
      display_style: "none",
      none_appointment_style: "none",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
        emailMatch: () => `The email and password you entered don't match`,
      },
    };
  },
  mounted() {
    this.isDisplay();
    this.store.state.snackbar.variant = "flat";
    this.store.state.snackbar.color_text = "#6e6f6a";
    this.store.state.snackbar.color_close = "#b2bcba";
    this.store.state.snackbar.timeout = 5000;
  },
  methods: {
    async acceptChangeSession() {
      this.store.state.single_progress_circular.icon =
        "mdi-content-save-settings";
      this.store.state.single_progress_circular.title = "Đang thực hiện...";
      this.store.state.single_progress_circular.state = true;
      await axios
        .post(
          `${useRuntimeConfig().public.DOMAIN}/update-patient-appointment`,
          {
            variables: this.store.data.patientAppointment,
            sessionPacks: this.store.data.sessionPacks,
          }
        )
        .then((response) => {
          if (response.data) {
            console.log("response.data", response.data);
          }
          if (response.data?.totalPatients?.length > 0) {
            const tempSessionPacks = response.data?.totalPatients;
            for (let index = 0; index < tempSessionPacks.length; index++) {
              for (
                let index2 = 0;
                index2 < this.store.data.sessionPacks.length;
                index2++
              ) {
                if (
                  tempSessionPacks[index].session_id ===
                    this.store.data.sessionPacks[index2].session_id &&
                  (tempSessionPacks[index].total_patient ||
                    tempSessionPacks[index].total_patient === 0)
                ) {
                  this.store.data.sessionPacks[index2].total_patient =
                    tempSessionPacks[index].total_patient;
                }
              }
            }
            console.log(
              "this.store.data.sessionPacks",
              this.store.data.sessionPacks
            );

            // thông báo thành công
            this.store.state.snackbar.variant = "flat";
            this.store.state.snackbar.color_text = "#6e6f6a";
            this.store.state.snackbar.color_close = "#b2bcba";
            this.store.state.snackbar.timeout = 5000;
            this.store.state.snackbar = this.store.state.snackbar_default;
            this.store.state.snackbar.text = "Cập nhật thành công!";
            this.store.state.snackbar.state = true;
          }
        })
        .catch((error) => {
          // Handle errors
          console.error("Error:", error);
          // thông báo không thành công
          this.store.state.snackbar.variant = "flat";
          this.store.state.snackbar.color_text = "#6e6f6a";
          this.store.state.snackbar.color_close = "#b2bcba";
          this.store.state.snackbar.timeout = 5000;
          this.store.state.snackbar = this.store.state.snackbar_error;
          this.store.state.snackbar.text = "Cập nhật không thành công!";
          this.store.state.snackbar.state = true;
        });

      // Đóng circle load
      this.store.state.single_progress_circular.state = false;
      this.store.state.single_progress_circular.icon = "";
      this.store.state.single_progress_circular.title = "";
      console.log(this.store.data.patientAppointment);
    },
    isDisplay() {
      if (this.store.state.isChooseAppointment) {
        this.display_style = "block";
      } else {
        this.display_style = "none";
      }
      return `display: ${this.display_style};`;
    },
    isNoneAppointment() {
      if (this.store.state.isNoneAppointment) {
        this.none_appointment_style = "block";
      } else {
        this.none_appointment_style = "none";
      }
      return `display: ${this.none_appointment_style};`;
    },
  },
};
</script>

<style scoped>
.check-box-style {
  margin: -40px 0 -40px 0;
}
.col-style {
  margin-top: -35px;
}
.none-email-card {
  background-color: rgba(255, 255, 255, 0.844);
}
.appointment_card {
  background-color: rgba(255, 255, 255, 0.844);
}
</style>