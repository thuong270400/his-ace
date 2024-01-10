<template>
  <RealExamination :packs_data="data" :fetching="fetchingProp" />
  <Snackbar />
  <ProgressCircular />
  <SingleProgressCircular />
</template>
<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import RealExamination from "~/components/data_tables/RealExamination.vue";
import Snackbar from "~/components/utilities/Snackbar.vue";
import ProgressCircular from "~/components/utilities/ProgressCircular.vue";
import SingleProgressCircular from "~/components/utilities/SingleProgressCircular.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
  name: "HomePage",
  components: {
    RealExamination,
    Snackbar,
    ProgressCircular,
    SingleProgressCircular,
  },
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
      fetchingProp: false,
      data: [],
    };
  },
  async mounted() {
    await this.filtersStore.fetchUser();
    await this.fetchFirstData();
  },
  watch: {
    "store.state.isUpdateRealNum"(newVal, oldVal) {
      console.log(
        "change store.state.isUpdateRealNum",
        this.store.state.isUpdateRealNum
      );
      if (newVal === true) {
        console.log("this.fetchFirstData()");
        this.fetchFirstData();
        this.store.state.isUpdateRealNum = false;
      }
    },
  },
  methods: {
    async fetchFirstData() {
      this.fetchingProp = true;
      this.store.state.progress_circular.state = true;
      this.store.state.progress_circular.icon = "mdi-medical-bag";
      const headers = {
        authentication: localStorage.getItem("loginToken")
          ? localStorage.getItem("loginToken")
          : "",
      };
      if (this.store.data.user.permission === "admin") {
        console.log("axios admin real num pack");
        try {
          console.log("do axios admin!");
          await axios
            .get(`${useRuntimeConfig().public.DOMAIN}/admin-real-num-of-pack`, {
              params: {
                headers,
              },
            })
            .then((response) => {
              console.log("response here!");
              if (response.data?.his_ace_company_service_packs) {
                console.log(
                  "admin-real-num-of-pack response.data",
                  response.data.his_ace_company_service_packs
                );
                this.data = response.data.his_ace_company_service_packs;
              }
            });
          console.log("done!");
        } catch (error) {
          console.log("không có data số lượng thực cho admin", error);
        }
      } else if (this.store.data.user.permission === "manager") {
        console.log("axios manager real num pack");
        try {
          try {
            await axios
              .get(
                `${useRuntimeConfig().public.DOMAIN}/manager-real-num-of-pack`,
                {
                  params: {
                    company_id: this.store.data.user.company_id,
                    headers,
                  },
                }
              )
              .then((response) => {
                if (response.data) {
                  console.log(
                    "manager-real-num-of-pack response.data",
                    response.data
                  );
                  if (response.data?.his_ace_company_service_packs) {
                    console.log(
                      "admin-real-num-of-pack response.data",
                      response.data.his_ace_company_service_packs
                    );
                    this.data = response.data.his_ace_company_service_packs;
                  }
                }
              });
          } catch (error) {
            console.log("không có data số lượng thực cho admin", error);
          }
        } catch (error) {
          console.log("không có data số lượng thực cho manager", error);
        }
      }
      this.store.state.progress_circular.state = false;
      this.store.state.progress_circular.icon = "";
      this.fetchingProp = false;
    },
  },
});
</script>

<style scoped>
</style>