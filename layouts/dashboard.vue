<template>
  <v-card
    class="card_style"
    image="https://img.freepik.com/free-vector/blue-dna-blue-medical-healthcare-background_1017-24093.jpg"
    theme="dark"
  >
    <v-app-bar class="app-bar">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title class="app-bar-title">
        <v-row justify="center">
          <v-col>
            <v-tabs
              v-model="tab"
              color="light-green-accent-2"
              align-tabs="center"
            >
              <v-tab
                v-for="item in layout.app_bar.items"
                :key="item.id"
                :value="item.id"
                @click="getListNavDraw(item), (drawer = true)"
                >{{ item.title }}</v-tab
              >
            </v-tabs>
          </v-col>
        </v-row>
      </v-app-bar-title>
      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" class="app-bar" permanent>
      <v-list color="transparent">
        <NuxtLink
          v-for="item in layout.nav_draw_now.items"
          :key="item.id"
          :to="item.path"
          class="link_style"
        >
          <v-list-item
            :value="item.id"
            width="100%"
            color="light-green-accent-2"
            :prepend-icon="item.icon"
            :title="item.title"
          >
          </v-list-item>
        </NuxtLink>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block @click="logOut()"> Logout </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
    <v-main>
      <v-card theme="light" class="pa-2">
        <slot />
      </v-card>
    </v-main>
  </v-card>
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
export default {
  name: "DashboardLayout",
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
      items: [
        { text: "Real-Time", icon: "mdi-clock" },
        { text: "Audience", icon: "mdi-account" },
        { text: "Conversions", icon: "mdi-flag" },
      ],
      layout: {
        app_bar: {
          items: [
            {
              id: 1,
              icon: null,
              title: "Trang chủ",
            },
            {
              id: 2,
              icon: null,
              title: "Quản lý khám bệnh",
            },
            {
              id: 3,
              icon: null,
              title: "Quản lý lịch khám",
            },
            {
              id: 4,
              icon: null,
              title: "Báo cáo",
            },
          ],
        },
        nav_draw: {
          items: [
            {
              id: 1,
              icon: "mdi-view-dashboard",
              title: "Dashboard",
              path: "/",
              app_bar_id: 1,
            },
            {
              id: 2,
              icon: "mdi-domain",
              title: "Danh sách công ty",
              path: "/table_manage/companies",
              app_bar_id: 2,
              permission: ["admin"],
            },
            {
              id: 3,
              icon: "mdi-medical-bag",
              title: "Danh sách gói khám",
              path: "/table_manage/company_packages",
              app_bar_id: 2,
            },
            {
              id: 4,
              icon: "mdi-account-box",
              title: "Danh sách bệnh nhân",
              path: "/table_manage/patients",
              app_bar_id: 2,
            },
            {
              id: 5,
              icon: "mdi-calendar-today",
              title: "Danh sách lịch hẹn",
              path: "/schedule_manage/examination_schedule",
              app_bar_id: 3,
            },
            {
              id: 6,
              icon: "mdi-clipboard-clock-outline",
              title: "Số lượng khám thực",
              path: "/table_manage/real_examination",
              app_bar_id: 3,
            },
            {
              id: 7,
              icon: "mdi-file-export",
              title: "Báo cáo trong ngày",
              path: "/",
              app_bar_id: 4,
            },
          ],
        },
        nav_draw_now: {
          items: [
            {
              id: 1,
              icon: "mdi-view-dashboard",
              title: "Dashboard",
              path: "/",
            },
          ],
        },
      },
      overlay: true,
      text: "dashboard",
      tab: null,
      drawer: true,
    };
  },

  async mounted() {
    await this.fetchLogin();
    await this.filtersStore.fetchUser();
  },
  methods: {
    async fetchLogin() {
      this.overlay = true;
      await this.filtersStore.fetchLogin();
      this.overlay = false;
    },
    testLogin() {
      return this.store.state.isLogin;
    },
    getListNavDraw(item) {
      this.layout.nav_draw_now.items = [];
      for (let i = 0; i < this.layout.nav_draw.items.length; i++) {
        if (item.id === this.layout.nav_draw.items[i].app_bar_id) {
          const tempItem = {
            id: this.layout.nav_draw.items[i].id,
            icon: this.layout.nav_draw.items[i].icon,
            title: this.layout.nav_draw.items[i].title,
            path: this.layout.nav_draw.items[i].path,
          };
          if (
            this.layout.nav_draw.items[i]?.permission &&
            this.layout.nav_draw.items[i].permission.length > 0
          ) {
            for (
              let j = 0;
              j < this.layout.nav_draw.items[i].permission.length;
              j++
            ) {
              if (
                this.layout.nav_draw.items[i].permission[j] ===
                this.store.data.user.permission
              ) {
                this.layout.nav_draw_now.items.push(tempItem);
              }
            }
          } else {
            this.layout.nav_draw_now.items.push(tempItem);
          }
        }
      }
      console.log(this.layout.nav_draw_now);
    },

    logOut() {
      localStorage.removeItem("loginToken");
      this.store.state.isLogin = false;
      this.$router.push({ path: "/login" });
    },
  },
};
</script>

<style scoped>
.app-bar {
  background-color: rgba(0, 0, 0, 0.3);
  box-shadow: 5px 10px rgba(59, 202, 59, 0) !important;
  margin-bottom: 2vh;
}
.app-bar-title {
  font-weight: bold;
  vertical-align: middle;
}
.app-bar-item {
  color: rgb(0, 0, 0);
  font-family: "Times New Roman", Times, serif;
}
.app-bar-icon {
  display: block;
}
.v-toolbar__content,
.v-toolbar__extension {
  height: 5vw !important;
}
.card_style {
  display: flex;
  border-radius: 0;
  min-height: 100vh;
  /* margin-bottom: 3vw; */
}
.link_style {
  color: #fff;
  text-decoration: none;
}
.nav_btn_style {
  background: #ffffff00;
  margin: 0;
  text-align: left;
}
/* @media only screen and (max-width: 576px) {
  .app-bar-item {
    display: none;
  }
  .app-bar-icon {
    display: block;
  }
}
@media only screen and (min-width: 576px) {

  .app-bar-icon {
    display: none;
  }
}
@media only screen and (min-width: 768px) {
  .app-bar-icon {
    display: none;
  }
  .card {
  }
}
@media only screen and (min-width: 992px) {
  .app-bar-icon {
    display: none;
  }
  .card {
  }
}
@media only screen and (min-width: 1200px) {
}
@media only screen and (min-width: 1400px) {
} */
</style>