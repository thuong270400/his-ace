<template>
  <Patients />
</template>
<script>
import Patients from "~/components/data_tables/Patients.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
  name: "HomePage",
  components: {
    Patients,
  },
});
</script>

<style scoped>
</style>