<template>
  <a-layout class="d-flex align-center justify-center" style="height: 100vh">
    <a-card
      title="Đăng nhập"
      :bordered="false"
      style="width: 300px; vertical-align: middle"
      class="mx-auto"
    >
      <a-form
        :model="user"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="checkLogin"
      >
        <a-form-item
          label="email"
          name="email"
          :rules="[{ required: true, message: 'Please input your email!' }]"
        >
          <a-input v-model:value="user.email" />
        </a-form-item>

        <a-form-item
          label="Password"
          name="password"
          :rules="[
            { required: true, message: 'Please input your password!' },

            {
              min: 4,
              message: 'Mật khẩu tối thiểu là 4 ký tự',
            },
            {
              max: 50,
              message: 'Mật khẩu phải không vượt quá 50 ký tự',
            },
          ]"
        >
          <a-input-password v-model:value="user.password" />
        </a-form-item>

        <!-- <a-form-item name="remember" :wrapper-col="{ offset: 8, span: 16 }">
          <a-checkbox v-model:checked="user.remember">Remember me</a-checkbox>
        </a-form-item> -->

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit">Submit</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </a-layout>
</template>

<script>
import { reactive } from "vue";
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
export default {
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
      is_login: storeToRefs(useFiltersStore()).state._value.isLogin,

      errors: [],
      user: {
        email: null,
        password: null,
        remember: true,
      },
      show_pass1: false,
      password: "",
      rules: {
        required: (value) => !!value || "Required.",
        min: (v) => v.length >= 8 || "Min 8 characters",
        emailMatch: () => `The email and password you entered don't match`,
      },
    };
  },
  mounted() {
    this.store.state.snackbar.variant = "flat";
    this.store.state.snackbar.color_text = "#6e6f6a";
    this.store.state.snackbar.color_close = "#b2bcba";
    this.store.state.snackbar.timeout = 5000;
  },
  methods: {
    async checkLogin() {
      if (!this.user.email) {
        // thông báo không thành công
        this.store.state.snackbar = this.store.state.snackbar_error;
        this.store.state.snackbar.text = "Email không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!this.user.password) {
        // thông báo không thành công
        this.store.state.snackbar = this.store.state.snackbar_error;
        this.store.state.snackbar.text = "Vui lòng nhập mật khẩu!";
        this.store.state.snackbar.state = true;
      } else if (this.user.email && this.user.password) {
        this.store.state.single_progress_circular.icon =
          "mdi-content-save-settings";
        this.store.state.single_progress_circular.title =
          "Kiểm tra tài khoản...";
        this.store.state.single_progress_circular.state = true;
        let data = null;
        await axios
          .get(`${useRuntimeConfig().public.DOMAIN}/login`, {
            params: {
              email: this.user.email,
              password: this.user.password,
            },
          })
          .then((response) => {
            console.log("after axios 1");
            // this.posts = response.data;
            data = response;
            if (data?.data?.ToKen) {
              console.log("data auth", data);
            } else {
              console.log("data login false", data);
              // thông báo không thành công
              this.store.state.snackbar = this.store.state.snackbar_error;
              this.store.state.snackbar.text = "Thông tin đăng nhập chưa đúng!";
              this.store.state.snackbar.state = true;

              // Đóng circle load
              this.store.state.single_progress_circular.state = false;
              this.store.state.single_progress_circular.icon = "";
              this.store.state.single_progress_circular.title = "";
            }
          })
          .catch((e) => {
            this.errors.push(e);
            console.log("không có data");

            // thông báo không thành công
            this.store.state.snackbar = this.store.state.snackbar_error;
            this.store.state.snackbar.text = "Thông tin đăng nhập chưa đúng!";
            this.store.state.snackbar.state = true;

            // Đóng circle load
            this.store.state.single_progress_circular.state = false;
            this.store.state.single_progress_circular.icon = "";
            this.store.state.single_progress_circular.title = "";
          });
        if (data) {
          console.log("data", data);
          console.log("data", data.data.ToKen);
          console.log("data", data.data.internal_hospital_id);
          if (data.data.internal_hospital_id) {
            localStorage.setItem(
              "internal_hospital_id",
              data.data.internal_hospital_id
            );
          }
          console.log(
            "this.store.state.internal_hospital_id",
            this.store.state.internal_hospital_id
          );
          console.log(
            "this.store.state.internal_hospital_id",
            data.data.internal_hospital_id
          );
        }
        const headers = {
          authentication: data?.data?.ToKen,
        };
        await axios
          .get(`${useRuntimeConfig().public.DOMAIN}/auth`, {
            headers,
          })
          .then((response) => {
            // this.posts = response.data;
            console.log("res2", response);
            if (response.data.acceptLogin) {
              this.store.state.isLogin = true;
            } else {
              // thông báo không thành công
              this.store.state.snackbar = this.store.state.snackbar_error;
              this.store.state.snackbar.text =
                "Xác thực tài khoản không thành công!";
              this.store.state.snackbar.state = true;

              // Đóng circle load
              this.store.state.single_progress_circular.state = false;
              this.store.state.single_progress_circular.icon = "";
              this.store.state.single_progress_circular.title = "";
            }
            console.log("this.store.state.isLogin", this.store.state.isLogin);
          })

          .catch((e) => {
            this.errors.push(e);
            console.log("không có data");
            // thông báo không thành công
            this.store.state.snackbar = this.store.state.snackbar_error;
            this.store.state.snackbar.text =
              "Xác thực tài khoản không thành công!";
            this.store.state.snackbar.state = true;

            // Đóng circle load
            this.store.state.single_progress_circular.state = false;
            this.store.state.single_progress_circular.icon = "";
            this.store.state.single_progress_circular.title = "";
          });
        console.log("this.store.state._value", this.store.state.isLogin);
        if (this.store.state.isLogin) {
          console.log("Đăng nhập thành công");
          // thông báo thành công
          this.store.state.snackbar = this.store.state.snackbar_default;
          this.store.state.snackbar.text = "Đăng nhập thành công!";
          this.store.state.snackbar.state = true;
          if (data?.data?.ToKen) {
            localStorage.setItem("loginToken", data.data.ToKen);
          }
          if (data?.data?.id) {
            this.store.data.user.id = data.data.id;
          }
          if (data?.data?.permission) {
            this.store.data.user.permission = data.data.permission;
          }
          this.$router.push({ path: "/" });
        } else {
          // thông báo không thành công
          this.store.state.snackbar = this.store.state.snackbar_error;
          this.store.state.snackbar.text =
            "Thông tin đăng nhập chưa chính xác!";
          this.store.state.snackbar.state = true;
        }
        //   if (store.state.path.isLogin) {
        //     store.state.snackbar.state = true;
        //     this.snackbar.state = store.state.snackbar.state;
        //     store.state.snackbar.text = "Đăng nhập thành công";
        //     this.snackbar.text = store.state.snackbar.text;
        //     if (data?.data?.ToKen) {
        //       localStorage.setItem("loginToken", data.data.ToKen);
        //     }
        //     this.$router.push({ path: "/" });
        //   } else {
        //     store.state.snackbar.state = true;
        //     this.snackbar.state = store.state.snackbar.state;
        //     store.state.snackbar.text = "Thông tin đăng nhập chưa chính xác";
        //     this.snackbar.text = store.state.snackbar.text;
        //   }

        // Đóng circle load
        this.store.state.single_progress_circular.state = false;
        this.store.state.single_progress_circular.icon = "";
        this.store.state.single_progress_circular.title = "";
      }
    },
  },
};
</script>


<style scoped>
.login-card {
  width: 30vw;
}
</style>