<template>
  <v-skeleton-loader
    v-if="fetching"
    class="mx-auto ma-2"
    elevation="12"
    max-width="100%"
    type="subtitle, table"
  ></v-skeleton-loader>
  <v-card-title v-if="!store.state.progress_circular.state">
    <v-row>
      <v-col> DANH SÁCH CÔNG TY</v-col>
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
          store.data.user.permission === 'admin' ||
          store.data.user.permission === 'KD'
        "
        cols="auto"
        style="text-align: right"
      >
        <v-btn color="primary" dark class="mb-2" @click="addCompany">
          Thêm công ty
        </v-btn>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
  </v-card-title>
  <v-data-table
    v-if="!fetching"
    v-model:expanded="expanded"
    :style="isDisable()"
    :headers="headers"
    :items="companies_"
    :search="search"
    show-expand
  >
    <template v-slot:item.logo="{ item }">
      <v-img
        :src="base64Img(item.url_image)"
        width="100%"
        alt="Hình ảnh từ máy chủ"
        loading="lazy"
        style="border-radius: 10px; margin: 2px 3px 2px 0"
      ></v-img>
    </template>
    <template v-slot:item.info="{ item }">
      <div style="white-space: pre-wrap">
        Website:
        <span v-if="item.website" style="font-weight: bold">
          {{ item.website }} </span
        ><br />
        SĐT:
        <span v-if="item.phone_number" style="font-weight: bold">
          {{ item.phone_number }} </span
        ><br />
        Địa chỉ:
        <span v-if="item.address" style="font-weight: bold">
          {{ item.address }}
        </span>
      </div>
    </template>
    <template v-slot:item.contact="{ item }">
      <div style="white-space: pre-wrap">
        Họ và tên:
        <span
          v-if="item.company_contacts[0].fullname"
          style="font-weight: bold"
        >
          {{ item.company_contacts[0].fullname }} </span
        ><br />
        Email:
        <span v-if="item.company_contacts[0].email" style="font-weight: bold">
          {{ item.company_contacts[0].email }} </span
        ><br />
        SĐT:
        <span
          v-if="item.company_contacts[0].phone_number"
          style="font-weight: bold"
        >
          {{ item.company_contacts[0].phone_number }}
        </span>
      </div>
    </template>
    <template v-slot:item.actions="{ item }">
      <span
        v-if="
          store.data.user.permission === 'admin' ||
          store.data.user.permission === 'KD'
        "
      >
        <v-tooltip text="Tạo gói khám">
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
        </v-tooltip>
        <v-icon size="small" class="me-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon>
      </span>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
    </template>
    <template v-slot:expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length">
          <v-card class="mx-auto ma-2" style="background-color: #e7eef3">
            <CompanyServicePacks
              :is_follow_company="true"
              :company_id="item.id"
            />
          </v-card>
        </td>
      </tr>
    </template>
  </v-data-table>

  <!-- Dialog chỉnh sửa dữ liệu công ty -->
  <v-dialog v-model="dialog" max-width="700px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ formTitle }} công ty</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col class="col-edit" cols="12" sm="12" md="12">
              <v-text-field
                v-model="editedItem.name"
                color="blue"
                label="Tên công ty(*)"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="12" md="6">
              <v-text-field
                v-model="editedItem.phone_number"
                :rules="phoneNumberRule"
                color="blue"
                maxlength="11"
                label="Số điện thoại công ty(*Số Việt Nam)"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="12" md="6">
              <v-text-field
                v-model="editedItem.website"
                color="blue"
                label="Website công ty"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="12" md="12">
              <v-text-field
                v-model="editedItem.address"
                color="blue"
                label="Địa chỉ(*)"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="12" md="6">
              <v-text-field
                v-model="editedItem.company_contacts[0].fullname"
                color="blue"
                label="Tên người liên hệ(*)"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="12" md="6">
              <v-text-field
                v-model="editedItem.company_contacts[0].phone_number"
                :rules="phoneNumberRule"
                color="blue"
                maxlength="11"
                label="Số điện thoại người liên hệ(*Số Việt Nam)"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="12" md="12">
              <v-text-field
                v-model="editedItem.company_contacts[0].email"
                :rules="emailRules"
                color="blue"
                label="Email người liên hệ(*)"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="12" md="6">
              <v-text-field
                v-model="editedItem.company_contacts[0].position"
                color="blue"
                label="Chức vụ người liên hệ(*)"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="12" md="6">
              <v-file-input
                color="blue"
                ref="imgInput"
                accept="image/png, image/jpeg, image/bmp"
                placeholder="Pick an avatar"
                prepend-icon="mdi-camera"
                label="Logo"
                @change="handleSendFileChange"
                variant="outlined"
              ></v-file-input>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
          Cancel
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="save()">
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
          Bạn có chắc xóa công ty&nbsp;<b>{{ editedItem.name }}</b
          >&nbsp;ra khỏi dữ liệu?
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
          >Cancel</v-btn
        >
        <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog tạo gói khám -->
  <v-dialog v-model="dialogPackage" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">Tạo gói khám</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col class="col-edit" cols="12">
              <v-text-field
                v-model="store.data.packageAdd.name"
                label="Tên gói khám"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="6" md="4">
              <v-text-field
                v-model="store.data.packageAdd.register_year"
                :rules="[numberRule]"
                label="Năm tạo"
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="6" md="4">
              <v-text-field
                v-model="store.data.packageAdd.price"
                label="Giá trị gói khám"
                variant="outlined"
                @focus="followKSKPrice"
                @blur="blurKSKPrice"
              ></v-text-field>
            </v-col>
            <v-col class="col-edit" cols="12" sm="6" md="4">
              <v-text-field
                v-model="store.data.packageAdd.number_of_employees"
                :rules="[numberRule]"
                label="Số lượng nhân viên"
                variant="outlined"
                @focus="followKSKAmount"
                @blur="blurKSKAmount"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDialogPackage">
          Đóng
        </v-btn>
        <!-- <v-btn color="blue-darken-1" variant="text" @click="createPackage()">
          Khởi tạo
        </v-btn> -->
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogCreatePackageSchedule = true"
        >
          Khởi tạo
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận khởi tạo gói khám -->
  <v-dialog
    width="auto"
    v-model="dialogCreatePackageSchedule"
    class="schedule_dialog"
  >
    <v-card>
      <v-card-title align="center">
        Xác nhận thêm gói khám&nbsp;<b>{{ store.data.packageAdd.name }}</b
        >&nbsp;vào dữ liệu?
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogCreatePackageSchedule = false"
        >
          Hủy
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="checkBeforeCreatePack()"
        >
          Xác nhận
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog đặt lịch khám cho gói -->
  <v-dialog
    v-model="store.state.dialogPakageSchedule"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar dark color="white">
        <v-btn icon light @click="store.state.dialogPakageSchedule = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Đặt lịch khám</v-toolbar-title>
        <v-spacer></v-spacer>
      </v-toolbar>
      <v-card-text>
        <Calendar v-if="store.state.isShowSchedule" />
      </v-card-text>
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
import numeral from "numeral";
import Calendar from "../time_manage/Calendar.vue";
import Snackbar from "../utilities/Snackbar.vue";
import ProgressCircular from "../utilities/ProgressCircular.vue";
import SingleProgressCircular from "../utilities/SingleProgressCircular.vue";
import PacksOfCompany from "./PacksOfCompany.vue";
import CompanyServicePacks from "./CompanyServicePacks.vue";
export default {
  name: "HomePage",
  components: {
    Calendar,
    Snackbar,
    ProgressCircular,
    SingleProgressCircular,
    PacksOfCompany,
    CompanyServicePacks,
  },
  data() {
    return {
      expanded: [],
      formTitle: null,
      fetching: false,

      dialog: false,
      dialogDelete: false,
      dialogPackage: false,
      dialogCreatePackageSchedule: false,

      display_style: "none",

      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),

      search: "",
      headers: [
        {
          align: "start",
          key: "stt",
          sortable: false,
          title: "STT",
        },
        { key: "logo", title: "Logo" },
        { key: "name", title: "Tên công ty" },
        { key: "info", title: "Thông tin công ty" },
        { key: "contact", title: "Liên hệ" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      companies_: [
        {
          id: 1,
          stt: 1,
          name: null,
          phone_number: null, //new
          website: null, //new
          address: null, //new
          company_contacts: [
            {
              fullname: null,
              phone_number: null, //new
              email: null,
              position: null,
            },
          ],
          logo: "",
        },
      ],
      packages_: [
        {
          id: null,
          name: null,
          company_id: null,
          register_year: 0,
          price: null,
          number_of_employees: 0,
        },
      ],
      editedPackageIndex: -1,
      editedPackage: {
        id: null,
        name: null,
        company_id: null,
        register_year: 0,
        price: null,
        number_of_employees: 0,
      },
      defaultPackage: {
        id: null,
        name: null,
        company_id: null,
        register_year: 0,
        price: null,
        number_of_employees: 0,
      },

      editedIndex: -1,
      editedItem: {
        id: null,
        stt: null,
        name: null,
        phone_number: null,
        website: null,
        address: null,
        company_contacts: [
          {
            id: null,
            fullname: null,
            phone_number: null,
            email: null,
            position: null,
          },
        ],
        logo: null,
      },
      defaultItem: {
        id: null,
        stt: null,
        name: null,
        phone_number: null,
        website: null,
        address: null,
        company_contacts: [
          {
            fullname: null,
            phone_number: null,
            email: null,
            position: null,
          },
        ],
        logo: null,
      },
      selectedLogo: null,
      companies_data_: [],
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
    };
  },

  async mounted() {
    this.store.state.isManageSchedule = false;
    if (this.store.data.user.permission) {
      await this.fetchFirstData();
    }
  },
  watch: {
    "store.data.packageAdd.price"() {
      // Định dạng giá tiền với dấu phẩy ở hàng nghìn, triệu, tỷ, v.v.
      this.store.data.packageAdd.price = numeral(
        this.store.data.packageAdd.price
      ).format("0,0");
    },
    // async "store.state.isLogin"(newValue, oldValue) {
    //   console.log("oldValue", oldValue, "and NewValue2", newValue);
    //   if (this.store.state.isLogin === true) {
    //     console.log("load lại companies_");
    //     await this.fetchFirstData();
    //   }
    //   console.log("store.state.isLogin", this.store.state.isLogin);
    // },

    async "store.data.user.permission"(newVal, oldVal) {
      if (newVal) {
        console.log("load lại companies_ theo permission");
        await this.fetchFirstData();
      }
    },

    async "store.state.dialogPakageSchedule"(newVal, oldVal) {
      if (newVal === false) {
        await this.fetchFirstData();
        this.dialogPackage = false;
      }
    },

    dialogPackage(newVal, oldVal) {
      if (newVal === false) {
        this.store.state.isCreatePackage = false;
        this.store.state.isShowSchedule = false;
        this.store.state.snackbar.variant = "flat";
        this.store.state.snackbar.color_text = "#5f9431";
        this.store.state.snackbar.color_close = "white";
      }
    },
    dialog(newVal, oldVal) {
      if (newVal === false) {
        console.log("close");
        this.close();
      }
    },
  },
  methods: {
    base64Img(base64Str) {
      return `data:image/png;base64,${base64Str ? base64Str : ""}`;
    },
    async checkBeforeCreatePack() {
      this.store.state.snackbar.variant = "flat";
      this.store.state.snackbar.color_text = "#5f9431";
      this.store.state.snackbar.color_close = "white";
      this.store.state.snackbar.timeout = 3000;

      this.store.data.packageAdd.price = parseInt(
        this.store.data.packageAdd.price.replace(/\D/g, ""),
        10
      );
      if (!this.store.data.packageAdd.name) {
        console.log(this.store.state);
        this.store.state.snackbar.text = "Tên gói khám không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (
        !this.store.data.packageAdd.register_year ||
        Number(this.store.data.packageAdd.register_year) <
          new Date().getFullYear()
      ) {
        this.store.state.snackbar.text =
          "Năm đăng ký phải lớn hơn hoặc bằng năm hiện tại!";
        this.store.state.snackbar.state = true;
      } else if (!this.store.data.packageAdd.price) {
        this.store.state.snackbar.text =
          "Giá trị gói khám không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!Number.isInteger(Number(this.store.data.packageAdd.price))) {
        this.store.state.snackbar.text = "Giá trị gói khám phải là số!";
        this.store.state.snackbar.state = true;
      } else if (Number(this.store.data.packageAdd.price) <= 0) {
        this.store.state.snackbar.text = "Giá trị gói khám phải lớn hơn 0!";
        this.store.state.snackbar.state = true;
      } else if (!this.store.data.packageAdd.number_of_employees) {
        this.store.state.snackbar.text =
          "Số lượng nhân viên không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (
        !Number.isInteger(
          Number(this.store.data.packageAdd.number_of_employees)
        )
      ) {
        this.store.state.snackbar.text = "Số lượng nhân viên phải là số!";
        this.store.state.snackbar.state = true;
      } else if (Number(this.store.data.packageAdd.number_of_employees) <= 0) {
        this.store.state.snackbar.text = "Số lượng nhân viên phải lớn hơn 0!";
        this.store.state.snackbar.state = true;
      }
      // Thỏa điều kiện
      else {
        await this.filtersStore.createPackageSchedule();
        this.dialogCreatePackageSchedule = false;
        this.dialogPackage = false;
      }
    },
    followKSKPrice() {
      if (!this.store.data.packageAdd.price) {
        this.store.data.packageAdd.price = null;
      }
    },
    blurKSKPrice() {
      if (!this.store.data.packageAdd.price) {
        this.store.data.packageAdd.price = 0;
      }
    },
    followKSKAmount() {
      if (!this.store.data.packageAdd.number_of_employees) {
        this.store.data.packageAdd.number_of_employees = null;
      }
    },
    blurKSKAmount() {
      if (!this.store.data.packageAdd.number_of_employees) {
        this.store.data.packageAdd.number_of_employees = 0;
      }
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
      }
    },
    async fetchFirstData() {
      console.log("fetch đây");
      this.fetchHeader();
      this.fetching = true;
      this.store.state.progress_circular.state = true;
      this.store.state.progress_circular.icon = "mdi-domain";
      const headers = {
        authentication: localStorage.getItem("loginToken")
          ? localStorage.getItem("loginToken")
          : "",
      };
      if (this.store.data.user.permission === "admin") {
        console.log("gửi axios");
        // const response = await $fetch("/api/DataTables/Selects/companies", {
        //   method: "post",
        //   body: {
        //     internal_hospital_id: localStorage.getItem("internal_hospital_id"),
        //     headers,
        //   },
        // });
        const response = await axios.get(
          `${useRuntimeConfig().public.DOMAIN}/select-companies`,
          {
            params: {
              internal_hospital_id: localStorage.getItem(
                "internal_hospital_id"
              ),
              headers,
            },
          }
        );
        if (response) {
          console.log("response.data", response);
          // this.posts = response.data;
          if (response?.data?.his_ace_companies) {
            this.companies_ = response?.data?.his_ace_companies;
            console.log("companies_data_", this.companies_);
          }
          if (this.companies_ && this.companies_.length > 0) {
            let stt = 0;
            for (let index = 0; index < this.companies_.length; index++) {
              this.companies_[index].stt = ++stt;
              // await this.getImageData(this.companies_[index].id, index);
            }
          }
        }
      } else if (this.store.data.user.permission === "KD") {
        await axios
          .get(`${useRuntimeConfig().public.DOMAIN}/select-client-companies`, {
            params: {
              internal_hospital_id: localStorage.getItem(
                "internal_hospital_id"
              ),
              headers,
            },
          })
          .then(async (response) => {
            console.log("response.data", response?.data?.his_ace_companies);
            // this.posts = response.data;
            if (response?.data?.his_ace_companies) {
              this.companies_ = response?.data?.his_ace_companies;
              console.log("companies_data_", this.companies_);
            }
            if (this.companies_ && this.companies_.length > 0) {
              let stt = 0;
              for (let index = 0; index < this.companies_.length; index++) {
                this.companies_[index].stt = ++stt;
                // await this.getImageData(this.companies_[index].id, index);
              }
            }
          })
          .catch((e) => {
            console.log("không có data", e);
          });
      }

      this.store.state.progress_circular.state = false;
      this.store.state.progress_circular.icon = "";

      this.fetching = false;
    },

    async fetchAppointment() {
      this.store.state.progress_circular.state = true;
      this.store.state.progress_circular.icon = "mdi-calendar-today";
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
                        state: "add",
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
                    }
                    // console.log("tempEvent", tempEvent);
                    this.store.data.scheduleEvents.push(tempEvent);
                    // console.log(
                    //   "this.store.data.scheduleEvents.push",
                    //   this.store.data.scheduleEvents
                    // );
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
            this.store.state.dialogPakageSchedule = true;
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

    isDisable() {
      if (this.store.state.isLogin) {
        this.display_style = "block";
      } else {
        this.display_style = "none";
      }
      return `display: ${this.display_style};`;
    },

    addCompany() {
      this.dialog = true;
      this.formTitle = "Thêm";
    },

    addPackage(item) {
      this.editedItem = Object.assign({}, item);
      this.store.data.packageAdd.company_id = item.id;
      this.store.data.packageAdd.name = null;
      this.store.data.packageAdd.register_year = new Date().getFullYear();
      this.store.data.packageAdd.price = 0;
      this.store.data.packageAdd.number_of_employees = 0;
      this.store.data.packageAdd.session_packs = [];
      this.dialogPackage = true;
    },
    async createPackage() {
      this.store.state.snackbar.variant = "flat";
      this.store.state.snackbar.color_text = "#5f9431";
      this.store.state.snackbar.color_close = "white";
      this.store.state.snackbar.timeout = 3000;
      if (!this.store.data.packageAdd.name) {
        console.log(this.store.state);
        this.store.state.snackbar.text = "Tên gói khám không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (
        !this.store.data.packageAdd.register_year ||
        Number(this.store.data.packageAdd.register_year) <
          new Date().getFullYear()
      ) {
        this.store.state.snackbar.text =
          "Năm đăng ký phải lớn hơn hoặc bằng năm hiện tại!";
        this.store.state.snackbar.state = true;
      } else if (!this.store.data.packageAdd.price) {
        this.store.state.snackbar.text =
          "Giá trị gói khám không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!Number.isInteger(Number(this.store.data.packageAdd.price))) {
        this.store.state.snackbar.text = "Giá trị gói khám phải là số!";
        this.store.state.snackbar.state = true;
      } else if (Number(this.store.data.packageAdd.price) <= 0) {
        this.store.state.snackbar.text = "Giá trị gói khám phải lớn hơn 0!";
        this.store.state.snackbar.state = true;
      } else if (!this.store.data.packageAdd.number_of_employees) {
        this.store.state.snackbar.text =
          "Số lượng nhân viên không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (
        !Number.isInteger(
          Number(this.store.data.packageAdd.number_of_employees)
        )
      ) {
        this.store.state.snackbar.text = "Số lượng nhân viên phải là số!";
        this.store.state.snackbar.state = true;
      } else if (Number(this.store.data.packageAdd.number_of_employees) <= 0) {
        this.store.state.snackbar.text = "Số lượng nhân viên phải lớn hơn 0!";
        this.store.state.snackbar.state = true;
      }
      // Thỏa điều kiện
      else {
        this.fetchAppointment();
        this.store.state.isCreatePackage = true;
      }
    },

    editItem(item) {
      this.formTitle = "Sửa";
      this.editedIndex = this.companies_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.companies_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.store.state.single_progress_circular.icon =
        "mdi-content-save-settings";
      this.store.state.single_progress_circular.title = "Đang thực hiện...";
      this.store.state.single_progress_circular.state = true;
      // this.store.state.single_progress_circular
      console.log("delete company...", this.editedItem);
      const headers = {
        authentication: localStorage.getItem("loginToken"),
      };
      console.log("headers", headers);
      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/quick-select-package_ids`, {
          params: {
            headers: headers,
            company_id: this.editedItem.id,
          },
        })
        .then(async (response) => {
          if (response.data?.his_ace_company_service_packs?.length > 0) {
            const tempPacks = response.data.his_ace_company_service_packs;
            for (let index = 0; index < tempPacks.length; index++) {
              const tempPackName = tempPacks[index].name
                ? tempPacks[index].name
                : "";
              this.store.state.single_progress_circular.title = `Đang xóa gói khám ${tempPackName}...`;
              await axios
                .post(
                  `${
                    useRuntimeConfig().public.DOMAIN
                  }/delete-company-service-packs`,
                  { package_id: tempPacks[index].id }
                )
                .then((response) => {
                  if (response?.data) {
                    console.log("delete thành công", response.data); // thông báo thành công
                    this.store.state.snackbar =
                      this.store.state.snackbar_default;
                    this.store.state.snackbar.text = `Xóa thành công gói khám ${tempPackName}!`;
                    this.store.state.snackbar.state = true;
                  } else {
                    console.log("không có data", e);
                    // thông báo không thành công
                    this.store.state.snackbar = this.store.state.snackbar_error;
                    this.store.state.snackbar.text = `Xóa không thành công gói khám ${tempPackName}!`;
                    this.store.state.snackbar.state = true;
                  }
                })
                .catch((e) => {
                  // thông báo không thành công
                  this.store.state.snackbar = this.store.state.snackbar_error;
                  this.store.state.snackbar.text = `Lỗi khi xóa gói khám ${tempPackName}!`;
                  this.store.state.snackbar.state = true;
                });
            }
            console.log("response.data", response.data);
          }
        });
      this.store.state.single_progress_circular.title = `Đang xóa công ty ${this.editedItem.name}...`;
      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/delete-companies`, {
          params: {
            headers: headers,
            company_id: this.editedItem.id,
            company_contact_id: this.editedItem.company_contacts[0]?.id,
          },
        })
        .then((response) => {
          if (response?.data) {
            console.log("delete thành công", response.data);
            this.closeDelete();
            // thông báo thành công
            this.store.state.snackbar = this.store.state.snackbar_default;
            this.store.state.snackbar.text = `Xóa công ty ${this.editedItem?.name} thành công!`;
            this.store.state.snackbar.state = true;
            this.fetchFirstData();
          } else {
            // thông báo không thành công
            this.store.state.snackbar = this.store.state.snackbar_error;
            this.store.state.snackbar.text = `Xóa công ty${this.editedItem?.name} không thành công!`;
            this.store.state.snackbar.state = true;
          }
        })
        .catch((e) => {
          console.log("không có data", e);
          // thông báo không thành công
          this.store.state.snackbar = this.store.state.snackbar_error;
          this.store.state.snackbar.text = `Lỗi khi xóa công ty ${this.editedItem?.name}!`;
          this.store.state.snackbar.state = true;
        });

      // Đóng circle load
      this.store.state.single_progress_circular.state = false;
      this.store.state.single_progress_circular.icon = "";
      this.store.state.single_progress_circular.title = "";
    },

    close() {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDialogPackage() {
      this.dialogPackage = false;
      this.store.data.packageAdd.session_packs = [];
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.store.data.packageAdd = Object.assign({}, this.defaultPackage);
        // console.log("this.store.data.packageAdd", this.store.data.packageAdd);
        this.editedPackageIndex = -1;
        this.editedIndex = -1;
      });
      this.store.state.isCreatePackage = true;
    },

    async save() {
      console.log("save: set object", this.editedIndex);
      // kiểm tra field nhập
      if (!this.editedItem.name) {
        this.store.state.snackbar.text = "Tên công ty không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.phone_number) {
        this.store.state.snackbar.text =
          "Số điện thoại công ty không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (
        !/^[Z0-9-()]+(\s+[Z0-9-()]+)*$/.test(this.editedItem.phone_number)
      ) {
        this.store.state.snackbar.text = "Số điện thoại công ty phải là số";
        this.store.state.snackbar.state = true;
      } else if (
        !(
          this.editedItem.phone_number[0] === "0" &&
          (this.editedItem.phone_number.length === 11 ||
            this.editedItem.phone_number.length === 10)
        )
      ) {
        this.store.state.snackbar.text =
          "Sđt công ty phải có 10 hoặc 11 số. Vd: 07012345678";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.address) {
        this.store.state.snackbar.text = "Địa chỉ công ty không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.company_contacts[0].fullname) {
        this.store.state.snackbar.text =
          "Tên người liên hệ không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.company_contacts[0].phone_number) {
        this.store.state.snackbar.text =
          "Số điện thoại người liên hệ không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (
        !/^[Z0-9-()]+(\s+[Z0-9-()]+)*$/.test(
          this.editedItem.company_contacts[0].phone_number
        )
      ) {
        this.store.state.snackbar.text =
          "Số điện thoại người liên hệ phải là số";
        this.store.state.snackbar.state = true;
      } else if (
        !(
          this.editedItem.company_contacts[0].phone_number[0] === "0" &&
          (this.editedItem.company_contacts[0].phone_number.length === 11 ||
            this.editedItem.company_contacts[0].phone_number.length === 10)
        )
      ) {
        this.store.state.snackbar.text =
          "Sđt người liên hệ phải có 10 hoặc 11 số. Vd: 07012345678";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.company_contacts[0].position) {
        this.store.state.snackbar.text =
          "Chức vụ người liên hệ không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (
        !this.editedItem.company_contacts[0].email ||
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/.test(
          this.editedItem.company_contacts[0].email
        )
      ) {
        this.store.state.snackbar.text =
          "email phải đúng định dạng. vd: nvmau@gmail.com";
        this.store.state.snackbar.state = true;
      } else {
        this.store.state.single_progress_circular.icon =
          "mdi-content-save-settings";
        this.store.state.single_progress_circular.state = true;
        // Cập nhật thông tin công ty
        if (this.editedIndex > -1) {
          this.store.state.single_progress_circular.title = "Đang cập nhật...";
          console.log("save: update object");
          const Company = {
            address: this.editedItem.address,
            code: null,
            internal_hospital_id: this.store.state.internal_hospital_id,
            name: this.editedItem.name,
            phone_number: this.editedItem.phone_number,
            url_image: null,
            website: this.editedItem.website,
            status: 1,
          };
          const CompanyContact = {
            address: null,
            birthday: null,
            code_name: null,
            email: this.editedItem.company_contacts[0]?.email,
            firstname: null,
            fullname: this.editedItem.company_contacts[0]?.fullname,
            lastname: null,
            phone_number: this.editedItem.company_contacts[0]?.phone_number,
            position: this.editedItem.company_contacts[0]?.position,
          };
          const headers = {
            authentication: localStorage.getItem("loginToken")
              ? localStorage.getItem("loginToken")
              : "",
          };
          await axios
            .get(`${useRuntimeConfig().public.DOMAIN}/update-companies`, {
              params: {
                headers: headers,
                company: Company,
                company_id: this.editedItem.id,
                company_contact: CompanyContact,
                company_contact_id: this.editedItem.company_contacts[0]?.id,
              },
            })
            .then(async (response) => {
              if (response?.data) {
                console.log("update thành công", response.data);
                if (
                  response?.data?.update_his_ace_companies?.returning[0]?.id
                ) {
                  this.store.state.single_progress_circular.title =
                    "Đang cập nhật hình ảnh...";
                  await this.uploadImage(
                    response?.data?.update_his_ace_companies?.returning[0]?.id
                  );
                } else {
                  console.log("không có id company update");
                }
                Object.assign(
                  this.companies_[this.editedIndex],
                  this.editedItem
                );
                this.store.state.snackbar.text = "Cập nhật thành công!";
                this.store.state.snackbar.timeout = 3500;
                this.store.state.snackbar.state = true;
                this.store.state.single_progress_circular.state = false;
                this.dialog = false;
                await this.fetchFirstData();
              }
            })
            .catch((e) => {
              console.log("không có data", e);
            });
        }
        // Thêm công ty
        else {
          this.store.state.single_progress_circular.title = "Đang lưu...";
          console.log("this.store.data.user.id", this.store.data.user.id);
          const Objects = {
            address: this.editedItem.address,
            code: null,
            internal_hospital_id: this.store.state.internal_hospital_id,
            name: this.editedItem.name,
            phone_number: this.editedItem.phone_number,
            url_image: null,
            website: this.editedItem.website,
            status: 1,
            created_by: this.store.data.user.id,
            company_contacts: {
              data: {
                address: null,
                birthday: null,
                code_name: null,
                email: this.editedItem.company_contacts[0]?.email,
                firstname: null,
                fullname: this.editedItem.company_contacts[0]?.fullname,
                lastname: null,
                phone_number: this.editedItem.company_contacts[0]?.phone_number,
                position: this.editedItem.company_contacts[0]?.position,
              },
            },
          };
          const headers = {
            authentication: localStorage.getItem("loginToken")
              ? localStorage.getItem("loginToken")
              : "",
          };
          await axios
            .get(`${useRuntimeConfig().public.DOMAIN}/insert-companies`, {
              params: {
                objects: Objects,
                headers: headers,
              },
            })
            .then(async (response) => {
              if (response?.data) {
                console.log("insert thành công", response.data);
                this.companies_.push(this.editedItem);
                this.companies_[this.companies_.length - 1].stt =
                  this.companies_.length;
                if (
                  response?.data?.insert_his_ace_companies?.returning[0]?.id
                ) {
                  this.store.state.single_progress_circular.title =
                    "Đang lưu hình ảnh...";
                  await this.uploadImage(
                    response?.data?.insert_his_ace_companies?.returning[0]?.id
                  );
                } else {
                  console.log("không có id company insert");
                }

                this.store.state.snackbar = this.store.state.snackbar_default;
                this.store.state.snackbar.text = "Thêm thành công!";
                this.store.state.snackbar.timeout = 3500;
                this.store.state.snackbar.state = true;
                this.store.state.single_progress_circular.state = false;
                this.dialog = false;
                await this.fetchFirstData();
              }
            })
            .catch((e) => {
              console.log("không có data", e);
            });
        }
        this.close();
        this.store.state.single_progress_circular.state = false;
        this.store.state.single_progress_circular.icon = "";
      }
    },

    // xử lý file ảnh trước khi gửi lên serve
    handleSendFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type.startsWith("image/")) {
          // Đây là tệp hình ảnh
          // Xử lý tệp hình ảnh ở đây nếu cần
          console.log("event.target.files[0]", event.target.files[0]);
          this.selectedLogo = event.target.files[0];
        } else {
          // Không phải tệp hình ảnh
          this.clearImageInput();
          alert("Please select an image file.");
        }
      }
    },

    clearImageInput() {
      this.$refs.imgInput.value = ""; // Xóa giá trị của input file
    },

    async uploadImage(company_id) {
      if (this.selectedLogo) {
        const formData = new FormData();

        const filename = `${company_id}.jpg`;
        formData.append("image", this.selectedLogo, filename);
        formData.append("company_id", company_id);
        console.log("formData img", formData);
        try {
          await axios.post(
            `${useRuntimeConfig().public.DOMAIN}/upload-logo-company`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("Image uploaded successfully.");

          console.log("upload hình ảnh thành công");
          this.selectedLogo = null; // Reset selected file
        } catch (error) {
          console.error("Error uploading image:", error);
          console.log("lỗi upload hình ảnh");
        }
      } else {
        console.warn("No image selected.");
        console.log("không có hình ảnh được chọn");
      }
    },
    // async getImageData(company_id, index) {
    //   try {
    //     const imageName = `${company_id}.jpg`;
    //     const response = await axios.get(
    //       `${useRuntimeConfig().public.DOMAIN}/get_logo_company`,
    //       {
    //         responseType: "arraybuffer", // Cho phép nhận dữ liệu nhị phân (binary data)
    //         params: { imageName: imageName },
    //       }
    //     );
    //     if (response?.data) {
    //       console.log("response.data", response.data);
    //       const imageData = response.data;
    //       if (imageData?.byteLength) {
    //         const blob = new Blob([imageData], { type: "image/png" });
    //         this.companies_[index].logo = URL.createObjectURL(blob);
    //       } else {
    //         console.log("không có dữ liệu hình ảnh");
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Lỗi khi lấy dữ liệu hình ảnh:", error);
    //   }
    // },
  },
};
</script>

<style scoped>
.col-edit {
  margin-top: -30px;
}
.background_style {
}
</style>