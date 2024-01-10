<template>
  <v-skeleton-loader
    v-if="fetching"
    class="mx-auto ma-2"
    elevation="12"
    max-width="100%"
    type="subtitle, table"
  ></v-skeleton-loader>
  <v-card-title v-if="!fetching">
    <v-row>
      <v-col>
        {{
          store.data.user.permission === "manager"
            ? `GÓI KHÁM ${
                packs_[0]?.company?.name ? packs_[0].company.name : "CÔNG TY"
              }`
            : store.data.user.permission === "admin"
            ? "SỐ LƯỢNG KHÁM THỰC CỦA GÓI KHÁM"
            : "DANH SÁCH GÓI"
        }}
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
    :style="isDisable()"
    :headers="headers"
    :items="packs_"
    :search="search"
  >
    <template v-slot:item.date="{ item }">
      <div
        v-for="(item2, index) in item.appointment_company_service_packs"
        :key="index"
        style="margin: 10px 0 10px 0"
      >
        <span style="font-weight: bold">
          {{
            filtersStore.DataDateToValDate(
              item2.appointment_session.appointment_schedule.date
            )
          }}</span
        >&nbsp;-&nbsp;Ca
        <span style="font-weight: bold">
          {{ item2.appointment_session.name }}
        </span>
        <span style="font-size: 11px">
          ({{
            store.data.shift[Number(item2.appointment_session.name) - 1]?.time
          }})
        </span>
        &nbsp;-&nbsp; số lượng:
        <span
          style="
            font-weight: bold;
            background-color: #ffbf00aa;
            border-radius: 15px;
            padding: 5px;
          "
        >
          {{ item2.total_slot }}
        </span>
        &nbsp;-&nbsp;
        <span
          style="
            color: white;
            background-color: #1867c0;
            border-radius: 15px;
            padding: 5px;
          "
        >
          số lượng thực:
          <span style="font-weight: bold">
            {{
              Number.isInteger(Number(item2.real_num)) && item2.real_num
                ? item2.real_num
                : 0
            }}
          </span>
        </span>
        <br />
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
      <!-- <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon> -->
    </template>
    <template v-slot:no-data>
      <v-btn color="primary"> Reset </v-btn>
    </template>
  </v-data-table>

  <!-- Dialog chỉnh sửa dữ liệu bệnh nhân -->
  <v-dialog v-model="dialog" max-width="700px">
    <v-card>
      <v-card-text>
        <v-container>
          <v-row justify="center">
            <v-col style="text-align: center">
              <h3 style="color: #9b735e">
                {{ formTitle }} số lượng thực của gói khám
              </h3>
            </v-col>
          </v-row>
          <v-row class="ma-2" justify="center">
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.name"
                variant="outlined"
                color="#9b735e"
                label="Tên gói khám"
                readonly
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="12"
              sm="12"
              v-for="(
                item, index
              ) in editedItem.appointment_company_service_packs"
              :key="index"
            >
              <v-row class="col-style">
                <v-col cols="8">
                  <div style="margin-top: 15px">
                    <span style="font-weight: bold">
                      {{
                        filtersStore.DataDateToValDate(
                          item.appointment_session.appointment_schedule.date
                        )
                      }}</span
                    >&nbsp;-&nbsp;Ca
                    <span style="font-weight: bold">
                      {{ item.appointment_session.name }}
                    </span>
                    <span style="font-size: 11px">
                      ({{
                        store.data.shift[
                          Number(item.appointment_session.name) - 1
                        ]?.time
                      }})
                    </span>
                    &nbsp;-&nbsp; số lượng:
                    <span
                      style="
                        font-weight: bold;
                        background-color: #ffbf00aa;
                        border-radius: 15px;
                        padding: 5px;
                      "
                    >
                      {{ item.total_slot }}
                    </span>
                  </div>
                  <!-- <v-text-field
                    :model-value="
                      filtersStore.DataDateToValDate(
                        item.appointment_session.appointment_schedule.date
                      ) +
                      ' - buổi:' +
                      item.appointment_session.name +
                      ' - số lượng: ' +
                      item.total_slot
                    "
                    variant="outlined"
                    color="#9b735e"
                    label="Thông tin buổi"
                    readonly
                  >
                  </v-text-field> -->
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="item.real_num"
                    variant="outlined"
                    color="#9b735e"
                    label="Số lượng thực"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-divider></v-divider>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
          Đóng
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="save()">
          Lưu
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- loader -->
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
export default {
  name: "ManagerRealNumExaminationPage",
  props: {
    packs_data: {},
    fetching: false,
  },
  components: {
    Snackbar,
    ProgressCircular,
    SingleProgressCircular,
  },
  data() {
    return {
      // other
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
      overlay: false,
      formTitle: null,
      dialog: false,
      dialogDelete: false,
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
      headers: [
        { key: "name", title: "Tên gói khám" },
        { key: "date", title: "Thông tin ngày khám" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      packs_: [],
    };
  },
  async mounted() {},

  watch: {
    dialog(newVal, oldVal) {
      if (newVal === false) {
        this.close();
      }
    },

    dialogDelete(newVal, oldVal) {
      if (newVal === false) {
        this.closeDelete();
      }
    },
    packs_data(newVal, oldVal) {
      if (newVal) {
        this.packs_ = this.packs_data;
        console.log("this.packs_", this.packs_);
      }
    },
  },

  methods: {
    isDisable() {
      if (this.store.state.isLogin) {
        this.display_style = "block";
      } else {
        this.display_style = "none";
      }
      return `display: ${this.display_style};`;
    },

    async editItem(item) {
      this.formTitle = "Sửa";
      this.editedIndex = this.packs_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      console.log("this.editedIndex", this.editedIndex);
      console.log("this.editedItem", this.editedItem);
      this.dialog = true;
    },

    close() {
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
      this.editedIndex = this.packs_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      this.store.state.single_progress_circular.icon =
        "mdi-content-save-settings";
      this.store.state.single_progress_circular.title = "Đang thực hiện...";
      this.store.state.single_progress_circular.state = true;
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
            this.store.state.single_progress_circular.state = false;
            this.store.state.single_progress_circular.icon = "";
            this.store.state.single_progress_circular.title = "";
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
          this.store.state.single_progress_circular.state = false;
          this.store.state.single_progress_circular.icon = "";
          this.store.state.single_progress_circular.title = "";
          console.log("Xóa không thành công", e);
        });
    },

    async save() {
      console.log("save: set object", this.editedIndex);
      // kiểm tra field nhập
      if (!this.editedItem.name) {
        this.store.state.snackbar.text = "Tên gói khám không được để trống!";
        this.store.state.snackbar.state = true;
      } else {
        let is_not_null_real_num = false;
        let count_not_null_real_num = 0;
        for (
          let index = 0;
          index < this.editedItem.appointment_company_service_packs.length;
          index++
        ) {
          const itemSessionPack =
            this.editedItem.appointment_company_service_packs[index];
          if (!itemSessionPack.real_num) {
            this.store.state.snackbar.text =
              "Số lượng thực không được để trống!";
            this.store.state.snackbar.state = true;
          } else if (!Number.isInteger(Number(itemSessionPack.real_num))) {
            this.store.state.snackbar.text = "Số lượng thực phải là số!";
            this.store.state.snackbar.state = true;
          } else if (
            Number(itemSessionPack.real_num) >
            Number(itemSessionPack.total_slot)
          ) {
            this.store.state.snackbar.text =
              "Số lượng thực không được lớn hơn số lượng tổng!";
            this.store.state.snackbar.state = true;
          } else {
            this.editedItem.appointment_company_service_packs[index].real_num =
              Number(itemSessionPack.real_num);
            count_not_null_real_num++;
          }
        }
        if (
          count_not_null_real_num ===
          this.editedItem.appointment_company_service_packs.length
        ) {
          is_not_null_real_num = true;
          console.log("không bị trống");
        }
        if (
          is_not_null_real_num &&
          this.editedItem.appointment_company_service_packs?.length > 0
        ) {
          this.store.state.single_progress_circular.icon =
            "mdi-content-save-settings";
          this.store.state.single_progress_circular.title = "Đang cập nhật...";
          this.store.state.single_progress_circular.state = true;
          const tempSessionPacks =
            this.editedItem.appointment_company_service_packs;
          let countUpdateSessionPack = 0;

          const headers = {
            authentication: localStorage.getItem("loginToken")
              ? localStorage.getItem("loginToken")
              : "",
          };
          for (let index = 0; index < tempSessionPacks.length; index++) {
            const itemSessionPack = tempSessionPacks[index];
            // Cập nhật thông tin gói khám
            if (this.editedIndex > -1) {
              console.log("save: update object");
              await axios
                .post(
                  `${useRuntimeConfig().public.DOMAIN}/update-real-num-of-pack`,
                  {
                    session_pack: itemSessionPack,
                    headers,
                  }
                )
                .then(async (response) => {
                  if (response?.data) {
                    console.log("update gói khám thành công", response.data);
                    if (
                      response?.data
                        ?.update_his_ace_appointment_company_service_packs
                        ?.returning
                    ) {
                      countUpdateSessionPack++;
                    }
                    Object.assign(
                      this.packs_[this.editedIndex],
                      this.editedItem
                    );
                  }
                })
                .catch((e) => {
                  console.log("không có data", e);
                  this.dialog = false;
                });
            }
          }
          console.log("countUpdateSessionPack", countUpdateSessionPack);
          console.log("tempSessionPacks.length", tempSessionPacks.length);
          if (countUpdateSessionPack === tempSessionPacks.length) {
            this.store.state.snackbar = this.store.state.snackbar_default;
            this.store.state.snackbar.text = "Cập nhật gói khám thành công!";
            this.store.state.snackbar.timeout = 3500;
            this.store.state.snackbar.state = true;
          } else {
            this.store.state.snackbar = this.store.state.snackbar_default;
            this.store.state.snackbar.text = "Cập nhật không thành công!";
            this.store.state.snackbar.timeout = 3500;
            this.store.state.snackbar.state = true;
          }
          this.dialog = false;
          this.store.state.single_progress_circular.state = false;
          this.store.state.single_progress_circular.icon = "";
          this.store.state.single_progress_circular.title = "";
          this.dialog = false;
          this.store.state.isUpdateRealNum = true;
        }
        this.store.state.single_progress_circular.state = false;
        this.store.state.single_progress_circular.icon = "";
        this.store.state.single_progress_circular.title = "";
      }
    },
  },
};
</script>

<style scoped>
.col-style {
  margin: -20px 0 -20px 0;
}
.v-progress-circular {
  margin: 1rem;
}
</style>