<template>
  <v-skeleton-loader
    v-if="circle_loader.state"
    class="mx-auto ma-2"
    elevation="12"
    max-width="100%"
    type="subtitle, table"
  ></v-skeleton-loader>
  <v-card-title v-if="!circle_loader.state">
    <v-row>
      <v-col style="font-size: 15px"> DANH SÁCH GÓI KHÁM CHỜ DUYỆT</v-col>
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
    v-if="!circle_loader.state"
    v-model:expanded="expanded"
    :style="isDisable()"
    :headers="headers"
    :items="packages_"
    :search="search"
    show-expand
  >
    <template v-slot:item.schedules="{ item }">
      <div
        v-for="item2 in item.appointment_company_service_packs"
        :key="item2.id"
        style="white-space: pre-wrap; margin: 7px 0 7px 0"
      >
        <span
          style="
            background-color: #1867c0;
            color: white;
            border-radius: 7px;
            padding: 3.5px;
            border: 1px solid #98e055;
          "
          >{{
            filtersStore.DataDateToValDate(
              item2.appointment_session.appointment_schedule.date
            )
          }}</span
        >&nbsp;-&nbsp; Ca
        <span style="font-weight: bold">
          {{ item2.appointment_session.name }}
        </span>
        <span style="font-size: 11px">
          ({{
            store.data.shift[Number(item2.appointment_session.name) - 1]?.time
          }})
        </span>
        &nbsp;-&nbsp; số lượng:
        <span style="font-weight: bold">{{ item2.total_slot }}</span
        >&nbsp;
        <v-tooltip text="Xóa buổi khám" location="bottom">
          <template v-slot:activator="{ props }">
            <v-icon
              v-bind="props"
              size="small"
              class="me-2"
              @click="deleteSessionPack(item2)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-tooltip>
        <br />
      </div>
    </template>
    <template v-slot:item.actions="{ item }">
      <!-- <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileChange"
        accept=".xlsx"
      />
      <v-tooltip text="Gửi danh sách người khám">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="triggerFileInput(item)"
          >
            mdi-account-multiple-plus
          </v-icon>
        </template>
      </v-tooltip> -->
      <v-tooltip text="Duyệt gói khám">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="acceptPackage(item)"
          >
            mdi-briefcase-check
          </v-icon>
        </template>
      </v-tooltip>
      <!-- <v-tooltip text="Sửa thông tin gói khám" location="top">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
        </template>
      </v-tooltip>
      <br />
      <v-tooltip text="Sửa lịch gói khám">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="fetchAppointment(item)"
          >
            mdi-calendar-edit
          </v-icon>
        </template>
      </v-tooltip> -->
      <v-tooltip text="Từ chối gói khám" location="bottom">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="deleteItem(item)"
          >
            mdi-close-box
          </v-icon>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="fetchFirstData()"> Reset </v-btn>
    </template>

    <template v-slot:expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length">
          <v-card class="mx-auto ma-2" style="background-color: #cedee7">
            <Patients :pack_id="item.id" :is_follow_pack="true" />
          </v-card>
        </td>
      </tr>
    </template>
  </v-data-table>

  <!-- Dialog xác nhận xóa thông tin gói khám -->
  <v-dialog width="auto" v-model="dialogDelete" max-width="50vw">
    <v-card>
      <v-card-text class="text-h7">
        <v-row justify="center" style="text-align: center">
          Từ chối gói&nbsp;<b>{{ editedPackage.name }}</b
          >&nbsp;?
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogDelete = false"
          >Đóng</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm"
          >Xác nhận</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog import danh sách bệnh nhân -->
  <v-dialog v-model="dialogImport" max-width="50vw">
    <v-card>
      <v-card-text>
        <v-row justify="center" style="text-align: center"
          >Xác nhận gửi danh sách&nbsp;<b>{{ selectedFileName }}</b
          >&nbsp;vào dữ liệu?</v-row
        >
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogImport = false"
          >Đóng</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="acceptImport"
          >Xác nhận</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận duyệt gói khám -->
  <v-dialog v-model="dialogConfirmDeleteSessionPack" max-width="50vw">
    <v-card>
      <v-card-text>
        <v-row justify="center" style="text-align: center"
          >Xác nhận xóa buổi khám&nbsp;<b>{{
            editedSessionPack.appointment_session.appointment_schedule.date
          }}</b
          >?</v-row
        >
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogConfirmDeleteSessionPack = false"
          >Đóng</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="deleteSessionPackConfirm"
          >Xác nhận</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Dialog xác nhận duyệt gói khám -->
  <v-dialog v-model="dialogConfirmAcceptPack" max-width="50vw">
    <v-card>
      <v-card-text>
        <v-row justify="center" style="text-align: center"
          >Xác nhận duyệt gói khám&nbsp;<b>{{ editedPackage.name }}</b
          >?</v-row
        >
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogConfirmAcceptPack = false"
          >Đóng</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="acceptPackageConfirm"
          >Xác nhận</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

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
  <v-dialog persistent v-model="this.single_circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(112, 171, 78, 0.85)"
    >
      <div>
        <v-row justify="center" style="margin: 1rem">
          <v-col
            v-if="this.single_circle_loader.title"
            cols="12"
            style="text-align: center; color: white"
            >{{ this.single_circle_loader.title }}</v-col
          >
          <v-col cols="12" style="text-align: center">
            <v-progress-circular
              :size="70"
              :width="7"
              color="white"
              indeterminate
            >
              <v-icon v-if="this.circle_loader.icon">{{
                this.single_circle_loader.icon
              }}</v-icon>
            </v-progress-circular>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>

  <!-- Dialog sửa gói khám -->
  <v-dialog v-model="dialogEdit" max-width="50vw">
    <v-card>
      <v-card-title style="text-align: center; color: #4da1eb">
        SỬA GÓI KHÁM
      </v-card-title>
      <v-card-text>
        <v-row justify="center" style="text-align: center">
          <v-col cols="12">
            <v-text-field
              v-model="editedPackage.name"
              label="Tên gói khám"
              color="#4da1eb"
              variant="outlined"
            >
            </v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="editedPackage.number_of_employees"
              label="Số người khám"
              color="#4da1eb"
              variant="outlined"
              :rules="[numberRule]"
            >
            </v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="editedPackage.price"
              label="Giá gói khám"
              color="#4da1eb"
              variant="outlined"
              :rules="[numberRule]"
            >
            </v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="editedPackage.register_year"
              label="Năm"
              color="#4da1eb"
              variant="outlined"
              :rules="[numberRule]"
            >
            </v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="dialogEdit = false"
          >Đóng</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="acceptUpdate"
          >Xác nhận</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <Snackbar />
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import * as XLSX from "xlsx";
import Snackbar from "../utilities/Snackbar.vue";
import PatientsOfPack from "./PatientsOfPack.vue";
import Patients from "./Patients.vue";

