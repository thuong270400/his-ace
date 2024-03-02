<template>
  <v-card>
    <v-card-title>
      <v-row>
        <!-- Khởi tạo gói khám -->
        <v-col
          v-if="
            store.state.isCreatePackage &&
            (store.data.user.permission === 'admin' ||
              store.data.user.permission === 'KD')
          "
          style="text-align: right"
        >
          <v-tooltip text="Xác nhận khởi tạo gói khám" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-package-up"
                size="large"
                class="btn_add_schedule"
                @click="dialogCreatePakageSchedule = true"
              >
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>

        <!-- Cập nhật gói khám -->
        <v-col
          v-if="
            store.state.isEditPackage &&
            (store.data.user.permission === 'admin' ||
              store.data.user.permission === 'KD' ||
              store.data.user.permission === 'LH')
          "
          style="text-align: right"
        >
          <v-tooltip text="Cập nhật gói khám" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-reload mdi-spin"
                size="large"
                class="btn_add_schedule"
                @click="dialogUpdate = true"
              ></v-btn> </template
          ></v-tooltip>
        </v-col>

        <v-col
          style="text-align: right"
          v-if="
            (store.data.user.permission === 'admin' ||
              store.data.user.permission === 'LH') &&
            store.state.isManageSchedule
          "
        >
          <!-- Duyệt gói khám -->
          <!-- <v-tooltip text="Duyệt gói khám" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-calendar-multiple-check"
                size="large"
                class="btn_add_schedule"
                @click="store.state.dialogAcceptPakageSchedule = true"
                style="margin-right: 2vw"
              >
              </v-btn>
            </template>
          </v-tooltip> -->

          <!-- Import lịch hẹn -->
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="handleFileChange"
            accept=".xlsx"
          />
          <v-tooltip text="Thêm lịch hẹn" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-calendar-plus"
                size="large"
                class="btn_add_schedule"
                @click="triggerFileInput(item)"
              ></v-btn> </template
          ></v-tooltip>
        </v-col>
      </v-row>
    </v-card-title>
    <FullCalendar :options="calendarOptions" />
  </v-card>
  <v-dialog v-model="dialog" class="schedule_dialog">
    <v-card>
      <v-card-title align="center"> Nhập số lượng người khám </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="register_patients"
                label="Số lượng người khám"
                placeholder="Nhập số lượng người khám"
                variant="outlined"
                color="light-blue-accent-3"
                :rules="slotRegisteredRules"
              ></v-text-field>
            </v-col>
            <v-col cols="12" align="center">
              Số bệnh nhân <span v-if="store.state.isEditPackage">đã</span
              ><span v-if="store.state.isCreatePackage">vừa</span> thêm:
              {{ register_patients_add }}&nbsp;
              <v-tooltip text="Reset số lượng đã thêm" location="right">
                <template v-slot:activator="{ props }">
                  <v-icon
                    v-bind="props"
                    color="primary"
                    style="margin-top: -2px"
                    @click="resetRegisterAdded()"
                  >
                    mdi-delete-circle-outline
                  </v-icon>
                </template>
              </v-tooltip>
            </v-col>

            <v-col cols="6" align="center">
              Còn lại: {{ available_patients }}
            </v-col>
            <v-col cols="6" align="center">
              Còn trống:
              {{ empty_slots }}
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
          Hủy
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="save"> Lưu </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận khởi tạo gói khám -->
  <v-dialog v-model="dialogCreatePakageSchedule" class="schedule_dialog">
    <v-card>
      <v-card-title align="center">
        Xác nhận thêm lịch khám của gói&nbsp;<b>{{ store.data.packageAdd.name }}</b
        >&nbsp;vào dữ liệu?
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogCreatePakageSchedule = false"
        >
          Hủy
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="
            filtersStore.createPackageSchedule(),
              (dialogCreatePackageSchedule = false)
          "
        >
          Xác nhận
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog duyệt gói khám -->
  <!-- <dialog-browse-packages /> -->

  <!-- dialog import lịch hẹn -->
  <v-dialog v-model="dialogImport" max-width="50vw">
    <v-card>
      <v-card-text>
        <v-row justify="center" style="text-align: center"
          >Xác nhận gửi danh sách&nbsp;<b>{{ selectedFileName }}</b
          >&nbsp;vào dữ liệu?</v-row
        >
      </v-card-text>
      <v-card-actions>
        <v-btn color="blue-darken-1" variant="text" @click="closeImport"
          >Đóng</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="acceptImport"
          >Xác nhận</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- dialog update lịch hẹn -->
  <v-dialog v-model="dialogUpdate" width="auto">
    <v-card>
      <v-card-text>
        <v-row justify="center" style="text-align: center">
          Xác nhận cập nhật lịch gói khám
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogUpdate = false"
        >
          Đóng
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="acceptUpdatePack()">
          Xác nhận
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- <ProgressCircular />
  <SingleProgressCircular /> -->
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import "@fullcalendar/core"; // solve problem with Vite
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Calendar } from "@fullcalendar/core";
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import * as XLSX from "xlsx";
import DialogBrowsePackages from "../dialogs/DialogBrowsePackages.vue";

