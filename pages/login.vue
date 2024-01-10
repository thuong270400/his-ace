<template>
  <Login />
</template>

<script>
import Login from "~/components/Login.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "log",
    });
  },
  components: {
    Login,
  },
});
</script>

<style scoped>
/* CSS module không cần khai báo scoped */
</style>