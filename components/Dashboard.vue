<!-- components/CenteredText.vue -->

<template>
  <v-container class="fill-height">
    <v-row>
      <v-col cols="12" style="text-align: center">
        <h2 class="hello">PHẦN MỀM ĐẶT LỊCH HẸN</h2>
        <!-- <h2>Phần mềm đặt lịch hẹn</h2> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
export default {
  name: "CenteredText",
  data() {
    return {
      interval: -1,
      value: 0,
      rating: 5,
    };
  },
  mounted() {
    this.interval = setInterval(() => {
      if (this.value === 100) {
        return (this.value = 0);
      }
      this.value += 10;
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    async alertTestAPI_1() {
      await axios
        .get(`/api/hello`, {})
        .then((response) => {
          console.log("after axios 1", response);
          // this.posts = response.data;
          alert("abc");
        })
        .catch((e) => {
          console.log("không có data");
        });
    },
  },
};
</script>

<style scoped>
.custom-card {
  display: flex;
  justify-content: center;
  align-items: center;
}
.fill-height {
  min-height: 90vh; /* Chiều cao tối thiểu là 100% của viewport height */
}
.hello {
  color: rgb(39, 220, 159);
  font-size: 8vh;
}
.v-progress-circular {
  margin: 1rem;
}
.v-progress-linear {
  width: 50vw;
}
</style>
