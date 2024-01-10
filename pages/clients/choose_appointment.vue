<template>
  <ChooseAppointment />
</template>

<script>
import ChooseAppointment from "~/components/appointments/ChooseAppointment.vue";
export default defineComponent({
  setup() {
    definePageMeta({
      layout: "appointment",
    });
  },
  components: {
    ChooseAppointment,
  },
});
</script>

<style scoped>
.none-email-card {
  background-color: rgba(255, 255, 255, 0.844);
}
</style>