<!-- components/CenteredText.vue -->

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <div>
          <h1 class="hello">XIN CHÀO!</h1>
          <p>Ứng dụng web - quản lý lịch hẹn</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "CenteredText",
};
</script>

<style scoped>
.fill-height {
  min-height: 90vh; /* Chiều cao tối thiểu là 100% của viewport height */
}
.hello {
  color: rgb(39, 220, 159);
  font-size: 10vh;
}
</style>
