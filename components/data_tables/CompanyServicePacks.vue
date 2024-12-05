<template>
  <v-skeleton-loader
    v-if="fetching"
    class="mx-auto ma-2"
    elevation="12"
    max-width="100%"
    type="subtitle, table"
    :style="skeletonStyle()"
  ></v-skeleton-loader>
  <v-card-title
    v-if="!fetching"
    :style="
      is_follow_company
        ? `background-color: #e7eef3;
          font-size: 15px`
        : ''
    "
  >
    <v-row>
      <v-col> DANH SÁCH GÓI KHÁM</v-col>
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
      <v-col
        v-if="
          (store.data.user.permission === 'admin' ||
            store.data.user.permission === 'LH') &&
          !is_browse_packs
        "
        cols="auto"
        style="text-align: right"
      >
        <v-btn color="primary" dark class="mb-2" @click="browsePacks">
          Duyệt lịch khám
        </v-btn>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
  </v-card-title>
  <v-data-table
    v-if="!fetching"
    v-model:expanded="expanded"
    :style="dataTableStyle()"
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
        ><br />
      </div>
    </template>

    <!-- Trạng thái gói khám -->
    <template v-slot:item.status="{ item }">
      <div>
        <span
          v-if="item.is_accepted === 1"
          style="
            background-color: lightskyblue;
            color: white;
            border-radius: 7px;
            padding: 3.5px;
            border: 1px solid #98e055;
          "
        >
          Đang chờ
        </span>
        <span
          v-if="item.is_accepted === 2"
          style="
            background-color: gray;
            color: white;
            border-radius: 7px;
            padding: 3.5px;
            border: 1px solid #98e055;
          "
        >
          Đã đóng
        </span>
        <span
          v-if="item.is_accepted === 3"
          style="
            background-color: #98e055;
            color: white;
            border-radius: 7px;
            padding: 3.5px;
            border: 1px solid #98e055;
          "
        >
          Đã duyệt
        </span>
        <br />
        (<b>SL:</b>
        {{ sumAmountAppointment(item.appointment_company_service_packs) }})
      </div>
    </template>
    <template v-slot:item.actions="{ item }">
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileChange"
        accept=".xlsx"
      />
      <v-tooltip
        v-if="is_browse_packs"
        text="Sửa thông tin gói khám"
        location="top"
      >
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
      <v-tooltip
        v-else-if="item.is_accepted === 3"
        text="Gửi danh sách người khám"
      >
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
      </v-tooltip>
      <v-tooltip text="Sửa thông tin gói khám" location="top">
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
      </v-tooltip>
      <v-tooltip text="Xóa gói khám" location="bottom">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
    </template>

    <template v-slot:expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length">
          <v-card class="mx-auto ma-2" style="background-color: #cedee7">
            <Patients
              :pack_info="item"
              :pack_id="item.id"
              :is_follow_pack="true"
            />
          </v-card>
        </td>
      </tr>
    </template>
  </v-data-table>

  <!-- Dialog xác nhận xóa thông tin công ty -->
  <v-dialog v-model="dialogDelete" width="auto">
    <v-card>
      <v-card-title style="text-align: center; color: #4da1eb">
        XÓA GÓI KHÁM
      </v-card-title>
      <v-card-text class="text-h7">
        <v-row justify="center" style="text-align: center">
          Bạn có chắc xóa gói&nbsp;<b>{{ editedPackage.name }}</b
          >&nbsp;ra khỏi dữ liệu?
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
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
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogImport" width="auto">
    <v-card>
      <v-card-title style="text-align: center; color: #4da1eb">
        GỬI DANH SÁCH
      </v-card-title>
      <v-card-text>
        <v-row justify="center" style="text-align: center"
          >Xác nhận gửi danh sách&nbsp;<b>{{ selectedFileName }}</b
          >&nbsp;vào dữ liệu?</v-row
        >
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
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
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
              <v-icon v-if="circle_loader.icon">{{
                single_circle_loader.icon
              }}</v-icon>
            </v-progress-circular>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>
  <v-dialog persistent v-model="dialogNonePhoneAndMail" width="auto">
    <v-card>
      <v-card-title style="text-align: center">
        <h2>Danh sách bệnh nhân không có cả email và số điện thoại</h2>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row justify="center" style="text-align: center">
            <v-col cols="12" v-for="(item, i) in nonePhoneAndMail" :key="i">
              Tên: {{ item?.fullname ? item?.fullname : "" }} - Ngày sinh
              {{ item?.birthday ? item.birthday : "" }}
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogNonePhoneAndMail = false"
        >
          Đóng
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- <v-dialog v-model="dialogLinkList">
    <v-card>
      <v-card-text>
        <span v-for="(item, i) in short_urls" :key="i"> {{ item }}<br /></span>
        <br />
        <v-divider></v-divider>
        <br />
        <span v-for="(item, i) in original_urls" :key="i">
          {{ item }}<br />
        </span>
      </v-card-text>
    </v-card>
  </v-dialog> -->
  <v-dialog
    v-if="incorrectPatients.length > 0"
    persistent
    v-model="dialogIncorrectPatient"
    width="auto"
  >
    <v-card class="mx-auto ma-2 pa-2">
      <v-card-title style="text-align: center">
        <h3>DANH SÁCH BỆNH NHÂN CHƯA KHỚP LỊCH HẸN CỦA GÓI KHÁM</h3>
        <b
          >(trường <span style="color: red">bôi đỏ</span> là trường chưa
          khớp)</b
        >
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row justify="center">
            <v-col cols="12" v-for="(item, i) in incorrectPatients" :key="i">
              Bệnh nhân: {{ item.fullname }} -
              <span :style="incorrectPatientStyle(item.isDateFall)">
                Ngày hẹn trên excel:
                {{ item.date ? filtersStore.DataDateToValDate(item.date) : "" }}
              </span>
              -
              <span :style="incorrectPatientStyle(item.isSessionFall)">
                Khung giờ: {{ item.session }}
              </span>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogIncorrectPatient = false"
          >Đóng</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <Snackbar />
  <ProgressCircular />
  <SingleProgressCircular />
  <DialogAppointment />
  <DialogBrowsePackages />
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import * as XLSX from "xlsx";
import numeral from "numeral";
import Snackbar from "../utilities/Snackbar.vue";
import ProgressCircular from "../utilities/ProgressCircular.vue";
import SingleProgressCircular from "../utilities/SingleProgressCircular.vue";
import Patients from "./Patients.vue";
import DialogAppointment from "../dialogs/DialogApointment.vue";
import DialogBrowsePackages from "../dialogs/DialogBrowsePackages.vue";

