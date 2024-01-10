// store/filters.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { useRouter } from 'vue-router';

export const useFiltersStore = defineStore('filterStore', () => {
  const filtersList = ref(['youtube', 'twitch'])
  const router = useRouter();

  // Khởi tạo headers để xác thực (auth)
  const localStorageAvailable = typeof localStorage !== 'undefined';
  const headers = ref({
    authentication: localStorageAvailable ? localStorage.getItem("loginToken")
      ? localStorage.getItem("loginToken")
      : "" : 'Default Value',
  })

  const state = ref({
    // kiểm tra đăng nhập
    isLogin: false,

    // kiểm tra thông tin bệnh nhân đặt hẹn là đúng (Giao diện bệnh nhân chọn buổi)
    isChooseAppointment: false,

    // kiểm tra thông tin bệnh nhân đặt hẹn là sai (giao diện bệnh nhân chọn buổi)
    isNoneAppointment: false,

    // kiểm tra đang chỉnh sửa lịch của gói khám
    isEditPackSchedule: false,
    isUpdatedPakageSchedule: false,

    // Kiểm tra chỉnh sửa số lượng thực
    isUpdateRealNum: false,

    // Dialog thêm lịch hẹn cho gói khám
    dialogPakageSchedule: false,

    // Dialog duyệt gói khám
    dialogAcceptPakageSchedule: false,

    // Dialog lịch hẹn
    dialogAppointment: false,

    // trạng thái đang tạo gói khám
    isCreatePackage: false,

    // trạng thái đang sửa gói khám
    isEditPackage: false,

    // trạng thái đang quản lý lịch
    isManageSchedule: false,

    // dấu hiệu trạng thái
    calendarState: "",

    internal_hospital_id: null,
    snackbar: {
      state: false,
      text: '',
      variant: 'flat',
      color_text: '#5f9431',
      color_close: '#70beef',
      timeout: 2000,
    },
    snackbar_default: {
      state: false,
      text: '',
      variant: 'flat',
      color_text: '#5f9431',
      color_close: '#70beef',
      timeout: 3000,
    },
    snackbar_error: {
      state: false,
      text: '',
      variant: 'flat',
      color_text: '#99de53',
      color_close: 'white',
      timeout: 3500,
    },

    // loader
    progress_circular: {
      state: false,
      icon: "",
    },
    single_progress_circular: {
      state: false,
      icon: "",
      title: "",
    },

    // child loader
    circle_loader: {
      state: false,
      icon: "",
    },
    single_circle_loader: {
      state: false,
      icon: "",
      title: "",
    },
    isShowSchedule: false,
  })

  const data = ref({
    // =====Variables
    user: {
      permission: null,
      company_id: null,
    },
    fullCalendarKey: 0,

    // ca làm việc
    shift: [
      {
        id: 1,
        time: '07:30 - 09:30',
      },
      {
        id: 2,
        time: '09:30 - 11:15',
      },
      {
        id: 3,
        time: '13:00 - 15:00',
      },
      {
        id: 4,
        time: '15:00 - 16:30',
      },
    ],

    packExpandID: null,

    // =====Objects
    // headers
    // headers: {
    //   authentication: localStorage.getItem("loginToken")
    //     ? localStorage.getItem("loginToken")
    //     : "",
    // },

    packageAdd: {
      id: null,
      company_id: null,
      name: null,
      register_year: new Date().getFullYear(),
      price: 0,
      number_of_employees: 0,
      session_packs: [
        {
          // id gói-buổi
          id: null,
          // id buổi
          appointment_session_id: null,
          // id gói khám
          pack_id: null,
          // có tồn tại
          is_exist: false,
          // số lượng của gói trong buổi 
          total_slot: null,
        }
      ]
    },
    patientAppointment: {
      id: null,
      fullname: null,
      birthday: null,
      phone_number: null,
      email: null,
      company_pack_id: null,
      session_id: null,
    },

    // =====Arrays
    scheduleEvents: [],
    sessionPacks: [],
    tempDeleteSessionPacks: [],

  })

  // Khởi tạo gói khám
  async function createPackageSchedule() {
    console.log("createPackageSchedule");
    if (data.value.packageAdd?.session_packs?.length > 0) {
      state.value.single_progress_circular.icon = "mdi-calendar-range";
      state.value.single_progress_circular.title = "Đang khởi tạo";
      state.value.single_progress_circular.state = true;
      // xử lý chuẩn dữ liệu gói khám
      data.value.packageAdd.register_year = Number(
        data.value.packageAdd.register_year
      );
      data.value.packageAdd.price = Number(
        data.value.packageAdd.price
      );
      data.value.packageAdd.number_of_employees = Number(
        data.value.packageAdd.number_of_employees
      );
      console.log('data.value.packageAdd', data.value.packageAdd);

      try {
        await axios
          .post(`${useRuntimeConfig().public.DOMAIN}/add-pack-schedule`, {
            package_add: data.value.packageAdd,
          })
          .then((response) => {
            if (response.data) {
              console.log("response.data", response.data);
            }
          });
      } catch (error) {
        console.log("error", error);
      }
      state.value.snackbar.text = "Thêm gói khám thành công!";
      state.value.snackbar.state = true;
      state.value.dialogPakageSchedule = false;
      state.value.single_progress_circular.state = false;
      state.value.single_progress_circular.icon = "";
      state.value.single_progress_circular.title = "";
    } else {
      state.value.snackbar.text =
        "Vui lòng đặt chỗ cho ít nhất 1 bệnh nhân của gói này!";
      state.value.snackbar.state = true;
    }
  }

  // Cập nhật gói khám
  async function updatePakageSchedule() {
    console.log("updatePakageSchedule");
    if (data.value.packageAdd?.session_packs?.length > 0) {
      // state.value.single_progress_circular.icon = "mdi-calendar-range";
      // state.value.single_progress_circular.title = "Đang cập nhật";
      // state.value.single_progress_circular.state = true;
      for (let index = 0; index < data.value.packageAdd.session_packs.length; index++) {
        try {
          await axios
            .post(`${useRuntimeConfig().public.DOMAIN}/update-pack-schedule`, {
              session_pack: data.value.packageAdd.session_packs[index],
            })
            .then((response) => {
              if (response.data) {
                console.log("response.data", response.data);

              }
            });
        } catch (error) {
          console.log("error", error);
        }
      }
      if (data.value.tempDeleteSessionPacks?.length > 0) {
        const tempDeleteSessionPacks = data.value.tempDeleteSessionPacks
        try {
          await axios
            .post(`${useRuntimeConfig().public.DOMAIN}/delete-pack-schedule`, {
              session_packs: tempDeleteSessionPacks,
            })
            .then((response) => {
              console.log("response.data", response.data);

            })
        } catch (error) {
          console.log("error", error);
        }
      }
      // Thông báo thành công
      state.value.snackbar.text = "Cập nhật gói khám thành công!";
      state.value.snackbar.state = true;
      state.value.isUpdatedPakageSchedule = true
      state.value.dialogAppointment = false;
    } else {
      state.value.snackbar.text =
        "Vui lòng đặt chỗ cho ít nhất 1 bệnh nhân của gói này!";
      state.value.snackbar.state = true;
    }
  }

  // Duyệt gói khám
  async function browsePack(pack_id: number) {
    console.log("createPakageSchedule");
    console.log('pack_id', pack_id);

    if (pack_id) {
      state.value.single_progress_circular.icon = "mdi-calendar-range";
      state.value.single_progress_circular.title = "Đang xử lý";
      state.value.single_progress_circular.state = true;
      // xử lý chuẩn dữ liệu gói khám
      const headers = {
        authentication: localStorage.getItem("loginToken")
          ? localStorage.getItem("loginToken")
          : "",
      };
      try {
        await axios
          .post(`${useRuntimeConfig().public.DOMAIN}/accept-browse-pack`, {
            pack_id: pack_id,
            headers
          })
          .then((response) => {
            if (response.data) {
              console.log("response.data", response.data);
            }
          });
      } catch (error) {
        console.log("error", error);
      }
      state.value.snackbar = state.value.snackbar_default
      state.value.snackbar.text = "Duyệt gói khám thành công!";
      state.value.snackbar.state = true;
      state.value.dialogPakageSchedule = false;
      state.value.single_progress_circular.state = false;
      state.value.single_progress_circular.icon = "";
      state.value.single_progress_circular.title = "";
    }
  }

  // Duyệt gói khám
  async function updatePackInfo(object: Object) {
    console.log("createPakageSchedule");
    console.log('pack_id', object);

    if (object) {
      state.value.single_progress_circular.icon = "mdi-calendar-range";
      state.value.single_progress_circular.title = "Đang cập nhật gói khám";
      state.value.single_progress_circular.state = true;

      // axios

      try {
        await axios
          .post(`${useRuntimeConfig().public.DOMAIN}/update-pack-info`, {
            object: object,
            headers: headers.value
          })
          .then((response) => {
            if (response.data) {
              console.log("response.data", response.data);
              if (response.data?.update_his_ace_company_service_packs?.affected_rows) {
                // Snackbar thông báo thành công
                state.value.snackbar = state.value.snackbar_default
                state.value.snackbar.text = "Cập nhật gói khám thành công!";
                state.value.snackbar.state = true;
                state.value.dialogAppointment = false;
              } else {
                // Snackbar thông báo không thành công
                state.value.snackbar = state.value.snackbar_error
                state.value.snackbar.text = "Cập nhật gói khám không thành công!";
                state.value.snackbar.state = true;
              }
            }
          });
      } catch (error) {
        console.log("error", error);
      }
      // Đóng circle load đơn
      state.value.single_progress_circular.state = false;
      state.value.single_progress_circular.icon = "";
      state.value.single_progress_circular.title = "";
    }
  }

  function ValDateToDataDate(date: string) {
    let strDate = date;
    let dateConverted = "";
    if (strDate) {
      if (Number.isInteger(Number(strDate))) {
        const [dd, mm, yyyy] = new Date(strDate)
          .toISOString()
          .split("T")[0]
          .split("-");
        const dateObject = new Date(`${yyyy}-${mm}-${dd}`);
        dateConverted = dateObject.toISOString().split("T")[0];
      } else if (strDate && strDate.includes("-")) {
        const [dd, mm, yyyy] = strDate.split("-");
        const dateObject = new Date(`${yyyy}-${mm}-${dd}`);
        dateConverted = dateObject.toISOString().split("T")[0];
      } else if (strDate && strDate.includes("/")) {
        const [dd, mm, yyyy] = strDate.split("/");
        const dateObject = new Date(`${yyyy}-${mm}-${dd}`);
        dateConverted = dateObject.toISOString().split("T")[0];
      }
    }
    return dateConverted;
  }

  function DataDateToValDate(date: string) {
    let strDate = date;
    let dateConverted = "";
    if (strDate && strDate.includes("-")) {
      const [yyyy, mm, dd] = strDate.split("-");
      dateConverted = `${dd}-${mm}-${yyyy}`;
    } else if (strDate && strDate.includes("/")) {
      const [yyyy, mm, dd] = strDate.split("/");
      dateConverted = `${dd}-${mm}-${yyyy}`;
    }
    return dateConverted;
  }

  async function fetchLogin() {
    let loginToken = null;
    if (localStorage.getItem("loginToken")) {
      loginToken = localStorage.getItem("loginToken");
    } else {
      console.log("Không có ToKen");
    }
    if (loginToken) {
      const headers = {
        authentication: loginToken,
      };
      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/auth`, {
          headers,
        })
        .then((response) => {
          // this.posts = response.data;
          if (response.data.acceptLogin) {
            state.value.isLogin = true;
          }
        })
        .catch((e) => {
          console.log(e);
          console.log("không có data");
        });

      if (state.value.isLogin) {
        //   store.state.snackbar.state = true;
        //   this.snackbar.state = store.state.snackbar.state;
        //   store.state.snackbar.text = "Welcome to TFB MAP!";
        //   this.snackbar.text = store.state.snackbar.text;
      } else {
        //   store.state.snackbar.state = true;
        //   this.snackbar.state = store.state.snackbar.state;
        //   store.state.snackbar.text = "Vui lòng đăng nhập để sử dụng dịch vụ";
        //   this.snackbar.text = store.state.snackbar.text;
        router.push({ path: "/login" });
      }
    } else {
      router.push({ path: "/login" });
    }
  }

  async function fetchUser() {
    const headers = {
      authentication: localStorage.getItem("loginToken")
        ? localStorage.getItem("loginToken")
        : "",
    };
    try {
      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/fetch-user`, {
          headers,
        })
        .then((response) => {
          if (response?.data?.permission) {
            data.value.user.permission = response.data.permission;
          }
          if (response?.data?.company_id) {
            data.value.user.company_id = response.data.company_id;
          }
          console.log('data.value.user.permission', data.value.user.permission);
          console.log('data.value.user.company_id', data.value.user.company_id);

        });
    } catch (error) {
      console.log("error", error);
    }
  }

  return {
    ValDateToDataDate,
    DataDateToValDate,
    createPackageSchedule,
    updatePakageSchedule,
    browsePack,
    updatePackInfo,
    fetchLogin,
    fetchUser,
    filtersList,
    state,
    data
  }
})