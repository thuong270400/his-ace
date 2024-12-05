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
      is_follow_pack
        ? `background-color: #cedee7;
          font-size: 15px`
        : ''
    "
  >
    <v-row>
      <v-col> DANH SÁCH BỆNH NHÂN</v-col>
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
      <v-col cols="auto">
        <v-tooltip
          text="Xuất danh sách khách hàng và đường link"
          location="top"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-microsoft-excel"
              size="large"
              class="btn_add_schedule"
              @click="
                pack_info?.appointment_company_service_packs?.length > 0
                  ? exportToExcel(pack_info)
                  : (dialogCanNotChooseSendMultiple = true)
              "
            ></v-btn> </template
        ></v-tooltip>
      </v-col>
      <v-col cols="auto">
        <v-tooltip text="Gửi SMS cho khách hàng" location="top">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              class="btn_add_schedule"
              @click="
                pack_info?.appointment_company_service_packs?.length > 0
                  ? (dialogChooseSendMultiple = true)
                  : (dialogCanNotChooseSendMultiple = true)
              "
              style="margin-top: 10px"
              ><b>Gửi</b></v-btn
            >
          </template>
        </v-tooltip>
      </v-col>
      <!-- <v-col cols="auto" style="text-align: right">
        <v-btn color="primary" dark class="mb-2" @click="addPatient">
          Thêm bệnh nhân
        </v-btn>
      </v-col> -->
    </v-row>
    <v-spacer></v-spacer>
  </v-card-title>
  <v-data-table
    v-if="!fetching"
    :style="dataTableStyle()"
    :headers="headers"
    :items="patients_"
    :search="search"
  >
    <template v-slot:item.appointment="{ item }">
      <div v-if="item.date" style="white-space: pre-wrap; margin: 7px 0 7px 0">
        <span
          style="
            background-color: #1867c0;
            color: white;
            border-radius: 7px;
            padding: 3.5px;
            border: 1px solid #98e055;
          "
          >{{ filtersStore.DataDateToValDate(item.date) }}</span
        >&nbsp;-&nbsp; Ca
        <span style="font-weight: bold">
          {{ item.session_name }}
        </span>
        <span style="font-size: 11px">
          ({{ store.data.shift[Number(item.session_name) - 1]?.time }})
        </span>
      </div>
    </template>
    <template v-slot:item.actions="{ item }">
      <!-- <v-tooltip text="Tạo gói khám">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="addPackage(item)"
          >
            mdi-medical-bag
          </v-icon>
        </template>
      </v-tooltip> -->
      <v-icon size="small" class="me-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template v-slot:item.actionsLH="{ item }">
      <v-tooltip text="Xem danh sách buổi đã đặt" location="left">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="seenItem(item)"
          >
            mdi-table-eye
          </v-icon>
        </template>
      </v-tooltip>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary"> Reset </v-btn>
    </template>
  </v-data-table>

  <!-- Dialog xác nhận gửi SMS cho các khách hàng của gói -->
  <v-dialog v-model="dialogAcceptSendMultiSMS" width="auto">
    <v-card style="text-align: center">
      <v-card-text>
        Xác nhận gửi
        <b>{{
          type === "S"
            ? "SMS"
            : type === "E"
            ? "Email"
            : type === "ES"
            ? "SMS và Email"
            : ""
        }}</b>
        cho các bệnh nhân{{ pack_info?.name ? ` của gói ` : "" }}
        <b> {{ pack_info?.name ? pack_info?.name : "" }} </b>?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogAcceptSendMultiSMS = false"
        >
          Đóng
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="sendMultiSMS()">
          Xác nhận
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Thông báo không thể gửi tin nhắn vì gói chưa được xếp lịch -->
  <v-dialog v-model="dialogCanNotChooseSendMultiple" width="auto">
    <v-card style="text-align: center">
      <v-card-text>
        Vui lòng liên hệ phòng Khám Sức Khỏe Doanh Nghiệp để duyệt lịch khám!
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogCanNotChooseSendMultiple = false"
        >
          Đóng
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- Dialog lựa chọn phương thức gửi thông báo -->
  <v-dialog v-model="dialogChooseSendMultiple" width="auto">
    <v-card style="text-align: center">
      <v-card-text>
        Chọn phương thức gửi thông báo cho các khách hàng{{
          pack_info?.name ? ` của gói ` : ""
        }}
        <b> {{ pack_info?.name ? pack_info?.name : "" }} </b>?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogChooseSendMultiple = false"
        >
          Đóng
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="sendMultiSMS()">
          Gửi
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận gửi email -->
  <!-- <v-dialog v-model="dialogAcceptSendMultiSMS" width="auto">
    <v-card style="text-align: center">
      <v-card-text>
        Xác nhận gửi <b>Email</b> cho các bệnh nhân{{
          pack_info?.name ? ` của gói ` : ""
        }}
        <b> {{ pack_info?.name ? pack_info?.name : "" }} </b>?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogAcceptSendMultiSMS = false"
        >
          Đóng
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="sendMultiSMS()">
          Xác nhận
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog> -->
  <!-- Dialog xem buổi khám bệnh nhân đã đặt -->
  <v-dialog v-model="dialogSeenItem" max-width="700px">
    <v-card>
      <v-card-text>
        <v-container>
          <v-row justify="center">
            <v-col style="text-align: center">
              <h3 style="color: #9b735e">
                Xem lịch buổi khám khách hàng đã đặt
              </h3>
            </v-col>
          </v-row>
          <v-row class="ma-2" justify="center">
            <v-col cols="12" class="check-box-col">
              <span v-for="(item, i) in edited_session_packs_" :key="i">
                <span
                  style="
                    background-color: #1867c0;
                    color: white;
                    border-radius: 7px;
                    padding: 3.5px;
                    border: 1px solid #98e055;
                  "
                  >{{ filtersStore.DataDateToValDate(item.date) }}</span
                >&nbsp;-&nbsp; Ca
                <span style="font-weight: bold">
                  {{ item.session_name }}
                </span>
                <span style="font-size: 11px">
                  ({{
                    store.data.shift[Number(item.session_name) - 1]?.time
                  }}) </span
                >&ensp;-&ensp;{{ item.registered_patients }}/{{
                  item.session_pack_slots
                }}
                <v-divider style="margin: 7px 0 7px 0"></v-divider>
              </span>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Dialog chỉnh sửa dữ liệu bệnh nhân -->
  <v-dialog v-model="dialog" max-width="700px">
    <v-card>
      <v-card-text>
        <v-container>
          <v-row justify="center">
            <v-col style="text-align: center">
              <h3 style="color: #9b735e">
                {{ formTitle }} thông tin bệnh nhân
              </h3>
            </v-col>
          </v-row>
          <v-row class="ma-2" justify="center">
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.fullname"
                variant="outlined"
                color="#9b735e"
                label="Tên bệnh nhân"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="12" md="6" class="col-style">
              <v-text-field
                v-model="editedItem.phone_number"
                :rules="phoneNumberRule"
                variant="outlined"
                color="#9b735e"
                maxlength="11"
                label="Số điện thoại"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="12" md="6" class="col-style">
              <v-text-field
                v-model="editedItem.birthday"
                variant="outlined"
                color="#9b735e"
                label="Ngày sinh"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="col-style">
              <v-text-field
                v-model="editedItem.email"
                :rules="emailRules"
                variant="outlined"
                color="#9b735e"
                label="Email"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="check-box-col">
              <v-radio-group
                v-model="editedItem.session_id"
                style="margin-top: -30px"
              >
                <span v-for="(item, i) in edited_session_packs_" :key="i">
                  <v-radio
                    :disabled="
                      item.registered_patients >= item.session_pack_slots
                    "
                    :label="`${item.date}&ensp;-&ensp;Ca ${item.session_name}(${
                      store.data.shift[Number(item.session_name) - 1]?.time
                    })&ensp;-&ensp;${item.registered_patients}/${
                      item.session_pack_slots
                    }`"
                    :value="item.session_id"
                    style="font-weight: bold"
                  ></v-radio>
                </span>
                <v-radio
                  label="Chưa đặt lịch"
                  :value="null"
                  style="font-weight: bold"
                >
                </v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
          Cancel
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogUpdateOrNotic = true"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận xóa thông tin công ty -->
  <v-dialog v-model="dialogDelete" max-width="50vw">
    <v-card>
      <v-card-text class="text-h7">
        <v-row justify="center" style="text-align: center">
          Bạn có chắc xóa bệnh nhân&nbsp;<b>{{ editedItem.fullname }}</b
          >&nbsp;ra khỏi dữ liệu?
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogDelete = false"
          >Cancel</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

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

  <!-- dialog lựa chọn gửi sms hay chỉ lưu update -->
  <v-dialog v-model="dialogUpdateOrNotic" width="auto">
    <v-card>
      <v-card-text>
        <v-container style="text-align: center">
          Xác nhận cập nhật thông tin bệnh nhân
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="save()">Lưu</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="save('SMS')"
          >Lưu và gửi SMS</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogUpdateOrNotic = false"
          >Đóng</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
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
    pack_info: {},
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
        { key: "fullname", title: "Họ tên" },
        { key: "birthday", title: "Ngày sinh" },
        { key: "email", title: "Email" },
        { key: "phone_number", title: "Số điện thoại" },
        { key: "appointment", title: "Ngày khám" },
        { title: "Actions", key: "actions", sortable: false },
        { title: "ActionsLH", key: "actionsLH", sortable: false },
      ],
      patients_: [],
    };
  },
  async mounted() {
    await this.fetchFirstData();
  },

  watch: {
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
    "store.data.user.permission"(newVal, oldVal) {
      this.fetchFirstData();
    },
    is_follow_pack(newVal, oldVal) {
      this.fetchFirstData();
    },
  },

  methods: {
    chooseSendMultiple(type) {
      this.type_send_multiple = type;
      this.dialogAcceptSendMultiSMS = true;
    },
    async sendMultiSMS() {
      this.single_circle_loader.icon = "mdi-content-save-settings";
      this.single_circle_loader.title = "Đang thực hiện...";
      this.single_circle_loader.state = true;
      const headers = {
        authentication: localStorage.getItem("loginToken")
          ? localStorage.getItem("loginToken")
          : "",
      };
      if (this.patients_.length > 0) {
        for (let index = 0; index < this.patients_.length; index++) {
          if (this.patients_[index]?.phone_number) {
            this.single_circle_loader.title = `Đang gửi SMS cho khách hàng${
              this.patients_[index]?.fullname
                ? " " + this.patients_[index].fullname
                : ""
            }!`;
            try {
              await this.delay(2000);
              await this.filtersStore.sendSMS(
                headers,
                this.patients_[index]?.phone_number
                  ? this.patients_[index].phone_number
                  : "",
                this.patients_[index]?.fullname
                  ? this.patients_[index].fullname
                  : "",
                this.patients_[index]?.id ? `${this.patients_[index].id}` : "0",
                this.patients_[index]?.date
                  ? this.filtersStore.DataDateToValDate(
                      this.patients_[index].date
                    )
                  : "",
                this.patients_[index].session_name
                  ? this.patients_[index].session_name
                  : 0
              );
            } catch (error) {
              console.log("lỗi gửi sms", error);
            }
          }
          // if (this.patients_[index]?.email) {
          //   this.single_circle_loader.title = `Đang gửi SMS cho khách hàng${
          //     this.patients_[index]?.fullname
          //       ? " " + this.patients_[index].fullname
          //       : ""
          //   }!`;
          //   try {
          //     await this.delay(2000);
          //     await this.filtersStore.sendEmail2(
          //       headers,
          //       this.patients_[index]?.email ? this.patients_[index].email : "",
          //       this.patients_[index]?.fullname
          //         ? this.patients_[index].fullname
          //         : "",
          //       this.patients_[index]?.id ? `${this.patients_[index].id}` : "0",
          //       this.patients_[index]?.date
          //         ? this.filtersStore.DataDateToValDate(
          //             this.patients_[index].date
          //           )
          //         : "",
          //       this.patients_[index].session_name
          //         ? this.patients_[index].session_name
          //         : 0
          //     );
          //   } catch (error) {
          //     console.log("lỗi gửi email", error);
          //   }
          // }
        }
      }
      this.dialogAcceptSendMultiSMS = false;
      // Đóng circle load
      this.single_circle_loader.state = false;
      this.single_circle_loader.icon = "";
      this.single_circle_loader.title = "";
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
    async fetchFirstData() {
      this.fetchHeader();
      this.fetching = true;
      this.circle_loader.icon = "mdi-account-box";
      this.circle_loader.state = true;
      console.log("alo alo");
      const currentYear = new Date().getFullYear();
      console.log("date", currentYear);

      const headers = {
        authentication: localStorage.getItem("loginToken")
          ? localStorage.getItem("loginToken")
          : "",
      };
      let response = null;
      // xem bệnh nhân của gói khám
      if (this.is_follow_pack) {
        response = await axios
          .get(`${useRuntimeConfig().public.DOMAIN}/select-patients-of-pack`, {
            params: {
              headers,
              currentYear: currentYear,
              pack_id: this.pack_id,
            },
          })
          .catch((e) => {
            console.log("không có data", e);
          });
      }
      // admin xem bệnh nhân
      else if (this.store.data.user.permission === "admin") {
        response = await axios
          .get(`${useRuntimeConfig().public.DOMAIN}/select-patients`, {
            params: {
              headers,
              currentYear: currentYear,
            },
          })
          .catch((e) => {
            console.log("không có data", e);
          });
      }
      // manager xem bệnh nhân
      else if (this.store.data.user.permission === "KD") {
        response = await axios
          .get(`${useRuntimeConfig().public.DOMAIN}/select-patients-manager`, {
            params: {
              headers,
              currentYear: currentYear,
            },
          })
          .catch((e) => {
            console.log("không có data", e);
          });
      }
      if (response) {
        console.log("response.data", response.data);
        this.patients_ = [];
        this.session_packs_ = [];
        if (response.data?.his_ace_patients?.length > 0) {
          const tempPatients = response.data.his_ace_patients;
          let stt = 0;
          // thực hiện gán giá trị cho mảng patient_ và session_pack_
          for (let index = 0; index < tempPatients.length; index++) {
            const tempPatient = {
              stt: ++stt,
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
              short_url: null,
            };
            if (tempPatients[index].id) {
              tempPatient.id = tempPatients[index].id;
            }
            if (tempPatients[index].fullname) {
              tempPatient.fullname = tempPatients[index].fullname;
            }
            if (tempPatients[index].birthday) {
              tempPatient.birthday = this.filtersStore.DataDateToValDate(
                tempPatients[index].birthday
              );
            }
            if (tempPatients[index].email) {
              tempPatient.email = tempPatients[index].email;
            }
            if (tempPatients[index].phone_number) {
              tempPatient.phone_number = tempPatients[index].phone_number;
            }
            if (tempPatients[index].company_service_pack_id) {
              tempPatient.pack_id = tempPatients[index].company_service_pack_id;
            }
            if (tempPatients[index].appointment_session_id) {
              tempPatient.session_id =
                tempPatients[index].appointment_session_id;
            }
            if (tempPatients[index].appointment_session?.name) {
              tempPatient.session_name =
                tempPatients[index].appointment_session.name;
            }
            if (
              tempPatients[index].appointment_session?.appointment_schedule
                ?.date
            ) {
              tempPatient.date =
                tempPatients[
                  index
                ].appointment_session.appointment_schedule.date;
            }
            if (tempPatient.session_name && tempPatient.date) {
              tempPatient.appointment = `${this.filtersStore.DataDateToValDate(
                tempPatient.date
              )} - Ca ${tempPatient.session_name}(${
                this.store.data.shift[Number(tempPatient.session_name) - 1].time
              })`;
            }
            if (tempPatients[index].shortlink?.short_url) {
              tempPatient.short_url = `${useRuntimeConfig().public.DOMAIN}/${
                tempPatients[index].shortlink.short_url
              }`;
            }
            this.patients_.push(tempPatient);
          }
          console.log("this.patients_", this.patients_);
        }
      }

      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/select-session-packs`)
        .then((response) => {
          if (response.data?.length > 0) {
            console.log("response.data", response.data);
            for (let index = 0; index < response.data.length; index++) {
              const tempSessionPack = {
                pack_id: null,
                session_id: null,
                session_name: null,
                date: null,
                session_slots: 0,
                registered_patients: 0,
                session_pack_slots: 0,
              };
              if (response.data[index].pack_id) {
                tempSessionPack.pack_id = response.data[index].pack_id;
              }
              if (response.data[index].session_id) {
                tempSessionPack.session_id = response.data[index].session_id;
              }
              if (response.data[index].session_name) {
                tempSessionPack.session_name =
                  response.data[index].session_name;
              }
              if (response.data[index].date) {
                tempSessionPack.date = this.filtersStore.DataDateToValDate(
                  response.data[index].date
                );
              }
              if (response.data[index].session_slots) {
                tempSessionPack.session_slots =
                  response.data[index].session_slots;
              }
              if (response.data[index].session_pack_slots) {
                tempSessionPack.session_pack_slots =
                  response.data[index].session_pack_slots;
              }
              this.session_packs_.push(tempSessionPack);
            }
            console.log("this.session_packs_", this.session_packs_);
          }
        });
      this.circle_loader.state = false;
      this.circle_loader.icon = "";
      this.fetching = false;
    },

    exportToExcel(pack_info) {
      // Dữ liệu bạn muốn xuất ra Excel
      const data = [
        // Thêm dữ liệu khác nếu cần
      ];
      this.patients_.forEach(function (obj, index) {
        const tempData = {
          Phone: null,
          Fullname: null,
          ["Birthday (dd-mm-yyyy)"]: null,
          Email: null,
          Address: null,
          ["Gender (0: Female, 1:Male)"]: 1,
          ["Status (0:Disable, 1:Enable)"]: 1,
          Category1: null,
          ["Category1(0:No, 1:Yes)"]: null,
          ["Category2(0:No, 1:Yes)"]: null,
          ["Category3(0:No, 1:Yes)"]: null,
          ["Category4(0:No, 1:Yes)"]: null,
          ["Category5(0:No, 1:Yes)"]: null,
          ["Field 1(character)"]: null,
          ["Field 2(character)"]: null,
          ["Field 3(character)"]: null,
          ["Field 4(character)"]: null,
          ["Field 5(character)"]: null,
          ["Field 6(character)"]: null,
          ["Field 7(character)"]: null,
          ["Field 8(character)"]: null,
          ["Field 9(character)"]: null,
          ["Field 10(character)"]: null,
        };
        if (obj.phone_number) {
          tempData.Phone = obj.phone_number;
        }
        if (obj.fullname) {
          tempData.Fullname = obj.fullname;
        }
        if (obj.birthday) {
          tempData["Birthday (dd-mm-yyyy)"] = obj.birthday;
        }
        if (obj.email) {
          tempData.Email = obj.email;
        }
        if (obj.email) {
          tempData.Email = obj.email;
        }
        if (obj.short_url) {
          tempData.Address = obj.short_url;
        }
        data.push(tempData);
      });

      // Tạo một workbook mới
      const wb = XLSX.utils.book_new();

      // Tạo một sheet mới
      const ws = XLSX.utils.json_to_sheet(data);
      // Thêm sheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Xuất file Excel
      XLSX.writeFile(
        wb,
        `Danh sách khách hàng${
          this.pack_info?.name ? ` gói ${this.pack_info.name}` : ""
        }.xls`
      );
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

    async editItem(item) {
      this.formTitle = "Sửa";
      this.circle_loader.state = true;
      this.editedIndex = this.patients_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.edited_session_packs_ = [];
      for (let index = 0; index < this.session_packs_.length; index++) {
        if (this.editedItem.pack_id === this.session_packs_[index].pack_id) {
          this.edited_session_packs_.push(this.session_packs_[index]);
        }
      }
      if (this.edited_session_packs_.length > 0) {
        for (
          let index = 0;
          index < this.edited_session_packs_.length;
          index++
        ) {
          if (
            this.edited_session_packs_[index].pack_id &&
            this.edited_session_packs_[index].session_id
          )
            await axios
              .get(
                `${
                  useRuntimeConfig().public.DOMAIN
                }/get-patient-appointment-total`,
                {
                  params: {
                    pack_id: this.edited_session_packs_[index].pack_id,
                    session_id: this.edited_session_packs_[index].session_id,
                  },
                }
              )
              .then((response) => {
                console.log("response?.data", response?.data);
                this.edited_session_packs_[index].registered_patients =
                  response?.data;
              })
              .catch((e) => {
                console.log("error fetching count patient pack", e);
              });
        }
      }
      console.log(this.edited_session_packs_);

      this.circle_loader.state = false;
      this.dialog = true;
    },

    async seenItem(item) {
      this.circle_loader.state = true;
      this.editedIndex = this.patients_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.edited_session_packs_ = [];
      for (let index = 0; index < this.session_packs_.length; index++) {
        if (this.editedItem.pack_id === this.session_packs_[index].pack_id) {
          this.edited_session_packs_.push(this.session_packs_[index]);
        }
      }
      if (this.edited_session_packs_.length > 0) {
        for (
          let index = 0;
          index < this.edited_session_packs_.length;
          index++
        ) {
          if (
            this.edited_session_packs_[index].pack_id &&
            this.edited_session_packs_[index].session_id
          )
            await axios
              .get(
                `${
                  useRuntimeConfig().public.DOMAIN
                }/get-patient-appointment-total`,
                {
                  params: {
                    pack_id: this.edited_session_packs_[index].pack_id,
                    session_id: this.edited_session_packs_[index].session_id,
                  },
                }
              )
              .then((response) => {
                console.log("response?.data", response?.data);
                this.edited_session_packs_[index].registered_patients =
                  response?.data;
              })
              .catch((e) => {
                console.log("error fetching count patient pack", e);
              });
        }
      }
      console.log(this.edited_session_packs_);

      this.circle_loader.state = false;
      this.dialogSeenItem = true;
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

    async deleteItemConfirm() {
      this.single_circle_loader.icon = "mdi-content-save-settings";
      this.single_circle_loader.title = "Đang thực hiện...";
      this.single_circle_loader.state = true;
      console.log("delete patient...", this.editedItem);
      await axios
        .post(`${useRuntimeConfig().public.DOMAIN}/delete-patients`, {
          patient_id: this.editedItem.id,
        })
        .then((response) => {
          if (response?.data) {
            console.log("delete thành công", response.data);
            this.store.state.snackbar = this.store.state.snackbar_default;
            this.store.state.snackbar.text = "Xóa bệnh nhân thành công!";
            this.store.state.snackbar.timeout = 3500;
            this.store.state.snackbar.state = true;
            this.dialogDelete = false;

            // đóng circle load
            this.single_circle_loader.state = false;
            this.single_circle_loader.icon = "";
            this.single_circle_loader.title = "";
            this.fetchFirstData();
          }
        })
        .catch((e) => {
          this.store.state.snackbar = this.store.state.snackbar_default;
          this.store.state.snackbar.text = "Xóa không thành công!";
          this.store.state.snackbar.timeout = 3500;
          this.store.state.snackbar.state = true;
          this.dialogDelete = false;

          // đóng circle load
          this.single_circle_loader.state = false;
          this.single_circle_loader.icon = "";
          this.single_circle_loader.title = "";
          console.log("Xóa không thành công", e);
        });
    },
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async save(notic) {
      console.log("save: set object", this.editedIndex);
      // kiểm tra field nhập
      if (!this.editedItem.fullname) {
        this.store.state.snackbar.text = "Tên bệnh nhân không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.phone_number && !this.editedItem.email) {
        this.store.state.snackbar.text =
          "Bệnh nhân phải có số điện thoại hoặc email";
        this.store.state.snackbar.state = true;
      } else if (
        this.editedItem.phone_number &&
        !/^[Z0-9-()]+(\s+[Z0-9-()]+)*$/.test(this.editedItem.phone_number)
      ) {
        this.store.state.snackbar.text = "Số điện thoại phải là số";
        this.store.state.snackbar.state = true;
      } else if (
        this.editedItem.phone_number &&
        !(
          this.editedItem.phone_number[0] === "0" &&
          (this.editedItem.phone_number.length === 11 ||
            this.editedItem.phone_number.length === 10)
        )
      ) {
        this.store.state.snackbar.text =
          "Sđt phải có 10 hoặc 11 số và bắt đầu từ 0. Vd: 07012345678";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.birthday) {
        this.store.state.snackbar.text =
          "Ngày sinh bệnh nhân không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (
        this.editedItem.email &&
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/.test(
          this.editedItem.email
        )
      ) {
        this.store.state.snackbar.text =
          "email phải đúng định dạng. vd: nvmau@gmail.com";
        this.store.state.snackbar.state = true;
      } else {
        this.single_circle_loader.icon = "mdi-content-save-settings";
        this.single_circle_loader.title = "Đang cập nhật...";
        this.single_circle_loader.state = true;
        // Cập nhật thông tin công ty
        if (this.editedIndex > -1) {
          console.log("save: update object");
          const Patient = {
            id: null,
            email: null,
            fullname: null,
            phone_number: null,
            birthday: null,
            pack_id: null,
            session_id: null,
          };
          if (this.editedItem.id) {
            Patient.id = this.editedItem.id;
          }
          if (this.editedItem.email) {
            Patient.email = this.editedItem.email;
          }
          if (this.editedItem.fullname) {
            Patient.fullname = this.editedItem.fullname;
          }
          if (this.editedItem.birthday) {
            console.log("this.editedItem.birthday", this.editedItem.birthday);
            Patient.birthday = this.filtersStore.ValDateToDataDate(
              this.editedItem.birthday
            );
          }
          if (this.editedItem.phone_number) {
            Patient.phone_number = this.editedItem.phone_number;
          }
          if (this.editedItem.pack_id) {
            Patient.pack_id = this.editedItem.pack_id;
          }
          if (
            this.editedItem.session_id ||
            this.editedItem.session_id === null
          ) {
            console.log("editedItem.session_id");
            Patient.session_id = this.editedItem.session_id;
          }
          console.log("Patient", Patient);
          console.log("this.editedItem.session_id", this.editedItem.session_id);
          await axios
            .get(`${useRuntimeConfig().public.DOMAIN}/update-patients`, {
              params: {
                patient: Patient,
              },
            })
            .then(async (response) => {
              if (response?.data) {
                if (response?.data?.update_his_ace_patients?.returning[0]?.id) {
                  console.log("update bệnh nhân thành công", response.data);

                  this.store.state.snackbar = this.store.state.snackbar_default;
                  this.store.state.snackbar.text =
                    "Cập nhật bệnh nhân thành công!";
                  this.store.state.snackbar.timeout = 3500;
                  this.store.state.snackbar.state = true;

                  // Gửi email, sms cho bệnh nhân
                  const headers = {
                    authentication: localStorage.getItem("loginToken")
                      ? localStorage.getItem("loginToken")
                      : "",
                  };
                  const foundObject = this.edited_session_packs_.find(
                    (item) =>
                      Number(item.session_id) === Number(Patient.session_id)
                  );
                  if (Patient.email) {
                    try {
                      this.single_circle_loader.title = `Đang tạo mới đường dẫn cho khách hàng${
                        Patient.fullname ? " " + Patient.fullname : ""
                      }!`;

                      // gửi email cho bệnh nhân
                      this.url = await this.filtersStore.sendEmail(
                        headers,
                        Patient.email ? Patient.email : "",
                        Patient.fullname ? Patient.fullname : "",
                        Patient.phone_number ? Patient.phone_number : "",
                        Patient.id
                      );
                      this.dialogUpdateOrNotic = true;
                      if (Patient.phone_number && notic && notic === "SMS") {
                        // gửi sms cho bệnh nhân
                        this.single_circle_loader.title = `Đang gửi SMS cho khách hàng${
                          Patient.fullname ? " " + Patient.fullname : ""
                        }!`;
                        await this.delay(1000);
                        await this.filtersStore.sendSMSUpdate(
                          headers,
                          Patient.phone_number ? Patient.phone_number : "",
                          Patient.fullname ? Patient.fullname : "",
                          Patient.id ? `${Patient.id}` : "0",
                          foundObject?.date ? foundObject.date : null,
                          foundObject?.session_name
                            ? foundObject.session_name
                            : 0,
                          this.url?.short_url ? this.url.short_url : ""
                        );
                      }
                    } catch (error) {
                      // thông báo không thành công
                      this.store.state.snackbar =
                        this.store.state.snackbar_error;
                      this.store.state.snackbar.text = `Lỗi khi gửi thông báo cho bệnh nhân${
                        Patient.fullname ? " " + Patient.fullname : ""
                      }!`;
                      this.store.state.snackbar.state = true;

                      console.log("lỗi", error);
                    }
                  } else if (Patient.phone_number && notic && notic === "SMS") {
                    // gửi sms cho bệnh nhân
                    await this.delay(2000);
                    this.single_circle_loader.title = `Đang gửi SMS cho khách hàng${
                      Patient.fullname ? " " + Patient.fullname : ""
                    }!`;
                    await this.filtersStore.sendSMSUpdate(
                      headers,
                      Patient.phone_number ? Patient.phone_number : "",
                      Patient.fullname ? Patient.fullname : "",
                      Patient.id ? `${Patient.id}` : "0",
                      foundObject?.date ? foundObject.date : null,
                      foundObject?.session_name ? foundObject.session_name : 0
                    );
                  }
                } else {
                  this.store.state.snackbar = this.store.state.snackbar_default;
                  this.store.state.snackbar.text = "Cập nhật không thành công!";
                  this.store.state.snackbar.timeout = 3500;
                  this.store.state.snackbar.state = true;
                  console.log("không có id patient update");
                }
                Object.assign(
                  this.patients_[this.editedIndex],
                  this.editedItem
                );
                this.dialog = false;
                this.single_circle_loader.state = false;
                this.single_circle_loader.icon = "";
                this.single_circle_loader.title = "";
                await this.fetchFirstData();
              }
            })
            .catch((e) => {
              console.log("không có data", e);
            });
        }
        // Thêm công ty
        // else if (this.editedIndex === -1) {
        //   const Patient = {
        //     email: this.editedItem.email,
        //     fullname: this.editedItem.fullname,
        //     phone_number: this.editedItem.phone_number,
        //     website: this.editedItem.website,
        //     company_service_pack_id: this.editedItem.pack_id,
        //     appointment_session_id: this.editedItem.session_id,
        //   };
        //   await axios
        //     .get(`${useRuntimeConfig().public.DOMAIN}/insert-patients`, {
        //       params: {
        //         patient: Patient,
        //       },
        //     })
        //     .then(async (response) => {
        //       if (response?.data) {
        //         console.log("insert thành công", response.data);
        //         this.patients_.push(this.editedItem);
        //         this.patients_[this.patients_.length - 1].stt =
        //           this.patients_.length;
        //         if (response?.data?.insert_his_ace_patients?.returning[0]?.id) {
        //           await this.uploadImage(
        //             response?.data?.insert_his_ace_patients?.returning[0]?.id
        //           );
        //         } else {
        //           console.log("không có id company insert");
        //         }

        //         await this.fetchFirstData();
        //       }
        //     })
        //     .catch((e) => {
        //       console.log("không có data", e);
        //     });
        // }
        this.single_circle_loader.state = false;
        this.single_circle_loader.icon = "";
        this.single_circle_loader.title = "";
        this.dialog = false;
        this.dialogUpdateOrNotic = false;
      }
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