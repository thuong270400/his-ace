<template>
  <AppointmentReport />
</template>
<script>
import AppointmentReport from "~/components/reports/AppointmentReport.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "dashboard",
    });
  },
  name: "AppointmentReportPage",
  components: {
    AppointmentReport,
  },
});
</script>

<style scoped>
</style>