export default {
  name: "company_packages",
  props: {
    company_id: {},
    is_follow_company: false,
    is_browse_packs: false,
  },
  components: {
    Snackbar,
    ProgressCircular,
    SingleProgressCircular,
    Patients,
    DialogAppointment,
    DialogBrowsePackages,
  },
  data: () => ({
    // --base variable
    // dialog display

    dialog: false,
    dialogDelete: false,
    dialogPackage: false,
    dialogImport: false,
    dialogEdit: false,
    dialogLinkList: false,
    dialogIncorrectPatient: false,
    dialogNonePhoneAndMail: false,

    short_urls: [],
    original_urls: [],
    expanded: [],
    incorrectPatients: [],

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
    fetching: false,
    selectedFileName: null,
    display_style: "none",
    store: storeToRefs(useFiltersStore()),
    filtersStore: useFiltersStore(),
    search: "",
    editedPackageIndex: -1,
    nonePhoneAndMail: [],

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
      { key: "status", title: "Trạng thái\n(Tổng đặt)" },
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
        phone_number: "",
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
    if (this.store.data.user.permission) {
      await this.fetchFirstData();
    }
  },

  watch: {
    "editedPackage.price"() {
      // Định dạng giá tiền với dấu phẩy ở hàng nghìn, triệu, tỷ, v.v.
      this.editedPackage.price = numeral(this.editedPackage.price).format(
        "0,0"
      );
    },
    // async "store.state.isLogin"() {
    //   if (this.store.state.isLogin) {
    //     await this.fetchFirstData();
    //   }
    // },

    async "store.data.user.permission"(newVal, oldVal) {
      console.log("load lại pack_ theo permission");
      await this.fetchFirstData();
    },

    async "store.state.isReFetch"(newVal, oldVal) {
      if (newVal === true) {
        await this.fetchFirstData();
        this.store.state.isReFetch = false;
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
    "store.state.dialogAppointment"(newVal, oldVal) {
      if (newVal === false) {
        this.store.state.isShowSchedule = false;
        this.store.state.isEditPackage = false;
      }
    },
    "store.state.isUpdatedPakageSchedule"(newVal, oldVal) {
      if (newVal === true) {
        this.fetchFirstData();
        this.store.state.isUpdatedPakageSchedule = false;
      }
    },
  },
  methods: {
    sumAmountAppointment(item) {
      let count = 0;
      for (let index = 0; index < item.length; index++) {
        count += Number(item[index].total_slot);
      }
      return count;
    },
    incorrectPatientStyle(isFall) {
      if (isFall) {
        return `
        font-weight: bold;
        color: red`;
      } else {
        return `
        font-weight: bold;
        color: black`;
      }
    },
    initialize() {
      this.fetchFirstData();
    },

    fetchHeader() {
      if (
        this.store.data.user.permission !== "admin" &&
        this.store.data.user.permission !== "KD"
      ) {
        console.log("true");
        this.headers = this.headers.filter(
          (header) => header.key !== "actions" && header.key !== "price"
        );
        console.log(this.headers);
      }
    },
    async fetchFirstData() {
      const headers = {
        authentication: localStorage.getItem("loginToken")
          ? localStorage.getItem("loginToken")
          : "",
      };
      this.fetchHeader();
      this.fetching = true;
      this.circle_loader.icon = "mdi-medical-bag";
      this.circle_loader.state = true;
      let response = null;
      if (this.is_follow_company) {
        response = await axios
          .get(`${useRuntimeConfig().public.DOMAIN}/select-packs-of-company`, {
            params: {
              headers,
              company_id: this.company_id,
            },
          })
          .catch((e) => {
            console.log("không có data", e);
          });
      } else if (
        this.store.data.user.permission === "admin" ||
        this.store.data.user.permission === "LH"
      ) {
        // console.log("admin packs");
        response = await axios
          .get(
            `${useRuntimeConfig().public.DOMAIN}/select-company-service-packs`,
            {
              params: {
                headers,
              },
            }
          )
          .catch((e) => {
            console.log("không có data", e);
          });
      } else if (this.store.data.user.permission === "KD") {
        // console.log("manager packs");
        response = await axios
          .get(
            `${
              useRuntimeConfig().public.DOMAIN
            }/select-company-service-packs-manager`,
            {
              params: {
                headers,
                id: this.store.data.user.id,
              },
            }
          )
          .catch((e) => {
            console.log("không có data", e);
          });
      }
      if (response) {
        if (response?.data?.his_ace_company_service_packs) {
          this.packages_ = response?.data?.his_ace_company_service_packs;
          console.log("response?.data", response?.data);
        }
        if (this.packages_ && this.packages_.length > 0) {
          let stt = 0;
          for (let index = 0; index < this.packages_.length; index++) {
            this.packages_[index].stt = ++stt;
            this.packages_[index].price = numeral(
              this.packages_[index].price
            ).format("0,0");
          }
        }
      }

      this.circle_loader.state = false;
      this.circle_loader.icon = "";

      this.fetching = false;
    },

    async fetchAppointment(item) {
      this.fetching = true;
      // console.log("item", item);
      this.store.data.packageAdd = item;
      this.store.data.packageAdd.session_packs = [];
      this.store.data.packageAdd.real_num_available =
        this.store.data.packageAdd.number_of_employees;
      // console.log("this.store.data.packageAdd", this.store.data.packageAdd);
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
            // console.log(
            //   "response.data",
            //   response?.data?.his_ace_appointment_schedules
            // );

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

                          // console.log("obj", obj);
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

                          // console.log(
                          //   "cloneSessions[j].id",
                          //   cloneSessions[j].id,
                          //   "totalSlots",
                          //   totalSlots
                          // );
                          tempEvent.extendedProps.is_edit = true;
                          if (
                            totalSlots === Number(cloneSessions[j].total_slot)
                          ) {
                            tempEvent.backgroundColor = "orange";
                            // console.log("change orange");
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

      this.circle_loader.state = false;
      this.circle_loader.icon = "";

      this.fetching = false;
    },

    browsePacks() {
      this.store.state.dialogAcceptPakageSchedule = true;
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
        // console.log("Selected CSV File:", selectedFile);
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

          // console.log("Sheet Data:", sheetData);

          // Thực hiện các xử lý khác dựa trên dữ liệu từ file XLSX đã chọn
          if (sheetData) {
            this.patient_ = [];
            for (let index = 0; index < sheetData.length; index++) {
              const tempPatient = {
                fullname: "",
                phone_number: "",
                birthday: "",
                email: "",
                appointment_date: "",
                session: "",
              };
              if (sheetData[index]["Họ tên"]) {
                tempPatient.fullname = sheetData[index]["Họ tên"];
              }
              if (sheetData[index]["Số điện thoại"]) {
                tempPatient.phone_number = sheetData[index]["Số điện thoại"];
              }
              if (sheetData[index]["Ngày sinh(dd/mm/yyyy)"]) {
                if (
                  Number.isInteger(
                    Number(sheetData[index]["Ngày sinh(dd/mm/yyyy)"])
                  )
                ) {
                  const dmy = this.filtersStore.excelSerialToDate(
                    Number(sheetData[index]["Ngày sinh(dd/mm/yyyy)"])
                  );
                  console.log(dmy);
                  console.log(dmy.getFullYear());
                  console.log(dmy.getMonth() + 1);
                  console.log(dmy.getDate());
                  const dd = dmy.getDate();
                  const mm = dmy.getMonth() + 1;
                  const yyyy = dmy.getFullYear();
                  tempPatient.birthday = `${yyyy}-${mm}-${dd}`;
                  console.log("tempPatient.birthday", tempPatient.birthday);
                } else {
                  tempPatient.birthday =
                    sheetData[index]["Ngày sinh(dd/mm/yyyy)"];
                }
              }
              if (sheetData[index]["Email"]) {
                tempPatient.email = sheetData[index]["Email"];
              }
              if (sheetData[index]["Ngày hẹn(dd/mm/yyyy)"]) {
                if (
                  Number.isInteger(
                    Number(sheetData[index]["Ngày hẹn(dd/mm/yyyy)"])
                  )
                ) {
                  const dmy = this.filtersStore.excelSerialToDate(
                    Number(sheetData[index]["Ngày hẹn(dd/mm/yyyy)"])
                  );
                  const dd = String(dmy.getDate()).padStart(2, "0");
                  const mm = String(dmy.getMonth() + 1).padStart(2, "0");
                  const yyyy = dmy.getFullYear();
                  tempPatient.appointment_date = `${yyyy}-${mm}-${dd}`;
                  console.log(
                    "tempPatient.appointment_date",
                    tempPatient.appointment_date
                  );
                } else {
                  tempPatient.appointment_date =
                    sheetData[index]["Ngày hẹn(dd/mm/yyyy)"];
                }
                if (sheetData[index]["Khung giờ"]) {
                  const findTime = this.store.data.shift.find(function (
                    element
                  ) {
                    return element.time === sheetData[index]["Khung giờ"];
                  });
                  if (findTime) {
                    // console.log("findTime", findTime);
                    tempPatient.session = findTime.id;
                    console.log("tempPatient.session", tempPatient.session);
                  }
                }
              }
              // console.log("tempPatient", tempPatient);
              this.patient_.push(tempPatient);
              // console.log("this.patient_", this.patient_);
            }
            this.dialogImport = true;
          }
        };

        // Đọc file dưới dạng array buffer
        reader.readAsArrayBuffer(selectedFile);
        // console.log("reader", reader);
      } else {
        console.error("Invalid file format. Please select a XLSX file.");
        // Xử lý khi file không đúng định dạng
      }

      // Thực hiện các xử lý khác dựa trên file đã chọn
    },
    dataTableStyle() {
      if (this.store.state.isLogin) {
        this.display_style = "block";
      } else {
        this.display_style = "none";
      }
      return `display: ${this.display_style};
      ${this.is_follow_company ? "background-color: #e7eef3" : ""}`;
    },
    skeletonStyle() {
      return `${this.is_follow_company ? "background-color: #e7eef3" : ""}`;
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
      this.editedPackage.price = parseInt(
        this.editedPackage.price.replace(/\D/g, ""),
        10
      );
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
        // console.log("tempEditPackage", tempEditPackage);
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
      // console.log("delete company...", this.editedPackage);
      await axios
        .post(
          `${useRuntimeConfig().public.DOMAIN}/delete-company-service-packs`,
          {
            package_id: this.editedPackage.id,
          }
        )
        .then((response) => {
          if (response?.data) {
            // console.log("delete thành công", response.data);
            this.packages_.splice(this.editedPackageIndex, 1);
            // thông báo thành công
            this.store.state.snackbar = this.store.state.snackbar_default;
            this.store.state.snackbar.text = "Xóa thành công!";
            this.store.state.snackbar.state = true;

            // Đóng circle load
            this.single_circle_loader.state = false;
            this.single_circle_loader.icon = "";
            this.single_circle_loader.title = "";

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

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
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
          this.incorrectPatients = [];
          this.nonePhoneAndMail = [];
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
              // console.log("appointment_packs", appointment_packs);

              let isSessionExcelFall = true;
              let isDateExcelFall = true;
              for (let index = 0; index < appointment_packs.length; index++) {
                // console.log(
                //   "DataDate",
                //   appointment_packs[
                //     index
                //   ].appointment_session.appointment_schedule.date.toString()
                // );
                // console.log(
                //   "ExcelDateToDataDate",
                //   this.patient_[indexPatient].appointment_date
                // );
                // console.log(
                //   "compare",
                //   appointment_packs[
                //     index
                //   ].appointment_session.appointment_schedule.date.toString() ===
                //     this.patient_[indexPatient].appointment_date
                // );
                // Kiểm tra buổi trong excel có bằng buổi trong gói khám hay không
                console.log(
                  "session in pack",
                  appointment_packs[index].appointment_session.name.toString()
                );
                console.log(
                  "session excel",
                  this.patient_[indexPatient].session.toString()
                );
                console.log(
                  "compare session",
                  appointment_packs[
                    index
                  ].appointment_session.name.toString() ===
                    this.patient_[indexPatient].session.toString()
                );
                // Kiểm tra ngày trong excel có bằng ngày trong gói khám hay không
                if (
                  (appointment_packs[
                    index
                  ].appointment_session.appointment_schedule.date.toString() ===
                    this.patient_[indexPatient].appointment_date) ===
                  true
                ) {
                  isDateExcelFall = false;
                  if (
                    !isDateExcelFall &&
                    (appointment_packs[
                      index
                    ].appointment_session.name.toString() ===
                      this.patient_[indexPatient].session.toString()) ===
                      true
                  ) {
                    isSessionExcelFall = false;
                  }
                }
                if (isDateExcelFall) {
                  isSessionExcelFall = false;
                }
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
                    this.patient_[indexPatient].appointment_date &&
                  appointment_packs[index].appointment_session.id
                ) {
                  console.log("trueeeeeeee!!!");
                  variable.session_id =
                    appointment_packs[index].appointment_session.id;
                }
              }
              if (isSessionExcelFall || isDateExcelFall) {
                const tempPatientFall = {
                  fullname: null,
                  date: null,
                  session: null,
                  isSessionFall: false,
                  isDateFall: false,
                };
                if (this.patient_[indexPatient].fullname) {
                  tempPatientFall.fullname =
                    this.patient_[indexPatient].fullname;
                }
                if (this.patient_[indexPatient].appointment_date) {
                  tempPatientFall.date =
                    this.patient_[indexPatient].appointment_date;
                }
                if (this.patient_[indexPatient].session) {
                  tempPatientFall.session = this.patient_[indexPatient].session;
                }
                tempPatientFall.isSessionFall = isSessionExcelFall;

                tempPatientFall.isDateFall = isDateExcelFall;

                this.incorrectPatients.push(tempPatientFall);
              }
            }
            variable.fullname = this.patient_[indexPatient].fullname;
            variable.phone_number = this.patient_[indexPatient].phone_number;
            // console.log("before val");
            variable.birthday = this.patient_[indexPatient].birthday;
            variable.email = this.patient_[indexPatient].email;
            if (variable.phone_number || variable.email) {
              variables.push(variable);
            } else {
              this.nonePhoneAndMail.push(variable);
            }
            console.log("variables", variables);
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
                  // console.log("response.data", response.data);
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
            const headers = {
              authentication: localStorage.getItem("loginToken")
                ? localStorage.getItem("loginToken")
                : "",
            };
            this.short_urls = [];
            this.original_urls = [];
            for (let index = 0; index < returning.length; index++) {
              if (returning[index].email) {
                try {
                  this.single_circle_loader.title = `Đang gửi email cho bệnh nhân${
                    returning[index].fullname
                      ? " " + returning[index].fullname
                      : ""
                  }!`;

                  // gửi email cho bệnh nhân
                  const url = await this.filtersStore.sendEmail(
                    headers,
                    returning[index].email ? returning[index].email : "",
                    returning[index].fullname ? returning[index].fullname : "",
                    returning[index].phone_number
                      ? returning[index].phone_number
                      : "",
                    returning[index].id
                  );
                  // console.log("short_url", short_url);
                  // console.log("short_url", original_url);
                  if (url) {
                    this.short_urls.push(url.short_url);
                    this.original_urls.push(url.original_url);
                  }
                  // if (returning[index].phone_number) {
                  //   // gửi sms cho bệnh nhân
                  //   console.log("returning[index]", returning[index]);
                  //   this.single_circle_loader.title = `Đang gửi SMS cho bệnh nhân${
                  //     returning[index].fullname
                  //       ? " " + returning[index].fullname
                  //       : ""
                  //   }!`;
                  //   await this.delay(1000);
                  //   await this.filtersStore.sendSMS(
                  //     headers,
                  //     returning[index].phone_number
                  //       ? returning[index].phone_number
                  //       : "",
                  //     returning[index].fullname
                  //       ? returning[index].fullname
                  //       : "",
                  //     returning[index].id ? `${returning[index].id}` : "0",
                  //     returning[index].company_service_pack
                  //       ?.appointment_company_service_packs[0]
                  //       ?.appointment_session?.appointment_schedule?.date
                  //       ? returning[index].company_service_pack
                  //           ?.appointment_company_service_packs[0]
                  //           ?.appointment_session?.appointment_schedule?.date
                  //       : "",
                  //     url.short_url ? url.short_url : ""
                  //   );
                  // }
                } catch (error) {
                  // thông báo không thành công
                  this.store.state.snackbar = this.store.state.snackbar_error;
                  this.store.state.snackbar.text = `Lỗi khi gửi thông báo cho bệnh nhân${
                    returning[index].fullname
                      ? " " + returning[index].fullname
                      : ""
                  }!`;
                  this.store.state.snackbar.state = true;

                  console.log("lỗi", error);
                }
              }
              // else if (returning[index].phone_number) {
              //   // gửi sms cho bệnh nhân
              //   await this.delay(2000);
              //   console.log("returning[index]", returning[index]);
              //   this.single_circle_loader.title = `Đang gửi SMS cho bệnh nhân${
              //     returning[index].fullname
              //       ? " " + returning[index].fullname
              //       : ""
              //   }!`;
              //   await this.filtersStore.sendSMS(
              //     headers,
              //     returning[index].phone_number
              //       ? returning[index].phone_number
              //       : "",
              //     returning[index].fullname ? returning[index].fullname : "",
              //     returning[index].id ? `${returning[index].id}` : "0"
              //   );
              // }
            }
            console.log("this.short_urls", this.short_urls);
            console.log("this.original_urls", this.original_urls);
            // this.dialogLinkList = true;
            this.dialogIncorrectPatient = true;
            console.log(
              "this.store.data.links",
              this.store.data.links.toString()
            );
          }
        }
      }

      // Đóng circle load
      this.single_circle_loader.state = false;
      this.single_circle_loader.icon = "";
      this.single_circle_loader.title = "";
      this.fetchFirstData();
      if (this.nonePhoneAndMail?.length > 0) {
        this.dialogNonePhoneAndMail = true;
      }
    },
  },
};
</script>

<style scoped>
.v-progress-circular {
  margin: 1rem;
}
</style>