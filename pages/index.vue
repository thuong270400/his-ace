<template>
  <home />
</template>

<script>
import home from "./home.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
  components: {
    home,
  },
});
</script>
<style scoped>
</style>