// import ProgressCircular from "../utilities/ProgressCircular.vue";
// import SingleProgressCircular from "../utilities/SingleProgressCircular.vue";

// ====KHỞI TẠO
onMounted(async () => {
  console.log("first events_", tempEvent_.value);
  console.log("packageAdd:", store.value.data.packageAdd);
});

// =====BIẾN GIÁ TRỊ
const store = ref(storeToRefs(useFiltersStore()));
const filtersStore = ref(useFiltersStore());

store.value.state.snackbar.variant = "flat";
// store.value.state.snackbar.color_text = "#ffe9b8";
store.value.state.snackbar.color_text = "#2c3e50";
store.value.state.snackbar.color_close = "red";
store.value.state.snackbar.timeout = 3000;

// giá trị tạm, mặc định
let isBigerEmptySlot = ref(false);
const currentDate = ref(new Date());
let tempEvent_ = ref([
  {
    title: null,
    date: `${currentDate.value.getFullYear()}-${
      currentDate.value.getMonth() + 1
    }-${currentDate.value.getDate()}`,
    start: null,
    end: null,
    extendedProps: {
      status: null,
    },
    backgroundColor: "green",
  },
]);
let tempEventEdit_id = ref(1);
let tempAppointmentSessionEdit_id = ref(0);
let empty_slots = ref(0);

// --giá trị chính
// các biến của database
let available_patients = ref(
  store.value.state.isEditPackage
    ? store.value.data.packageAdd?.real_num_available
    : store.value.data.packageAdd?.number_of_employees
);
let old_available_patients = ref(
  store.value.state.isEditPackage
    ? store.value.data.packageAdd?.real_num_available
    : store.value.data.packageAdd?.number_of_employees
);

// các biến hiển thị tính toán
let register_patients_add = ref(0);
let register_patients = ref(0);

// dialog
let dialog = ref(false);
let dialogImport = ref(false);
let dialogUpdate = ref(false);
let dialogCreatePakageSchedule = ref(false);

