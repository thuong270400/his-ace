<template>
  <v-card-text>
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

      <v-col cols="12">
        <!-- v-text-field đóng vai trò input để kích hoạt v-date-picker -->
        <v-text-field
          v-model="formattedDate"
          label="Chọn khoảng thời gian"
          prepend-icon="mdi-calendar"
          readonly
          @click="isDatePickerActive = true"
        ></v-text-field>
      </v-col>
      <v-col cols="12" class="d-flex justify-center align-center">
        <v-btn
          color="primary"
          append-icon="mdi-sync"
          variant="flat"
          @click="SyncData()"
        >
          Đồng bộ
        </v-btn>
      </v-col>
    </v-row>
  </v-card-text>

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
              <v-icon v-if="single_circle_loader.icon">{{
                single_circle_loader.icon
              }}</v-icon>
            </v-progress-circular>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
export default {
  data() {
    return {
      isDatePickerActive: false, // Kiểm soát hiển thị của v-date-picker
      selectedDate: [], // Lưu mảng ngày đã chọn
      formattedDate: "", // Chuỗi hiển thị định dạng "ngày - ngày"
      rangeDate: {
        startDate: "",
        endDate: "",
      },
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),

      single_circle_loader: {
        state: false,
        icon: "",
        title: "",
      },
    };
  },
  watch: {
    formattedDate(newVal, oldVal) {
      this.checkRangeDate(this.formattedDate);
    },
  },
  methods: {
    isDateDifferenceGreaterThan10Days(date1, date2) {
      const startDate = new Date(date1);
      const endDate = new Date(date2);
      // console.log("startDate", Number(startDate));

      // Tính chênh lệch giữa hai ngày bằng milliseconds
      const differenceInTime = Math.abs(endDate - startDate);

      // Đổi milliseconds thành số ngày
      const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

      return differenceInDays > 10;
    },
    checkRangeDate(strRange) {
      const tempDates = strRange.length > 0 ? strRange.split("-") : [];
      if (tempDates?.length === 2) {
        const tempStart = tempDates[0].trim().split("/");
        const tempEnd = tempDates[1].trim().split("/");
        const startDay = `${tempStart[2]}-${tempStart[1]}-${tempStart[0]}`;
        const endDay = `${tempEnd[2]}-${tempEnd[1]}-${tempEnd[0]}`;
        if (this.isDateDifferenceGreaterThan10Days(startDay, endDay)) {
          console.log("Khoảng cách ngày phải nhỏ hơn 10!");
          this.rangeDate = {
            startDate: startDay,
            endDate: endDay,
          };
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
          this.store.state.snackbar.text = `Khoảng thời gian không được vượt quá 10 ngày!`;
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
      const threeMonthsInMilliseconds = 10 * 24 * 60 * 60 * 1000; // Khoảng 10 ngày
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
    async SyncData() {
      this.single_circle_loader.icon = "mdi-content-save-settings";
      this.single_circle_loader.title = "Đang thực hiện...";
      this.single_circle_loader.state = true;
      if (this.rangeDate.startDate && this.rangeDate.endDate) {
        console.log("among ú");
        const headers = {
          authentication: localStorage.getItem("loginToken")
            ? localStorage.getItem("loginToken")
            : "",
        };
        await axios
          .post(`${useRuntimeConfig().public.DOMAIN}/get-company-pd`, {
            headers,
            startDate: this.rangeDate.startDate,
            endDate: this.rangeDate.endDate,
          })
          .then((response) => {
            if (response?.data) {
              console.log("lấy thông tin công ty thành công:", response.data); // thông báo thành công
              this.store.state.snackbar.text = `Lấy thông tin công ty thành công!`;
              this.store.state.snackbar.state = true;
            } else {
              console.log("không có data", e);
              // thông báo không thành công
              this.store.state.snackbar = this.store.state.snackbar_error;
              this.store.state.snackbar.text = `Lấy thông tin công ty không thành công!`;
              this.store.state.snackbar.state = true;
            }
          })
          .catch((e) => {
            // thông báo không thành công
            console.log(e);

            this.store.state.snackbar = this.store.state.snackbar_error;
            this.store.state.snackbar.text = `Lỗi khi lấy thông tin!`;
            this.store.state.snackbar.state = true;
          });
      } else {
        console.log("Khoảng cách ngày không hợp lệ!");
        alert("Khoảng cách ngày không hợp lệ!");
      }

      // đóng circle load
      this.single_circle_loader.state = false;
      this.single_circle_loader.icon = "";
      this.single_circle_loader.title = "";
    },
  },
};
</script>
