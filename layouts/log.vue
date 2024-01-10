<template>
  <main class="login-background">
    <slot />
    <Snackbar />
    <ProgressCircular />
    <SingleProgressCircular />
  </main>
</template>

<script>
import ProgressCircular from "~/components/utilities/ProgressCircular.vue";
import SingleProgressCircular from "~/components/utilities/SingleProgressCircular.vue";
import Snackbar from "~/components/utilities/Snackbar.vue";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import axios from "axios";
export default {
  components: {
    Snackbar,
    ProgressCircular,
    SingleProgressCircular,
  },
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
    };
  },
  mounted() {
    this.fetchLoginFromLoginPage();
  },
  methods: {
    async fetchLoginFromLoginPage() {
      this.store.state.single_progress_circular.icon =
        "mdi-content-save-settings";
      this.store.state.single_progress_circular.title = "Kiểm tra tài khoản...";
      this.store.state.single_progress_circular.state = true;
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
              this.store.state.isLogin = true;
              this.$router.push({ path: "/" });
              // thông báo thành công
              this.store.state.snackbar = this.store.state.snackbar_default;
              this.store.state.snackbar.text = "Đã đăng nhập!";
              this.store.state.snackbar.state = true;
            }
          })
          .catch((e) => {
            console.log(e);
            console.log("không có data");
          });

        if (this.store.state.isLogin) {
          //   this.snackbar.state = store.state.snackbar.state;
          //   store.state.snackbar.text = "Welcome to TFB MAP!";
          //   this.snackbar.text = store.state.snackbar.text;
          //   store.state.snackbar.state = true;
        } else {
          //   store.state.snackbar.state = true;
          //   this.snackbar.state = store.state.snackbar.state;
          //   store.state.snackbar.text = "Vui lòng đăng nhập để sử dụng dịch vụ";
          //   this.snackbar.text = store.state.snackbar.text;
        }
      } else {
      }
      // Đóng circle load
      this.store.state.single_progress_circular.state = false;
      this.store.state.single_progress_circular.icon = "";
      this.store.state.single_progress_circular.title = "";
    },
  },
};
</script>
<style scoped>
.login-background {
  background-image: url("https://firebasestorage.googleapis.com/v0/b/tfbvn-3755f.appspot.com/o/app_icon%2Fcompany-examination-admin-web%2Fbackground_login.jpg?alt=media&token=45d9c2a5-7e7c-4d11-99a0-2650022a125d&_gl=1*iuh49d*_ga*Mzg2MTcyNzg1LjE2OTkyNDIxMzc.*_ga_CW55HF8NVT*MTY5OTI0MjEzNi4xLjEuMTY5OTI0MjIxMy41My4wLjA.");
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  height: 100%;
  width: 100%;
}
</style>