let selectedFileName = ref(null);
const id = ref(10);
const tempSessionPack = ref({});
const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,dayGridWeek,dayGridDay,listMonth",
  },
  // editable: true,
  selectable: true,
  weekends: true,
  dayMaxEventRows: true, // for all non-TimeGrid views
  views: {
    timeGrid: {
      dayMaxEventRows: 6, // adjust to 6 only for timeGridWeek/timeGridDay
    },
  },
  buttonText: {
    today: "Ngày hiện tại",
    month: "Tháng",
    week: "Tuần",
    day: "Ngày",
    list: "Danh Sách",
  },
  select: (arg) => {
    console.log("arg select", arg);
    // id.value = id.value + 1;
    // const cal = arg.view.calendar;
    // cal.unselect();
    // cal.addEvent({
    //   id: `${id.value}`,
    //   title: `newEvent ${id.value}`,
    //   start: arg.start,
    //   end: arg.end,
    //   allDay: true,
    // });
  },
  eventClick: (arg) => {
    console.log(new Date());
    console.log("arg eventClick before", arg);
    console.log("arg eventClick after", arg.event._def.title);
    // console.log(arg.event._def.ui.backgroundColor);
    tempSessionPack.value.appointment_session_id =
      arg.event?._def?.extendedProps?.appointment_session_id;
    if (
      store.value.state.isCreatePackage ||
      arg?.event?._def?.extendedProps?.state === "edit_pack"
    ) {
      if (arg?.event?._def?.extendedProps?.state === "edit_pack") {
        store.value.state.calendarState =
          arg?.event?._def?.extendedProps?.state;
      }
      if (arg?.event?._def?.ui?.backgroundColor !== "red") {
        console.log(`còn slot`);
        if (
          arg.event._def.extendedProps?.id ||
          arg.event._def.extendedProps?.id === 0
        ) {
          tempEventEdit_id.value = arg.event._def.extendedProps.id;
          console.log("tempEventEdit_id.value", tempEventEdit_id.value);
        }
        if (arg.event._def.extendedProps?.appointment_session_id) {
          tempAppointmentSessionEdit_id.value =
            arg.event._def.extendedProps.appointment_session_id;
        }
        register_patients_add.value = 0;
        if (arg.event._def.extendedProps?.register_patients_add) {
          register_patients_add.value = Number(
            arg.event._def.extendedProps.register_patients_add
          );
        }

        const session_slot = Number(
          store.value.data.scheduleEvents[tempEventEdit_id.value]?.extendedProps
            .session_slot
        );
        console.log("session_slot", session_slot);
        const slot_registered = Number(
          store.value.data.scheduleEvents[tempEventEdit_id.value]?.extendedProps
            .slot_registered
        );
        console.log("slot_registered", slot_registered);
        empty_slots.value = session_slot - slot_registered;
        console.log("empty_slots.value", empty_slots.value);
        if (empty_slots.value > old_available_patients.value) {
          isBigerEmptySlot.value = true;
        } else {
          isBigerEmptySlot.value = false;
        }
        dialog.value = true; // mở bảng thêm bệnh nhân cho buổi
        console.log(dialog.value);
      } else {
        console.log(`hết slot`);
      }
    } else if (arg?.event?._def?.extendedProps?.state === "seen") {
      console.log("giao diện chỉ xem");
    } else {
      console.log("giao diện số lượng khám thực");
    }
  },
  events:
    store.value.data.scheduleEvents !== []
      ? store.value.data.scheduleEvents
      : tempEvent_.value,
};

// ==================RULES
const slotRegisteredRules = ref([
  (v) => {
    if (v) {
      if (/^[0-9-/]*$/.test(v)) {
        return true;
      } else {
        return "Không được có khoảng trắng và kí tự";
      }
    }
    return false;
  },
]);
// =====watch
// ---Kiểm tra thay đổi số lượng bệnh nhân đăng ký

watch(register_patients, (newValue, oldValue) => {
  checkSlot(newValue, oldValue);
});
watch(register_patients_add, (newValue, oldValue) => {
  console.log("change register_patients_add");
  // if (store.value.state.isEditPackage) {
  //   available_patients.value += oldValue;
  //   empty_slots.value += oldValue;
  // }
});

watch(dialogImport, async (newValue, oldValue) => {
  if (newValue === false) {
    fileInput.value.value = null;
  }
});

watch(dialogUpdate, async (newValue, oldValue) => {
  if (newValue === false) {
  }
});

watch(dialog, async (newValue, oldValue) => {
  console.log("✨change dialog");
  console.log("isBigerEmptySlot", isBigerEmptySlot);
  console.log("register_patients.value before", register_patients.value);
  if (newValue === false) {
    register_patients.value = 0;
    console.log("register_patients.value", register_patients.value);
    available_patients.value = old_available_patients.value;
    const session_slot = Number(
      store.value.data.scheduleEvents[tempEventEdit_id.value]?.extendedProps
        .session_slot
    );
    const slot_registered = Number(
      store.value.data.scheduleEvents[tempEventEdit_id.value]?.extendedProps
        .slot_registered
    );
    empty_slots.value =
      session_slot - slot_registered - register_patients.value;
  }
});