export default {
  name: "company_packages",
  props: ["company_id"],
  components: {
    Snackbar,
    PatientsOfPack,
    Patients,
  },
  data: () => ({
    // --base variable
    // dialog display
    dialog: false,
    dialogDelete: false,
    dialogPackage: false,
    dialogImport: false,
    dialogEdit: false,
    dialogConfirmAcceptPack: false,
    dialogConfirmDeleteSessionPack: false,
    expanded: [],

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

    // other
    selectedFileName: null,
    display_style: "none",
    store: storeToRefs(useFiltersStore()),
    filtersStore: useFiltersStore(),
    search: "",
    editedPackageIndex: -1,

    // --array variable
    headers: [
      {
        align: "start",
        key: "stt",
        sortable: false,
        title: "STT",
      },
      { key: "company.name", title: "Tên công ty" },
      { key: "name", title: "Tên gói khám" },
      { key: "number_of_employees", title: "Số lượng người tham gia" },
      { key: "price", title: "Giá gói khám" },
      { key: "register_year", title: "Năm" },
      { key: "schedules", title: "Lịch khám" },
      { title: "Actions", key: "actions", sortable: false },
    ],
    packages_: [
      {
        stt: null,
        id: null,
        name: null,
        company_id: null,
        register_year: 0,
        price: 0,
        number_of_employees: 0,
        appointment_company_service_packs: [
          {
            id: null,
            total_slot: 0,
            appointment_session: {
              id: null,
              name: null,
              appointment_schedule: {
                id: null,
                date: null,
              },
            },
          },
        ],
      },
    ],

    // --object variable
    editedPackage: {
      stt: null,
      id: null,
      name: null,
      company_id: null,
      register_year: 0,
      price: 0,
      number_of_employees: 0,
      appointment_company_service_packs: [
        {
          id: null,
          total_slot: 0,
          appointment_session: {
            id: null,
            name: null,
            appointment_schedule: {
              id: null,
              date: null,
            },
          },
        },
      ],
    },
    editedSessionPack: {
      id: null,
      total_slot: 0,
      appointment_session: {
        id: null,
        name: null,
        appointment_schedule: {
          id: null,
          date: null,
        },
      },
    },
    defaultPackage: {
      stt: null,
      id: null,
      name: null,
      company_id: null,
      register_year: 0,
      price: 0,
      number_of_employees: 0,
      appointment_company_service_packs: [
        {
          id: null,
          total_slot: 0,
          appointment_session: {
            id: null,
            name: null,
            appointment_schedule: {
              id: null,
              date: null,
            },
          },
        },
      ],
    },

    patient_: [
      {
        fullname: "",
        phong_number: "",
        birthday: "",
        email: "",
        appointment_date: "",
        session: "",
      },
    ],

    // --rules config
    numberRule: (v) => {
      if (v) {
        if (/^[0-9-/]*$/.test(v)) {
          return true;
        } else {
          return "Không được có khoảng trắng và kí tự";
        }
      }
      return false;
    },
  }),

  async mounted() {
    if (this.store.state.isLogin) {
      if (!this.packages_[0]?.id) {
        await this.fetchFirstData();
      }
    }
  },

  watch: {
    async "store.state.isLogin"() {
      if (this.store.state.isLogin) {
        if (!this.packages_[0]?.id) {
          await this.fetchFirstData();
        }
      }
    },

    dialogImport(newVal, oldVal) {
      if (newVal === false) {
        this.$refs.fileInput.value = null;
      }
    },
    dialogDelete(newVal, oldVal) {
      if (newVal === false) {
        this.closeDelete();
      }
    },
  },
  methods: {
    async fetchFirstData() {
      this.circle_loader.icon = "mdi-medical-bag";
      this.circle_loader.state = true;
      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/browse-packs`)
        .then((response) => {
          if (response?.data?.his_ace_company_service_packs) {
            this.packages_ = response?.data?.his_ace_company_service_packs;
          }
          if (this.packages_ && this.packages_.length > 0) {
            let stt = 0;
            for (let index = 0; index < this.packages_.length; index++) {
              this.packages_[index].stt = ++stt;
            }
          }
        })
        .catch((e) => {
          console.log("không có data", e);
        });
      this.circle_loader.state = false;
      this.circle_loader.icon = "";
    },

    async fetchAppointment(item) {
      this.fetching = true;
      console.log("item", item);
      this.store.data.packageAdd = item;
      this.store.data.packageAdd.session_packs = [];
      this.store.data.packageAdd.real_num_available =
        this.store.data.packageAdd.number_of_employees;
      console.log("this.store.data.packageAdd", this.store.data.packageAdd);
      this.circle_loader.state = true;
      this.circle_loader.icon = "mdi-calendar-today";
      try {
        const headers = {
          authentication: localStorage.getItem("loginToken")
            ? localStorage.getItem("loginToken")
            : "",
        };
        await axios
          .get(
            `${useRuntimeConfig().public.DOMAIN}/select-appointments-mutate`,
            {
              params: {
                internal_hospital_id: localStorage.getItem(
                  "internal_hospital_id"
                ),
                headers,
              },
            }
          )
          .then(async (response) => {
            console.log(
              "response.data",
              response?.data?.his_ace_appointment_schedules
            );

            // console.log(
            //   "store scheduleEvents first",
            //   this.store.data.scheduleEvents
            // );
            let appointmentSchedules = [];
            if (response?.data?.his_ace_appointment_schedules) {
              appointmentSchedules =
                response?.data?.his_ace_appointment_schedules;
            }
            if (appointmentSchedules.length > 0) {
              this.store.data.scheduleEvents = [];
              let index_session = 0;
              for (
                let index = 0;
                index < appointmentSchedules.length;
                index++
              ) {
                const cloneSessions =
                  appointmentSchedules[index]?.appointment_sessions;
                // console.log("cloneSessions", cloneSessions);
                // console.log("cloneSessions.length", cloneSessions.length);

                // bắt đầu cấu hình cho sự kiện để hiển thị trong lịch
                if (cloneSessions.length > 0) {
                  for (let j = 0; j < cloneSessions.length; j++) {
                    const tempEvent = {
                      title: null,
                      date: null,
                      start: null,
                      end: null,
                      extendedProps: {
                        id: index_session++,
                        appointment_session_id: null,
                        session_name: null,
                        session_slot: null,
                        slot_registered: null,
                        state: "edit_pack",
                        is_edit: false,
                      },
                      backgroundColor: "00407e",
                    };
                    tempEvent.date = appointmentSchedules[index].date;

                    tempEvent.extendedProps.appointment_session_id =
                      cloneSessions[j].id;
                    if (cloneSessions[j].name) {
                      tempEvent.title = `Ca ${j + 1} | ${
                        this.store.data.shift[j].time
                      } \t|\t `;
                      tempEvent.extendedProps.session_name =
                        cloneSessions[j].name;
                    }
                    // console.log("cloneSessions[j].name", cloneSessions[j].name);
                    let totalSlots = 0;
                    const companyPacks =
                      cloneSessions[j].appointment_company_service_packs;
                    if (companyPacks) {
                      for (let k = 0; k < companyPacks.length; k++) {
                        totalSlots += Number(companyPacks[k].total_slot);
                      }
                      tempEvent.title += `\t${totalSlots}`;
                      tempEvent.extendedProps.slot_registered = totalSlots;
                    } else {
                      tempEvent.title += `\t0`;
                      tempEvent.extendedProps.session_slot = 0;
                    }
                    tempEvent.title += `/${cloneSessions[j].total_slot}`;
                    tempEvent.extendedProps.session_slot =
                      cloneSessions[j].total_slot;
                    if (totalSlots === Number(cloneSessions[j].total_slot)) {
                      tempEvent.backgroundColor = "red";
                    } else {
                      tempEvent.backgroundColor = "green";
                      tempEvent.extendedProps.is_edit = true;
                    }
                    // console.log("tempEvent", tempEvent);
                    this.store.data.scheduleEvents.push(tempEvent);
                    // console.log(
                    //   "this.store.data.scheduleEvents.push",
                    //   this.store.data.scheduleEvents
                    // );
                    if (
                      cloneSessions[j].appointment_company_service_packs
                        ?.length > 0
                    ) {
                      console.log("tempSessionPacks");
                      const tempSessionPacks =
                        cloneSessions[j].appointment_company_service_packs;
                      tempSessionPacks.forEach((obj) => {
                        // chỗ này không thỏa
                        if (
                          obj["company_service_pack_id"] ===
                          this.store.data.packageAdd.id
                        ) {
                          // tempEvent.extendedProps.register_patients_add = this.store.data.packageAdd.session_packs

                          console.log("obj", obj);
                          this.store.data.packageAdd.session_packs.push({
                            id: obj.id,
                            is_exist: true,
                            appointment_session_id: cloneSessions[j].id,
                            total_slot: obj["total_slot"],
                          });

                          //
                          tempEvent.extendedProps.register_patients_add =
                            obj["total_slot"];
                          this.store.data.packageAdd.real_num_available -=
                            tempEvent.extendedProps.register_patients_add;

                          console.log(
                            "cloneSessions[j].id",
                            cloneSessions[j].id,
                            "totalSlots",
                            totalSlots
                          );
                          tempEvent.extendedProps.is_edit = true;
                          if (
                            totalSlots === Number(cloneSessions[j].total_slot)
                          ) {
                            tempEvent.backgroundColor = "orange";
                            console.log("change orange");
                          } else {
                            tempEvent.backgroundColor = "#68cd00";
                          }
                        }
                      });
                    }
                  }
                }
              }
              // console.log(
              //   "store scheduleEvents",
              //   this.store.data.scheduleEvents
              // );
            } else if (appointmentSchedules?.length === 0) {
            }
            this.store.state.isShowSchedule = true;
            this.store.state.dialogAppointment = true;
            this.store.state.isEditPackage = true;
          })

          .catch((e) => {
            console.log("không có data", e);
          });
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      this.state = false;
      this.icon = "";
      this.store.state.dialogAcceptPakageSchedule = false;

      this.fetching = false;
    },

    deleteSessionPack(item2) {
      this.editedSessionPack = Object.assign({}, item2);
      this.dialogConfirmDeleteSessionPack = true;
    },

    acceptPackage(item) {
      this.editedPackageIndex = this.packages_.indexOf(item);
      this.editedPackage = Object.assign({}, item);
      this.dialogConfirmAcceptPack = true;
    },

    async acceptPackageConfirm() {
      console.log("confirm pack");
      console.log("this.editedPackageIndex.id", this.editedPackage.id);
      await this.filtersStore.browsePack(this.editedPackage.id);
      this.dialogConfirmAcceptPack = false;
      this.fetchFirstData();
    },
    async deleteSessionPackConfirm() {
      console.log("confirm pack");
      await this.filtersStore.deleteSessionPack(this.editedSessionPack.id);
      this.dialogConfirmDeleteSessionPack = false;
      this.fetchFirstData();
    },

    triggerFileInput(item) {
      // Kích thích sự kiện click cho input[type=file] ẩn
      this.$refs.fileInput.click();
      this.editedPackageIndex = this.packages_.indexOf(item);
      this.editedPackage = Object.assign({}, item);
    },

    handleFileChange(event) {
      // Xử lý khi có sự thay đổi trong file
      const selectedFile = event.target.files[0];

      // Kiểm tra định dạng của file
      if (
        selectedFile &&
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        this.selectedFileName = selectedFile.name;
        // Thực hiện các xử lý khác dựa trên file CSV đã chọn
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          // Lấy dữ liệu từ sheet đầu tiên (hoặc sheet cụ thể nếu cần)
          const sheetName = workbook.SheetNames[0];
          const sheetData = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName]
          );

          // Thực hiện các xử lý khác dựa trên dữ liệu từ file XLSX đã chọn
          if (sheetData) {
            this.patient_ = [];
            for (let index = 0; index < sheetData.length; index++) {
              const tempPatient = {
                fullname: "",
                phong_number: "",
                birthday: "",
                email: "",
                appointment_date: "",
                session: "",
              };
              if (sheetData[index]["Họ tên"]) {
                tempPatient.fullname = sheetData[index]["Họ tên"];
              }
              if (sheetData[index]["Số điện thoại"]) {
                tempPatient.phong_number = sheetData[index]["Số điện thoại"];
              }
              if (sheetData[index]["Ngày sinh"]) {
                tempPatient.birthday = sheetData[index]["Ngày sinh"];
              }
              if (sheetData[index]["Email"]) {
                tempPatient.email = sheetData[index]["Email"];
              }
              if (sheetData[index]["Ngày hẹn"]) {
                tempPatient.appointment_date = sheetData[index]["Ngày hẹn"];
              }
              if (sheetData[index]["Buổi"]) {
                tempPatient.session = sheetData[index]["Buổi"];
              }
              this.patient_.push(tempPatient);
            }
            this.dialogImport = true;
          }
        };

        // Đọc file dưới dạng array buffer
        reader.readAsArrayBuffer(selectedFile);
      } else {
        console.error("Invalid file format. Please select a XLSX file.");
        // Xử lý khi file không đúng định dạng
      }

      // Thực hiện các xử lý khác dựa trên file đã chọn
    },

    isDisable() {
      if (this.store.state.isLogin) {
        this.display_style = "block";
      } else {
        this.display_style = "none";
      }
      return `display: ${this.display_style};`;
    },

    // ValDateToDataDate(date) {
    //   let strDate = date;
    //   if (!(typeof 1 === "string")) {
    //     strDate = date.toString();
    //   }
    //   let dateConverted = "";
    //   if (Number.isInteger(Number(strDate))) {
    //     const [dd, mm, yyyy] = new Date(strDate)
    //       .toISOString()
    //       .split("T")[0]
    //       .split("-");
    //     const dateObject = new Date(`${yyyy}-${mm}-${dd}`);
    //     dateConverted = dateObject.toISOString().split("T")[0];
    //   } else if (strDate.includes("-")) {
    //     const [dd, mm, yyyy] = strDate.split("-");
    //     const dateObject = new Date(`${yyyy}-${mm}-${dd}`);
    //     dateConverted = dateObject.toISOString().split("T")[0];
    //   } else if (strDate.includes("/")) {
    //     const [dd, mm, yyyy] = strDate.split("/");
    //     const dateObject = new Date(`${yyyy}-${mm}-${dd}`);
    //     dateConverted = dateObject.toISOString().split("T")[0];
    //   }
    //   return dateConverted;
    // },

    editItem(item) {
      this.editedPackage = {};
      this.editedPackage = Object.assign({}, item);
      this.dialogEdit = true;
    },

    async acceptUpdate() {
      if (!this.editedPackage.name) {
        this.store.state.snackbar = this.store.state.snackbar_error;
        this.store.state.snackbar.text = "Không đúng định dạng!";
        this.store.state.snackbar.state = true;
      } else if (
        this.numberRule(this.editedPackage.number_of_employees) !== true
      ) {
        this.store.state.snackbar = this.store.state.snackbar_error;
        this.store.state.snackbar.text =
          "Số lượng người khám không đúng định dạng!";
        this.store.state.snackbar.state = true;
      } else if (this.numberRule(this.editedPackage.price) !== true) {
        this.store.state.snackbar = this.store.state.snackbar_error;
        this.store.state.snackbar.text = "Giá gói khám không đúng định dạng!";
        this.store.state.snackbar.state = true;
      } else if (this.numberRule(this.editedPackage.register_year) !== true) {
        this.store.state.snackbar = this.store.state.snackbar_error;
        this.store.state.snackbar.text =
          "Năm đăng ký gói khám không đúng định dạng!";
        this.store.state.snackbar.state = true;
      } else {
        const tempEditPackage = {
          id: this.editedPackage.id,
          name: this.editedPackage.name,
          number_of_employees: this.editedPackage.number_of_employees,
          price: this.editedPackage.price,
          register_year: this.editedPackage.register_year,
        };
        console.log("tempEditPackage", tempEditPackage);
        await this.filtersStore.updatePackInfo(tempEditPackage);
        await this.fetchFirstData();
        this.dialogEdit = false;
      }
    },

    deleteItem(item) {
      this.editedPackage = {};
      this.editedPackage = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.single_circle_loader.icon = "mdi-content-save-settings";
      this.single_circle_loader.title = "Đang thực hiện...";
      this.single_circle_loader.state = true;
      await axios
        .post(`${useRuntimeConfig().public.DOMAIN}/update-pack-status`, {
          pack_id: this.editedPackage.id,
          status: 2,
        })
        .then((response) => {
          if (response?.data) {
            this.packages_.splice(this.editedPackageIndex, 1);
            // thông báo thành công
            this.store.state.snackbar = this.store.state.snackbar_default;
            this.store.state.snackbar.text = "Xóa thành công!";
            this.store.state.snackbar.state = true;

            // Đóng circle load
            this.single_circle_loader.state = false;
            this.single_circle_loader.icon = "";
            this.single_circle_loader.title = "";

            // Load lại danh sách gói khám
            this.store.state.isReFetch = true;

            this.dialogDelete = false;

            this.fetchFirstData();
          }
        })
        .catch((e) => {
          console.log("không có data", e);
          // thông báo không thành công
          this.store.state.snackbar = this.store.state.snackbar_error;
          this.store.state.snackbar.text = "Xóa không thành công!";
          this.store.state.snackbar.state = true;

          // Đóng circle load
          this.single_circle_loader.state = false;
          this.single_circle_loader.icon = "";
          this.single_circle_loader.title = "";
        });
      this.dialogDelete = false;
    },

    closeDelete() {
      this.$nextTick(() => {
        this.editedPackage = Object.assign({}, this.defaultPackage);
        this.editedPackageIndex = -1;
      });
    },
    closeImport() {
      this.dialogImport = false;
    },
    async acceptImport() {
      this.single_circle_loader.icon = "mdi-content-save-settings";
      this.single_circle_loader.title = "Đang thực hiện...";
      this.single_circle_loader.state = true;
      if (
        this.editedPackage.id &&
        this.editedPackage.company_id &&
        this.editedPackage.appointment_company_service_packs?.length > 0
      ) {
        if (this.patient_?.length > 0) {
          const variables = [];
          for (
            let indexPatient = 0;
            indexPatient < this.patient_.length;
            indexPatient++
          ) {
            const variable = {};
            variable.package_id = this.editedPackage.id;
            variable.company_id = this.editedPackage.company_id;
            if (
              this.editedPackage.appointment_company_service_packs?.length > 0
            ) {
              const appointment_packs =
                this.editedPackage.appointment_company_service_packs;
              for (let index = 0; index < appointment_packs.length; index++) {
                if (
                  appointment_packs[index].appointment_session?.name &&
                  appointment_packs[
                    index
                  ].appointment_session.name.toString() ===
                    this.patient_[indexPatient].session.toString() &&
                  appointment_packs[index].appointment_session
                    .appointment_schedule?.date &&
                  appointment_packs[
                    index
                  ].appointment_session.appointment_schedule.date.toString() ===
                    this.filtersStore.ValDateToDataDate(
                      this.patient_[indexPatient].appointment_date
                    ) &&
                  appointment_packs[index].appointment_session.id
                ) {
                  variable.session_id =
                    appointment_packs[index].appointment_session.id;
                }
              }
            }
            variable.fullname = this.patient_[indexPatient].fullname;
            variable.phong_number = this.patient_[indexPatient].phong_number;
            variable.birthday = this.filtersStore.ValDateToDataDate(
              this.patient_[indexPatient].birthday
            );
            variable.email = this.patient_[indexPatient].email;
            variables.push(variable);
            this.dialogImport = false;
          }
          let returning = [];
          try {
            await axios
              .post(
                `${useRuntimeConfig().public.DOMAIN}/add-patient-appointment`,
                {
                  variables: variables,
                }
              )
              .then((response) => {
                if (response.data) {
                  this.store.state.snackbar = this.store.state.snackbar_default;

                  this.store.state.snackbar.text =
                    "Import dánh sách bệnh nhân thành công!";
                  this.store.state.snackbar.timeout = 3500;
                  this.store.state.snackbar.state = true;
                  console.log("response.data", response.data);
                  if (response.data.data?.insert_his_ace_patients?.returning) {
                    returning =
                      response.data.data?.insert_his_ace_patients?.returning;
                  }
                }
              })
              .catch((e) => {
                // thông báo không thành công
                this.store.state.snackbar = this.store.state.snackbar_error;
                this.store.state.snackbar.text = "Import không thành công!";
                this.store.state.snackbar.state = true;
              });
          } catch (error) {
            // thông báo không thành công
            this.store.state.snackbar = this.store.state.snackbar_error;
            this.store.state.snackbar.text = "Lỗi khi thêm bệnh nhân!";
            this.store.state.snackbar.state = true;

            console.log("lỗi", error);
          }
          if (returning.length > 0) {
            for (let index = 0; index < returning.length; index++) {
              if (returning[index].email) {
                try {
                  this.single_circle_loader.title = `Đang gửi email cho bệnh nhân${
                    returning[index].fullname
                      ? " " + returning[index].fullname
                      : ""
                  }!`;
                  const headers = {
                    authentication: localStorage.getItem("loginToken")
                      ? localStorage.getItem("loginToken")
                      : "",
                  };
                  await axios
                    .post(`${useRuntimeConfig().public.DOMAIN}/send-email`, {
                      variable: returning[index].email,
                      headers,
                    })
                    .then((response) => {
                      if (response.data?.success) {
                        this.store.state.snackbar =
                          this.store.state.snackbar_default;
                        this.store.state.snackbar.text = `Gửi email cho bệnh nhân${
                          returning[index].fullname
                            ? " " + returning[index].fullname
                            : ""
                        } thành công!`;
                        this.store.state.snackbar.timeout = 3500;
                        this.store.state.snackbar.state = true;
                      } else {
                        // thông báo không thành công
                        this.store.state.snackbar =
                          this.store.state.snackbar_error;
                        this.store.state.snackbar.text = `Gửi email cho bệnh nhân${
                          returning[index].fullname
                            ? " " + returning[index].fullname
                            : ""
                        } không thành công!`;
                        this.store.state.snackbar.state = true;

                        console.log("lỗi", error);
                      }
                    });
                } catch (error) {
                  // thông báo không thành công
                  this.store.state.snackbar = this.store.state.snackbar_error;
                  this.store.state.snackbar.text = `Lỗi khi gửi email cho bệnh nhân${
                    returning[index].fullname
                      ? " " + returning[index].fullname
                      : ""
                  }!`;
                  this.store.state.snackbar.state = true;

                  console.log("lỗi", error);
                }
              }
            }
          }
        }
      }
      // Đóng circle load
      this.single_circle_loader.state = false;
      this.single_circle_loader.icon = "";
      this.single_circle_loader.title = "";
      this.fetchFirstData();
    },
  },
};
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>