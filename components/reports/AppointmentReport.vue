<template>
  <v-card-title>
    <v-row>
      <v-col>DANH SÁCH HẸN KHÁM</v-col>
    </v-row>
    <v-row justify="center">
      <v-dialog v-model="isDatePickerActive" width="auto" hide-overlay>
        <v-card>
          <v-card-text>
            <!-- Vùng chứa v-date-picker -->
            <v-date-picker
              v-model="selectedDate"
              color="primary"
              multiple="range"
            ></v-date-picker>
            <v-row>
              <v-spacer></v-spacer>
              <v-btn
                class="text-none"
                color="blue-darken-4"
                rounded="0"
                variant="outlined"
                style="margin-right: 15px"
                @click="closeDatePicker()"
                >Đóng</v-btn
              >
              <v-btn
                class="text-none ms-4 text-white"
                color="blue-darken-4"
                rounded="0"
                variant="flat"
                @click="
                  saveDate(selectedDate);
                  isDatePickerActive = false;
                "
                >OK</v-btn
              >
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-col cols="10">
        <!-- v-text-field đóng vai trò input để kích hoạt v-date-picker -->
        <v-text-field
          v-model="formattedDate"
          label="Khoảng thời gian theo ngày tạo gói khám"
          prepend-icon="mdi-calendar"
          readonly
          @click="isDatePickerActive = true"
        ></v-text-field>
      </v-col>
      <v-col cols="2" class="d-flex justify-center align-center">
        <v-btn color="primary" variant="outlined" @click="fetchData">
          LẤY DỮ LIỆU
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          variant="outlined"
          color="light-blue-accent-3"
          single-line
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
  </v-card-title>
  <v-data-table
    :style="dataTableStyle()"
    :headers="headers"
    :items="patients_"
    :search="search"
    :loading="fetching"
  >
    <template v-slot:item.is_mess_sent="{ item }">
      <v-checkbox
        v-model="item.is_mess_sent"
        hide-details
        readonly
      ></v-checkbox>
    </template>

    <template v-slot:item.is_appointment="{ item }">
      <v-checkbox
        v-model="item.is_appointment"
        hide-details
        readonly
        class="d-flex justify-center"
      ></v-checkbox>
      <div
        v-if="item.is_appointment"
        class="text-center"
        style="padding-bottom: 12px"
      >
        <v-chip
          color="black"
          :text="`${filtersStore.DataDateToValDate(
            item.appointment?.schedule?.date
          )} - Ca ${item.appointment?.session?.name} (${
            store.data.shift[Number(item.appointment?.session?.name) - 1]?.time
          })`"
          size="x-small"
          label
        ></v-chip>
      </div>
    </template>

    <template v-slot:item.checkin_date="{ item }">
      <div v-if="item.checkin_date" class="text-end">
        <v-chip
          color="green"
          :text="item.checkin_date"
          class="text-uppercase"
          size="small"
          label
        ></v-chip>
      </div>
    </template>

    <template v-slot:item.checkout_date="{ item }">
      <div v-if="item.checkout_date" class="text-end">
        <v-chip
          color="green"
          :text="item.checkout_date"
          class="text-uppercase"
          size="small"
          label
        ></v-chip>
      </div>
    </template>
    <template v-slot:no-data>
      <!-- <v-btn color="primary"> Reset </v-btn> -->
      <span style="color: gray"> Chưa có dữ liệu... </span>
    </template>
  </v-data-table>

  <!-- loader -->

  <!-- circle-load -->
  <v-dialog persistent v-model="circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(255, 255, 255, 0.6)"
    >
      <div>
        <v-progress-circular :size="50" color="green" indeterminate>
          <v-icon v-if="circle_loader.icon">{{ circle_loader.icon }}</v-icon>
        </v-progress-circular>
      </div>
    </v-card>
  </v-dialog>

  <!-- single-circle-load -->
  <v-dialog persistent v-model="single_circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(112, 171, 78, 0.85)"
    >
      <div>
        <v-row justify="center" style="margin: 1rem">
          <v-col
            v-if="single_circle_loader.title"
            cols="12"
            style="text-align: center; color: white"
            >{{ single_circle_loader.title }}</v-col
          >
          <v-col cols="12" style="text-align: center">
            <v-progress-circular
              :size="70"
              :width="7"
              color="white"
              indeterminate
            >
              <v-icon v-if="this.circle_loader.icon">{{
                single_circle_loader.icon
              }}</v-icon>
            </v-progress-circular>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>

  <Snackbar />
  <ProgressCircular />
  <SingleProgressCircular />
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import Snackbar from "../utilities/Snackbar.vue";
import ProgressCircular from "../utilities/ProgressCircular.vue";
import SingleProgressCircular from "../utilities/SingleProgressCircular.vue";
import * as XLSX from "xlsx";
export default {
  name: "PatientPage",
  props: {
    // pack_info: {},
    pack_id: {},
    is_follow_pack: false,
  },
  components: {
    Snackbar,
    ProgressCircular,
    SingleProgressCircular,
  },
  data() {
    return {
      // rule

      // ===rules
      phoneNumberRule: [
        (v) => {
          if (v) {
            if (/^[Z0-9-()]+(\s+[Z0-9-()]+)*$/.test(v)) {
              if (v[0] === "0" && (v.length === 11 || v.length === 10)) {
                return true;
              }
              return "sdt phải có 10 số. Vd: 07012345678";
            } else {
              return "Không được có khoảng trắng và kí tự";
            }
          }
          return true;
        },
      ],
      emailRules: [
        (v) =>
          !v ||
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/.test(v) ||
          "email phải đúng định dạng. vd: nvmau@gmail.com",
      ],

      // loader
      circle_loader: {
        state: false,
        icon: "",
      },
      single_circle_loader: {
        state: false,
        icon: "",
        title: "",
      },

      isDatePickerActive: false, // Kiểm soát hiển thị của v-date-picker
      selectedDate: [], // Lưu mảng ngày đã chọn
      formattedDate: "", // Chuỗi hiển thị định dạng "ngày - ngày"
      rangeDate: {
        startDate: "",
        endDate: "",
      },

      // orther
      url: null,
      fetching: false,
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
      overlay: false,
      formTitle: null,

      dialog: false,
      dialogSeenItem: false,
      dialogDelete: false,
      dialogUpdateOrNotic: false,
      dialogAcceptSendMultiSMS: false,
      dialogChooseSendMultiple: false,
      dialogCanNotChooseSendMultiple: false,

      type_send_multiple: null,
      search: "",
      editedIndex: -1,
      editedItem: {
        stt: null,
        id: null,
        fullname: null,
        birthday: null,
        email: null,
        phone_number: null,
        date: null,
        session_name: null,
        pack_id: null,
        session_id: null,
        appointment: null,
      },
      defaultItem: {
        stt: null,
        id: null,
        fullname: null,
        birthday: null,
        email: null,
        phone_number: null,
        date: null,
        session: null,
        pack_id: null,
        session_id: null,
        session_name: null,
        appointment: null,
      },
      session_packs_: [
        {
          pack_id: null,
          session_id: null,
          session_name: null,
          date: null,
          session_slots: 0,
          registered_patients: 0,
        },
      ],
      edited_session_packs_: [
        {
          pack_id: null,
          session_id: null,
          session_name: null,
          date: null,
          session_slots: 0,
          registered_patients: 0,
        },
      ],
      headers: [
        {
          align: "start",
          key: "stt",
          sortable: false,
          title: "STT",
        },
        { key: "company.name", title: "Tên công ty" },
        { key: "fullname", title: "Tên khách hàng" },
        { key: "is_mess_sent", title: "Đã gửi tin" },
        { key: "is_appointment", title: "Đã đặt lịch", align: "center" },
        { key: "checkin_date", title: "Ngày tới khám" },
        { key: "checkout_date", title: "Ngày hoàn thành khám" },
        // { title: "Actions", key: "actions", sortable: false },
        // { title: "ActionsLH", key: "actionsLH", sortable: false },
      ],
      patients_: [],
    };
  },
  async mounted() {
    this.fetchHeader();
  },

  watch: {
    formattedDate(newVal, oldVal) {
      this.checkRangeDate(this.formattedDate);
    },

    dialog(newVal, oldVal) {
      if (newVal === false) {
        this.close();
      }
    },

    dialogSeenItem(newVal, oldVal) {
      if (newVal === false) {
        this.closeSeenItem();
      }
    },

    dialogDelete(newVal, oldVal) {
      if (newVal === false) {
        this.closeDelete();
      }
    },
  },

  methods: {
    isDateDifferenceGreaterThan3Months(date1, date2) {
      const startDate = new Date(date1);
      const endDate = new Date(date2);
      // console.log("startDate", Number(startDate));

      // Tính chênh lệch giữa hai ngày bằng milliseconds
      const differenceInTime = Math.abs(endDate - startDate);

      // Đổi milliseconds thành số ngày
      const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

      return differenceInDays > 90;
    },
    checkRangeDate(strRange) {
      const tempDates = strRange.length > 0 ? strRange.split("-") : [];
      if (tempDates?.length === 2) {
        const tempStart = tempDates[0].trim().split("/");
        const tempEnd = tempDates[1].trim().split("/");
        const startDay = `${tempStart[2]}-${tempStart[1]}-${tempStart[0]}`;
        const endDay = `${tempEnd[2]}-${tempEnd[1]}-${tempEnd[0]}`;
        if (this.isDateDifferenceGreaterThan3Months(startDay, endDay)) {
          console.log("Khoảng cách ngày phải nhỏ hơn 3 tháng!");
        } else if (tempStart?.length === 3 && tempEnd?.length === 3) {
          this.rangeDate = {
            startDate: startDay,
            endDate: endDay,
          };
        }
        console.log(`this.rangeDate:`, this.rangeDate);
      } else {
        console.log("Invalid range date!");
      }
    },
    closeDatePicker() {
      this.selectedDate = null;
      this.isDatePickerActive = false;
    },
    // Phương thức lưu ngày đã chọn
    saveDate(dates) {
      this.isDatePickerActive = false; // Đóng v-date-picker
      if (dates.length > 0) {
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        // Kiểm tra nếu khoảng cách lớn hơn 3 tháng
        if (this.isMoreThanThreeMonths(firstDate, lastDate)) {
          this.store.state.snackbar = this.store.state.snackbar_default;
          this.store.state.snackbar.text = `Khoảng thời gian không được vượt quá 3 tháng!`;
          this.store.state.snackbar.state = true;
          console.log("vượt 3 tháng!", this.store.state.snackbar);

          this.formattedDate = "";
          this.selectedDate = []; // Xóa ngày đã chọn nếu vượt quá giới hạn
        } else {
          this.formattedDate = `${this.formatDate(
            firstDate
          )} - ${this.formatDate(lastDate)}`;
        }
      } else {
        this.formattedDate = ""; // Nếu không chọn ngày, để chuỗi rỗng
      }
    },

    isMoreThanThreeMonths(start, end) {
      const threeMonthsInMilliseconds = 90 * 24 * 60 * 60 * 1000; // Khoảng 10 ngày
      return end - start > threeMonthsInMilliseconds;
    },
    // Phương thức định dạng ngày
    formatDate(date) {
      if (!date) return "";
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng 0-11 nên cộng 1
      const year = date.getFullYear();
      return `${day}/${month}/${year}`; // Trả về định dạng DD/MM/YYYY
    },

    chooseSendMultiple(type) {
      this.type_send_multiple = type;
      this.dialogAcceptSendMultiSMS = true;
    },
    fetchHeader() {
      if (
        this.store.data.user.permission !== "admin" &&
        this.store.data.user.permission !== "KD"
      ) {
        console.log("true");
        this.headers = this.headers.filter(
          (header) => header.key !== "actions"
        );
        console.log(this.headers);
      } else if (this.store.data.user.permission === "KD") {
        this.headers = this.headers.filter(
          (header) => header.key !== "actionsLH"
        );
      }
    },
    async fetchData() {
      if (!(this.rangeDate?.startDate && this.rangeDate?.startDate)) {
        this.store.state.snackbar = this.store.state.snackbar_default;
        this.store.state.snackbar.text = `Vui lòng chọn khoảng thời gian!`;
        this.store.state.snackbar.state = true;
        console.log("Chưa có khoảng thời gian!");
      } else {
        this.fetching = true;
        this.circle_loader.icon = "mdi-account-box";
        this.circle_loader.state = true;
        console.log("this.rangeDate", this.rangeDate);

        const headers = {
          authentication: localStorage.getItem("loginToken")
            ? localStorage.getItem("loginToken")
            : "",
        };
        let response = null;
        // xem danh sách báo cáo đặt hẹn
        if (
          this.store.data.user.permission === "admin" ||
          this.store.data.user.permission === "LH"
        ) {
          response = await axios
            .get(
              `${useRuntimeConfig().public.DOMAIN}/select-appointment-report`,
              {
                params: {
                  headers,
                  rangeDate: this.rangeDate,
                },
              }
            )
            .catch((e) => {
              console.log("không có data", e);
            });
        }
        // manager xem bệnh nhân
        else if (this.store.data.user.permission === "KD") {
          response = await axios
            .get(
              `${
                useRuntimeConfig().public.DOMAIN
              }/select-appointment-report-manager`,
              {
                params: {
                  headers,
                  rangeDate: this.rangeDate,
                  user: this.store.data.user
                },
              }
            )
            .catch((e) => {
              console.log("không có data", e);
            });
        }
        if (response) {
          console.log("response.data", response.data);
          this.patients_ = [];
          if (response.data?.his_ace_patients?.length > 0) {
            const tempPatients = response.data.his_ace_patients;
            let stt = 0;
            // thực hiện gán giá trị cho mảng patient_ và session_pack_
            for (let index = 0; index < tempPatients.length; index++) {
              let tempPatient = {
                stt: ++stt,
                id: tempPatients[index].id ? tempPatients[index].id : null,
                fullname: tempPatients[index].fullname
                  ? tempPatients[index].fullname
                  : null,
                company: {
                  id: tempPatients[index].company_service_pack?.company?.id
                    ? tempPatients[index].company_service_pack?.company.id
                    : null,
                  name: tempPatients[index].company_service_pack?.company?.name
                    ? tempPatients[index].company_service_pack?.company.name
                    : null,
                },
                is_mess_sent:
                  tempPatients[index].is_mess_sent === 1 ? true : false,
                is_appointment:
                  tempPatients[index].appointment_session?.id &&
                  tempPatients[index].appointment_session?.appointment_schedule
                    ?.id
                    ? true
                    : false,
                appointment: {
                  session: {
                    id: tempPatients[index].appointment_session?.id
                      ? tempPatients[index].appointment_session.id
                      : null,
                    name: tempPatients[index].appointment_session?.name
                      ? tempPatients[index].appointment_session.name
                      : null,
                  },
                  schedule: {
                    id: tempPatients[index].appointment_session
                      ?.appointment_schedule?.id,
                    date: tempPatients[index].appointment_session
                      ?.appointment_schedule?.date,
                  },
                },
                checkin_date: tempPatients[index].checkin_date
                  ? this.filtersStore.TimestampToValDate(
                      tempPatients[index].checkin_date
                    )
                  : null,
                checkout_date: tempPatients[index].checkout_date
                  ? this.filtersStore.TimestampToValDate(
                      tempPatients[index].checkout_date
                    )
                  : null,
              };
              this.patients_.push(tempPatient);
            }
            console.log("this.patients_", this.patients_);
          }
        }
        this.circle_loader.state = false;
        this.circle_loader.icon = "";
        this.fetching = false;
      }
    },

    dataTableStyle() {
      if (this.store.state.isLogin) {
        this.display_style = "block";
      } else {
        this.display_style = "none";
      }
      return `display: ${this.display_style};
      ${this.is_follow_pack ? "background-color: #cedee7" : ""}`;
    },
    skeletonStyle() {
      return `${this.is_follow_pack ? "background-color: #cedee7" : ""}`;
    },

    addPatient() {
      this.formTitle = "Thêm";
      this.dialog = true;
    },

    labelWithFormatting(item) {
      return `${item.date}&ensp;-&ensp;Ca ${item.session_name}(${
        store.data.shift[Number(item.session_name) - 1]?.time
      })&ensp;-&ensp;${item.registered_patients}/${item.session_pack_slots}`;
    },

    close() {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeSeenItem() {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    deleteItem(item) {
      this.editedIndex = this.patients_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>

<style scoped>
.btn_add_schedule {
  background: linear-gradient(to left, #c1cbd1, #ffffff, #c1cbd1);
}
.col-style {
  margin-top: -35px;
}
.v-progress-circular {
  margin: 1rem;
}
</style>