let fileInput = ref(null);
const triggerFileInput = () => {
  console.log(fileInput.value);
  fileInput.value.click();
};
const schedule_insert_ = ref([]);
const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (
    file &&
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    selectedFileName.value = file.name;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Lấy dữ liệu từ sheet đầu tiên (index 0)
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Dữ liệu từ Excel:", sheetData);

      // Xử lý dữ liệu của bạn ở đây
      if (sheetData) {
        schedule_insert_.value = [];
        for (let index = 0; index < sheetData.length; index++) {
          let tempSchedule = {
            date: "",
            appointment_sessions: {
              data: [],
            },
          };
          if (sheetData[index]["Date"]) {
            tempSchedule.date = sheetData[index]["Date"];
          }
          if (sheetData[index]["7:30 am - 9:00 am"]) {
            tempSchedule.appointment_sessions.data.push({
              name: "1",
              total_slot: sheetData[index]["7:30 am - 9:00 am"],
            });
          }
          if (sheetData[index]["9:00 am - 10:30 am"]) {
            tempSchedule.appointment_sessions.data.push({
              name: "2",
              total_slot: sheetData[index]["9:00 am - 10:30 am"],
            });
          }
          if (sheetData[index]["1:00 pm - 2:00 pm"]) {
            tempSchedule.appointment_sessions.data.push({
              name: "3",
              total_slot: sheetData[index]["1:00 pm - 2:00 pm"],
            });
          }
          if (sheetData[index]["2:00 pm - 3:30 pm"]) {
            tempSchedule.appointment_sessions.data.push({
              name: "4",
              total_slot: sheetData[index]["2:00 pm - 3:30 pm"],
            });
          }
          schedule_insert_.value.push(tempSchedule);
        }
        console.log("schedule_insert_.value", schedule_insert_.value);
        dialogImport.value = true;
      }
    };

    reader.readAsArrayBuffer(file);
  } else {
    console.error("Invalid file format. Please select a XLSX file.");
    // Xử lý khi file không đúng định dạng
  }
};

const checkSlot = (newValue, oldValue) => {
  if (newValue === oldValue) {
  } else if (Number.isInteger(Number(register_patients.value))) {
    console.log("watch register_patients");
    const session_slot = Number(
      store.value.data.scheduleEvents[tempEventEdit_id.value]?.extendedProps
        .session_slot
    );
    const slot_registered = Number(
      store.value.data.scheduleEvents[tempEventEdit_id.value]?.extendedProps
        .slot_registered
    );
    console.log(
      "is < 0?",
      session_slot - slot_registered - Number(register_patients.value)
    );
    if (newValue < 0) {
      register_patients.value = Number(oldValue);
    }
    if (newValue < oldValue) {
      available_patients.value =
        old_available_patients.value - register_patients.value;
      empty_slots.value =
        session_slot - slot_registered - register_patients.value;
    } else if (
      !isBigerEmptySlot.value &&
      empty_slots.value - Number(register_patients.value) <= 0
    ) {
      console.log("max empty_slots");
      register_patients.value = Number(session_slot - slot_registered);
    } else if (
      isBigerEmptySlot.value &&
      old_available_patients.value - Number(register_patients.value) <= 0
    ) {
      console.log("max available_patients");
      register_patients.value = old_available_patients.value;
    }
    available_patients.value =
      old_available_patients.value - register_patients.value;
    empty_slots.value =
      session_slot - slot_registered - register_patients.value;
  } else {
    register_patients.value = Number(oldValue);
  }
};

