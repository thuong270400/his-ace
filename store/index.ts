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
    isReFetch: false,
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
      id: null,
      permission: null,
      company_id: null,
    },
    fullCalendarKey: 0,

    // ca làm việc
    shift: [
      {
        id: 1,
        time: '07:30 - 09:00',
      },
      {
        id: 2,
        time: '09:00 - 10:30',
      },
      {
        id: 3,
        time: '13:00 - 14:00',
      },
      {
        id: 4,
        time: '14:00 - 15:30',
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
    links: '',
    scheduleEvents: [],
    sessionPacks: [],
    tempDeleteSessionPacks: [],

  })

  // Khởi tạo gói khám
  async function createPackageSchedule() {
    console.log("createPackageSchedule");
    // if (data.value.packageAdd?.session_packs?.length > 0) {
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
        .post(`${useRuntimeConfig().public.DOMAIN}/add-pack`, {
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
    state.value.isReFetch = true;
    // } else {
    //   state.value.snackbar.text =
    //     "Vui lòng đặt chỗ cho ít nhất 1 bệnh nhân của gói này!";
    //   state.value.snackbar.state = true;
    // }
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
      console.log('data.value.packageAdd.id', data.value.packageAdd.id);

      if (data.value.packageAdd.id) {
        try {
          await axios
            .post(`${useRuntimeConfig().public.DOMAIN}/update-pack-status`, {
              pack_id: data.value.packageAdd.id,
              status: 0
            })
            .then((response) => {
              if (response.data) {
                console.log("response.data update", response.data);
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
        "Vui lòng đặt chỗ cho ít nhất 1 khách hàng của gói này!";
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
              state.value.snackbar = state.value.snackbar_default
              state.value.snackbar.text = "Duyệt gói khám thành công!";
              state.value.snackbar.state = true;

              // Load lại danh sách gói khám
              state.value.isReFetch = true;
            }
          });
      } catch (error) {
        console.log("error", error);
        state.value.snackbar = state.value.snackbar_error
        state.value.snackbar.text = "Duyệt gói khám không thành công!";
        state.value.snackbar.state = true;
      }
      state.value.dialogPakageSchedule = false;
      state.value.single_progress_circular.state = false;
      state.value.single_progress_circular.icon = "";
      state.value.single_progress_circular.title = "";
    }
  }

  // Xóa buổi khám
  async function deleteSessionPack(session_pack_id: number) {


    if (session_pack_id) {
      state.value.single_progress_circular.icon = "mdi-calendar-range";
      state.value.single_progress_circular.title = "Đang thực hiện";
      state.value.single_progress_circular.state = true;
      const headers = {
        authentication: localStorage.getItem("loginToken")
          ? localStorage.getItem("loginToken")
          : "",
      };

      try {
        await axios
          .post(`${useRuntimeConfig().public.DOMAIN}/delete-session-pack`, {
            session_pack_id: session_pack_id,
            headers
          })
          .then((response) => {
            if (response.data) {
              console.log("response.data", response.data);
              state.value.snackbar = state.value.snackbar_default
              state.value.snackbar.text = "Xóa buổi khám thành công!";
              state.value.snackbar.state = true;

              // Load lại danh sách gói khám
              state.value.isReFetch = true;
            }
          });
      } catch (error) {
        state.value.snackbar = state.value.snackbar_error
        state.value.snackbar.text = "Xóa buổi khám không thành công!";
        state.value.snackbar.state = true;
      }

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
        const dateObject = new Date(`${yyyy}-${mm}-${((Number(dd) + 1)).toString()}`);
        dateConverted = dateObject.toISOString().split("T")[0];
      } else if (strDate && strDate.includes("-")) {
        const [dd, mm, yyyy] = strDate.split("-");
        const dateObject = new Date(`${yyyy}-${mm}-${(Number(dd) + 1)}`);
        dateConverted = dateObject.toISOString().split("T")[0];
      } else if (strDate && strDate.includes("/")) {
        const [dd, mm, yyyy] = strDate.split("/");
        const dateObject = new Date(`${yyyy}-${mm}-${((Number(dd) + 1)).toString()}`);
        dateConverted = dateObject.toISOString().split("T")[0];
      }
    }
    return dateConverted;
  }

  function ExcelDateToDataDate(date: string) {
    let strDate = date;
    let dateConverted = "";
    if (strDate) {
      if (Number.isInteger(Number(strDate))) {
        const [mm, dd, yyyy] = new Date(strDate)
          .toISOString()
          .split("T")[0]
          .split("-");
        const dateObject = new Date(`${yyyy}-${mm}-${((Number(dd))).toString()}`);
        dateConverted = dateObject.toISOString().split("T")[0];
      } else if (strDate && strDate.includes("-")) {
        const [mm, dd, yyyy] = strDate.split("-");
        const dateObject = new Date(`${yyyy}-${mm}-${(Number(dd))}`);
        dateConverted = dateObject.toISOString().split("T")[0];
      } else if (strDate && strDate.includes("/")) {
        const [mm, dd, yyyy] = strDate.split("/");
        const dateObject = new Date(`${yyyy}-${mm}-${((Number(dd))).toString()}`);
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

  function isValidTimestamp(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime()); // Kiểm tra nếu giá trị hợp lệ
  }

  function TimestampToValDate(timestamp: string) {
    if (!isValidTimestamp(timestamp)) {
      return null; // Trả về null hoặc giá trị mặc định nếu không hợp lệ
    }

    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
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
          if (response.data?.acceptLogin) {
            console.log('response.data', response.data);

            state.value.isLogin = true;
          }
          if (response.data?.verify?.permission) {
            data.value.user.permission = response.data?.verify?.permission
          }
          if (response.data?.verify?.id) {
            data.value.user.id = response.data?.verify?.id
          }
          if (response.data?.verify?.company_id) {
            data.value.user.company_id = response.data?.verify?.company_id
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

  async function sendEmail(headers: object, email: string, fullname: string, phone_number: string, id_patient: string) {
    console.log('headers', headers);
    let short_url = ''
    let original_url = ''
    await axios
      .post(`${useRuntimeConfig().public.DOMAIN}/send-email`, {
        variable: email,
        id_patient: id_patient,
        headers,
      })
      .then(async (response) => {
        if (response.data?.success) {
          state.value.snackbar =
            state.value.snackbar_default;
          state.value.snackbar.text = `Gửi email cho khách hàng${fullname
            ? " " + fullname
            : ""
            } thành công!`;
          state.value.snackbar.timeout = 3500;
          state.value.snackbar.state = true;
          console.log("response.data", response.data);
          console.log('response.data.original_url', response.data.original_url);
          console.log('response.data.link', response.data.short_url);
          const what = response.data.short_url ? 'true' : 'false'
          console.log('what', what);
          short_url = response.data.short_url
          original_url = response.data.original_url
          data.value.links += ',' + response.data.short_url
        } else {
          // thông báo không thành công
          state.value.snackbar =
            state.value.snackbar_error;
          state.value.snackbar.text = `Gửi email cho khách hàng${fullname
            ? " " + fullname
            : ""
            } không thành công!`;
          state.value.snackbar.state = true;
          return 0
        }
        // if (phone_number) {
        //   await sendSMS(
        //     headers,
        //     phone_number
        //       ? phone_number
        //       : "",
        //     fullname ? fullname : ""
        //   );
        // }
      })
      .catch((err) => {
        // thông báo không thành công
        state.value.snackbar =
          state.value.snackbar_error;
        state.value.snackbar.text = `Gửi email cho khách hàng${fullname
          ? " " + fullname
          : ""
          } không thành công!`;
        state.value.snackbar.state = true;
        console.log("lỗi gửi email cho bệnh nhận", err);
        return 0
      });
    return {
      short_url: short_url,
      original_url: original_url
    }
  }

  async function sendEmail2(headers: object, email: string, fullname: string, id_patient: string, date: string, session_name: string) {
    console.log('headers', headers);
    let short_url = ''
    let original_url = ''
    await axios
      .post(`${useRuntimeConfig().public.DOMAIN}/send-email-2`, {
        variable: email,
        date: date,
        session_name: session_name,
        fullname: fullname,
        id_patient: id_patient,
        headers,
      })
      .then(async (response) => {
        if (response.data?.success) {
          state.value.snackbar =
            state.value.snackbar_default;
          state.value.snackbar.text = `Gửi email cho khách hàng${fullname
            ? " " + fullname
            : ""
            } thành công!`;
          state.value.snackbar.timeout = 3500;
          state.value.snackbar.state = true;
          console.log("response.data", response.data);
          console.log('response.data.original_url', response.data.original_url);
          console.log('response.data.link', response.data.short_url);
          const what = response.data.short_url ? 'true' : 'false'
          console.log('what', what);
          short_url = response.data.short_url
          original_url = response.data.original_url
          data.value.links += ',' + response.data.short_url
        } else {
          // thông báo không thành công
          state.value.snackbar =
            state.value.snackbar_error;
          state.value.snackbar.text = `Gửi email cho khách hàng${fullname
            ? " " + fullname
            : ""
            } không thành công!`;
          state.value.snackbar.state = true;
          return 0
        }
        // if (phone_number) {
        //   await sendSMS(
        //     headers,
        //     phone_number
        //       ? phone_number
        //       : "",
        //     fullname ? fullname : ""
        //   );
        // }
      })
      .catch((err) => {
        // thông báo không thành công
        state.value.snackbar =
          state.value.snackbar_error;
        state.value.snackbar.text = `Gửi email cho khách hàng${fullname
          ? " " + fullname
          : ""
          } không thành công!`;
        state.value.snackbar.state = true;
        console.log("lỗi gửi email cho khách hàng", err);
        return 0
      });
    return {
      short_url: short_url,
      original_url: original_url
    }
  }

  async function sendSMS(headers: object, phone_number: string, fullname: string, request_id: string, date: string, session_name: number, short_url: string) {
    console.log('headers', headers);

    await axios
      .post(`${useRuntimeConfig().public.DOMAIN}/send-sms`, {
        phone_number: phone_number,
        headers,
        request_id: `${request_id}`,
        date: date,
        shift: data.value.shift[session_name - 1]?.time,
        short_url: short_url ? short_url : ''
      })
      .then((response) => {
        if (response.data?.short_url) {
          state.value.snackbar =
            state.value.snackbar_default;
          state.value.snackbar.text = `Gửi SMS cho khách hàng${fullname
            ? " " + fullname
            : ""
            } thành công!`;
          state.value.snackbar.timeout = 5000;
          state.value.snackbar.state = true;
          console.log("response.data", response.data);
        } else {
          // thông báo không thành công
          state.value.snackbar =
            state.value.snackbar_error;
          state.value.snackbar.text = `Gửi SMS cho khách hàng${fullname
            ? " " + fullname
            : ""
            } không thành công!`;
          state.value.snackbar.state = true;
        }
      })
      .catch((err) => {
        // thông báo không thành công
        state.value.snackbar = state.value.snackbar_error;
        state.value.snackbar.text = `Lỗi khi gửi SMS cho khách hàng${fullname
          ? " " + fullname
          : ""
          }!`;
        state.value.snackbar.state = true;
        console.log("lỗi gửi SMS cho bệnh nhận", err);
      });
  }

  async function sendSMSUpdate(headers: object, phone_number: string, fullname: string, request_id: string, date: string, session_name: number, short_url: string) {
    console.log('headers', headers);

    await axios
      .post(`${useRuntimeConfig().public.DOMAIN}/send-sms-update`, {
        phone_number: phone_number,
        headers,
        request_id: `${request_id}`,
        date: date,
        shift: data.value.shift[session_name - 1]?.time,
        short_url: short_url ? short_url : ''
      })
      .then((response) => {
        console.log("response", response);
        if (response.data?.sms_now) {
          state.value.snackbar =
            state.value.snackbar_default;
          state.value.snackbar.text = `Gửi SMS cho khách hàng${fullname
            ? " " + fullname
            : ""
            } thành công!`;
          state.value.snackbar.timeout = 3500;
          state.value.snackbar.state = true;
          console.log("response.data sms update", response.data);
        } else {
          // thông báo không thành công
          state.value.snackbar =
            state.value.snackbar_error;
          state.value.snackbar.text = `Gửi SMS cho khách hàng${fullname
            ? " " + fullname
            : ""
            } không thành công!`;
          state.value.snackbar.state = true;
        }
      })
      .catch((err) => {
        // thông báo không thành công
        state.value.snackbar = state.value.snackbar_error;
        state.value.snackbar.text = `Lỗi khi gửi SMS cho khách hàng${fullname
          ? " " + fullname
          : ""
          }!`;
        state.value.snackbar.state = true;
        console.log("lỗi gửi SMS cho khách hàng", err);
      });
  }


  function excelSerialToDate(serial: number) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    total_seconds -= seconds;

    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(
      date_info.getFullYear(),
      date_info.getMonth(),
      date_info.getDate()
    );
  }

  return {
    excelSerialToDate,
    sendEmail, sendEmail2, sendSMS, sendSMSUpdate,

    ValDateToDataDate, DataDateToValDate,
    ExcelDateToDataDate, TimestampToValDate,

    createPackageSchedule, updatePakageSchedule,
    browsePack, deleteSessionPack,
    updatePackInfo,
    fetchLogin, fetchUser,
    filtersList,
    state, data
  }
})