const checkNumber = (v) => {
  console.log("v", v);
  if (v) {
    if (Number.isInteger(v)) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

const closeImport = () => {
  dialogImport.value = false;
};
const acceptImport = async () => {
  store.value.state.single_progress_circular.icon = "mdi-content-save-settings";
  store.value.state.single_progress_circular.title = "Đang thực hiện...";
  store.value.state.single_progress_circular.state = true;
  console.log("xác nhận import lịch hẹn");
  const variables = schedule_insert_.value;
  try {
    await axios
      .post(`${useRuntimeConfig().public.DOMAIN}/add-schedule-session`, {
        variables: variables,
      })
      .then(async (response) => {
        if (response.data) {
          console.log("response.data", response.data);
          await fetchSchedule();
          store.value.data.fullCalendarKey++;
          store.value.state.isShowSchedule = !store.value.state.isShowSchedule;
          store.value.state.isShowSchedule = !store.value.state.isShowSchedule;
          dialogImport.value = false;
          store.value.state.snackbar.text =
            "Thêm vào danh sách lịch hẹn thành công";
          store.value.state.snackbar.timeout = 4500;
          store.value.state.snackbar.state = true;
        }
      })
      .catch((error) => {
        // Handle errors
        console.error("Error:", error);
        store.value.state.snackbar.text = "Lỗi khi thêm vào danh sách lịch hẹn";
        store.value.state.snackbar.timeout = 4500;
        store.value.state.snackbar.state = true;
      });
  } catch (error) {
    console.log("lỗi", error);
  }
  // Đóng circle load
  store.value.state.single_progress_circular.state = false;
  store.value.state.single_progress_circular.icon = "";
  store.value.state.single_progress_circular.title = "";
};
async function acceptUpdatePack() {
  console.log("Chạy circle load");
  // Chạy circle load
  store.value.state.single_progress_circular.icon = "mdi-calendar-range";
  store.value.state.single_progress_circular.title = "Đang cập nhật...";
  store.value.state.single_progress_circular.state = true;

  console.log(store.value.data.packageAdd);
  await filtersStore.value.updatePakageSchedule();
  console.log("Chạy xong circle load");
  dialogUpdate.value = false;
  // Đóng circle load
  store.value.state.single_progress_circular.state = false;
  store.value.state.single_progress_circular.icon = "";
  store.value.state.single_progress_circular.title = "";
}

// hàm xử lý chính
function resetRegisterAdded() {
  // còn lại
  store.value.data.packageAdd.real_num_available += register_patients_add.value;
  available_patients.value += register_patients_add.value;
  old_available_patients.value = available_patients.value;

  // còn trống
  empty_slots.value += register_patients_add.value;
  store.value.data.scheduleEvents[
    tempEventEdit_id.value
  ].extendedProps.slot_registered -= register_patients_add.value;

  // rút gọn tên biến
  const session_name =
    store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
      .session_name;
  const session_slot =
    store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
      .session_slot;
  const slot_registered =
    store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
      .slot_registered;

  // cập nhật giá trị buổi
  store.value.data.scheduleEvents[
    tempEventEdit_id.value
  ].title = `Ca ${session_name}\t|\t${
    this.store.data.shift[Number(session_name) - 1].time
  }\t|\t${slot_registered}/${session_slot}`;

  store.value.data.scheduleEvents[tempEventEdit_id.value].backgroundColor =
    "green";

  // số lượng đã đăng ký
  store.value.data.scheduleEvents[
    tempEventEdit_id.value
  ].extendedProps.register_patients_add = 0;
  register_patients_add.value = 0;

  // xóa buổi của gói
  let index = store.value.data.packageAdd.session_packs.findIndex(
    (item) =>
      item.appointment_session_id === tempAppointmentSessionEdit_id.value
  );
  if (index !== -1) {
    store.value.data.tempDeleteSessionPacks.push(
      store.value.data.packageAdd.session_packs[index]
    );
    console.log(
      "store.value.data.tempDeleteSessionPacks",
      store.value.data.tempDeleteSessionPacks
    );
    store.value.data.packageAdd.session_packs.splice(index, 1);
    console.log(`Đã xóa phần tử với id ${tempAppointmentSessionEdit_id.value}`);
    console.log("store.value.data.packageAdd", store.value.data.packageAdd);
  } else {
    console.log(
      `Không tìm thấy phần tử với id ${tempAppointmentSessionEdit_id.value}`
    );
  }
  console.log(store.value.data.packageAdd.session_packs);
}

const findTempDeleteSessionPack = (session_id) => {
  console.log("findTempDeleteSessionPack", session_id);
  const tempDeleteSessionPacks = store.value.data.tempDeleteSessionPacks;
  console.log("tempDeleteSessionPacks", tempDeleteSessionPacks);
  console.log("tempDeleteSessionPacks.length", tempDeleteSessionPacks.length);
  let tempObj = {
    // id gói-buổi
    id: 0,
    // id buổi
    appointment_session_id: 0,
    // id gói khám
    pack_id: 0,
    // có tồn tại
    is_exist: false,
    // số lượng của gói trong buổi
    total_slot: 0,
  };
  if (tempDeleteSessionPacks?.length > 0) {
    tempDeleteSessionPacks.forEach((obj) => {
      console.log("obj.appointment_session_id", obj.appointment_session_id);
      if (obj.appointment_session_id.toString() === session_id.toString()) {
        console.log(
          "obj.appointment_session_id.toString() === session_id.toString()",
          obj.appointment_session_id.toString() === session_id.toString()
        );
        console.log("obj", obj);
        tempObj = obj;
      }
    });
  }
  return tempObj;
};
// lưu gói khám và lịch khám
const save = async () => {
  // console.log("checkNumber", checkNumber(Number(register_patients.value)));
  if (
    !Number.isInteger(Number(register_patients.value)) ||
    Number(register_patients.value) <= 0
  ) {
    console.log(store.value.state);
    store.value.state.snackbar.state = true;
    store.value.state.snackbar.text =
      "Số lượng người đăng ký khám phải lớn hơn 0!";
  } else {
    console.log("tempEventEdit_id.value", tempEventEdit_id.value);
    tempSessionPack.value.total_slot = Number(register_patients.value);

    let isExistSessionID = false;
    if (store.value.data.packageAdd?.session_packs?.length > 0) {
      console.log("đã thêm trước đó!");
      console.log(
        "packageAdd.session_packs",
        store.value.data.packageAdd.session_packs
      );
      for (
        let index = 0;
        index < store.value.data.packageAdd.session_packs.length;
        index++
      ) {
        const tempDataSSP = store.value.data.packageAdd.session_packs[index];
        const tempDataScheduleEvents =
          store.value.data.scheduleEvents[tempEventEdit_id.value];
        console.log(
          "tempDataScheduleEvents?.extendedProps?.appointment_session_id?.toString()",
          tempDataScheduleEvents?.extendedProps?.appointment_session_id?.toString()
        );
        console.log(
          `findTempDeleteSessionPack(
            tempDataScheduleEvents?.extendedProps?.appointment_session_id
          )?.appointment_session_id?.toString()`,
          findTempDeleteSessionPack(
            tempDataScheduleEvents?.extendedProps?.appointment_session_id
          )?.appointment_session_id?.toString()
        );
        if (
          tempDataSSP.appointment_session_id?.toString() ===
          tempDataScheduleEvents.extendedProps?.appointment_session_id?.toString()
        ) {
          if (tempDataSSP?.total_slot) {
            // if (
            //   tempDataScheduleEvents?.extendedProps?.appointment_session_id?.toString() ===
            //   findTempDeleteSessionPack(
            //     tempDataScheduleEvents?.extendedProps?.appointment_session_id
            //   )?.appointment_session_id?.toString()
            // ) {
            //   const findTempDelete = findTempDeleteSessionPack(
            //     tempDataScheduleEvents?.extendedProps?.appointment_session_id
            //   );
            //   tempSessionPack.value.id = findTempDelete.id
            //     ? findTempDelete.id
            //     : null;
            //   console.log("findTempDelete", findTempDelete);
            //   console.log("findTempDelete.is_exist", findTempDelete.is_exist);
            //   tempSessionPack.value.is_exist = findTempDelete.is_exist
            //     ? findTempDelete.is_exist
            //     : null;
            //   console.log("tempSessionPack", tempSessionPack);
            //   store.value.data.packageAdd.session_packs.push(
            //     tempSessionPack.value
            //   );

            //   store.value.data.tempDeleteSessionPacks =
            //     store.value.data.tempDeleteSessionPacks.filter(
            //       (temp) =>
            //         temp.appointment_session_id !==
            //         findTempDelete.appointment_session_id
            //     );
            //   isExistSessionID = true;
            // } else {
            console.log(
              "chạy vô cộng lặp",
              store.value.data.packageAdd.session_packs[index].total_slot
            );
            store.value.data.packageAdd.session_packs[index].total_slot +=
              tempSessionPack.value.total_slot;
            isExistSessionID = true;
            // }
          }
        }
      }
    }
    if (!isExistSessionID) {
      tempSessionPack.value.is_exist = false;
      tempSessionPack.value.pack_id = store.value.data.packageAdd.id;
      console.log("chưa có!");
      store.value.data.packageAdd.session_packs.push(tempSessionPack.value);
    }

    console.log(store.value.data.packageAdd.session_packs);

    tempSessionPack.value = {};

    store.value.data.scheduleEvents[
      tempEventEdit_id.value
    ].extendedProps.slot_registered += Number(register_patients.value);
    // rút gọn tên biến
    const session_name =
      store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
        .session_name;
    const session_slot =
      store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
        .session_slot;
    const slot_registered =
      store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
        .slot_registered;

    // cập nhật giá trị buổi
    store.value.data.scheduleEvents[
      tempEventEdit_id.value
    ].title = `Ca ${session_name}\t|\t${
      store.value.data.shift[Number(session_name) - 1].time
    }\t|\t${slot_registered}/${session_slot}`;
    old_available_patients.value -= register_patients.value;
    console.log(
      "extendedProps.register_patients_add",
      store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
        .register_patients_add
    );
    if (
      store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
        .register_patients_add
    ) {
      store.value.data.scheduleEvents[
        tempEventEdit_id.value
      ].extendedProps.register_patients_add += Number(register_patients.value);
      register_patients.value = 0;
    } else {
      store.value.data.scheduleEvents[
        tempEventEdit_id.value
      ].extendedProps.register_patients_add = Number(register_patients.value);
    }

    if (
      store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
        .slot_registered -
        store.value.data.scheduleEvents[tempEventEdit_id.value].extendedProps
          .session_slot ===
      0
    ) {
      store.value.data.scheduleEvents[tempEventEdit_id.value].backgroundColor =
        "orange";
    } else {
      store.value.data.scheduleEvents[tempEventEdit_id.value].backgroundColor =
        "#68cd00";
    }

    // reload lịch
    store.value.state.isShowSchedule = !store.value.state.isShowSchedule;
    store.value.state.isShowSchedule = !store.value.state.isShowSchedule;
    dialog.value = false;
  }
};

// fetch lịch
const fetchSchedule = async () => {
  try {
    await axios
      .get(`${useRuntimeConfig().public.DOMAIN}/select-appointments`, {
        params: {
          internal_hospital_id: localStorage.getItem("internal_hospital_id"),
        },
      })
      .then(async (response) => {
        console.log(
          "response.data",
          response?.data?.his_ace_appointment_schedules
        );

        console.log(
          "store scheduleEvents first",
          store.value.data.scheduleEvents
        );
        console.log(
          "store scheduleEvents second",
          store.value.data.scheduleEvents
        );
        // this.posts = response.data;
        let appointmentSchedules = [];
        if (response?.data?.his_ace_appointment_schedules) {
          appointmentSchedules = response?.data?.his_ace_appointment_schedules;
        }

        store.value.data.scheduleEvents = [];
        if (appointmentSchedules?.length > 0) {
          for (let index = 0; index < appointmentSchedules.length; index++) {
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
                  },
                  backgroundColor: "#00407e",
                };
                tempEvent.date = appointmentSchedules[index].date;
                tempEvent.extendedProps.appointment_session_id =
                  cloneSessions[j].id;
                if (cloneSessions[j].name) {
                  tempEvent.title = `Ca ${j + 1} | ${
                    this.store.data.shift[j].time
                  } \t|\t `;
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
                store.value.data.scheduleEvents.push(tempEvent);
              }
            }
          }
        } else if (appointmentSchedules?.length === 0) {
        }

        store.value.state.isShowSchedule = true;
      })

      .catch((e) => {
        console.log("không có data", e);
      });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
</script>
<style scoped>
.btn_add_schedule {
  background: linear-gradient(to left, #c1cbd1, transparent, #c1cbd1);
}
.schedule_dialog {
  width: 50vw;
}

/* xs */
@media only screen and (max-width: 576px) {
  .schedule_dialog {
    width: 100vw;
  }
}

/* sm */
@media only screen and (min-width: 576px) {
  .schedule_dialog {
    width: 100vw;
  }
}

/* md */
@media only screen and (min-width: 768px) {
}

/* lg */
@media only screen and (min-width: 992px) {
}

/* xl */
@media only screen and (min-width: 1200px) {
  .schedule_dialog {
    width: 50vw;
  }
}

/* xxl */
@media only screen and (min-width: 1400px) {
}
</style>